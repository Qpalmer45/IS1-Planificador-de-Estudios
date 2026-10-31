"""Aplicación web IS1: Planificador de Estudios.

Sprint 1: Autenticación de usuarios (HU20 - Registro, HU21 - Inicio de sesión)
y panel de notas rápidas (HU27 - Lista de To-Dos).

Al cargar este módulo se preparan las rutas del proyecto y de la base de datos,
se crea la aplicación Flask y se configura cómo se guardan las sesiones del usuario.
"""
# Herramientas de Python para decoradores, rutas de archivos, expresiones regulares
# y acceso a SQLite.
from functools import wraps
from pathlib import Path
import re
import sqlite3

# Flask gestiona las rutas, las peticiones, las respuestas y la sesión del usuario.
from flask import Flask, g, jsonify, redirect, render_template, request, session, url_for
# Estas funciones permiten guardar contraseñas de forma segura y comprobarlas al iniciar sesión.
from werkzeug.security import check_password_hash, generate_password_hash

# Path absoluto a la carpeta del proyecto y archivo SQLite que almacena usuarios y tareas.
BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "todos.db"

# Instancia principal de Flask: registra las rutas y atiende las peticiones web.
app = Flask(__name__)
# Clave de tipo texto usada por Flask para firmar las cookies de sesión.
app.secret_key = "clave_secreta_is1_planificador_estudios_segura"
# Opciones de sesión: impedir el acceso desde JavaScript y limitar su envío entre sitios.
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"


def get_db():
    """Obtiene la conexión a la base de datos para la petición actual."""
    # Flask guarda datos de contexto en `g`; así cada petición reutiliza
    # su conexión sin compartirla con otras peticiones.
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        # Permite acceder a las columnas por nombre y hace cumplir las
        # relaciones declaradas con claves foráneas en esta conexión.
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    """Cierra la conexión al finalizar la petición."""
    # Retira primero la referencia del contexto para que la conexión no se
    # reutilice accidentalmente después de cerrar la petición.
    db = g.pop("db", None)
    if db is not None:
        db.close()


def initialize_database():
    """Crea las tablas si no existen y aplica migraciones necesarias."""
    # Esta conexión es independiente de la conexión de petición: se utiliza
    # para preparar el esquema al arrancar la aplicación.
    conn = sqlite3.connect(DATABASE)
    try:
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        # Agrupa la creación y migración del esquema en una transacción para
        # confirmar los cambios juntos o revertirlos si ocurre un error.
        with conn:
            # Tabla de usuarios (HU20 y HU21)
            conn.execute(
                """CREATE TABLE IF NOT EXISTS usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    nombre TEXT NOT NULL DEFAULT '',
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
                )"""
            )

            # Lee el esquema instalado para añadir columnas nuevas a bases ya
            # existentes, sin borrar ni recrear los datos de sus usuarios.
            cols_usuarios = [row[1] for row in conn.execute("PRAGMA table_info(usuarios)").fetchall()]
            if "nombre" not in cols_usuarios:
                conn.execute("ALTER TABLE usuarios ADD COLUMN nombre TEXT NOT NULL DEFAULT ''")
            if "fecha_creacion" not in cols_usuarios:
                conn.execute("ALTER TABLE usuarios ADD COLUMN fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP")

            # Tabla de To-Dos (HU27) asociada estrictamente a cada usuario
            conn.execute(
                """CREATE TABLE IF NOT EXISTS todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    titulo TEXT NOT NULL,
                    completada INTEGER NOT NULL DEFAULT 0 CHECK (completada IN (0, 1)),
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
                )"""
            )

            # Conserva compatibilidad con bases previas que todavía no guardaban
            # la fecha de creación de las tareas.
            cols_todos = [row[1] for row in conn.execute("PRAGMA table_info(todos)").fetchall()]
            if "fecha_creacion" not in cols_todos:
                conn.execute("ALTER TABLE todos ADD COLUMN fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP")

            # Cada asignatura pertenece a un usuario y puede consultarse de forma
            # independiente. Las futuras tablas de temario o exámenes podrán
            # relacionarse con asignatura_id sin mezclar datos entre materias.
            conn.execute(
                """CREATE TABLE IF NOT EXISTS asignaturas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    nombre TEXT NOT NULL,
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
                )"""
            )
    finally:
        # La inicialización no mantiene una conexión abierta durante el uso normal.
        conn.close()


def login_required(f):
    """Decorador para proteger rutas y APIs que requieren autenticación."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # La API informa el problema con JSON y estado HTTP; las páginas
        # tradicionales redirigen a la vista de inicio de sesión.
        if "usuario_id" not in session:
            if request.path.startswith("/api/"):
                return jsonify({"error": "No has iniciado sesión o tu sesión ha expirado."}), 401
            return redirect(url_for("login_view"))
        # Si existe usuario en la sesión, continúa con la vista protegida.
        return f(*args, **kwargs)
    return decorated_function


def todo_to_dict(row):
    """Convierte una fila de la tabla todos a un diccionario serializable."""
    # Normaliza el estado entero de SQLite a booleano y admite filas heredadas
    # que no incluyan todavía la columna fecha_creacion.
    return {
        "id": row["id"],
        "usuario_id": row["usuario_id"],
        "titulo": row["titulo"],
        "completada": bool(row["completada"]),
        "fecha_creacion": row["fecha_creacion"] if "fecha_creacion" in row.keys() else None,
    }


def asignatura_to_dict(row):
    """Convierte una fila de asignaturas en un diccionario para la API."""
    # Limita la respuesta a los datos que la interfaz necesita para identificar
    # la materia y su propietario.
    return {
        "id": row["id"],
        "usuario_id": row["usuario_id"],
        "nombre": row["nombre"],
    }


# --- RUTAS DE NAVEGACIÓN (Vistas HTML) ---

@app.get("/")
def home():
    """Pantalla principal (Dashboard y pestañas). Requiere autenticación."""
    # Comprueba la sesión antes de renderizar el panel con datos del usuario.
    if "usuario_id" not in session:
        return redirect(url_for("login_view"))
    # Los valores por defecto permiten renderizar la plantilla incluso si la
    # sesión antigua no contiene todavía nombre o correo.
    return render_template(
        "index.html",
        usuario_nombre=session.get("nombre", "Estudiante"),
        usuario_email=session.get("email", ""),
    )


@app.get("/login")
def login_view():
    """Vista de inicio de sesión (HU21). Si ya está autenticado, va al inicio."""
    # Evita mostrar el formulario de acceso si ya hay una sesión activa.
    if "usuario_id" in session:
        return redirect(url_for("home"))
    return render_template("login.html")


@app.get("/registro")
def registro_view():
    """Vista de registro (HU20). Si ya está autenticado, va al inicio."""
    # Una persona autenticada no necesita crear otra cuenta desde esta sesión.
    if "usuario_id" in session:
        return redirect(url_for("home"))
    return render_template("registro.html")


# --- API DE AUTENTICACIÓN (HU20 - Registro y HU21 - Login) ---

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@app.post("/api/registro")
def registrar_usuario():
    """Registra una nueva cuenta de estudiante (HU20)."""
    # Convierte el JSON recibido en datos limpios antes de validar o guardar.
    data = request.get_json(silent=True) or {}
    nombre = data.get("nombre", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    # Comprueba primero el correo para evitar persistir cuentas con dirección
    # vacía o con un formato que no corresponda a una dirección básica.
    if not email or not EMAIL_REGEX.match(email):
        return jsonify({"error": "Debes introducir un correo electrónico válido."}), 400

    # Si no se indica nombre, deriva uno de la parte anterior a @; si se indica,
    # limita su longitud para mantener los datos dentro del contrato de la app.
    if not nombre:
        nombre = email.split("@")[0].capitalize()
    elif len(nombre) > 100:
        return jsonify({"error": "El nombre no puede exceder los 100 caracteres."}), 400

    # No se guarda la contraseña original: se valida su longitud y después se
    # almacena únicamente el hash generado por Werkzeug.
    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres."}), 400

    password_hash = generate_password_hash(password)
    db = get_db()

    try:
        # Inserta la cuenta de forma parametrizada y dentro de una transacción;
        # SQLite rechaza el correo si ya existe por la restricción UNIQUE.
        with db:
            cursor = db.execute(
                "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)",
                (nombre, email, password_hash),
            )
            usuario_id = cursor.lastrowid

        # La cuenta recién creada queda autenticada en esta misma sesión.
        session["usuario_id"] = usuario_id
        session["email"] = email
        session["nombre"] = nombre

        return jsonify({
            "mensaje": "Cuenta creada con éxito.",
            "usuario": {"id": usuario_id, "nombre": nombre, "email": email}
        }), 201
    # Traduce la violación de unicidad en una respuesta útil para el cliente.
    except sqlite3.IntegrityError:
        return jsonify({"error": "Este correo electrónico ya está registrado. Prueba a iniciar sesión."}), 409


@app.post("/api/login")
def iniciar_sesion():
    """Inicia sesión con credenciales válidas (HU21)."""
    # Normaliza el correo de la petición y verifica que se hayan recibido
    # ambos valores antes de consultar la base de datos.
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Por favor, introduce tu correo y contraseña."}), 400

    db = get_db()
    # La consulta parametrizada localiza la cuenta sin interpolar el correo
    # dentro del texto SQL.
    user = db.execute(
        "SELECT * FROM usuarios WHERE email = ?", (email,)
    ).fetchone()

    # Comprueba el hash almacenado; el mismo mensaje evita revelar si existe
    # una cuenta concreta cuando las credenciales no son válidas.
    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "El correo electrónico o la contraseña son incorrectos."}), 401

    # Las cuentas antiguas pueden no tener nombre; en ese caso se calcula uno
    # a partir del correo para poder mostrarlo en la aplicación.
    nombre = user["nombre"] if user["nombre"] else user["email"].split("@")[0].capitalize()

    # Guarda la identidad necesaria para las siguientes peticiones autenticadas.
    session["usuario_id"] = user["id"]
    session["email"] = user["email"]
    session["nombre"] = nombre

    return jsonify({
        "mensaje": "Inicio de sesión correcto.",
        "usuario": {"id": user["id"], "nombre": nombre, "email": user["email"]}
    }), 200


@app.post("/api/logout")
def cerrar_sesion():
    """Cierra la sesión del usuario actual."""
    # Elimina toda la información de autenticación de la cookie de sesión.
    session.clear()
    return jsonify({"mensaje": "Sesión cerrada correctamente."}), 200


@app.get("/api/usuario_actual")
def usuario_actual():
    """Devuelve la información del usuario autenticado."""
    # Esta ruta puede consultarse sin sesión: informa si existe identidad
    # autenticada y añade sus datos cuando están disponibles.
    if "usuario_id" in session:
        return jsonify({
            "autenticado": True,
            "id": session["usuario_id"],
            "nombre": session.get("nombre", "Estudiante"),
            "email": session.get("email", "")
        }), 200
    return jsonify({"autenticado": False}), 200


# --- API DE TO-DOS (HU27 - Lista de To-Dos Rápidos) ---

@app.get("/api/todos")
@login_required
def list_todos():
    """Devuelve todas las notas rápidas del usuario autenticado."""
    # El identificador se toma de la sesión, nunca del cuerpo de la petición,
    # para que el listado quede limitado a la cuenta actual.
    usuario_id = session["usuario_id"]
    db = get_db()
    # Ordena por ID descendente para mostrar primero las notas más recientes.
    rows = db.execute(
        "SELECT id, usuario_id, titulo, completada, fecha_creacion FROM todos WHERE usuario_id = ? ORDER BY id DESC",
        (usuario_id,),
    ).fetchall()
    return jsonify([todo_to_dict(row) for row in rows])


@app.post("/api/todos")
@login_required
def create_todo():
    """Crea una nueva nota rápida para el usuario autenticado (HU27)."""
    # Extrae el título del JSON y elimina espacios exteriores para validar
    # y persistir una versión normalizada del texto.
    data = request.get_json(silent=True) or {}
    titulo = data.get("titulo", "").strip()
    # Rechaza títulos vacíos o que superen el límite admitido por la interfaz.
    if not titulo or len(titulo) > 200:
        return jsonify({"error": "La tarea debe tener entre 1 y 200 caracteres."}), 400

    # La relación de propiedad se crea con el usuario de la sesión. Después
    # se vuelve a leer la fila para devolver también ID y fecha generados por SQLite.
    usuario_id = session["usuario_id"]
    db = get_db()
    with db:
        cursor = db.execute(
            "INSERT INTO todos (usuario_id, titulo) VALUES (?, ?)", (usuario_id, titulo)
        )
        row = db.execute(
            "SELECT id, usuario_id, titulo, completada, fecha_creacion FROM todos WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
    return jsonify(todo_to_dict(row)), 201


@app.patch("/api/todos/<int:todo_id>")
@login_required
def update_todo(todo_id):
    """Actualiza una nota rápida existente: título y/o estado completado (HU27)."""
    # Identifica al propietario desde la sesión; los campos que se modificarán
    # se construyen únicamente a partir de nombres de columna permitidos.
    usuario_id = session["usuario_id"]
    data = request.get_json(silent=True) or {}
    updates, params = [], []

    db = get_db()
    # Comprueba existencia y propiedad antes de validar los campos para que
    # no se pueda modificar una nota de otra cuenta.
    existing = db.execute(
        "SELECT id FROM todos WHERE id = ? AND usuario_id = ?", (todo_id, usuario_id)
    ).fetchone()

    if existing is None:
        return jsonify({"error": "Tarea no encontrada o no pertenece a tu usuario."}), 404

    # Acepta título, estado o ambos, validando cada campo presente de manera
    # independiente para poder realizar actualizaciones parciales.
    if "titulo" in data:
        titulo = data["titulo"].strip()
        if not titulo or len(titulo) > 200:
            return jsonify({"error": "El título debe tener entre 1 y 200 caracteres."}), 400
        updates.append("titulo = ?")
        params.append(titulo)

    if "completada" in data:
        updates.append("completada = ?")
        params.append(1 if data["completada"] else 0)

    # No ejecutar un UPDATE vacío: se exige al menos un campo reconocido.
    if not updates:
        return jsonify({"error": "No se enviaron campos válidos para actualizar."}), 400

    # Los nombres de columna proceden de una lista fija local y todos los
    # valores se pasan como parámetros SQL, no como texto concatenado.
    with db:
        db.execute(
            f"UPDATE todos SET {', '.join(updates)} WHERE id = ? AND usuario_id = ?",
            (*params, todo_id, usuario_id),
        )
        row = db.execute(
            "SELECT id, usuario_id, titulo, completada, fecha_creacion FROM todos WHERE id = ?",
            (todo_id,),
        ).fetchone()
    return jsonify(todo_to_dict(row))


@app.delete("/api/todos/<int:todo_id>")
@login_required
def delete_todo(todo_id):
    """Elimina una nota rápida del usuario autenticado (HU27)."""
    # Incluye el usuario en la condición para que el borrado solo alcance
    # elementos propios; rowcount permite detectar IDs inexistentes o ajenos.
    usuario_id = session["usuario_id"]
    db = get_db()
    with db:
        cursor = db.execute(
            "DELETE FROM todos WHERE id = ? AND usuario_id = ?", (todo_id, usuario_id)
        )
    if cursor.rowcount == 0:
        return jsonify({"error": "Tarea no encontrada o no pertenece a tu usuario."}), 404
    return jsonify({"mensaje": "Tarea eliminada con éxito."}), 200


# --- API DE ASIGNATURAS (HU01 - Gestión y HU23 - Apartado individual) ---

@app.get("/api/asignaturas")
@login_required
def list_asignaturas():
    """Devuelve las asignaturas de la cuenta actual, de más nueva a más antigua."""
    # Filtra siempre por el propietario de la sesión y presenta primero las
    # asignaturas añadidas más recientemente.
    usuario_id = session["usuario_id"]
    rows = get_db().execute(
        """SELECT id, usuario_id, nombre
           FROM asignaturas
           WHERE usuario_id = ?
           ORDER BY id DESC""",
        (usuario_id,),
    ).fetchall()
    return jsonify([asignatura_to_dict(row) for row in rows]), 200


@app.post("/api/asignaturas")
@login_required
def create_asignatura():
    """Crea una asignatura para el usuario autenticado."""
    # El cuerpo debe ser un objeto JSON; validar el tipo evita llamar a
    # métodos de texto sobre valores nulos, numéricos u otras estructuras.
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Debes enviar un objeto JSON con el nombre de la asignatura."}), 400

    # Exige un nombre textual no vacío y guarda su versión sin espacios
    # exteriores para mantener los registros consistentes.
    nombre = data.get("nombre")
    if not isinstance(nombre, str) or not nombre.strip():
        return jsonify({"error": "El nombre de la asignatura no puede estar vacío."}), 400
    nombre = nombre.strip()

    # Asocia la nueva materia al usuario actual y lee el registro insertado
    # para devolver el ID generado por la base de datos.
    usuario_id = session["usuario_id"]
    db = get_db()
    with db:
        cursor = db.execute(
            "INSERT INTO asignaturas (usuario_id, nombre) VALUES (?, ?)",
            (usuario_id, nombre),
        )
        row = db.execute(
            "SELECT id, usuario_id, nombre FROM asignaturas WHERE id = ? AND usuario_id = ?",
            (cursor.lastrowid, usuario_id),
        ).fetchone()
    return jsonify(asignatura_to_dict(row)), 201


@app.get("/api/asignaturas/<int:asignatura_id>")
@login_required
def get_asignatura(asignatura_id):
    """Devuelve el contenido base del apartado de una asignatura propia."""
    # El ID solicitado y el ID de sesión forman juntos la condición: las
    # asignaturas inexistentes y las ajenas producen el mismo 404.
    row = get_db().execute(
        """SELECT id, usuario_id, nombre
           FROM asignaturas
           WHERE id = ? AND usuario_id = ?""",
        (asignatura_id, session["usuario_id"]),
    ).fetchone()
    if row is None:
        return jsonify({"error": "Asignatura no encontrada."}), 404
    return jsonify(asignatura_to_dict(row)), 200


@app.patch("/api/asignaturas/<int:asignatura_id>")
@login_required
def update_asignatura(asignatura_id):
    """Cambia el nombre de una asignatura propia sin afectar a las demás."""
    # Restringe toda consulta y actualización al propietario de la sesión.
    usuario_id = session["usuario_id"]
    db = get_db()
    existing = db.execute(
        "SELECT id FROM asignaturas WHERE id = ? AND usuario_id = ?",
        (asignatura_id, usuario_id),
    ).fetchone()
    # Se informa como no encontrada si no existe o pertenece a otro usuario.
    if existing is None:
        return jsonify({"error": "Asignatura no encontrada."}), 404

    # Valida el JSON y el nuevo nombre antes de iniciar la escritura.
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Debes enviar un objeto JSON con el nombre de la asignatura."}), 400

    nombre = data.get("nombre")
    if not isinstance(nombre, str) or not nombre.strip():
        return jsonify({"error": "El nombre de la asignatura no puede estar vacío."}), 400

    # Actualiza exclusivamente la fila validada y vuelve a leerla para devolver
    # al frontend el nombre normalizado y el resto de datos públicos.
    with db:
        db.execute(
            "UPDATE asignaturas SET nombre = ? WHERE id = ? AND usuario_id = ?",
            (nombre.strip(), asignatura_id, usuario_id),
        )
        row = db.execute(
            "SELECT id, usuario_id, nombre FROM asignaturas WHERE id = ? AND usuario_id = ?",
            (asignatura_id, usuario_id),
        ).fetchone()
    return jsonify(asignatura_to_dict(row)), 200


@app.delete("/api/asignaturas/<int:asignatura_id>")
@login_required
def delete_asignatura(asignatura_id):
    """Elimina una asignatura perteneciente al usuario actual."""
    # La condición conjunta por ID y usuario garantiza que no se borren
    # registros de otra cuenta, incluso si se conoce su identificador.
    db = get_db()
    with db:
        cursor = db.execute(
            "DELETE FROM asignaturas WHERE id = ? AND usuario_id = ?",
            (asignatura_id, session["usuario_id"]),
        )
    # Si SQLite no eliminó filas, el recurso no existe para esta cuenta.
    if cursor.rowcount == 0:
        return jsonify({"error": "Asignatura no encontrada."}), 404
    return jsonify({"mensaje": "Asignatura eliminada con éxito."}), 200


# Prepara o actualiza el esquema al importar el módulo, antes de atender rutas.
initialize_database()

if __name__ == "__main__":
    # Permite ejecutar este módulo directamente para desarrollo local.
    app.run(debug=True)

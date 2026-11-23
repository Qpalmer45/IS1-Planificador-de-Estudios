"""Aplicación web IS1: Planificador de Estudios.

Sprint 1: Autenticación de usuarios (HU20 - Registro, HU21 - Inicio de sesión)
y panel de notas rápidas (HU27 - Lista de To-Dos).

Al cargar este módulo se preparan las rutas del proyecto y de la base de datos,
se crea la aplicación Flask y se configura cómo se guardan las sesiones del usuario.
"""
# Herramientas de Python para decoradores, rutas de archivos, expresiones regulares
# y acceso a SQLite.
from datetime import date, datetime, timedelta
from flask import jsonify, session
from functools import wraps
from pathlib import Path
from zoneinfo import ZoneInfo
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


def preparar_tabla_actividades(conn):
    """Amplía el CHECK de tipos de las instalaciones previas conservando sus datos."""
    esquema = conn.execute(
        "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'tareas_planificadas'"
    ).fetchone()
    migrar = esquema is not None and "'examen'" not in esquema[0]
    if migrar:
        conn.execute("ALTER TABLE tareas_planificadas RENAME TO actividades_anteriores")
    # HU04: actividades con plazo, independientes de las notas rápidas.
    conn.execute(
        """CREATE TABLE IF NOT EXISTS tareas_planificadas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
            titulo TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK (tipo IN ('tarea', 'entrega', 'examen')),
            fecha_limite TEXT NOT NULL,
            minutos_estimados INTEGER NOT NULL CHECK (minutos_estimados > 0),
            minutos_semanales INTEGER NOT NULL DEFAULT 0
        )"""
    )
    if migrar:
        conn.execute(
            """INSERT INTO tareas_planificadas
               (id, usuario_id, titulo, tipo, fecha_limite, minutos_estimados)
               SELECT id, usuario_id, titulo, tipo, fecha_limite, minutos_estimados
               FROM actividades_anteriores"""
        )
        # Los identificadores borrados antes de la migración tampoco se reutilizan.
        conn.execute(
            """UPDATE sqlite_sequence SET seq = max(seq, coalesce(
                   (SELECT seq FROM sqlite_sequence WHERE name = 'actividades_anteriores'), 0))
               WHERE name = 'tareas_planificadas'"""
        )
        conn.execute("DROP TABLE actividades_anteriores")
    if 'minutos_semanales' not in [r[1] for r in conn.execute('PRAGMA table_info(tareas_planificadas)')]:
        conn.execute('ALTER TABLE tareas_planificadas ADD COLUMN minutos_semanales INTEGER NOT NULL DEFAULT 0')
    if 'asignatura_id' not in [r[1] for r in conn.execute('PRAGMA table_info(tareas_planificadas)')]:
        conn.execute('ALTER TABLE tareas_planificadas ADD COLUMN asignatura_id INTEGER')
    conn.execute(
        """CREATE INDEX IF NOT EXISTS idx_tareas_planificadas_plazo
           ON tareas_planificadas(usuario_id, fecha_limite, id)"""
    )


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
            conn.execute("BEGIN IMMEDIATE")
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

            # Tabla de To-Dos (HU27, HU12) asociada estrictamente a cada usuario
            conn.execute(
                """CREATE TABLE IF NOT EXISTS todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    titulo TEXT NOT NULL,
                    completada INTEGER NOT NULL DEFAULT 0 CHECK (completada IN (0, 1)),
                    prioridad TEXT NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
                )"""
            )

            # Conserva compatibilidad con bases previas que todavía no guardaban
            # la fecha de creación o la prioridad de las tareas (HU12).
            cols_todos = [row[1] for row in conn.execute("PRAGMA table_info(todos)").fetchall()]
            if "fecha_creacion" not in cols_todos:
                conn.execute("ALTER TABLE todos ADD COLUMN fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP")
            if "prioridad" not in cols_todos:
                conn.execute("ALTER TABLE todos ADD COLUMN prioridad TEXT NOT NULL DEFAULT 'media'")

            # HU19: antelación de recordatorios, independiente para cada cuenta.
            conn.execute("""
                CREATE TABLE IF NOT EXISTS preferencias_recordatorios (
                    usuario_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
                    dias_anticipacion INTEGER NOT NULL DEFAULT 7
                        CHECK (dias_anticipacion BETWEEN 0 AND 365)
                )
            """)

            preparar_tabla_actividades(conn)

            # Cada asignatura pertenece a un usuario y puede consultarse de forma
            # independiente (HU01, HU12).
            conn.execute(
                """CREATE TABLE IF NOT EXISTS asignaturas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    nombre TEXT NOT NULL,
                    dificultad TEXT NOT NULL DEFAULT 'media' CHECK (dificultad IN ('baja', 'media', 'alta')),
                    prioridad TEXT NOT NULL DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta')),
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
                )"""
            )

            cols_asignaturas = [row[1] for row in conn.execute("PRAGMA table_info(asignaturas)").fetchall()]
            if "fecha_creacion" not in cols_asignaturas:
                conn.execute("ALTER TABLE asignaturas ADD COLUMN fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP")
            if "dificultad" not in cols_asignaturas:
                conn.execute("ALTER TABLE asignaturas ADD COLUMN dificultad TEXT NOT NULL DEFAULT 'media'")
            if "prioridad" not in cols_asignaturas:
                conn.execute(
                    """ALTER TABLE asignaturas ADD COLUMN prioridad TEXT NOT NULL
                       DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta'))"""
                )

            if 'minutos_semanales' not in [r[1] for r in conn.execute('PRAGMA table_info(asignaturas)')]:
                conn.execute('ALTER TABLE asignaturas ADD COLUMN minutos_semanales INTEGER NOT NULL DEFAULT 0')

            # Cada tema organiza un bloque de apuntes dentro de una asignatura.
            # Se guarda el usuario también en el tema para filtrar todas las
            # consultas por propietario; las claves en cascada evitan huérfanos
            # al eliminar una cuenta o una asignatura.
            conn.execute(
                """CREATE TABLE IF NOT EXISTS temas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    asignatura_id INTEGER NOT NULL,
                    titulo TEXT NOT NULL,
                    contenido TEXT NOT NULL DEFAULT '',
                    estudiado INTEGER NOT NULL DEFAULT 0 CHECK (estudiado IN (0, 1)),
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
                    FOREIGN KEY (asignatura_id) REFERENCES asignaturas (id) ON DELETE CASCADE
                )"""
            )

            # Horario de clases semanal recurrente por asignatura
            conn.execute(
                """CREATE TABLE IF NOT EXISTS horarios_clases (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    asignatura_id INTEGER NOT NULL,
                    dia_semana TEXT NOT NULL CHECK (dia_semana IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
                    hora_inicio TEXT NOT NULL,
                    hora_fin TEXT NOT NULL,
                    aula TEXT NOT NULL DEFAULT '',
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
                    FOREIGN KEY (asignatura_id) REFERENCES asignaturas (id) ON DELETE CASCADE
                )"""
            )
            conn.execute(
                """CREATE INDEX IF NOT EXISTS idx_horarios_usuario_dia
                   ON horarios_clases(usuario_id, dia_semana)"""
            )

            # Días y períodos libres (festivos, vacaciones o días no lectivos)
            conn.execute(
                """CREATE TABLE IF NOT EXISTS periodos_libres (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    fecha_inicio TEXT NOT NULL,
                    fecha_fin TEXT NOT NULL,
                    motivo TEXT NOT NULL DEFAULT '',
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
                )"""
            )
            conn.execute(
                """CREATE INDEX IF NOT EXISTS idx_periodos_libres_usuario
                   ON periodos_libres(usuario_id, fecha_inicio, fecha_fin)"""
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


# Niveles válidos para dificultad y prioridad de asignaturas y tareas (HU12)
NIVELES_DIFICULTAD = ("baja", "media", "alta")
NIVELES_PRIORIDAD = ("baja", "media", "alta")


def todo_to_dict(row):
    """Convierte una fila de la tabla todos a un diccionario serializable (HU27, HU12)."""
    # Normaliza el estado entero de SQLite a booleano y admite filas heredadas
    # que no incluyan todavía la columna fecha_creacion o prioridad.
    data = {
        "id": row["id"],
        "usuario_id": row["usuario_id"],
        "titulo": row["titulo"],
        "completada": bool(row["completada"]),
    }
    if "prioridad" in row.keys():
        data["prioridad"] = row["prioridad"]
    if "fecha_creacion" in row.keys():
        data["fecha_creacion"] = row["fecha_creacion"]
    else:
        data["fecha_creacion"] = None
    return data


def asignatura_to_dict(row):
    """Convierte una fila de asignaturas en un diccionario para la API (HU01, HU12)."""
    # Limita la respuesta a los datos que la interfaz y el planificador
    # necesitan para identificar la materia y sus atributos HU12.
    data = {
        "id": row["id"],
        "usuario_id": row["usuario_id"],
        "nombre": row["nombre"],
    }
    if "dificultad" in row.keys():
        data["dificultad"] = row["dificultad"]
    if "prioridad" in row.keys():
        data["prioridad"] = row["prioridad"]
    if "minutos_semanales" in row.keys():
        data["minutos_semanales"] = row["minutos_semanales"]
    return data


def tema_to_dict(row):
    """Convierte una fila SQLite de tema al formato público de la API."""
    # SQLite almacena estudiado como entero; la API expone un booleano JSON.
    return {
        "id": row["id"],
        "usuario_id": row["usuario_id"],
        "asignatura_id": row["asignatura_id"],
        "titulo": row["titulo"],
        "contenido": row["contenido"],
        "estudiado": bool(row["estudiado"]),
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
        zona_planificador=ZONA_PLANIFICADOR.key,
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
    """Devuelve todas las notas rápidas del usuario autenticado (HU27, HU12)."""
    # El identificador se toma de la sesión, nunca del cuerpo de la petición,
    # para que el listado quede limitado a la cuenta actual.
    usuario_id = session["usuario_id"]
    db = get_db()
    # Ordena por ID descendente para mostrar primero las notas más recientes.
    rows = db.execute(
        "SELECT id, usuario_id, titulo, completada, prioridad, fecha_creacion FROM todos WHERE usuario_id = ? ORDER BY id DESC",
        (usuario_id,),
    ).fetchall()
    return jsonify([todo_to_dict(row) for row in rows])


@app.post("/api/todos")
@login_required
def create_todo():
    """Crea una nueva nota rápida para el usuario autenticado (HU27, HU12)."""
    # Extrae el título del JSON y elimina espacios exteriores para validar
    # y persistir una versión normalizada del texto.
    data = request.get_json(silent=True) or {}
    titulo = data.get("titulo", "")
    if not isinstance(titulo, str):
        return jsonify({"error": "La tarea debe tener entre 1 y 200 caracteres."}), 400
    titulo = titulo.strip()
    # Rechaza títulos vacíos o que superen el límite admitido por la interfaz.
    if not titulo or len(titulo) > 200:
        return jsonify({"error": "La tarea debe tener entre 1 y 200 caracteres."}), 400

    prioridad = "media"
    if "prioridad" in data:
        prio_val = data["prioridad"]
        if not isinstance(prio_val, str) or prio_val.strip().lower() not in NIVELES_PRIORIDAD:
            return jsonify({"error": "La prioridad debe ser baja, media o alta."}), 400
        prioridad = prio_val.strip().lower()

    # La relación de propiedad se crea con el usuario de la sesión. Después
    # se vuelve a leer la fila para devolver también ID y fecha generados por SQLite.
    usuario_id = session["usuario_id"]
    db = get_db()
    with db:
        cursor = db.execute(
            "INSERT INTO todos (usuario_id, titulo, prioridad) VALUES (?, ?, ?)", (usuario_id, titulo, prioridad)
        )
        row = db.execute(
            "SELECT id, usuario_id, titulo, completada, prioridad, fecha_creacion FROM todos WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
    return jsonify(todo_to_dict(row)), 201


@app.patch("/api/todos/<int:todo_id>")
@login_required
def update_todo(todo_id):
    """Actualiza una nota rápida existente: título, completada y/o prioridad (HU27, HU12)."""
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

    # Acepta título, estado, prioridad o combinación de ellos, validando cada
    # campo presente de manera independiente para poder realizar actualizaciones parciales.
    if "titulo" in data:
        titulo = data["titulo"]
        if not isinstance(titulo, str):
            return jsonify({"error": "El título debe tener entre 1 y 200 caracteres."}), 400
        titulo = titulo.strip()
        if not titulo or len(titulo) > 200:
            return jsonify({"error": "El título debe tener entre 1 y 200 caracteres."}), 400
        updates.append("titulo = ?")
        params.append(titulo)

    if "completada" in data:
        if type(data["completada"]) is not bool:
            return jsonify({"error": "El estado completada debe ser booleano."}), 400
        updates.append("completada = ?")
        params.append(int(data["completada"]))

    if "prioridad" in data:
        prio_val = data["prioridad"]
        if not isinstance(prio_val, str) or prio_val.strip().lower() not in NIVELES_PRIORIDAD:
            return jsonify({"error": "La prioridad debe ser baja, media o alta."}), 400
        updates.append("prioridad = ?")
        params.append(prio_val.strip().lower())

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
            "SELECT id, usuario_id, titulo, completada, prioridad, fecha_creacion FROM todos WHERE id = ?",
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
    """Devuelve las asignaturas de la cuenta actual, de más nueva a más antigua (HU01, HU12)."""
    # Filtra siempre por el propietario de la sesión y presenta primero las
    # asignaturas añadidas más recientemente.
    usuario_id = session["usuario_id"]
    rows = get_db().execute(
        """SELECT id, usuario_id, nombre, dificultad, prioridad, minutos_semanales
           FROM asignaturas
           WHERE usuario_id = ?
           ORDER BY id DESC""",
        (usuario_id,),
    ).fetchall()
    return jsonify([asignatura_to_dict(row) for row in rows]), 200


@app.post("/api/asignaturas")
@login_required
def create_asignatura():
    """Crea una asignatura para el usuario autenticado (HU01, HU12)."""
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

    dificultad = "media"
    if "dificultad" in data:
        dif_val = data["dificultad"]
        if not isinstance(dif_val, str) or dif_val.strip().lower() not in NIVELES_DIFICULTAD:
            return jsonify({"error": "La dificultad debe ser baja, media o alta."}), 400
        dificultad = dif_val.strip().lower()

    prioridad = "media"
    if "prioridad" in data:
        prio_val = data["prioridad"]
        if not isinstance(prio_val, str) or prio_val.strip().lower() not in NIVELES_PRIORIDAD:
            return jsonify({"error": "La prioridad debe ser baja, media o alta."}), 400
        prioridad = prio_val.strip().lower()

    try:
        minutos_semana = validar_minutos_semanales(data.get('minutos_semanales', 0))
    except ValueError as exc:
        return jsonify(error=str(exc)), 400

    # Asocia la nueva materia al usuario actual y lee el registro insertado
    # para devolver el ID generado por la base de datos.
    usuario_id = session["usuario_id"]
    db = get_db()
    with db:
        cursor = db.execute(
            "INSERT INTO asignaturas (usuario_id, nombre, dificultad, prioridad, minutos_semanales) VALUES (?, ?, ?, ?, ?)",
            (usuario_id, nombre, dificultad, prioridad, minutos_semana),
        )
        row = db.execute(
            "SELECT id, usuario_id, nombre, dificultad, prioridad, minutos_semanales FROM asignaturas WHERE id = ? AND usuario_id = ?",
            (cursor.lastrowid, usuario_id),
        ).fetchone()
    return jsonify(asignatura_to_dict(row)), 201


@app.get("/api/asignaturas/<int:asignatura_id>")
@login_required
def get_asignatura(asignatura_id):
    """Devuelve el contenido base del apartado de una asignatura propia (HU23, HU12)."""
    # El ID solicitado y el ID de sesión forman juntos la condición: las
    # asignaturas inexistentes y las ajenas producen el mismo 404.
    row = get_db().execute(
        """SELECT id, usuario_id, nombre, dificultad, prioridad, minutos_semanales
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
    """Cambia el nombre y/o atributos HU12 de una asignatura propia (HU01, HU12)."""
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

    # Valida el JSON y los campos antes de iniciar la escritura.
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Debes enviar un objeto JSON con el nombre de la asignatura."}), 400

    updates = []
    params = []

    if "nombre" in data:
        nombre = data["nombre"]
        if not isinstance(nombre, str) or not nombre.strip():
            return jsonify({"error": "El nombre de la asignatura no puede estar vacío."}), 400
        updates.append("nombre = ?")
        params.append(nombre.strip())

    if "dificultad" in data:
        dif_val = data["dificultad"]
        if not isinstance(dif_val, str) or dif_val.strip().lower() not in NIVELES_DIFICULTAD:
            return jsonify({"error": "La dificultad debe ser baja, media o alta."}), 400
        updates.append("dificultad = ?")
        params.append(dif_val.strip().lower())

    if "prioridad" in data:
        prio_val = data["prioridad"]
        if not isinstance(prio_val, str) or prio_val.strip().lower() not in NIVELES_PRIORIDAD:
            return jsonify({"error": "La prioridad debe ser baja, media o alta."}), 400
        updates.append("prioridad = ?")
        params.append(prio_val.strip().lower())

    if "minutos_semanales" in data:
        try:
            minutos_semana = validar_minutos_semanales(data["minutos_semanales"])
        except ValueError as exc:
            return jsonify(error=str(exc)), 400
        updates.append("minutos_semanales = ?")
        params.append(minutos_semana)

    if not updates:
        return jsonify({"error": "Debes enviar al menos un campo para actualizar."}), 400

    # Actualiza exclusivamente la fila validada y vuelve a leerla para devolver
    # al frontend los datos normalizados y el resto de información pública.
    with db:
        db.execute(
            f"UPDATE asignaturas SET {', '.join(updates)} WHERE id = ? AND usuario_id = ?",
            (*params, asignatura_id, usuario_id),
        )
        row = db.execute(
            "SELECT id, usuario_id, nombre, dificultad, prioridad, minutos_semanales FROM asignaturas WHERE id = ? AND usuario_id = ?",
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


@app.get("/api/asignaturas/<int:asignatura_id>/temas")
@login_required
def list_temas(asignatura_id):
    """Lista los temas de una asignatura propia, con filtro de estado opcional."""
    # El usuario procede de la sesión y nunca de los parámetros del cliente.
    usuario_id = session["usuario_id"]
    db = get_db()
    # Comprueba primero la propiedad de la asignatura para devolver el mismo
    # 404 tanto si no existe como si pertenece a otra cuenta.
    asignatura = db.execute(
        "SELECT id FROM asignaturas WHERE id = ? AND usuario_id = ?",
        (asignatura_id, usuario_id),
    ).fetchone()
    if asignatura is None:
        return jsonify({"error": "Asignatura no encontrada."}), 404

    # Acepta únicamente los estados que entiende la interfaz; sin filtro
    # devuelve los temas pendientes y estudiados.
    estado = request.args.get("estado")
    if estado not in (None, "pendiente", "estudiado"):
        return jsonify({"error": "El estado debe ser pendiente o estudiado."}), 400

    # La consulta limita resultados por asignatura y propietario. Los valores
    # del filtro se pasan como parámetros para no interpolarlos en SQL.
    query = """SELECT id, usuario_id, asignatura_id, titulo, contenido, estudiado
               FROM temas
               WHERE asignatura_id = ? AND usuario_id = ?"""
    params = [asignatura_id, usuario_id]
    if estado is not None:
        query += " AND estudiado = ?"
        params.append(1 if estado == "estudiado" else 0)
    # Mantiene un orden estable entre consultas para facilitar la lectura.
    query += " ORDER BY id"
    rows = db.execute(query, params).fetchall()
    return jsonify([tema_to_dict(row) for row in rows]), 200


@app.post("/api/asignaturas/<int:asignatura_id>/temas")
@login_required
def create_tema(asignatura_id):
    """Crea un tema pendiente en una asignatura propia."""
    # Obtiene el propietario de la sesión y verifica antes que la materia
    # destino existe y está disponible para esta cuenta.
    usuario_id = session["usuario_id"]
    db = get_db()
    asignatura = db.execute(
        "SELECT id FROM asignaturas WHERE id = ? AND usuario_id = ?",
        (asignatura_id, usuario_id),
    ).fetchone()
    if asignatura is None:
        return jsonify({"error": "Asignatura no encontrada."}), 404

    # Solo se aceptan objetos JSON. El contenido es opcional, pero cuando se
    # envía debe ser texto; no se recortan sus espacios ni saltos de línea.
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Debes enviar un objeto JSON con título y contenido."}), 400

    titulo = data.get("titulo")
    contenido = data.get("contenido", "")
    if not isinstance(titulo, str) or not titulo.strip():
        return jsonify({"error": "El título del tema no puede estar vacío."}), 400
    if not isinstance(contenido, str):
        return jsonify({"error": "El contenido del tema debe ser texto."}), 400

    # El estado inicial estudiado se establece en la base de datos a false.
    # La transacción inserta el tema y lee la fila creada para devolver su ID.
    with db:
        cursor = db.execute(
            """INSERT INTO temas
               (usuario_id, asignatura_id, titulo, contenido)
               VALUES (?, ?, ?, ?)""",
            (usuario_id, asignatura_id, titulo.strip(), contenido),
        )
        row = db.execute(
            """SELECT id, usuario_id, asignatura_id, titulo, contenido, estudiado
               FROM temas WHERE id = ? AND usuario_id = ?""",
            (cursor.lastrowid, usuario_id),
        ).fetchone()
    return jsonify(tema_to_dict(row)), 201


@app.patch("/api/temas/<int:tema_id>")
@login_required
def update_tema(tema_id):
    """Actualiza uno o varios campos de un tema propio."""
    # La condición conjunta por ID y usuario hace indistinguibles los temas
    # inexistentes de los que pertenecen a otra cuenta.
    usuario_id = session["usuario_id"]
    db = get_db()
    existing = db.execute(
        "SELECT id FROM temas WHERE id = ? AND usuario_id = ?",
        (tema_id, usuario_id),
    ).fetchone()
    if existing is None:
        return jsonify({"error": "Tema no encontrado."}), 404

    # PATCH permite cambios parciales, pero exige al menos un campo permitido.
    # Se valida el objeto completo antes de ejecutar cualquier modificación.
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Debes enviar los campos que quieres actualizar."}), 400

    allowed_fields = {"titulo", "contenido", "estudiado"}
    if not set(data).issubset(allowed_fields):
        return jsonify({"error": "El tema contiene campos no permitidos."}), 400

    # Construye los nuevos valores solo después de comprobar el tipo de cada
    # dato. Así, un campo inválido no deja guardado un cambio parcial.
    updates = {}
    if "titulo" in data:
        titulo = data["titulo"]
        if not isinstance(titulo, str) or not titulo.strip():
            return jsonify({"error": "El título del tema no puede estar vacío."}), 400
        updates["titulo"] = titulo.strip()
    if "contenido" in data:
        contenido = data["contenido"]
        if not isinstance(contenido, str):
            return jsonify({"error": "El contenido del tema debe ser texto."}), 400
        updates["contenido"] = contenido
    if "estudiado" in data:
        estudiado = data["estudiado"]
        # bool es una subclase de int en Python: se requiere tipo booleano
        # exacto para rechazar números como 0 y 1 en el JSON recibido.
        if type(estudiado) is not bool:
            return jsonify({"error": "El estado estudiado debe ser booleano."}), 400
        updates["estudiado"] = int(estudiado)

    # Los nombres de columna provienen de la lista permitida y los valores
    # siguen parametrizados. La escritura y lectura de la respuesta son atómicas.
    assignments = ", ".join(f"{field} = ?" for field in updates)
    with db:
        db.execute(
            f"UPDATE temas SET {assignments} WHERE id = ? AND usuario_id = ?",
            (*updates.values(), tema_id, usuario_id),
        )
        row = db.execute(
            """SELECT id, usuario_id, asignatura_id, titulo, contenido, estudiado
               FROM temas WHERE id = ? AND usuario_id = ?""",
            (tema_id, usuario_id),
        ).fetchone()
    return jsonify(tema_to_dict(row)), 200


@app.delete("/api/temas/<int:tema_id>")
@login_required
def delete_tema(tema_id):
    """Elimina únicamente el tema perteneciente al usuario actual."""
    # Filtra por usuario en el propio DELETE para impedir que conocer un ID
    # permita borrar temas de otra cuenta.
    db = get_db()
    with db:
        cursor = db.execute(
            "DELETE FROM temas WHERE id = ? AND usuario_id = ?",
            (tema_id, session["usuario_id"]),
        )
    if cursor.rowcount == 0:
        return jsonify({"error": "Tema no encontrado."}), 404
    return jsonify({"mensaje": "Tema eliminado con éxito."}), 200




# --- HU04: TAREAS Y ENTREGAS ---

CAMPOS_TAREA = ("titulo", "tipo", "fecha_limite", "minutos_estimados")


try:
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
    ZONA_PLANIFICADOR = ZoneInfo("Europe/Madrid")
except (ZoneInfoNotFoundError, Exception):
    from datetime import tzinfo
    class _FallbackMadrid(tzinfo):
        key = "Europe/Madrid"
        def utcoffset(self, dt):
            return timedelta(hours=1)
        def dst(self, dt):
            return timedelta(0)
        def tzname(self, dt):
            return "CET"
    ZONA_PLANIFICADOR = _FallbackMadrid()


def hoy_planificador():
    return datetime.now(ZONA_PLANIFICADOR).date()


def validar_minutos_semanales(valor):
    if type(valor) is not int or not 0 <= valor <= 10080:
        raise ValueError("El tiempo semanal debe ser un entero entre 0 y 10080 minutos.")
    return valor


def validar_tarea(datos, parcial=False, fecha_anterior=None):
    """Valida y normaliza los campos editables antes de escribir en SQLite."""
    if not isinstance(datos, dict) or not datos:
        raise ValueError("Envía los datos de la tarea o entrega.")
    if datos.keys() - (set(CAMPOS_TAREA) | {"minutos_semanales", "asignatura_id"}):
        raise ValueError("La petición incluye campos que no se pueden modificar.")
    if not parcial and not all(campo in datos for campo in ('titulo', 'tipo', 'fecha_limite', 'minutos_estimados')):
        raise ValueError("Indica el título, el tipo, la fecha límite y el tiempo estimado.")

    campos = datos.copy()
    if "minutos_semanales" in campos:
        campos["minutos_semanales"] = validar_minutos_semanales(campos["minutos_semanales"])
    if "asignatura_id" in campos and campos["asignatura_id"] is not None and (
        type(campos["asignatura_id"]) is not int or campos["asignatura_id"] <= 0
    ):
        raise ValueError("Selecciona una asignatura válida.")
    if campos.get("tipo") == "examen":
        if campos.get("asignatura_id") is None:
            raise ValueError("El examen debe estar asociado a una asignatura.")
        if campos.get("minutos_semanales", 0) != 0:
            raise ValueError("Los exámenes utilizan las horas de su asignatura.")
        campos["minutos_semanales"] = 0
    if "titulo" in campos:
        titulo = campos["titulo"]
        if not isinstance(titulo, str) or not 1 <= len(titulo.strip()) <= 200:
            raise ValueError("El título debe tener entre 1 y 200 caracteres.")
        campos["titulo"] = titulo.strip()
    if "tipo" in campos and campos["tipo"] not in ("tarea", "entrega", "examen"):
        raise ValueError("Elige tarea, entrega o examen.")
    if "fecha_limite" in campos:
        fecha = campos["fecha_limite"]
        try:
            if not isinstance(fecha, str) or date.fromisoformat(fecha).isoformat() != fecha:
                raise ValueError
        except ValueError:
            raise ValueError("Indica una fecha límite válida en formato AAAA-MM-DD.") from None
        if fecha != fecha_anterior and fecha < hoy_planificador().isoformat():
            raise ValueError("La fecha debe ser hoy o posterior.")
    if "minutos_estimados" in campos:
        minutos = campos["minutos_estimados"]
        if type(minutos) is not int or not 1 <= minutos <= 2**53 - 1:
            raise ValueError("El tiempo estimado debe ser un número entero positivo de minutos.")
    return campos


def listar_tareas_planificadas(usuario_id):
    filas = get_db().execute(
        """SELECT id, titulo, tipo, fecha_limite, minutos_estimados, minutos_semanales, asignatura_id
           FROM tareas_planificadas WHERE usuario_id = ? ORDER BY fecha_limite, id""",
        (usuario_id,),
    )
    return [dict(fila) for fila in filas]


@app.get("/api/tareas")
@login_required
def listar_tareas():
    return jsonify(listar_tareas_planificadas(session["usuario_id"]))


@app.post("/api/tareas")
@login_required
def crear_tarea():
    try:
        campos = validar_tarea(request.get_json(silent=True))
    except ValueError as error:
        return jsonify(error=str(error)), 400

    campos.setdefault("minutos_semanales", 0)
    campos.setdefault("asignatura_id", None)
    db = get_db()
    if campos["asignatura_id"] is not None and db.execute("SELECT 1 FROM asignaturas WHERE id = ? AND usuario_id = ?", (campos["asignatura_id"], session["usuario_id"])).fetchone() is None:
        return jsonify(error="Asignatura no encontrada."), 400
    with db:
        cursor = db.execute(
            """INSERT INTO tareas_planificadas
               (usuario_id, titulo, tipo, fecha_limite, minutos_estimados, minutos_semanales, asignatura_id)
               VALUES (:usuario_id, :titulo, :tipo, :fecha_limite, :minutos_estimados, :minutos_semanales, :asignatura_id)""",
            {**campos, "usuario_id": session["usuario_id"]},
        )
    return jsonify(id=cursor.lastrowid, **campos), 201


@app.patch("/api/tareas/<int:tarea_id>")
@login_required
def editar_tarea(tarea_id):
    db = get_db()
    identidad = {"id": str(tarea_id), "usuario_id": session["usuario_id"]}
    with db:
        # Comparamos con la fecha guardada y escribimos en la misma transacción.
        db.execute("BEGIN IMMEDIATE")
        original = db.execute(
            "SELECT fecha_limite, tipo, asignatura_id FROM tareas_planificadas WHERE id = :id AND usuario_id = :usuario_id",
            identidad,
        ).fetchone()
        if original is None:
            return jsonify(error="Actividad no encontrada."), 404
        try:
            cambios = validar_tarea(request.get_json(silent=True), parcial=True,
                                   fecha_anterior=original["fecha_limite"])
        except ValueError as error:
            return jsonify(error=str(error)), 400
        tipo_final = cambios.get("tipo", original["tipo"])
        asignatura_final = cambios.get("asignatura_id", original["asignatura_id"])
        if tipo_final == "examen":
            if asignatura_final is None:
                return jsonify(error="El examen debe tener asignatura."), 400
            if cambios.get("minutos_semanales", 0) != 0:
                return jsonify(error="Los exámenes utilizan las horas de su asignatura."), 400
            cambios["minutos_semanales"] = 0
        if asignatura_final is not None and db.execute("SELECT 1 FROM asignaturas WHERE id = ? AND usuario_id = ?", (asignatura_final, session["usuario_id"])).fetchone() is None:
            return jsonify(error="Asignatura no encontrada."), 400
        asignaciones = ", ".join(f"{campo} = :{campo}" for campo in (*CAMPOS_TAREA, "minutos_semanales", "asignatura_id") if campo in cambios)
        db.execute(
            f"""UPDATE tareas_planificadas SET {asignaciones}
                WHERE id = :id AND usuario_id = :usuario_id""", {**identidad, **cambios},
        )
        fila = db.execute(
            """SELECT id, titulo, tipo, fecha_limite, minutos_estimados, minutos_semanales, asignatura_id
               FROM tareas_planificadas WHERE id = :id AND usuario_id = :usuario_id""",
            identidad,
        ).fetchone()
    return jsonify(dict(fila))


@app.delete("/api/tareas/<int:tarea_id>")
@login_required
def eliminar_tarea(tarea_id):
    db = get_db()
    with db:
        cursor = db.execute(
            "DELETE FROM tareas_planificadas WHERE id = ? AND usuario_id = ?",
            (str(tarea_id), session["usuario_id"]),
        )
    if not cursor.rowcount:
        return jsonify(error="Tarea o entrega no encontrada."), 404
    return "", 204


# --- MODELO / API PARA GENERADOR DE PLANES DE ESTUDIO (HU12, HU06) ---

def obtener_datos_planificacion(usuario_id):
    """Devuelve dificultad y prioridad de asignaturas y tareas para HU06."""
    db = get_db()
    asignaturas_rows = db.execute(
        """SELECT id, usuario_id, nombre, dificultad, prioridad, minutos_semanales
           FROM asignaturas
           WHERE usuario_id = ?
           ORDER BY id DESC""",
        (usuario_id,),
    ).fetchall()
    todos_rows = db.execute(
        """SELECT id, usuario_id, titulo, completada, prioridad, fecha_creacion
           FROM todos
           WHERE usuario_id = ?
           ORDER BY id DESC""",
        (usuario_id,),
    ).fetchall()
    return {
        "asignaturas": [asignatura_to_dict(row) for row in asignaturas_rows],
        "tareas": [todo_to_dict(row) for row in todos_rows],
        "tareas_planificadas": listar_tareas_planificadas(usuario_id),
    }


@app.get("/api/plan/datos")
@login_required
def api_datos_planificacion():
    """Expone dificultad y prioridad de asignaturas y tareas al generador (HU06)."""
    usuario_id = session["usuario_id"]
    return jsonify(obtener_datos_planificacion(usuario_id)), 200


# --- Vista previa del plan semanal: no persiste sesiones (HU42). ---
@app.route("/api/plan/semana", methods=["GET", "POST"])
@login_required
def api_plan_semana():
    from planificador import generar_semana
    usuario_id = session["usuario_id"]
    datos = request.get_json(silent=True) if request.method == "POST" else None
    if request.method == "POST" and not isinstance(datos, dict):
        return jsonify(error="Se requiere un objeto JSON."), 400
    parametros = datos if datos is not None else request.args
    inicio = parametros.get("inicio", hoy_planificador().isoformat())
    try:
        # Validación estricta y límites para evitar cargas excesivas.
        duracion = int(parametros.get("duracion", "60"))
        descanso = int(parametros.get("descanso", "15"))
        if not (25 <= duracion <= 180 and 0 <= descanso <= 60):
            raise ValueError("Duración o descanso fuera de rango.")
        fecha_inicio = date.fromisoformat(inicio)
        if not (hoy_planificador() - timedelta(days=7) <= fecha_inicio <= hoy_planificador() + timedelta(days=365)):
            raise ValueError("La fecha debe estar entre hace siete días y dentro de un año.")
        db = get_db()
        materias = [dict(row) for row in db.execute(
            "SELECT id, nombre, dificultad, prioridad, minutos_semanales FROM asignaturas WHERE usuario_id = ? ORDER BY id",
            (usuario_id,)).fetchall()]
        actividades = [dict(row) for row in db.execute(
            """SELECT id, titulo, tipo, fecha_limite, minutos_estimados, minutos_semanales, asignatura_id
               FROM tareas_planificadas WHERE usuario_id = ? AND fecha_limite >= ?
               ORDER BY fecha_limite, id""", (usuario_id, inicio)).fetchall()]
        clases = [dict(row) for row in db.execute(
            """SELECT dia_semana, hora_inicio, hora_fin FROM horarios_clases
               WHERE usuario_id = ?""", (usuario_id,)).fetchall()]
        periodos = [dict(row) for row in db.execute(
            """SELECT fecha_inicio, fecha_fin FROM periodos_libres
               WHERE usuario_id = ? AND fecha_fin >= ?""", (usuario_id, inicio)).fetchall()]
        plan = generar_semana(
            fecha_inicio, materias, actividades, clases, periodos,
            hora_inicio=parametros.get("desde", "16:00"),
            hora_fin=parametros.get("hasta", "21:00"),
            duracion=duracion, descanso=descanso,
            bloqueos=parametros.get("bloqueos", []))
    except (ValueError, TypeError, OverflowError) as exc:
        return jsonify(error=str(exc)), 400
    return jsonify(plan), 200


# ==============================================================================
# HORARIOS DE CLASES Y PERÍODOS LIBRES (DISPONIBILIDAD ACADÉMICA)
# ==============================================================================

DIAS_SEMANA_VALIDOS = ("lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo")
HORA_REGEX = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def normalizar_dia_semana(dia):
    """Normaliza el día de la semana eliminando tildes y espacios."""
    if not isinstance(dia, str):
        return None
    d = dia.strip().lower()
    tildes = {"miércoles": "miercoles", "sábado": "sabado"}
    return tildes.get(d, d)


def es_hora_valida(hora_str):
    """Valida que una cadena tenga el formato de hora HH:MM (24 horas)."""
    return isinstance(hora_str, str) and bool(HORA_REGEX.match(hora_str.strip()))


def es_fecha_iso_valida(fecha_str):
    """Valida que una cadena tenga formato AAAA-MM-DD y sea fecha válida."""
    if not isinstance(fecha_str, str):
        return False
    try:
        f = date.fromisoformat(fecha_str.strip())
        return f.isoformat() == fecha_str.strip()
    except (ValueError, TypeError):
        return False


def horario_to_dict(row):
    """Serializa un registro de horario de clase a diccionario."""
    keys = row.keys()
    data = {
        "id": row["id"],
        "usuario_id": row["usuario_id"],
        "asignatura_id": row["asignatura_id"],
        "dia_semana": row["dia_semana"],
        "hora_inicio": row["hora_inicio"],
        "hora_fin": row["hora_fin"],
        "aula": row["aula"] if "aula" in keys and row["aula"] is not None else "",
    }
    if "asignatura_nombre" in keys:
        data["asignatura_nombre"] = row["asignatura_nombre"]
    if "asignatura_dificultad" in keys:
        data["asignatura_dificultad"] = row["asignatura_dificultad"]
    if "asignatura_prioridad" in keys:
        data["asignatura_prioridad"] = row["asignatura_prioridad"]
    return data


def periodo_libre_to_dict(row):
    """Serializa un registro de día/período libre a diccionario."""
    return {
        "id": row["id"],
        "usuario_id": row["usuario_id"],
        "fecha_inicio": row["fecha_inicio"],
        "fecha_fin": row["fecha_fin"],
        "motivo": row["motivo"] if "motivo" in row.keys() and row["motivo"] is not None else "Día libre",
    }


def buscar_solapamiento_horario(db, usuario_id, dia_semana, hora_inicio, hora_fin, exclude_id=None):
    """
    Busca si existe algún bloque de clase que se solape con el intervalo horario propuesto
    para el mismo usuario y día de la semana.
    """
    query = """
        SELECT h.id, a.nombre AS asignatura_nombre, h.hora_inicio, h.hora_fin
        FROM horarios_clases h
        JOIN asignaturas a ON h.asignatura_id = a.id
        WHERE h.usuario_id = ? AND h.dia_semana = ?
          AND h.hora_inicio < ? AND h.hora_fin > ?
    """
    params = [usuario_id, dia_semana, hora_fin, hora_inicio]
    if exclude_id is not None:
        query += " AND h.id != ?"
        params.append(exclude_id)
    return db.execute(query, params).fetchone()


def resolver_o_crear_asignatura(db, usuario_id, data):
    """
    Obtiene el ID de la asignatura seleccionada o crea una nueva si se introduce
    el nombre de una asignatura inexistente para este usuario.
    """
    asignatura_id = data.get("asignatura_id")
    asignatura_nombre = data.get("asignatura_nombre") or data.get("nombre_asignatura")

    # Caso 1: ID explícito enviado
    if asignatura_id is not None and str(asignatura_id).strip() != "" and str(asignatura_id) != "__nueva__":
        try:
            asig_id_int = int(asignatura_id)
        except (ValueError, TypeError):
            raise ValueError("El identificador de la asignatura debe ser un número entero.")
        asig = db.execute(
            "SELECT id, nombre FROM asignaturas WHERE id = ? AND usuario_id = ?",
            (asig_id_int, usuario_id),
        ).fetchone()
        if asig is None:
            raise ValueError("La asignatura seleccionada no existe o no pertenece a tu usuario.")
        return asig["id"]

    # Caso 2: Nombre de asignatura proporcionado (nueva o existente por nombre)
    if isinstance(asignatura_nombre, str) and asignatura_nombre.strip():
        nombre_limpio = asignatura_nombre.strip()
        # Buscar en las asignaturas del usuario con casefold (soporta tildes en español)
        asigs_usuario = db.execute(
            "SELECT id, nombre FROM asignaturas WHERE usuario_id = ?",
            (usuario_id,),
        ).fetchall()
        for asig in asigs_usuario:
            if asig["nombre"].strip().casefold() == nombre_limpio.casefold():
                return asig["id"]

        # Si no existe, se crea automáticamente con valores por defecto
        cursor = db.execute(
            "INSERT INTO asignaturas (usuario_id, nombre, dificultad, prioridad) VALUES (?, ?, 'media', 'media')",
            (usuario_id, nombre_limpio),
        )
        return cursor.lastrowid

    raise ValueError("Debes seleccionar una asignatura existente o escribir el nombre de una nueva.")


# --- ENDPOINTS HORARIOS DE CLASES ---

@app.get("/api/horarios")
@login_required
def listar_horarios():
    """Devuelve todos los bloques de clases semanales del usuario autenticado."""
    usuario_id = session["usuario_id"]
    db = get_db()
    rows = db.execute(
        """SELECT h.id, h.usuario_id, h.asignatura_id, h.dia_semana,
                  h.hora_inicio, h.hora_fin, h.aula,
                  a.nombre AS asignatura_nombre, a.dificultad AS asignatura_dificultad,
                  a.prioridad AS asignatura_prioridad
           FROM horarios_clases h
           JOIN asignaturas a ON h.asignatura_id = a.id
           WHERE h.usuario_id = ?
           ORDER BY
             CASE h.dia_semana
               WHEN 'lunes' THEN 1
               WHEN 'martes' THEN 2
               WHEN 'miercoles' THEN 3
               WHEN 'jueves' THEN 4
               WHEN 'viernes' THEN 5
               WHEN 'sabado' THEN 6
               WHEN 'domingo' THEN 7
             END,
             h.hora_inicio ASC,
             h.id ASC""",
        (usuario_id,),
    ).fetchall()
    return jsonify([horario_to_dict(row) for row in rows]), 200


@app.post("/api/horarios")
@login_required
def crear_horario():
    """Crea un nuevo bloque de clase en el horario semanal."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Debes enviar un objeto JSON con los datos del horario."}), 400

    dia_semana = normalizar_dia_semana(data.get("dia_semana"))
    if dia_semana not in DIAS_SEMANA_VALIDOS:
        return jsonify({"error": "El día de la semana debe ser lunes, martes, miercoles, jueves, viernes, sabado o domingo."}), 400

    hora_inicio = str(data.get("hora_inicio", "")).strip()
    hora_fin = str(data.get("hora_fin", "")).strip()

    if not es_hora_valida(hora_inicio) or not es_hora_valida(hora_fin):
        return jsonify({"error": "Las horas de inicio y fin deben tener formato válido HH:MM."}), 400

    if hora_inicio >= hora_fin:
        return jsonify({"error": "La hora de inicio debe ser anterior a la hora de fin."}), 400

    aula = str(data.get("aula", "")).strip() if data.get("aula") is not None else ""

    usuario_id = session["usuario_id"]
    db = get_db()

    with db:
        try:
            asignatura_id = resolver_o_crear_asignatura(db, usuario_id, data)
        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        solapado = buscar_solapamiento_horario(db, usuario_id, dia_semana, hora_inicio, hora_fin)
        if solapado is not None:
            return jsonify({
                "error": f"El horario se solapa con la clase existente '{solapado['asignatura_nombre']}' ({solapado['hora_inicio']} - {solapado['hora_fin']})."
            }), 400

        cursor = db.execute(
            """INSERT INTO horarios_clases
               (usuario_id, asignatura_id, dia_semana, hora_inicio, hora_fin, aula)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (usuario_id, asignatura_id, dia_semana, hora_inicio, hora_fin, aula),
        )
        row = db.execute(
            """SELECT h.id, h.usuario_id, h.asignatura_id, h.dia_semana,
                      h.hora_inicio, h.hora_fin, h.aula,
                      a.nombre AS asignatura_nombre, a.dificultad AS asignatura_dificultad,
                      a.prioridad AS asignatura_prioridad
               FROM horarios_clases h
               JOIN asignaturas a ON h.asignatura_id = a.id
               WHERE h.id = ? AND h.usuario_id = ?""",
            (cursor.lastrowid, usuario_id),
        ).fetchone()

    return jsonify(horario_to_dict(row)), 201


@app.get("/api/horarios/<int:horario_id>")
@login_required
def obtener_horario(horario_id):
    """Devuelve los detalles de un bloque de clase del usuario actual."""
    usuario_id = session["usuario_id"]
    row = get_db().execute(
        """SELECT h.id, h.usuario_id, h.asignatura_id, h.dia_semana,
                  h.hora_inicio, h.hora_fin, h.aula,
                  a.nombre AS asignatura_nombre, a.dificultad AS asignatura_dificultad,
                  a.prioridad AS asignatura_prioridad
           FROM horarios_clases h
           JOIN asignaturas a ON h.asignatura_id = a.id
           WHERE h.id = ? AND h.usuario_id = ?""",
        (horario_id, usuario_id),
    ).fetchone()
    if row is None:
        return jsonify({"error": "Bloque de horario no encontrado."}), 404
    return jsonify(horario_to_dict(row)), 200


@app.route("/api/horarios/<int:horario_id>", methods=["PATCH", "PUT"])
@login_required
def actualizar_horario(horario_id):
    """Actualiza un bloque de clase existente."""
    usuario_id = session["usuario_id"]
    db = get_db()

    actual = db.execute(
        "SELECT * FROM horarios_clases WHERE id = ? AND usuario_id = ?",
        (horario_id, usuario_id),
    ).fetchone()
    if actual is None:
        return jsonify({"error": "Bloque de horario no encontrado."}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Debes enviar los campos que deseas actualizar."}), 400

    dia_semana = actual["dia_semana"]
    if "dia_semana" in data:
        dia_norm = normalizar_dia_semana(data["dia_semana"])
        if dia_norm not in DIAS_SEMANA_VALIDOS:
            return jsonify({"error": "El día de la semana no es válido."}), 400
        dia_semana = dia_norm

    hora_inicio = str(data["hora_inicio"]).strip() if "hora_inicio" in data else actual["hora_inicio"]
    hora_fin = str(data["hora_fin"]).strip() if "hora_fin" in data else actual["hora_fin"]

    if not es_hora_valida(hora_inicio) or not es_hora_valida(hora_fin):
        return jsonify({"error": "Las horas deben tener formato válido HH:MM."}), 400

    if hora_inicio >= hora_fin:
        return jsonify({"error": "La hora de inicio debe ser anterior a la hora de fin."}), 400

    aula = str(data["aula"]).strip() if "aula" in data else actual["aula"]

    with db:
        asignatura_id = actual["asignatura_id"]
        if "asignatura_id" in data or "asignatura_nombre" in data or "nombre_asignatura" in data:
            try:
                asignatura_id = resolver_o_crear_asignatura(db, usuario_id, data)
            except ValueError as e:
                return jsonify({"error": str(e)}), 400

        solapado = buscar_solapamiento_horario(db, usuario_id, dia_semana, hora_inicio, hora_fin, exclude_id=horario_id)
        if solapado is not None:
            return jsonify({
                "error": f"El horario modificado se solapa con '{solapado['asignatura_nombre']}' ({solapado['hora_inicio']} - {solapado['hora_fin']})."
            }), 400

        db.execute(
            """UPDATE horarios_clases
               SET asignatura_id = ?, dia_semana = ?, hora_inicio = ?, hora_fin = ?, aula = ?
               WHERE id = ? AND usuario_id = ?""",
            (asignatura_id, dia_semana, hora_inicio, hora_fin, aula, horario_id, usuario_id),
        )
        row = db.execute(
            """SELECT h.id, h.usuario_id, h.asignatura_id, h.dia_semana,
                      h.hora_inicio, h.hora_fin, h.aula,
                      a.nombre AS asignatura_nombre, a.dificultad AS asignatura_dificultad,
                      a.prioridad AS asignatura_prioridad
               FROM horarios_clases h
               JOIN asignaturas a ON h.asignatura_id = a.id
               WHERE h.id = ? AND h.usuario_id = ?""",
            (horario_id, usuario_id),
        ).fetchone()

    return jsonify(horario_to_dict(row)), 200


@app.delete("/api/horarios/<int:horario_id>")
@login_required
def eliminar_horario(horario_id):
    """Elimina un bloque de clase del horario."""
    usuario_id = session["usuario_id"]
    db = get_db()
    with db:
        cursor = db.execute(
            "DELETE FROM horarios_clases WHERE id = ? AND usuario_id = ?",
            (horario_id, usuario_id),
        )
    if cursor.rowcount == 0:
        return jsonify({"error": "Bloque de horario no encontrado."}), 404
    return jsonify({"mensaje": "Clase eliminada del horario con éxito."}), 200


# --- ENDPOINTS DÍAS Y PERÍODOS LIBRES ---

@app.get("/api/periodos-libres")
@login_required
def listar_periodos_libres():
    """Devuelve los períodos y días libres registrados por el usuario."""
    usuario_id = session["usuario_id"]
    rows = get_db().execute(
        """SELECT id, usuario_id, fecha_inicio, fecha_fin, motivo
           FROM periodos_libres
           WHERE usuario_id = ?
           ORDER BY fecha_inicio ASC, fecha_fin ASC, id ASC""",
        (usuario_id,),
    ).fetchall()
    return jsonify([periodo_libre_to_dict(row) for row in rows]), 200


@app.post("/api/periodos-libres")
@login_required
def crear_periodo_libre():
    """Registra un nuevo día o rango de fechas libres/festivas."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Debes enviar un objeto JSON con las fechas del período libre."}), 400

    fecha_inicio = str(data.get("fecha_inicio", "")).strip()
    if not es_fecha_iso_valida(fecha_inicio):
        return jsonify({"error": "La fecha de inicio debe tener formato válido AAAA-MM-DD."}), 400

    fecha_fin = str(data.get("fecha_fin", "")).strip() if data.get("fecha_fin") else fecha_inicio
    if not es_fecha_iso_valida(fecha_fin):
        return jsonify({"error": "La fecha de fin debe tener formato válido AAAA-MM-DD."}), 400

    if fecha_inicio > fecha_fin:
        return jsonify({"error": "La fecha de inicio no puede ser posterior a la fecha de fin."}), 400

    motivo = str(data.get("motivo", "")).strip()
    if not motivo:
        motivo = "Día libre"
    elif len(motivo) > 200:
        return jsonify({"error": "El motivo no puede superar los 200 caracteres."}), 400

    usuario_id = session["usuario_id"]
    db = get_db()
    with db:
        cursor = db.execute(
            """INSERT INTO periodos_libres (usuario_id, fecha_inicio, fecha_fin, motivo)
               VALUES (?, ?, ?, ?)""",
            (usuario_id, fecha_inicio, fecha_fin, motivo),
        )
        row = db.execute(
            "SELECT id, usuario_id, fecha_inicio, fecha_fin, motivo FROM periodos_libres WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()

    return jsonify(periodo_libre_to_dict(row)), 201


@app.get("/api/periodos-libres/<int:periodo_id>")
@login_required
def obtener_periodo_libre(periodo_id):
    """Obtiene los detalles de un período libre propio."""
    usuario_id = session["usuario_id"]
    row = get_db().execute(
        "SELECT id, usuario_id, fecha_inicio, fecha_fin, motivo FROM periodos_libres WHERE id = ? AND usuario_id = ?",
        (periodo_id, usuario_id),
    ).fetchone()
    if row is None:
        return jsonify({"error": "Período libre no encontrado."}), 404
    return jsonify(periodo_libre_to_dict(row)), 200


@app.route("/api/periodos-libres/<int:periodo_id>", methods=["PATCH", "PUT"])
@login_required
def actualizar_periodo_libre(periodo_id):
    """Actualiza las fechas o motivo de un período libre existente."""
    usuario_id = session["usuario_id"]
    db = get_db()
    actual = db.execute(
        "SELECT * FROM periodos_libres WHERE id = ? AND usuario_id = ?",
        (periodo_id, usuario_id),
    ).fetchone()
    if actual is None:
        return jsonify({"error": "Período libre no encontrado."}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Debes enviar los campos a actualizar."}), 400

    fecha_inicio = str(data["fecha_inicio"]).strip() if "fecha_inicio" in data else actual["fecha_inicio"]
    fecha_fin = str(data["fecha_fin"]).strip() if "fecha_fin" in data else actual["fecha_fin"]

    if not es_fecha_iso_valida(fecha_inicio) or not es_fecha_iso_valida(fecha_fin):
        return jsonify({"error": "Las fechas deben tener formato válido AAAA-MM-DD."}), 400

    if fecha_inicio > fecha_fin:
        return jsonify({"error": "La fecha de inicio no puede ser posterior a la fecha de fin."}), 400

    motivo = actual["motivo"]
    if "motivo" in data:
        m = str(data["motivo"]).strip()
        motivo = m if m else "Día libre"
        if len(motivo) > 200:
            return jsonify({"error": "El motivo no puede superar los 200 caracteres."}), 400

    with db:
        db.execute(
            """UPDATE periodos_libres SET fecha_inicio = ?, fecha_fin = ?, motivo = ?
               WHERE id = ? AND usuario_id = ?""",
            (fecha_inicio, fecha_fin, motivo, periodo_id, usuario_id),
        )
        row = db.execute(
            "SELECT id, usuario_id, fecha_inicio, fecha_fin, motivo FROM periodos_libres WHERE id = ?",
            (periodo_id,),
        ).fetchone()

    return jsonify(periodo_libre_to_dict(row)), 200


@app.delete("/api/periodos-libres/<int:periodo_id>")
@login_required
def eliminar_periodo_libre(periodo_id):
    """Elimina un día o período libre."""
    usuario_id = session["usuario_id"]
    db = get_db()
    with db:
        cursor = db.execute(
            "DELETE FROM periodos_libres WHERE id = ? AND usuario_id = ?",
            (periodo_id, usuario_id),
        )
    if cursor.rowcount == 0:
        return jsonify({"error": "Período libre no encontrado."}), 404
    return jsonify({"mensaje": "Período libre eliminado con éxito."}), 200


# ==============================================================================
# ARQUITECTURA / PREPARACIÓN PARA FUTURA PLANIFICACIÓN (HU02, HU05, HU06)
# ==============================================================================

MAPA_DIAS_SEMANA_PYTHON = {
    0: "lunes",
    1: "martes",
    2: "miercoles",
    3: "jueves",
    4: "viernes",
    5: "sabado",
    6: "domingo",
}


def obtener_intervalos_ocupados(usuario_id, fecha_objetivo):
    """
    Consulta el horario de clases y los períodos libres de un usuario para una fecha determinada.

    Determina si la fecha coincide con un día libre o festivo registrado y extrae las clases
    semanales que se imparten ese día con sus respectivos intervalos horarios.

    Esta función sirve como punto de partida arquitectónico para que el motor de planificación
    automática (HU06, HU08) conozca la disponibilidad real del estudiante y evite agendar sesiones
    durante horas lectivas o en períodos no lectivos.

    Parámetros:
        usuario_id (int): Identificador del estudiante.
        fecha_objetivo (date | str): Fecha en formato 'AAAA-MM-DD' o instancia de date.

    Retorna:
        dict con:
            - 'fecha': str 'AAAA-MM-DD'.
            - 'dia_semana': str ('lunes', 'martes', etc.).
            - 'es_dia_libre': bool (True si la fecha está dentro de algún período libre o festivo).
            - 'motivo_dia_libre': str | None (etiqueta del período libre, si aplica).
            - 'clases': list de dicts con las clases de ese día (vacío si no hay clases o es festivo).
            - 'intervalos_ocupados': list de tuplas (hora_inicio, hora_fin, descripcion).
    """
    if isinstance(fecha_objetivo, str):
        fecha_date = date.fromisoformat(fecha_objetivo.strip())
        fecha_str = fecha_date.isoformat()
    elif isinstance(fecha_objetivo, (date, datetime)):
        fecha_date = fecha_objetivo if isinstance(fecha_objetivo, date) and not isinstance(fecha_objetivo, datetime) else fecha_objetivo.date()
        fecha_str = fecha_date.isoformat()
    else:
        raise ValueError("fecha_objetivo debe ser un objeto date, datetime o una cadena 'AAAA-MM-DD'.")

    dia_semana = MAPA_DIAS_SEMANA_PYTHON[fecha_date.weekday()]
    db = get_db()

    # 1. Comprobar si coincide con un período libre
    periodo_libre = db.execute(
        """SELECT id, fecha_inicio, fecha_fin, motivo
           FROM periodos_libres
           WHERE usuario_id = ? AND ? BETWEEN fecha_inicio AND fecha_fin
           LIMIT 1""",
        (usuario_id, fecha_str),
    ).fetchone()

    es_dia_libre = periodo_libre is not None
    motivo_dia_libre = periodo_libre["motivo"] if es_dia_libre else None

    # 2. Obtener clases del día de la semana correspondiente
    filas_clases = db.execute(
        """SELECT h.id, h.asignatura_id, h.dia_semana, h.hora_inicio, h.hora_fin, h.aula,
                  a.nombre AS asignatura_nombre
           FROM horarios_clases h
           JOIN asignaturas a ON h.asignatura_id = a.id
           WHERE h.usuario_id = ? AND h.dia_semana = ?
           ORDER BY h.hora_inicio ASC""",
        (usuario_id, dia_semana),
    ).fetchall()

    clases = [dict(f) for f in filas_clases]
    intervalos_ocupados = []

    if es_dia_libre:
        # En día libre o festivo, se marca el día completo o se anota el período
        intervalos_ocupados.append(("00:00", "23:59", f"Período libre: {motivo_dia_libre}"))
    else:
        for c in clases:
            intervalos_ocupados.append((c["hora_inicio"], c["hora_fin"], f"Clase: {c['asignatura_nombre']}"))

    return {
        "fecha": fecha_str,
        "dia_semana": dia_semana,
        "es_dia_libre": es_dia_libre,
        "motivo_dia_libre": motivo_dia_libre,
        "clases": clases if not es_dia_libre else [],
        "intervalos_ocupados": intervalos_ocupados,
    }


def is_time_slot_available(usuario_id, target_datetime, duration_minutes=60):
    """
    Verifica si una franja de estudio propuesta está libre de clases lectivas y no cae en festivo.

    Parámetros:
        usuario_id (int): Identificador del estudiante.
        target_datetime (datetime | str): Fecha y hora de inicio de la franja.
        duration_minutes (int): Duración en minutos de la franja requerida (por defecto 60).

    Retorna:
        bool: True si la franja horaria no se solapa con ninguna clase lectiva programada
              para ese día ni coincide con un día festivo/libre completo.
    """
    if isinstance(target_datetime, str):
        target_dt = datetime.fromisoformat(target_datetime.strip())
    elif isinstance(target_datetime, datetime):
        target_dt = target_datetime
    else:
        raise ValueError("target_datetime debe ser una instancia de datetime o cadena ISO.")

    fecha_target = target_dt.date()
    info_dia = obtener_intervalos_ocupados(usuario_id, fecha_target)

    # Si es día libre, depende de si se permite estudiar en festivos;
    # arquitecturalmente no hay clases, pero el día está bloqueado por descanso/festivo.
    if info_dia["es_dia_libre"]:
        return False

    inicio_slot_str = target_dt.strftime("%H:%M")
    fin_slot_dt = target_dt + timedelta(minutes=duration_minutes)
    fin_slot_str = fin_slot_dt.strftime("%H:%M")

    # Comprobar solapamiento con las clases de ese día
    for clase in info_dia["clases"]:
        c_inicio = clase["hora_inicio"]
        c_fin = clase["hora_fin"]
        # Solapamiento [inicio_slot, fin_slot) con [c_inicio, c_fin)
        if inicio_slot_str < c_fin and fin_slot_str > c_inicio:
            return False

    return True

# Prepara o actualiza el esquema al importar el módulo, antes de atender rutas.
initialize_database()

# ==============================================================================
# HISTORIA DE USUARIO 19 (HU19) - RECORDATORIOS DE EVENTOS PRÓXIMOS
# ==============================================================================
import os
import sqlite3
from datetime import datetime, timedelta
from flask import jsonify, session
@app.route('/api/recordatorios/configuracion', methods=['GET', 'PUT'])
def configurar_recordatorios():
    """Consultar o guardar los días de aviso anticipado del usuario autenticado."""
    user_id = session.get('usuario_id') or session.get('user_id')
    if not user_id:
        return jsonify({'error': 'No autorizado'}), 401
    db = get_db()
    if request.method == 'PUT':
        datos = request.get_json(silent=True)
        if not isinstance(datos, dict):
            return jsonify({'error': 'Se requiere un objeto JSON'}), 400
        dias = datos.get('dias_anticipacion')
        if type(dias) is not int or not 0 <= dias <= 365:
            return jsonify({'error': 'La antelación debe ser un entero entre 0 y 365 días'}), 400
        with db:
            db.execute("""INSERT INTO preferencias_recordatorios (usuario_id, dias_anticipacion)
                          VALUES (?, ?) ON CONFLICT(usuario_id)
                          DO UPDATE SET dias_anticipacion = excluded.dias_anticipacion""",
                       (user_id, dias))
        return jsonify({'dias_anticipacion': dias}), 200
    fila = db.execute('SELECT dias_anticipacion FROM preferencias_recordatorios WHERE usuario_id = ?', (user_id,)).fetchone()
    return jsonify({'dias_anticipacion': fila['dias_anticipacion'] if fila else 7}), 200


@app.route('/api/recordatorios', methods=['GET'])
def obtener_recordatorios():
    # Detectar el ID de usuario desde la sesión
    user_id = session.get('usuario_id') or session.get('user_id')
    if not user_id:
        return jsonify({
            'status': 'error',
            'error': 'No autorizado',
            'mensaje': 'No autorizado',
        }), 401

    hoy = hoy_planificador()
    db = get_db()
    preferencia = db.execute("SELECT dias_anticipacion FROM preferencias_recordatorios WHERE usuario_id = ?", (user_id,)).fetchone()
    dias_anticipacion = preferencia['dias_anticipacion'] if preferencia else 7
    limite_dias = hoy + timedelta(days=dias_anticipacion)
    recordatorios = []

    try:
        db = get_db()
        cursor = db.cursor()

        proximas = db.execute(
            """SELECT id, tipo, titulo, fecha_limite FROM tareas_planificadas
               WHERE usuario_id = ? AND fecha_limite BETWEEN ? AND ?
               ORDER BY fecha_limite, id""",
            (user_id, hoy.isoformat(), limite_dias.isoformat()),
        )
        for fila in proximas:
            dias = (date.fromisoformat(fila["fecha_limite"]) - hoy).days
            if fila["tipo"] == "examen":
                mensaje = "El examen es hoy" if dias == 0 else f"Examen en {dias} día(s)"
            else:
                mensaje = "Vence hoy" if dias == 0 else f"Vence en {dias} día(s)"
            recordatorios.append({
                "id": f"hu04-{fila['id']}",
                "tipo": fila["tipo"].capitalize(),
                "titulo": fila["titulo"],
                "fecha": fila["fecha_limite"],
                "dias_restantes": dias,
                "mensaje": mensaje,
                "urgencia": "alta" if dias <= 1 else ("media" if dias <= 3 else "baja"),
            })

        # 1. Tareas / Entregas próximas
        try:
            cursor.execute("""
                SELECT id, titulo, fecha_entrega 
                FROM tareas 
                WHERE (user_id = ? OR usuario_id = ?)
            """, (user_id, user_id))
            
            for row in cursor.fetchall():
                raw_fecha = row['fecha_entrega'] if 'fecha_entrega' in row.keys() else None
                if not raw_fecha:
                    continue
                
                try:
                    fecha_obj = datetime.strptime(str(raw_fecha).split('.')[0], '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    try:
                        fecha_obj = datetime.strptime(str(raw_fecha), '%Y-%m-%d')
                    except ValueError:
                        continue

                if hoy <= fecha_obj.date() <= limite_dias:
                    dias = (fecha_obj.date() - hoy).days
                    recordatorios.append({
                        'id': f"tarea-{row['id']}",
                        'tipo': 'Entrega',
                        'titulo': row['titulo'],
                        'fecha': str(raw_fecha),
                        'dias_restantes': dias,
                        'mensaje': f"Entrega próxima en {dias} día(s)" if dias > 0 else "¡La entrega es HOY!",
                        'urgencia': 'alta' if dias <= 1 else ('media' if dias <= 3 else 'baja')
                    })
        except Exception:
            pass

        # 2. Exámenes próximos
        try:
            cursor.execute("""
                SELECT id, titulo, fecha_examen 
                FROM examenes 
                WHERE (user_id = ? OR usuario_id = ?)
            """, (user_id, user_id))

            for row in cursor.fetchall():
                raw_fecha = row['fecha_examen'] if 'fecha_examen' in row.keys() else None
                if not raw_fecha:
                    continue

                try:
                    fecha_obj = datetime.strptime(str(raw_fecha).split('.')[0], '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    try:
                        fecha_obj = datetime.strptime(str(raw_fecha), '%Y-%m-%d')
                    except ValueError:
                        continue

                if hoy <= fecha_obj.date() <= limite_dias:
                    dias = (fecha_obj.date() - hoy).days
                    recordatorios.append({
                        'id': f"examen-{row['id']}",
                        'tipo': 'Examen',
                        'titulo': row['titulo'],
                        'fecha': str(raw_fecha),
                        'dias_restantes': dias,
                        'mensaje': f"Examen programado en {dias} día(s)" if dias > 0 else "¡El examen es HOY!",
                        'urgencia': 'alta' if dias <= 2 else 'media'
                    })
        except Exception:
            pass

        recordatorios.sort(key=lambda item: item['dias_restantes'])

        return jsonify({
            'status': 'success',
            'total': len(recordatorios),
            'dias_anticipacion': dias_anticipacion,
            'recordatorios': recordatorios
        }), 200

    except Exception as e:
        return jsonify({'status': 'error', 'mensaje': str(e)}), 500


# Catálogo de escudos de las cinco grandes ligas y Segunda División española.
# Se consulta por competición para evitar mantener listas desactualizadas tras ascensos.
CLUB_LEAGUES = {
    "esp.1": "LaLiga EA Sports",
    "esp.2": "LaLiga Hypermotion (Segunda)",
    "eng.1": "Premier League",
    "ger.1": "Bundesliga",
    "ita.1": "Serie A",
    "fra.1": "Ligue 1",
}
_club_cache = {}


@app.get("/api/perfil/escudos")
def api_perfil_escudos():
    """Devuelve equipos y URLs de escudos de una liga permitida, con caché."""
    import json
    import time
    from urllib.request import Request, urlopen

    liga = request.args.get("liga", "")
    if liga not in CLUB_LEAGUES:
        return jsonify({"error": "Liga no válida"}), 400
    cached = _club_cache.get(liga)
    if cached and time.time() - cached["timestamp"] < 86400:
        return jsonify({"liga": liga, "nombre": CLUB_LEAGUES[liga], "equipos": cached["equipos"]})
    url = "https://site.api.espn.com/apis/site/v2/sports/soccer/" + liga + "/teams?limit=100"
    try:
        req = Request(url, headers={"User-Agent": "StudyPlan/1.0", "Accept": "application/json"})
        with urlopen(req, timeout=8) as response:
            data = json.load(response)
        equipos = []
        for sport in data.get("sports", []):
            for league in sport.get("leagues", []):
                for entry in league.get("teams", []):
                    team = entry.get("team", {})
                    logos = team.get("logos") or []
                    logo = next((x.get("href") for x in logos if isinstance(x, dict) and x.get("href", "").startswith("https://")), None)
                    name = team.get("displayName")
                    team_id = str(team.get("id", ""))
                    if team_id.isdigit() and name and logo:
                        equipos.append({"id": team_id, "nombre": name, "escudo": logo})
        equipos.sort(key=lambda item: item["nombre"].casefold())
        if not equipos:
            raise ValueError("La fuente no ha devuelto escudos")
        _club_cache[liga] = {"timestamp": time.time(), "equipos": equipos}
        return jsonify({"liga": liga, "nombre": CLUB_LEAGUES[liga], "equipos": equipos})
    except (OSError, ValueError, KeyError, TypeError) as exc:
        if cached:
            return jsonify({"liga": liga, "nombre": CLUB_LEAGUES[liga], "equipos": cached["equipos"], "cache": True})
        return jsonify({"error": "No se han podido cargar los escudos de esta liga. Inténtalo de nuevo."}), 503


# HU44: puzzles externos (datos abiertos de Lichess) mediante Chess Puzzle API.
# La respuesta de soluciones solo se obtiene en el servidor; se almacena en caché diaria.
_chess_cache = {}
CHESS_PUZZLE_API = "https://chess.mauriulloa.com/v1/puzzles"


def _chess_fetch_json(url):
    import json
    from urllib.request import Request, urlopen
    req = Request(url, headers={"User-Agent": "StudyPlan/1.0", "Accept": "application/json"})
    with urlopen(req, timeout=8) as response:
        return json.load(response)


# Reserva local cuando el servicio externo no responde o devuelve un lote incompleto.
# Se mantiene el mismo contrato JSON y la comprobación de movimientos en Flask.
CHESS_FALLBACK = [
    {"id": "local-a", "fen": "k7/8/1QK5/8/8/8/8/8 w - - 0 1", "color": "white", "rating": 600, "move": "b6b7"},
    {"id": "local-b", "fen": "7k/8/5KQ1/8/8/8/8/8 w - - 0 1", "color": "white", "rating": 600, "move": "g6g7"},
    {"id": "local-c", "fen": "8/8/8/8/8/1QK5/8/k7 w - - 0 1", "color": "white", "rating": 600, "move": "b3b2"},
    {"id": "local-d", "fen": "8/8/8/8/8/5KQ1/8/7k w - - 0 1", "color": "white", "rating": 600, "move": "g3g2"},
    {"id": "local-e", "fen": "k7/2K5/1Q6/8/8/8/8/8 w - - 0 1", "color": "white", "rating": 600, "move": "b6b7"},
]


def _chess_daily_set(today):
    """Obtiene cinco problemas de mate en una jugada; reutiliza el mismo lote durante el día."""
    import time
    cached = _chess_cache.get(today)
    if cached:
        return cached
    try:
        raw = _chess_fetch_json(CHESS_PUZZLE_API + "/random?themes=mateIn1&count=5")
        items = raw if isinstance(raw, list) else (
            raw.get("puzzles", raw.get("data", [])) if isinstance(raw, dict) else []
        )
        if isinstance(items, dict):
            items = items.get("puzzles", items.get("items", []))
        if not isinstance(items, list):
            raise ValueError("Formato de problemas no reconocido")
        puzzles = []
        for item in items:
            if not isinstance(item, dict):
                continue
            ident = str(item.get("id", ""))
            fen = item.get("positionFen")
            color = item.get("solverColor")
            if not ident.isalnum() or not isinstance(fen, str) or color not in ("white", "black"):
                continue
            solution = _chess_fetch_json(CHESS_PUZZLE_API + "/" + ident + "/solution")
            moves = solution.get("solution", []) if isinstance(solution, dict) else []
            if not isinstance(moves, list) or len(moves) != 1 or not isinstance(moves[0], str) or len(moves[0]) not in (4, 5):
                continue
            puzzles.append({"id": ident, "fen": fen, "color": color, "rating": item.get("rating"), "move": moves[0]})
            if len(puzzles) == 5:
                break
        if len(puzzles) != 5 or len({p["id"] for p in puzzles}) != 5:
            raise ValueError("La API no devolvió cinco mates en una jugada válidos")
    except (OSError, ValueError, KeyError, TypeError, TimeoutError):
        puzzles = [dict(p) for p in CHESS_FALLBACK]
    _chess_cache.clear()
    _chess_cache[today] = puzzles
    return puzzles


@app.get("/api/ajedrez/diario")
def api_ajedrez_diario():
    from datetime import date
    try:
        puzzles = _chess_daily_set(date.today().isoformat())
        return jsonify({"fecha": date.today().isoformat(), "ejercicios": [
            {"id": p["id"], "fen": p["fen"], "color": p["color"], "rating": p["rating"]}
            for p in puzzles
        ]})
    except (OSError, ValueError, KeyError, TypeError):
        return jsonify({"error": "No se han podido cargar los cinco ejercicios de ajedrez."}), 503


@app.post("/api/ajedrez/comprobar")
def api_ajedrez_comprobar():
    from datetime import date
    data = request.get_json(silent=True) or {}
    ident, move = data.get("id"), data.get("movimiento")
    if not isinstance(ident, str) or not isinstance(move, str) or len(move) not in (4, 5):
        return jsonify({"error": "Movimiento inválido"}), 400
    try:
        puzzles = _chess_daily_set(date.today().isoformat())
    except (OSError, ValueError, KeyError, TypeError):
        return jsonify({"error": "Servicio de ajedrez no disponible"}), 503
    puzzle = next((p for p in puzzles if p["id"] == ident), None)
    if puzzle is None:
        return jsonify({"error": "Ejercicio no disponible hoy"}), 404
    return jsonify({"correcto": move.lower() == puzzle["move"].lower()})

if __name__ == "__main__":
    # Permite ejecutar este módulo directamente para desarrollo local.
    app.run(debug=True)

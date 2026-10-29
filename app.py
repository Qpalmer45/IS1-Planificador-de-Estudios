"""Aplicación web IS1: Planificador de Estudios.

Sprint 1: Autenticación de usuarios (HU20 - Registro, HU21 - Inicio de sesión)
y panel de notas rápidas (HU27 - Lista de To-Dos).
"""
from functools import wraps
from pathlib import Path
import re
import sqlite3

from flask import Flask, g, jsonify, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "todos.db"

app = Flask(__name__)
# Clave secreta para la firma de cookies de sesión
app.secret_key = "clave_secreta_is1_planificador_estudios_segura"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"


def get_db():
    """Obtiene la conexión a la base de datos para la petición actual."""
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    """Cierra la conexión al finalizar la petición."""
    db = g.pop("db", None)
    if db is not None:
        db.close()


def initialize_database():
    """Crea las tablas si no existen y aplica migraciones necesarias."""
    conn = sqlite3.connect(DATABASE)
    try:
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
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

            # Migración si la tabla usuarios ya existía sin la columna nombre
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

            cols_todos = [row[1] for row in conn.execute("PRAGMA table_info(todos)").fetchall()]
            if "fecha_creacion" not in cols_todos:
                conn.execute("ALTER TABLE todos ADD COLUMN fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP")
    finally:
        conn.close()


def login_required(f):
    """Decorador para proteger rutas y APIs que requieren autenticación."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "usuario_id" not in session:
            if request.path.startswith("/api/"):
                return jsonify({"error": "No has iniciado sesión o tu sesión ha expirado."}), 401
            return redirect(url_for("login_view"))
        return f(*args, **kwargs)
    return decorated_function


def todo_to_dict(row):
    """Convierte una fila de la tabla todos a un diccionario serializable."""
    return {
        "id": row["id"],
        "usuario_id": row["usuario_id"],
        "titulo": row["titulo"],
        "completada": bool(row["completada"]),
        "fecha_creacion": row["fecha_creacion"] if "fecha_creacion" in row.keys() else None,
    }


# --- RUTAS DE NAVEGACIÓN (Vistas HTML) ---

@app.get("/")
def home():
    """Pantalla principal (Dashboard y pestañas). Requiere autenticación."""
    if "usuario_id" not in session:
        return redirect(url_for("login_view"))
    return render_template(
        "index.html",
        usuario_nombre=session.get("nombre", "Estudiante"),
        usuario_email=session.get("email", ""),
    )


@app.get("/login")
def login_view():
    """Vista de inicio de sesión (HU21). Si ya está autenticado, va al inicio."""
    if "usuario_id" in session:
        return redirect(url_for("home"))
    return render_template("login.html")


@app.get("/registro")
def registro_view():
    """Vista de registro (HU20). Si ya está autenticado, va al inicio."""
    if "usuario_id" in session:
        return redirect(url_for("home"))
    return render_template("registro.html")


# --- API DE AUTENTICACIÓN (HU20 - Registro y HU21 - Login) ---

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@app.post("/api/registro")
def registrar_usuario():
    """Registra una nueva cuenta de estudiante (HU20)."""
    data = request.get_json(silent=True) or {}
    nombre = data.get("nombre", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not EMAIL_REGEX.match(email):
        return jsonify({"error": "Debes introducir un correo electrónico válido."}), 400

    if not nombre:
        nombre = email.split("@")[0].capitalize()
    elif len(nombre) > 100:
        return jsonify({"error": "El nombre no puede exceder los 100 caracteres."}), 400

    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres."}), 400

    password_hash = generate_password_hash(password)
    db = get_db()

    try:
        with db:
            cursor = db.execute(
                "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)",
                (nombre, email, password_hash),
            )
            usuario_id = cursor.lastrowid

        session["usuario_id"] = usuario_id
        session["email"] = email
        session["nombre"] = nombre

        return jsonify({
            "mensaje": "Cuenta creada con éxito.",
            "usuario": {"id": usuario_id, "nombre": nombre, "email": email}
        }), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Este correo electrónico ya está registrado. Prueba a iniciar sesión."}), 409


@app.post("/api/login")
def iniciar_sesion():
    """Inicia sesión con credenciales válidas (HU21)."""
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Por favor, introduce tu correo y contraseña."}), 400

    db = get_db()
    user = db.execute(
        "SELECT * FROM usuarios WHERE email = ?", (email,)
    ).fetchone()

    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "El correo electrónico o la contraseña son incorrectos."}), 401

    nombre = user["nombre"] if user["nombre"] else user["email"].split("@")[0].capitalize()

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
    session.clear()
    return jsonify({"mensaje": "Sesión cerrada correctamente."}), 200


@app.get("/api/usuario_actual")
def usuario_actual():
    """Devuelve la información del usuario autenticado."""
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
    usuario_id = session["usuario_id"]
    db = get_db()
    rows = db.execute(
        "SELECT id, usuario_id, titulo, completada, fecha_creacion FROM todos WHERE usuario_id = ? ORDER BY id DESC",
        (usuario_id,),
    ).fetchall()
    return jsonify([todo_to_dict(row) for row in rows])


@app.post("/api/todos")
@login_required
def create_todo():
    """Crea una nueva nota rápida para el usuario autenticado (HU27)."""
    data = request.get_json(silent=True) or {}
    titulo = data.get("titulo", "").strip()
    if not titulo or len(titulo) > 200:
        return jsonify({"error": "La tarea debe tener entre 1 y 200 caracteres."}), 400

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
    usuario_id = session["usuario_id"]
    data = request.get_json(silent=True) or {}
    updates, params = [], []

    db = get_db()
    existing = db.execute(
        "SELECT id FROM todos WHERE id = ? AND usuario_id = ?", (todo_id, usuario_id)
    ).fetchone()

    if existing is None:
        return jsonify({"error": "Tarea no encontrada o no pertenece a tu usuario."}), 404

    if "titulo" in data:
        titulo = data["titulo"].strip()
        if not titulo or len(titulo) > 200:
            return jsonify({"error": "El título debe tener entre 1 y 200 caracteres."}), 400
        updates.append("titulo = ?")
        params.append(titulo)

    if "completada" in data:
        updates.append("completada = ?")
        params.append(1 if data["completada"] else 0)

    if not updates:
        return jsonify({"error": "No se enviaron campos válidos para actualizar."}), 400

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
    usuario_id = session["usuario_id"]
    db = get_db()
    with db:
        cursor = db.execute(
            "DELETE FROM todos WHERE id = ? AND usuario_id = ?", (todo_id, usuario_id)
        )
    if cursor.rowcount == 0:
        return jsonify({"error": "Tarea no encontrada o no pertenece a tu usuario."}), 404
    return jsonify({"mensaje": "Tarea eliminada con éxito."}), 200


initialize_database()

if __name__ == "__main__":
    app.run(debug=True)

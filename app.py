"""Aplicación web IS1: autenticación de usuarios y lista de To-Dos con Flask y SQLite."""
from pathlib import Path
import sqlite3

from flask import Flask, jsonify, render_template, request, session
from werkzeug.security import generate_password_hash, check_password_hash

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "todos.db"

app = Flask(__name__)
# Clave secreta necesaria para gestionar sesiones/cookies en Flask
app.secret_key = "clave_secreta_is1_planificador_estudios"


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        # Tabla de usuarios (HU20 y HU21)
        connection.execute(
            """CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )"""
        )
        # Tabla de To-Dos (HU28) asociada a cada usuario
        connection.execute(
            """CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER,
                titulo TEXT NOT NULL,
                completada INTEGER NOT NULL DEFAULT 0 CHECK (completada IN (0, 1)),
                FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
            )"""
        )


def to_dict(row):
    return {
        "id": row["id"],
        "titulo": row["titulo"],
        "completada": bool(row["completada"]),
    }


# --- RUTAS DE NAVEGACIÓN (Vistas HTML) ---

@app.get("/")
def home():
    return render_template("index.html")


@app.get("/login")
def login_view():
    return render_template("login.html")


@app.get("/registro")
def registro_view():
    return render_template("registro.html")


# --- API DE AUTENTICACIÓN (HU20 - Registro y HU21 - Login) ---

@app.post("/api/registro")
def registrar_usuario():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or "@" not in email:
        return jsonify({"error": "Debes introducir un correo electrónico válido."}), 400
    if len(password) < 6:
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres."}), 400

    password_hash = generate_password_hash(password)

    try:
        with get_connection() as connection:
            cursor = connection.execute(
                "INSERT INTO usuarios (email, password_hash) VALUES (?, ?)",
                (email, password_hash),
            )
            usuario_id = cursor.lastrowid
            
        session["usuario_id"] = usuario_id
        session["email"] = email
        return jsonify({"mensaje": "Registro completado con éxito.", "email": email}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "El correo electrónico ya está registrado."}), 409


@app.post("/api/login")
def iniciar_sesion():
    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    with get_connection() as connection:
        user = connection.execute(
            "SELECT * FROM usuarios WHERE email = ?", (email,)
        ).fetchone()

    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Credenciales incorrectas."}), 401

    session["usuario_id"] = user["id"]
    session["email"] = user["email"]
    return jsonify({"mensaje": "Inicio de sesión correcto.", "email": user["email"]}), 200


@app.post("/api/logout")
def cerrar_sesion():
    session.clear()
    return "", 204


@app.get("/api/usuario_actual")
def usuario_actual():
    if "usuario_id" in session:
        return jsonify({"autenticado": True, "email": session["email"]})
    return jsonify({"autenticado": False}), 200


# --- API DE TO-DOS (Filtrada por Usuario) ---

@app.get("/api/todos")
def list_todos():
    usuario_id = session.get("usuario_id")
    with get_connection() as connection:
        if usuario_id:
            rows = connection.execute(
                "SELECT id, titulo, completada FROM todos WHERE usuario_id = ? ORDER BY id DESC",
                (usuario_id,),
            ).fetchall()
        else:
            rows = connection.execute(
                "SELECT id, titulo, completada FROM todos WHERE usuario_id IS NULL ORDER BY id DESC"
            ).fetchall()
    return jsonify([to_dict(row) for row in rows])


@app.post("/api/todos")
def create_todo():
    data = request.get_json(silent=True) or {}
    titulo = data.get("titulo", "").strip()
    if not titulo or len(titulo) > 200:
        return jsonify({"error": "La tarea debe tener entre 1 y 200 caracteres."}), 400

    usuario_id = session.get("usuario_id")
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO todos (titulo, usuario_id) VALUES (?, ?)", (titulo, usuario_id)
        )
        row = connection.execute(
            "SELECT id, titulo, completada FROM todos WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return jsonify(to_dict(row)), 201


@app.patch("/api/todos/<int:todo_id>")
def update_todo(todo_id):
    data = request.get_json(silent=True) or {}
    updates, params = [], []

    if "titulo" in data:
        titulo = data["titulo"].strip()
        if not titulo or len(titulo) > 200:
            return jsonify({"error": "Título inválido."}), 400
        updates.append("titulo = ?")
        params.append(titulo)

    if "completada" in data:
        updates.append("completada = ?")
        params.append(int(data["completada"]))

    if not updates:
        return jsonify({"error": "Sin cambios válidos."}), 400

    with get_connection() as connection:
        connection.execute(
            f"UPDATE todos SET {', '.join(updates)} WHERE id = ?", (*params, todo_id)
        )
        row = connection.execute(
            "SELECT id, titulo, completada FROM todos WHERE id = ?", (todo_id,)
        ).fetchone()
    return jsonify(to_dict(row))


@app.delete("/api/todos/<int:todo_id>")
def delete_todo(todo_id):
    with get_connection() as connection:
        cursor = connection.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
    if cursor.rowcount == 0:
        return jsonify({"error": "Tarea no encontrada."}), 404
    return "", 204


initialize_database()

if __name__ == "__main__":
    app.run(debug=True)

"""Aplicación web IS1: lista de To-Dos con Flask y SQLite."""
from pathlib import Path
import sqlite3

from flask import Flask, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
DATABASE = BASE_DIR / "todos.db"
app = Flask(__name__)


def get_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_connection() as connection:
        connection.execute(
            """CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                completada INTEGER NOT NULL DEFAULT 0
                CHECK (completada IN (0, 1))
            )"""
        )


def to_dict(row):
    return {
        "id": row["id"],
        "titulo": row["titulo"],
        "completada": bool(row["completada"]),
    }


def valid_title(data):
    if not isinstance(data, dict):
        return None
    title = data.get("titulo")
    if not isinstance(title, str):
        return None
    title = title.strip()
    return title if 0 < len(title) <= 200 else None


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/todos")
def list_todos():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT id, titulo, completada FROM todos ORDER BY id DESC"
        ).fetchall()
    return jsonify([to_dict(row) for row in rows])


@app.post("/api/todos")
def create_todo():
    title = valid_title(request.get_json(silent=True))
    if title is None:
        return jsonify({"error": "La tarea debe tener entre 1 y 200 caracteres."}), 400
    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO todos (titulo) VALUES (?)", (title,)
        )
        row = connection.execute(
            "SELECT id, titulo, completada FROM todos WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
    return jsonify(to_dict(row)), 201


@app.patch("/api/todos/<int:todo_id>")
def update_todo(todo_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Se esperaba un objeto JSON."}), 400
    updates = []
    params = []
    if "titulo" in data:
        title = valid_title(data)
        if title is None:
            return jsonify({"error": "La tarea debe tener entre 1 y 200 caracteres."}), 400
        updates.append("titulo = ?")
        params.append(title)
    if "completada" in data:
        if not isinstance(data["completada"], bool):
            return jsonify({"error": "completada debe ser true o false."}), 400
        updates.append("completada = ?")
        params.append(int(data["completada"]))
    if not updates:
        return jsonify({"error": "No hay cambios válidos."}), 400
    with get_connection() as connection:
        exists = connection.execute(
            "SELECT id FROM todos WHERE id = ?", (todo_id,)
        ).fetchone()
        if exists is None:
            return jsonify({"error": "Tarea no encontrada."}), 404
        connection.execute(
            "UPDATE todos SET " + ", ".join(updates) + " WHERE id = ?",
            (*params, todo_id),
        )
        row = connection.execute(
            "SELECT id, titulo, completada FROM todos WHERE id = ?",
            (todo_id,),
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

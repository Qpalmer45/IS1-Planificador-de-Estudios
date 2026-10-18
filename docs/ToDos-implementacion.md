# Lista de To-Dos — Implementación inicial

Historia vinculada: [Issue #29](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/29).

## Tecnologías
Python, Flask, HTML, CSS, JavaScript y SQLite.

## Funcionalidades
- Añadir tarea (título obligatorio de 1 a 200 caracteres).
- Consultar tareas guardadas.
- Editar título.
- Marcar y desmarcar completada.
- Eliminar tarea (con confirmación).
- Filtrar todas, pendientes y completadas.
- Diferenciar visualmente tareas completadas.

## Ejecución local
1. Instalar Python 3.10 o superior.
2. En la raíz del repositorio, ejecutar `py -m pip install -r requirements.txt` en Windows (o `python -m pip install -r requirements.txt`).
3. Ejecutar `py app.py` en Windows (o `python app.py`).
4. Abrir `http://127.0.0.1:5000`.

La base de datos `todos.db` se crea automáticamente en la raíz del proyecto y está ignorada por Git.

## API
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Pantalla HTML |
| GET | `/api/todos` | Lista de tareas |
| POST | `/api/todos` | Crear tarea, JSON `{"titulo":"..."}` |
| PATCH | `/api/todos/<id>` | Cambiar `titulo` y/o `completada` |
| DELETE | `/api/todos/<id>` | Eliminar tarea |

## Limitaciones actuales
- No hay registro ni inicio de sesión. Las tareas son **compartidas** entre quienes accedan a la misma instancia del servidor.
- Flask se ejecuta en modo desarrollo, no apto para publicar directamente en Internet.
- No hay despliegue público ni pruebas automatizadas integradas.
- No confundir implementación con cierre de Sprint: la revisión y aceptación por el equipo están pendientes.

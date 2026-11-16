"""Pruebas unitarias y de integración de las funciones de app.py.

Ejecución desde la raíz del proyecto:
    python -m unittest discover -s tests -v

Cada prueba usa una base SQLite temporal para no modificar todos.db.
Los comentarios de cada bloque indican la función cubierta y los casos probados.
"""
from datetime import date, timedelta
import os
import sqlite3
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

import app as main_app


class TestStudyPlannerApp(unittest.TestCase):
    """Prepara una base de datos independiente y un cliente Flask por prueba."""

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.original_database = main_app.DATABASE
        self.original_testing = main_app.app.config.get("TESTING")
        self.original_secret_key = main_app.app.config.get("SECRET_KEY")

        main_app.DATABASE = Path(self.temp_dir.name) / "test.db"
        main_app.app.config.update(
            TESTING=True,
            SECRET_KEY="test-secret-key",
        )
        self.client = main_app.app.test_client()
        main_app.initialize_database()

    def tearDown(self):
        # Cierra cualquier conexión de contexto y restaura la configuración global.
        with main_app.app.app_context():
            main_app.close_db()
        main_app.DATABASE = self.original_database
        main_app.app.config["TESTING"] = self.original_testing
        main_app.app.config["SECRET_KEY"] = self.original_secret_key
        try:
            self.temp_dir.cleanup()
        except Exception:
            pass

    def registrar(
        self,
        email="alumno@ucm.es",
        password="clave123",
        nombre="Estudiante",
        client=None,
    ):
        """Crea una cuenta mediante la API; permite preparar sesiones de prueba."""
        active_client = client or self.client
        return active_client.post(
            "/api/registro",
            json={"nombre": nombre, "email": email, "password": password},
        )

    def crear_todo(self, titulo="Repasar apuntes", client=None):
        """Crea una nota mediante la API para preparar pruebas de tareas."""
        active_client = client or self.client
        return active_client.post("/api/todos", json={"titulo": titulo})

    def crear_asignatura(self, nombre="Matemáticas", client=None):
        """Crea una asignatura mediante la API para preparar pruebas."""
        active_client = client or self.client
        return active_client.post("/api/asignaturas", json={"nombre": nombre})

    def crear_tema(
        self,
        asignatura_id,
        titulo="Tema 1",
        contenido="",
        client=None,
    ):
        """Crea un tema en una asignatura mediante la API."""
        active_client = client or self.client
        response = active_client.post(
            f"/api/asignaturas/{asignatura_id}/temas",
            json={"titulo": titulo, "contenido": contenido},
        )
        self.assertEqual(
            response.status_code,
            201,
            response.get_data(as_text=True),
        )
        return response

    # ------------------------------------------------------------------
    # get_db devuelve y configura la conexión SQLite del contexto actual;
    # close_db la cierra al terminar; initialize_database crea las tablas
    # y añade columnas que faltan en bases de datos antiguas.
    # Casos: reutilización y configuración de la conexión, cierre correcto,
    # creación repetida del esquema y migración de columnas heredadas.
    # ------------------------------------------------------------------
    def test_get_db_reutiliza_conexion_y_activa_claves_foraneas(self):
        """get_db reutiliza la conexión del contexto y configura filas y FK."""
        with main_app.app.app_context():
            first_connection = main_app.get_db()
            second_connection = main_app.get_db()

            self.assertIs(first_connection, second_connection)
            self.assertEqual(first_connection.row_factory, sqlite3.Row)
            self.assertEqual(
                first_connection.execute("PRAGMA foreign_keys").fetchone()[0],
                1,
            )

    def test_close_db_cierra_y_retira_la_conexion_del_contexto(self):
        """close_db retira la conexión de g y cierra el recurso SQLite."""
        with main_app.app.app_context():
            connection = main_app.get_db()
            main_app.close_db()

            self.assertNotIn("db", main_app.g)
            with self.assertRaises(sqlite3.ProgrammingError):
                connection.execute("SELECT 1")

    def test_initialize_database_crea_tablas_y_es_idempotente(self):
        """initialize_database crea usuarios/todos y puede ejecutarse varias veces."""
        main_app.initialize_database()
        main_app.initialize_database()

        connection = sqlite3.connect(main_app.DATABASE)
        try:
            tables = {
                row[0]
                for row in connection.execute(
                    "SELECT name FROM sqlite_master WHERE type = 'table'"
                )
            }
            user_columns = {
                row[1] for row in connection.execute("PRAGMA table_info(usuarios)")
            }
            todo_columns = {
                row[1] for row in connection.execute("PRAGMA table_info(todos)")
            }
        finally:
            connection.close()

        self.assertTrue({"usuarios", "todos"}.issubset(tables))
        self.assertTrue({"nombre", "fecha_creacion"}.issubset(user_columns))
        self.assertIn("fecha_creacion", todo_columns)

    def test_initialize_database_migra_columnas_ausentes(self):
        """initialize_database añade columnas nuevas a tablas de una versión antigua."""
        connection = sqlite3.connect(main_app.DATABASE)
        try:
            connection.execute("DROP TABLE IF EXISTS temas")
            connection.execute("DROP TABLE IF EXISTS asignaturas")
            connection.execute("DROP TABLE todos")
            connection.execute("DROP TABLE usuarios")
            connection.execute(
                """CREATE TABLE usuarios (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL
                )"""
            )
            connection.execute(
                """CREATE TABLE todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    titulo TEXT NOT NULL,
                    completada INTEGER NOT NULL DEFAULT 0,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
                )"""
            )
            connection.execute(
                """CREATE TABLE asignaturas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    usuario_id INTEGER NOT NULL,
                    nombre TEXT NOT NULL,
                    dificultad TEXT NOT NULL DEFAULT 'media',
                    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
                )"""
            )
            connection.execute(
                "INSERT INTO asignaturas (usuario_id, nombre, dificultad) VALUES (1, ?, ?)",
                ("Asignatura heredada", "alta"),
            )
            connection.commit()
        finally:
            connection.close()

        main_app.initialize_database()

        connection = sqlite3.connect(main_app.DATABASE)
        try:
            user_columns = {
                row[1] for row in connection.execute("PRAGMA table_info(usuarios)")
            }
            todo_columns = {
                row[1] for row in connection.execute("PRAGMA table_info(todos)")
            }
            subject_columns = {
                row[1] for row in connection.execute("PRAGMA table_info(asignaturas)")
            }
            legacy_subject = connection.execute(
                "SELECT dificultad, prioridad FROM asignaturas WHERE id = 1"
            ).fetchone()
        finally:
            connection.close()

        self.assertTrue({"nombre", "fecha_creacion"}.issubset(user_columns))
        self.assertIn("fecha_creacion", todo_columns)
        self.assertIn("prioridad", subject_columns)
        self.assertEqual(legacy_subject, ("alta", "media"))

    # ------------------------------------------------------------------
    # todo_to_dict convierte una fila de la tabla todos en un diccionario
    # listo para devolverse como JSON desde la API.
    # Casos: conversión del indicador 0/1 a bool y fecha disponible/ausente.
    # ------------------------------------------------------------------
    def test_todo_to_dict_convierte_estado_y_conserva_fecha(self):
        """todo_to_dict serializa una fila SQLite y convierte completada a bool."""
        connection = sqlite3.connect(":memory:")
        connection.row_factory = sqlite3.Row
        row = connection.execute(
            """SELECT 7 AS id, 3 AS usuario_id, 'Repasar' AS titulo,
                      1 AS completada, '2026-01-01' AS fecha_creacion"""
        ).fetchone()

        result = main_app.todo_to_dict(row)
        connection.close()

        self.assertEqual(
            result,
            {
                "id": 7,
                "usuario_id": 3,
                "titulo": "Repasar",
                "completada": True,
                "fecha_creacion": "2026-01-01",
            },
        )

    def test_todo_to_dict_admite_fila_sin_fecha(self):
        """todo_to_dict devuelve fecha_creacion=None si la fila no tiene esa columna."""
        connection = sqlite3.connect(":memory:")
        connection.row_factory = sqlite3.Row
        row = connection.execute(
            "SELECT 1 AS id, 2 AS usuario_id, 'Leer' AS titulo, 0 AS completada"
        ).fetchone()

        result = main_app.todo_to_dict(row)
        connection.close()

        self.assertFalse(result["completada"])
        self.assertIsNone(result["fecha_creacion"])

    # ------------------------------------------------------------------
    # home muestra el dashboard con sesión, y contiene el diálogo de apartado
    # individual oculto hasta que el usuario abra una asignatura. El diálogo
    # no reserva espacio permanente en la lista y expone semántica accesible.
    # Casos: redirección de visitantes, renderizado, estructura del diálogo,
    # ausencia de un panel fijo y valores de sesión por defecto.
    # ------------------------------------------------------------------
    def test_home_redirige_a_login_si_no_hay_sesion(self):
        """home protege el dashboard redirigiendo al login a usuarios anónimos."""
        response = self.client.get("/")

        self.assertEqual(response.status_code, 302)
        self.assertIn("/login", response.headers["Location"])

    def test_home_renderiza_dashboard_con_datos_de_usuario(self):
        """home renderiza index.html y muestra los datos de la sesión autenticada."""
        self.registrar(nombre="Alicia")

        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Planificador de Estudios", response.data)
        self.assertIn(b"Alicia", response.data)

    def test_home_incluye_dialogo_individual_oculto_y_accesible(self):
        """El panel inicia oculto y usa semántica accesible de diálogo."""
        self.registrar()

        response = self.client.get("/")
        html = response.get_data(as_text=True)

        self.assertEqual(response.status_code, 200)
        self.assertIn('id="subject-modal"', html)
        self.assertIn('aria-hidden="true"\n      hidden', html)
        self.assertIn('role="dialog"', html)
        self.assertIn('aria-modal="true"', html)
        self.assertIn('aria-labelledby="subject-dialog-title"', html)
        self.assertIn('id="subject-dialog-close"', html)
        self.assertIn('id="subject-detail"', html)

    def test_home_no_reserva_un_panel_fijo_para_los_apartados(self):
        """La lista no incluye una zona fija de apartados ni pestañas permanentes."""
        self.registrar()

        response = self.client.get("/")

        self.assertNotIn(b"subject-workspace", response.data)
        self.assertNotIn(b"subject-tabs", response.data)
        self.assertNotIn(b"Apartados de asignaturas", response.data)

    def test_home_usa_valores_por_defecto_si_faltan_datos_de_sesion(self):
        """home muestra Estudiante y correo vacío si la sesión solo tiene el id."""
        with self.client.session_transaction() as user_session:
            user_session["usuario_id"] = 1

        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Estudiante", response.data)

    def test_login_view_muestra_formulario_y_redirige_si_autenticado(self):
        """login_view muestra login.html anónimamente y redirige con sesión."""
        anonymous_response = self.client.get("/login")
        self.registrar()
        authenticated_response = self.client.get("/login")

        self.assertEqual(anonymous_response.status_code, 200)
        self.assertIn(b' id="login-form"', anonymous_response.data)
        self.assertEqual(authenticated_response.status_code, 302)
        self.assertIn("/", authenticated_response.headers["Location"])

    def test_registro_view_muestra_formulario_y_redirige_si_autenticado(self):
        """registro_view muestra registro.html anónimamente y redirige con sesión."""
        anonymous_response = self.client.get("/registro")
        self.registrar()
        authenticated_response = self.client.get("/registro")

        self.assertEqual(anonymous_response.status_code, 200)
        self.assertIn(b' id="registro-form"', anonymous_response.data)
        self.assertEqual(authenticated_response.status_code, 302)
        self.assertIn("/", authenticated_response.headers["Location"])

    # ------------------------------------------------------------------
    # login_required es un decorador que impide usar rutas protegidas sin
    # iniciar sesión: redirige páginas web y devuelve error 401 en la API.
    # Casos: protección del dashboard y de los métodos GET/POST/PATCH/DELETE
    # de To-Dos cuando la petición es anónima.
    # ------------------------------------------------------------------
    def test_proteccion_rutas_sin_autenticacion(self):
        """login_required protege el dashboard y las rutas de tareas."""
        response_web = self.client.get("/")
        response_api = self.client.get("/api/todos")

        self.assertEqual(response_web.status_code, 302)
        self.assertIn("/login", response_web.headers["Location"])
        self.assertEqual(response_api.status_code, 401)
        self.assertIn("error", response_api.get_json())

    def test_login_required_protege_todos_los_metodos_de_todos(self):
        """login_required rechaza GET, POST, PATCH y DELETE de tareas anónimas."""
        responses = [
            self.client.get("/api/todos"),
            self.client.post("/api/todos", json={"titulo": "Nota"}),
            self.client.patch("/api/todos/1", json={"titulo": "Nota"}),
            self.client.delete("/api/todos/1"),
        ]

        self.assertEqual([response.status_code for response in responses], [401] * 4)

    # ------------------------------------------------------------------
    # registrar_usuario valida los datos, guarda una cuenta nueva con la
    # contraseña convertida en hash e inicia su sesión automáticamente.
    # Casos: alta y normalización, nombre por defecto, límites, hash seguro,
    # correo duplicado, entradas inválidas y petición sin JSON.
    # ------------------------------------------------------------------
    def test_registro_usuario_exitoso(self):
        """registrar_usuario crea la cuenta y normaliza correo y nombre."""
        response = self.registrar(
            email="  Elena@UCM.ES  ",
            password="mi_password123",
            nombre="Elena García",
        )
        data = response.get_json()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(data["usuario"]["email"], "elena@ucm.es")
        self.assertEqual(data["usuario"]["nombre"], "Elena García")
        self.assertEqual(data["mensaje"], "Cuenta creada con éxito.")

    def test_registro_usa_parte_local_del_correo_si_falta_nombre(self):
        """registrar_usuario deriva un nombre visible cuando se envía vacío."""
        response = self.registrar(email="lucas@ucm.es", nombre="   ")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["usuario"]["nombre"], "Lucas")

    def test_registro_acepta_limites_maximos_y_minimos(self):
        """registrar_usuario acepta nombre de 100 y contraseña de 6 caracteres."""
        response = self.registrar(
            email="limites@ucm.es",
            password="123456",
            nombre="N" * 100,
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.get_json()["usuario"]["nombre"]), 100)

    def test_registro_guarda_hash_y_no_password_original(self):
        """registrar_usuario persiste un hash verificable, no la contraseña."""
        self.registrar(password="clave123")
        with main_app.app.app_context():
            user = main_app.get_db().execute(
                "SELECT password_hash FROM usuarios WHERE email = ?",
                ("alumno@ucm.es",),
            ).fetchone()

        self.assertNotEqual(user["password_hash"], "clave123")
        self.assertTrue(
            main_app.check_password_hash(user["password_hash"], "clave123")
        )

    def test_registro_email_duplicado(self):
        """registrar_usuario rechaza un correo repetido con estado HTTP 409."""
        self.registrar()

        response = self.registrar(nombre="Otro alumno")

        self.assertEqual(response.status_code, 409)
        self.assertIn("ya está registrado", response.get_json()["error"])

    def test_registro_validaciones(self):
        """registrar_usuario rechaza email inválido, nombre >100 y password <6."""
        casos_invalidos = [
            {"email": "", "nombre": "Test", "password": "password123"},
            {"email": "correo-no-valido", "nombre": "Test", "password": "password123"},
            {"email": "test@ucm.es", "nombre": "Test", "password": "12345"},
            {"email": "test@ucm.es", "nombre": "N" * 101, "password": "password123"},
        ]

        for data in casos_invalidos:
            with self.subTest(data=data):
                response = self.client.post("/api/registro", json=data)
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.get_json())

    def test_registro_sin_json(self):
        """registrar_usuario rechaza una petición sin cuerpo JSON."""
        response = self.client.post("/api/registro")

        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())

    # ------------------------------------------------------------------
    # iniciar_sesion valida credenciales y crea la sesión; cerrar_sesion la
    # elimina; usuario_actual devuelve los datos de sesión o indica anonimato.
    # Casos: credenciales válidas/incorrectas/ausentes, normalización, nombre
    # heredado, respuestas con/sin sesión y cierre de sesión.
    # ------------------------------------------------------------------
    def test_login_exitoso_y_fallido(self):
        """iniciar_sesion acepta credenciales válidas y rechaza contraseña errónea."""
        self.registrar(
            nombre="Carlos",
            email="carlos@ucm.es",
            password="password123",
        )
        self.client.post("/api/logout")

        failed_response = self.client.post(
            "/api/login",
            json={"email": "carlos@ucm.es", "password": "incorrecta"},
        )
        success_response = self.client.post(
            "/api/login",
            json={"email": "carlos@ucm.es", "password": "password123"},
        )

        self.assertEqual(failed_response.status_code, 401)
        self.assertIn("incorrectos", failed_response.get_json()["error"])
        self.assertEqual(success_response.status_code, 200)
        self.assertEqual(
            success_response.get_json()["usuario"]["email"], "carlos@ucm.es"
        )
        self.assertEqual(success_response.get_json()["usuario"]["nombre"], "Carlos")

    def test_login_normaliza_email(self):
        """iniciar_sesion elimina espacios y convierte el correo a minúsculas."""
        self.registrar(email="alumno@ucm.es")
        self.client.post("/api/logout")

        response = self.client.post(
            "/api/login",
            json={"email": " ALUMNO@UCM.ES ", "password": "clave123"},
        )

        self.assertEqual(response.status_code, 200)

    def test_login_rechaza_campos_ausentes_y_usuario_inexistente(self):
        """iniciar_sesion devuelve 400 por campos vacíos y 401 si no hay cuenta."""
        missing_fields = self.client.post(
            "/api/login", json={"email": "", "password": ""}
        )
        missing_json = self.client.post("/api/login")
        unknown_user = self.client.post(
            "/api/login",
            json={"email": "desconocido@ucm.es", "password": "clave123"},
        )

        self.assertEqual(missing_fields.status_code, 400)
        self.assertEqual(missing_json.status_code, 400)
        self.assertEqual(unknown_user.status_code, 401)

    def test_login_deriva_nombre_para_usuario_heredado_sin_nombre(self):
        """iniciar_sesion crea un nombre de presentación si el usuario no lo tenía."""
        with main_app.app.app_context():
            with main_app.get_db() as connection:
                connection.execute(
                    """INSERT INTO usuarios (nombre, email, password_hash)
                       VALUES (?, ?, ?)""",
                    (
                        "",
                        "legacy@ucm.es",
                        main_app.generate_password_hash("clave123"),
                    ),
                )

        response = self.client.post(
            "/api/login",
            json={"email": "legacy@ucm.es", "password": "clave123"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["usuario"]["nombre"], "Legacy")

    def test_usuario_actual_anonimo_y_autenticado(self):
        """usuario_actual informa correctamente los estados sin sesión y con sesión."""
        anonymous_response = self.client.get("/api/usuario_actual")
        self.registrar(nombre="Ana")
        authenticated_response = self.client.get("/api/usuario_actual")

        self.assertEqual(
            anonymous_response.get_json(),
            {"autenticado": False},
        )
        self.assertEqual(
            authenticated_response.get_json(),
            {
                "autenticado": True,
                "id": 1,
                "nombre": "Ana",
                "email": "alumno@ucm.es",
            },
        )

    def test_usuario_actual_usa_valores_por_defecto_de_sesion(self):
        """usuario_actual completa nombre y email cuando no están en la sesión."""
        with self.client.session_transaction() as user_session:
            user_session["usuario_id"] = 7

        response = self.client.get("/api/usuario_actual")

        self.assertEqual(
            response.get_json(),
            {
                "autenticado": True,
                "id": 7,
                "nombre": "Estudiante",
                "email": "",
            },
        )

    def test_logout_limpia_sesion(self):
        """cerrar_sesion devuelve confirmación y usuario_actual queda anónimo."""
        self.registrar()

        logout_response = self.client.post("/api/logout")
        current_user_response = self.client.get("/api/usuario_actual")

        self.assertEqual(logout_response.status_code, 200)
        self.assertIn("Sesión cerrada", logout_response.get_json()["mensaje"])
        self.assertEqual(current_user_response.get_json(), {"autenticado": False})

    # ------------------------------------------------------------------
    # list_todos obtiene las notas del usuario actual ordenadas de más nueva
    # a más antigua; create_todo valida y guarda una nota vinculada a ese usuario.
    # Casos: lista vacía, orden, aislamiento por cuenta, creación válida y
    # límites de longitud, recorte de espacios, título inválido y sin JSON.
    # ------------------------------------------------------------------
    def test_listado_inicial_vacio(self):
        """list_todos responde una lista vacía para una cuenta sin notas."""
        self.registrar()

        response = self.client.get("/api/todos")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), [])

    def test_crear_todo_valido_y_recortar_espacios(self):
        """create_todo guarda título limpio, estado pendiente y fecha de creación."""
        self.registrar()

        response = self.crear_todo("  Comprar libreta para IS1  ")
        todo = response.get_json()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(todo["titulo"], "Comprar libreta para IS1")
        self.assertFalse(todo["completada"])
        self.assertEqual(todo["usuario_id"], 1)
        self.assertIsNotNone(todo["fecha_creacion"])

    def test_create_todo_valida_longitud_y_cuerpo(self):
        """create_todo acepta 200 caracteres y rechaza vacío, 201 y JSON ausente."""
        self.registrar()

        exact_limit = self.crear_todo("x" * 200)
        empty_title = self.crear_todo("   ")
        too_long = self.crear_todo("x" * 201)
        missing_json = self.client.post("/api/todos")

        self.assertEqual(exact_limit.status_code, 201)
        self.assertEqual(empty_title.status_code, 400)
        self.assertEqual(too_long.status_code, 400)
        self.assertEqual(missing_json.status_code, 400)

    def test_todos_crud_completo(self):
        """Flujo HU27: crear, listar, completar, editar y eliminar una nota."""
        self.registrar(nombre="Laura")

        created = self.crear_todo("Comprar libreta para IS1")
        todo_id = created.get_json()["id"]
        listed = self.client.get("/api/todos")
        completed = self.client.patch(
            f"/api/todos/{todo_id}",
            json={"completada": True},
        )
        edited = self.client.patch(
            f"/api/todos/{todo_id}",
            json={"titulo": "Comprar libreta cuadriculada"},
        )
        deleted = self.client.delete(f"/api/todos/{todo_id}")

        self.assertEqual(created.status_code, 201)
        self.assertEqual(len(listed.get_json()), 1)
        self.assertTrue(completed.get_json()["completada"])
        self.assertEqual(
            edited.get_json()["titulo"],
            "Comprar libreta cuadriculada",
        )
        self.assertEqual(deleted.status_code, 200)
        self.assertEqual(self.client.get("/api/todos").get_json(), [])

    def test_listado_orden_descendente(self):
        """list_todos devuelve las notas de la más reciente a la más antigua."""
        self.registrar()
        first_id = self.crear_todo("Primera").get_json()["id"]
        second_id = self.crear_todo("Segunda").get_json()["id"]

        response = self.client.get("/api/todos")

        self.assertEqual(
            [todo["id"] for todo in response.get_json()],
            [second_id, first_id],
        )

    def test_aislamiento_todos_entre_usuarios(self):
        """list_todos, update_todo y delete_todo aíslan los datos de cada usuario."""
        client1 = main_app.app.test_client()
        client2 = main_app.app.test_client()
        self.registrar("uno@ucm.es", client=client1, nombre="Usuario 1")
        todo = self.crear_todo("Nota privada", client=client1).get_json()
        self.registrar("dos@ucm.es", client=client2, nombre="Usuario 2")

        user2_list = client2.get("/api/todos")
        user2_update = client2.patch(
            f"/api/todos/{todo['id']}",
            json={"titulo": "Modificación ajena"},
        )
        user2_delete = client2.delete(f"/api/todos/{todo['id']}")
        owner_list = client1.get("/api/todos")

        self.assertEqual(user2_list.get_json(), [])
        self.assertEqual(user2_update.status_code, 404)
        self.assertEqual(user2_delete.status_code, 404)
        self.assertEqual(owner_list.get_json()[0]["titulo"], "Nota privada")

    # ------------------------------------------------------------------
    # update_todo busca una nota del usuario autenticado y modifica su título,
    # su estado de completado o ambos campos.
    # Casos: cambios individuales/combinados, títulos inválidos, petición sin
    # campos, nota inexistente o ajena; también se documenta el estado no booleano
    # que la implementación todavía debería rechazar.
    # ------------------------------------------------------------------
    def test_update_todo_actualiza_titulo_y_estado(self):
        """update_todo aplica título, estado True/False y ambos campos juntos."""
        self.registrar()
        todo_id = self.crear_todo().get_json()["id"]

        title_response = self.client.patch(
            f"/api/todos/{todo_id}",
            json={"titulo": "  Nuevo título  "},
        )
        done_response = self.client.patch(
            f"/api/todos/{todo_id}",
            json={"completada": True},
        )
        undone_response = self.client.patch(
            f"/api/todos/{todo_id}",
            json={"completada": False},
        )
        combined_response = self.client.patch(
            f"/api/todos/{todo_id}",
            json={"titulo": "Repasar física", "completada": True},
        )

        self.assertEqual(title_response.status_code, 200)
        self.assertEqual(title_response.get_json()["titulo"], "Nuevo título")
        self.assertTrue(done_response.get_json()["completada"])
        self.assertFalse(undone_response.get_json()["completada"])
        self.assertEqual(combined_response.get_json()["titulo"], "Repasar física")
        self.assertTrue(combined_response.get_json()["completada"])

    def test_update_todo_rechaza_titulo_invalido_y_sin_cambios(self):
        """update_todo rechaza título vacío, más de 200 caracteres o campos ausentes."""
        self.registrar()
        todo_id = self.crear_todo().get_json()["id"]

        responses = [
            self.client.patch(f"/api/todos/{todo_id}", json={"titulo": "  "}),
            self.client.patch(f"/api/todos/{todo_id}", json={"titulo": "x" * 201}),
            self.client.patch(f"/api/todos/{todo_id}", json={}),
        ]

        self.assertEqual([response.status_code for response in responses], [400] * 3)

    def test_update_todo_inexistente_devuelve_404(self):
        """update_todo devuelve 404 si la tarea no existe o no pertenece al usuario."""
        self.registrar()

        response = self.client.patch(
            "/api/todos/9999",
            json={"titulo": "No existe"},
        )

        self.assertEqual(response.status_code, 404)

    @unittest.expectedFailure
    def test_update_todo_rechaza_estado_que_no_es_booleano(self):
        """Caso pendiente: update_todo debería rechazar completada=2 con HTTP 400."""
        self.registrar()
        todo_id = self.crear_todo().get_json()["id"]

        response = self.client.patch(
            f"/api/todos/{todo_id}",
            json={"completada": 2},
        )

        self.assertEqual(response.status_code, 400)

    # ------------------------------------------------------------------
    # delete_todo elimina una nota perteneciente al usuario autenticado y
    # comunica si no existe o no puede borrarse desde esa cuenta.
    # Casos: borrado propio, desaparición del listado e identificador inexistente.
    # ------------------------------------------------------------------
    def test_delete_todo_elimina_nota(self):
        """delete_todo elimina una nota propia y deja la lista vacía."""
        self.registrar()
        todo_id = self.crear_todo().get_json()["id"]

        delete_response = self.client.delete(f"/api/todos/{todo_id}")
        list_response = self.client.get("/api/todos")

        self.assertEqual(delete_response.status_code, 200)
        self.assertIn("eliminada", delete_response.get_json()["mensaje"])
        self.assertEqual(list_response.get_json(), [])

    def test_delete_todo_inexistente_devuelve_404(self):
        """delete_todo informa 404 si no existe una tarea del usuario."""
        self.registrar()

        response = self.client.delete("/api/todos/9999")

        self.assertEqual(response.status_code, 404)

    # ------------------------------------------------------------------
    # La API de asignaturas permite crear y listar materias del usuario
    # autenticado. Cada respuesta incluye los datos de la asignatura y su
    # propietario, y los nombres se almacenan sin espacios exteriores.
    # Casos: listado vacío, creación válida, recorte del nombre y validación
    # de campos ausentes, vacíos o de tipo incorrecto.
    # ------------------------------------------------------------------
    def test_listado_inicial_de_asignaturas_vacio(self):
        """GET /api/asignaturas devuelve una lista vacía al inicio."""
        self.registrar()

        response = self.client.get("/api/asignaturas")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), [])

    def test_crear_asignatura_valida_y_recortar_espacios(self):
        """POST /api/asignaturas guarda el nombre limpio y el usuario propietario."""
        self.registrar()

        response = self.crear_asignatura("  Matemáticas I  ")
        asignatura = response.get_json()

        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(asignatura["id"], int)
        self.assertEqual(asignatura["nombre"], "Matemáticas I")
        self.assertEqual(asignatura["usuario_id"], 1)

    def test_crear_asignatura_rechaza_nombre_ausente_vacio_o_no_textual(self):
        """La creación devuelve 400 si nombre falta, está vacío o no es texto."""
        self.registrar()

        responses = [
            self.client.post("/api/asignaturas", json={}),
            self.client.post("/api/asignaturas", json={"nombre": ""}),
            self.client.post("/api/asignaturas", json={"nombre": "   "}),
            self.client.post("/api/asignaturas", json={"nombre": None}),
            self.client.post("/api/asignaturas", json={"nombre": 123}),
            self.client.post("/api/asignaturas"),
        ]

        self.assertEqual([response.status_code for response in responses], [400] * 6)
        self.assertEqual(self.client.get("/api/asignaturas").get_json(), [])

    # ------------------------------------------------------------------
    # get/list de asignaturas devuelve únicamente las materias del usuario
    # autenticado y cada apartado individual se identifica por su propio ID.
    # Casos: varias asignaturas, consulta de cada una y ausencia de datos
    # cruzados entre apartados.
    # ------------------------------------------------------------------
    def test_listado_y_apartados_individuales_no_mezclan_asignaturas(self):
        """Cada ID consulta su propia asignatura y el listado contiene ambas."""
        self.registrar()
        matematicas = self.crear_asignatura("Matemáticas").get_json()
        historia = self.crear_asignatura("Historia").get_json()

        listed = self.client.get("/api/asignaturas")
        matematicas_detail = self.client.get(
            f"/api/asignaturas/{matematicas['id']}"
        )
        historia_detail = self.client.get(
            f"/api/asignaturas/{historia['id']}"
        )

        self.assertEqual(listed.status_code, 200)
        self.assertEqual(
            {item["id"] for item in listed.get_json()},
            {matematicas["id"], historia["id"]},
        )
        self.assertEqual(matematicas_detail.status_code, 200)
        self.assertEqual(
            matematicas_detail.get_json()["id"],
            matematicas["id"],
        )
        self.assertEqual(matematicas_detail.get_json()["usuario_id"], matematicas["usuario_id"])
        self.assertEqual(matematicas_detail.get_json()["nombre"], "Matemáticas")
        self.assertEqual(historia_detail.status_code, 200)
        self.assertEqual(
            historia_detail.get_json()["id"],
            historia["id"],
        )
        self.assertEqual(historia_detail.get_json()["usuario_id"], historia["usuario_id"])
        self.assertEqual(historia_detail.get_json()["nombre"], "Historia")
        self.assertNotEqual(
            matematicas_detail.get_json()["id"],
            historia_detail.get_json()["id"],
        )

    # ------------------------------------------------------------------
    # update_asignatura modifica solo una asignatura del usuario actual.
    # Casos: cambio y recorte del nombre, conservación de otras asignaturas,
    # rechazo de datos inválidos y ausencia de cambios ante errores.
    # ------------------------------------------------------------------
    def test_editar_asignatura_actualiza_solo_la_seleccionada(self):
        """PATCH actualiza la materia solicitada sin modificar las demás."""
        self.registrar()
        matematicas = self.crear_asignatura("Matemáticas").get_json()
        historia = self.crear_asignatura("Historia").get_json()

        response = self.client.patch(
            f"/api/asignaturas/{matematicas['id']}",
            json={"nombre": "  Álgebra  "},
        )
        matematicas_detail = self.client.get(
            f"/api/asignaturas/{matematicas['id']}"
        )
        historia_detail = self.client.get(f"/api/asignaturas/{historia['id']}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["nombre"], "Álgebra")
        self.assertEqual(matematicas_detail.get_json()["nombre"], "Álgebra")
        self.assertEqual(historia_detail.get_json()["nombre"], "Historia")

    def test_editar_asignatura_rechaza_nombre_invalido_o_cuerpo_vacio(self):
        """PATCH devuelve 400 si nombre falta, es vacío o no es texto."""
        self.registrar()
        asignatura = self.crear_asignatura("Biología").get_json()
        url = f"/api/asignaturas/{asignatura['id']}"

        responses = [
            self.client.patch(url, json={}),
            self.client.patch(url, json={"nombre": ""}),
            self.client.patch(url, json={"nombre": "   "}),
            self.client.patch(url, json={"nombre": None}),
            self.client.patch(url, json={"nombre": 123}),
            self.client.patch(url),
        ]

        self.assertEqual([response.status_code for response in responses], [400] * 6)
        unchanged = self.client.get(url)
        self.assertEqual(unchanged.status_code, 200)
        self.assertEqual(unchanged.get_json()["nombre"], "Biología")

    # ------------------------------------------------------------------
    # get/update/delete de una asignatura solo operan si pertenece al usuario.
    # Casos: ID inexistente y acceso cruzado entre cuentas, comprobando que
    # el propietario conserva sus datos después de intentos no autorizados.
    # ------------------------------------------------------------------
    def test_detalle_edicion_y_borrado_de_asignatura_inexistente_devuelven_404(self):
        """Las operaciones por ID devuelven 404 si no existe la asignatura."""
        self.registrar()
        existing = self.crear_asignatura("Existente")
        self.assertEqual(existing.status_code, 201)
        url = "/api/asignaturas/9999"

        detail = self.client.get(url)
        update = self.client.patch(url, json={"nombre": "No existe"})
        delete = self.client.delete(url)

        self.assertEqual(detail.status_code, 404)
        self.assertEqual(update.status_code, 404)
        self.assertEqual(delete.status_code, 404)
        self.assertTrue(all(response.is_json for response in (detail, update, delete)))

    def test_asignaturas_aisladas_entre_usuarios(self):
        """Un usuario no lista, consulta, edita ni borra asignaturas ajenas."""
        client1 = main_app.app.test_client()
        client2 = main_app.app.test_client()
        self.registrar("uno@ucm.es", client=client1, nombre="Usuario 1")
        asignatura = self.crear_asignatura("Privada", client=client1).get_json()
        self.registrar("dos@ucm.es", client=client2, nombre="Usuario 2")
        url = f"/api/asignaturas/{asignatura['id']}"

        user2_list = client2.get("/api/asignaturas")
        user2_detail = client2.get(url)
        user2_update = client2.patch(url, json={"nombre": "Modificación ajena"})
        user2_delete = client2.delete(url)
        owner_detail = client1.get(url)

        self.assertEqual(user2_list.status_code, 200)
        self.assertEqual(user2_list.get_json(), [])
        self.assertEqual(user2_detail.status_code, 404)
        self.assertEqual(user2_update.status_code, 404)
        self.assertEqual(user2_delete.status_code, 404)
        self.assertEqual(owner_detail.status_code, 200)
        self.assertEqual(owner_detail.get_json()["nombre"], "Privada")

    # ------------------------------------------------------------------
    # delete_asignatura elimina únicamente la materia seleccionada y deja
    # de estar disponible tanto en el listado como en su apartado individual.
    # Casos: borrado correcto, conservación de las demás e ID ya eliminado.
    # ------------------------------------------------------------------
    def test_borrar_asignatura_no_elimina_las_demas(self):
        """DELETE elimina una asignatura propia y conserva el resto."""
        self.registrar()
        matematicas = self.crear_asignatura("Matemáticas").get_json()
        historia = self.crear_asignatura("Historia").get_json()

        delete = self.client.delete(f"/api/asignaturas/{matematicas['id']}")
        listed = self.client.get("/api/asignaturas")
        deleted_detail = self.client.get(
            f"/api/asignaturas/{matematicas['id']}"
        )

        self.assertEqual(delete.status_code, 200)
        self.assertEqual(
            [item["id"] for item in listed.get_json()],
            [historia["id"]],
        )
        self.assertEqual(deleted_detail.status_code, 404)

    # ------------------------------------------------------------------
    # Todas las operaciones de gestión requieren autenticación, igual que
    # las rutas protegidas existentes de la aplicación.
    # Casos: listado, creación, detalle, edición y borrado sin sesión.
    # ------------------------------------------------------------------
    def test_api_asignaturas_requiere_autenticacion(self):
        """Las operaciones de asignaturas sin sesión responden 401."""
        responses = [
            self.client.get("/api/asignaturas"),
            self.client.post("/api/asignaturas", json={"nombre": "Física"}),
            self.client.get("/api/asignaturas/1"),
            self.client.patch("/api/asignaturas/1", json={"nombre": "Física"}),
            self.client.delete("/api/asignaturas/1"),
        ]

        self.assertEqual([response.status_code for response in responses], [401] * 5)

    # ------------------------------------------------------------------
    # Los temas y apuntes están aislados por asignatura y propietario.
    # Cada tema guarda un título, contenido libre y un estado estudiado.
    # Casos: esquema, creación/listado, filtros, edición, borrado,
    # validación, autenticación, aislamiento y borrado en cascada.
    # ------------------------------------------------------------------
    def test_initialize_database_crea_tabla_temas_y_es_idempotente(self):
        """La tabla temas existe con sus campos y puede inicializarse varias veces."""
        main_app.initialize_database()
        main_app.initialize_database()

        connection = sqlite3.connect(main_app.DATABASE)
        try:
            columns = {
                row[1] for row in connection.execute("PRAGMA table_info(temas)")
            }
            foreign_keys = connection.execute(
                "PRAGMA foreign_key_list(temas)"
            ).fetchall()
        finally:
            connection.close()

        self.assertTrue(
            {
                "id",
                "usuario_id",
                "asignatura_id",
                "titulo",
                "contenido",
                "estudiado",
            }.issubset(columns)
        )
        self.assertTrue(any(row[2] == "asignaturas" for row in foreign_keys))

    def test_crear_tema_crea_bloque_vacio_con_titulo_normalizado(self):
        """El botón de nuevo tema crea un bloque vacío pendiente de apuntes."""
        self.registrar()
        asignatura = self.crear_asignatura().get_json()

        response = self.crear_tema(
            asignatura["id"],
            "  Límites  ",
        )

        self.assertEqual(response.status_code, 201)
        tema = response.get_json()
        self.assertEqual(tema["asignatura_id"], asignatura["id"])
        self.assertEqual(tema["usuario_id"], asignatura["usuario_id"])
        self.assertEqual(tema["titulo"], "Límites")
        self.assertEqual(tema["contenido"], "")
        self.assertIs(tema["estudiado"], False)

    def test_editor_guarda_apuntes_multilinea_sin_normalizar_su_contenido(self):
        """PATCH conserva exactamente las líneas y espacios escritos en el tema."""
        self.registrar()
        asignatura = self.crear_asignatura().get_json()
        tema = self.crear_tema(
            asignatura["id"],
            "Tema sin apuntes",
        ).get_json()
        contenido = "  Primera línea\n\nSegunda línea\n  "
        response = self.client.patch(
            f"/api/temas/{tema['id']}",
            json={"contenido": contenido},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["contenido"], contenido)
        listed = self.client.get(
            f"/api/asignaturas/{asignatura['id']}/temas"
        ).get_json()
        self.assertEqual(listed[0]["contenido"], contenido)

    def test_crear_tema_rechaza_titulo_o_contenido_invalidos_sin_guardar(self):
        """Los títulos deben ser texto no vacío y el contenido debe ser texto."""
        self.registrar()
        asignatura = self.crear_asignatura().get_json()
        url = f"/api/asignaturas/{asignatura['id']}/temas"
        invalid_payloads = [
            {},
            {"titulo": ""},
            {"titulo": "   "},
            {"titulo": None},
            {"titulo": 123},
            {"titulo": "Válido", "contenido": None},
            {"titulo": "Válido", "contenido": 123},
        ]

        responses = [
            self.client.post(url, json=payload) for payload in invalid_payloads
        ]
        responses.append(self.client.post(url))

        self.assertEqual([response.status_code for response in responses], [400] * 8)
        self.assertTrue(all(response.is_json for response in responses))
        self.assertEqual(self.client.get(url).get_json(), [])

    def test_listar_temas_separa_asignaturas_y_filtra_pendientes(self):
        """Cada asignatura lista solo sus temas y el filtro pendiente es exacto."""
        self.registrar()
        matematicas = self.crear_asignatura("Matemáticas").get_json()
        historia = self.crear_asignatura("Historia").get_json()
        pendiente = self.crear_tema(matematicas["id"], "Integrales").get_json()
        estudiado = self.crear_tema(matematicas["id"], "Derivadas").get_json()
        historia_tema = self.crear_tema(historia["id"], "Edad Media").get_json()
        self.client.patch(
            f"/api/temas/{estudiado['id']}",
            json={"estudiado": True},
        )

        all_math = self.client.get(
            f"/api/asignaturas/{matematicas['id']}/temas"
        )
        pending_math = self.client.get(
            f"/api/asignaturas/{matematicas['id']}/temas?estado=pendiente"
        )
        studied_math = self.client.get(
            f"/api/asignaturas/{matematicas['id']}/temas?estado=estudiado"
        )
        history_list = self.client.get(
            f"/api/asignaturas/{historia['id']}/temas"
        )

        self.assertEqual(all_math.status_code, 200)
        self.assertEqual(
            {tema["id"] for tema in all_math.get_json()},
            {pendiente["id"], estudiado["id"]},
        )
        self.assertEqual(
            [tema["id"] for tema in pending_math.get_json()],
            [pendiente["id"]],
        )
        self.assertEqual(
            [tema["id"] for tema in studied_math.get_json()],
            [estudiado["id"]],
        )
        self.assertEqual(
            [tema["id"] for tema in history_list.get_json()],
            [historia_tema["id"]],
        )

    def test_listar_temas_devuelve_404_para_asignatura_inexistente_o_ajena(self):
        """No es posible consultar temas desde una asignatura no accesible."""
        owner = main_app.app.test_client()
        other = main_app.app.test_client()
        self.registrar("temas1@ucm.es", client=owner)
        asignatura = self.crear_asignatura("Privada", client=owner).get_json()
        self.registrar("temas2@ucm.es", client=other)

        missing = other.get("/api/asignaturas/9999/temas")
        foreign = other.get(f"/api/asignaturas/{asignatura['id']}/temas")
        create_foreign = other.post(
            f"/api/asignaturas/{asignatura['id']}/temas",
            json={"titulo": "Intruso", "contenido": ""},
        )

        self.assertEqual(
            [missing.status_code, foreign.status_code, create_foreign.status_code],
            [404, 404, 404],
        )
        self.assertTrue(all(response.is_json for response in (missing, foreign, create_foreign)))
        self.assertEqual(
            owner.get(f"/api/asignaturas/{asignatura['id']}/temas").get_json(),
            [],
        )

    def test_editar_tema_actualiza_campos_parciales_sin_alterar_otros(self):
        """PATCH permite cambiar título, contenido o estado de un tema concreto."""
        self.registrar()
        asignatura = self.crear_asignatura().get_json()
        tema = self.crear_tema(
            asignatura["id"],
            "Tema original",
            "Apuntes iniciales",
        ).get_json()
        otro = self.crear_tema(asignatura["id"], "Otro tema", "Sin cambios").get_json()

        title_update = self.client.patch(
            f"/api/temas/{tema['id']}",
            json={"titulo": "  Tema editado  "},
        )
        self.assertEqual(
            title_update.get_json()["contenido"],
            "Apuntes iniciales",
        )
        inline_content = "  Primera línea\n\nsegunda línea\n  "
        content_update = self.client.patch(
            f"/api/temas/{tema['id']}",
            json={"contenido": inline_content},
        )
        status_update = self.client.patch(
            f"/api/temas/{tema['id']}",
            json={"estudiado": True},
        )
        temas = self.client.get(
            f"/api/asignaturas/{asignatura['id']}/temas"
        ).get_json()
        updated = next(item for item in temas if item["id"] == tema["id"])
        unchanged = next(item for item in temas if item["id"] == otro["id"])

        self.assertEqual(
            [title_update.status_code, content_update.status_code, status_update.status_code],
            [200, 200, 200],
        )
        self.assertEqual(updated["titulo"], "Tema editado")
        self.assertEqual(updated["contenido"], inline_content)
        self.assertIs(updated["estudiado"], True)
        self.assertEqual(unchanged["titulo"], "Otro tema")
        self.assertEqual(unchanged["contenido"], "Sin cambios")
        self.assertIs(unchanged["estudiado"], False)

    def test_editar_tema_rechaza_campos_invalidos_sin_mutacion_parcial(self):
        """Un PATCH inválido devuelve 400 y conserva todos los datos del tema."""
        self.registrar()
        asignatura = self.crear_asignatura().get_json()
        tema = self.crear_tema(
            asignatura["id"],
            "Tema original",
            "Contenido original",
        ).get_json()
        url = f"/api/temas/{tema['id']}"
        invalid_payloads = [
            {},
            {"titulo": ""},
            {"titulo": "   "},
            {"titulo": 12},
            {"contenido": None},
            {"contenido": []},
            {"estudiado": 2},
            {"estudiado": "true"},
            {"estudiado": None},
            {"titulo": "Cambio parcial", "estudiado": 2},
        ]

        responses = [
            self.client.patch(url, json=payload) for payload in invalid_payloads
        ]
        responses.append(self.client.patch(url))
        unchanged = self.client.get(
            f"/api/asignaturas/{asignatura['id']}/temas"
        ).get_json()[0]

        self.assertEqual([response.status_code for response in responses], [400] * 11)
        self.assertTrue(all(response.is_json for response in responses))
        self.assertEqual(unchanged["titulo"], "Tema original")
        self.assertEqual(unchanged["contenido"], "Contenido original")
        self.assertIs(unchanged["estudiado"], False)

    def test_editar_y_borrar_tema_inexistente_o_ajeno_devuelve_404(self):
        """Las operaciones de tema no revelan ni modifican temas ajenos."""
        owner = main_app.app.test_client()
        other = main_app.app.test_client()
        self.registrar("dueno@ucm.es", client=owner)
        asignatura = self.crear_asignatura(client=owner).get_json()
        tema = self.crear_tema(
            asignatura["id"],
            client=owner,
        ).get_json()
        self.registrar("otro@ucm.es", client=other)

        responses = [
            other.patch("/api/temas/9999", json={"titulo": "No existe"}),
            other.delete("/api/temas/9999"),
            other.patch(
                f"/api/temas/{tema['id']}",
                json={"titulo": "Cambio ajeno"},
            ),
            other.delete(f"/api/temas/{tema['id']}"),
        ]
        owner_topics = owner.get(
            f"/api/asignaturas/{asignatura['id']}/temas"
        ).get_json()

        self.assertEqual([response.status_code for response in responses], [404] * 4)
        self.assertTrue(all(response.is_json for response in responses))
        self.assertEqual([item["id"] for item in owner_topics], [tema["id"]])
        self.assertEqual(owner_topics[0]["titulo"], "Tema 1")

    def test_borrar_tema_conserva_los_demas_de_la_asignatura(self):
        """DELETE elimina únicamente el tema solicitado."""
        self.registrar()
        asignatura = self.crear_asignatura().get_json()
        borrar = self.crear_tema(asignatura["id"], "Borrar").get_json()
        conservar = self.crear_tema(asignatura["id"], "Conservar").get_json()

        response = self.client.delete(f"/api/temas/{borrar['id']}")
        second_delete = self.client.delete(f"/api/temas/{borrar['id']}")
        remaining = self.client.get(
            f"/api/asignaturas/{asignatura['id']}/temas"
        ).get_json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(second_delete.status_code, 404)
        self.assertEqual([tema["id"] for tema in remaining], [conservar["id"]])

    def test_borrar_asignatura_elimina_tambien_sus_temas(self):
        """La eliminación de una asignatura no deja temas huérfanos."""
        self.registrar()
        asignatura = self.crear_asignatura().get_json()
        self.crear_tema(asignatura["id"], "Tema dependiente")
        self.assertEqual(
            self.client.get(
                f"/api/asignaturas/{asignatura['id']}/temas"
            ).status_code,
            200,
        )

        response = self.client.delete(f"/api/asignaturas/{asignatura['id']}")

        self.assertEqual(response.status_code, 200)
        connection = sqlite3.connect(main_app.DATABASE)
        try:
            topic_count = connection.execute(
                "SELECT COUNT(*) FROM temas WHERE asignatura_id = ?",
                (asignatura["id"],),
            ).fetchone()[0]
        finally:
            connection.close()
        self.assertEqual(topic_count, 0)

    def test_api_temas_requiere_autenticacion(self):
        """Listar, crear, editar y borrar temas requieren sesión."""
        responses = [
            self.client.get("/api/asignaturas/1/temas"),
            self.client.get("/api/asignaturas/1/temas?estado=pendiente"),
            self.client.post(
                "/api/asignaturas/1/temas",
                json={"titulo": "Tema", "contenido": ""},
            ),
            self.client.patch("/api/temas/1", json={"estudiado": True}),
            self.client.delete("/api/temas/1"),
        ]

        self.assertEqual([response.status_code for response in responses], [401] * 5)
        self.assertTrue(all(response.is_json for response in responses))


    # ------------------------------------------------------------------
    # HISTORIA DE USUARIO 12 (HU12) - DIFICULTAD Y PRIORIDAD
    # Permite indicar dificultad y prioridad ('baja', 'media', 'alta') por
    # asignatura y prioridad por tarea, con persistencia y exposición en API/HU06.
    # Casos: valores por defecto, creación/edición válida e inválida, migración,
    # datos disponibles para HU06 y aislamiento estricto entre usuarios.
    # ------------------------------------------------------------------
    def test_crear_asignatura_dificultad_por_defecto_es_media(self):
        """POST /api/asignaturas asigna dificultad y prioridad 'media' por defecto."""
        self.registrar()

        response = self.client.post(
            "/api/asignaturas",
            json={"nombre": "Física Cuántica"},
        )
        data = response.get_json()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(data["nombre"], "Física Cuántica")
        self.assertEqual(data["dificultad"], "media")
        self.assertEqual(data["prioridad"], "media")

        # Verifica persistencia directa en base de datos
        with main_app.app.app_context():
            row = main_app.get_db().execute(
                "SELECT dificultad, prioridad FROM asignaturas WHERE id = ?",
                (data["id"],),
            ).fetchone()
            self.assertEqual(tuple(row), ("media", "media"))

    def test_crear_asignatura_con_niveles_dificultad_validos(self):
        """POST /api/asignaturas guarda correctamente niveles 'baja', 'media' y 'alta'."""
        self.registrar()

        for nivel in ["baja", "media", "alta", "  ALTA  ", "Media"]:
            with self.subTest(nivel=nivel):
                res = self.client.post(
                    "/api/asignaturas",
                    json={"nombre": f"Asignatura {nivel.strip()}", "dificultad": nivel},
                )
                self.assertEqual(res.status_code, 201)
                self.assertEqual(res.get_json()["dificultad"], nivel.strip().lower())

    def test_crear_asignatura_con_niveles_prioridad_validos(self):
        """POST /api/asignaturas guarda prioridades válidas y las expone en API."""
        self.registrar()

        for nivel in ["baja", "media", "alta", "  ALTA  ", "Media"]:
            with self.subTest(nivel=nivel):
                response = self.client.post(
                    "/api/asignaturas",
                    json={"nombre": f"Asignatura prioridad {nivel.strip()}", "prioridad": nivel},
                )
                self.assertEqual(response.status_code, 201)
                self.assertEqual(
                    response.get_json()["prioridad"],
                    nivel.strip().lower(),
                )
                with main_app.app.app_context():
                    row = main_app.get_db().execute(
                        "SELECT prioridad FROM asignaturas WHERE id = ?",
                        (response.get_json()["id"],),
                    ).fetchone()
                    self.assertEqual(row["prioridad"], nivel.strip().lower())

    def test_crear_asignatura_rechaza_dificultad_invalida(self):
        """POST /api/asignaturas devuelve 400 si la dificultad no es baja, media o alta."""
        self.registrar()

        casos_invalidos = ["extrema", "facil", "muy alta", "", 123, None, []]
        for invalido in casos_invalidos:
            with self.subTest(invalido=invalido):
                response = self.client.post(
                    "/api/asignaturas",
                    json={"nombre": "Álgebra", "dificultad": invalido},
                )
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.get_json())
                self.assertIn("dificultad", response.get_json()["error"].lower())

    def test_crear_asignatura_rechaza_prioridad_invalida(self):
        """POST /api/asignaturas devuelve 400 si la prioridad es inválida."""
        self.registrar()

        for invalido in ["urgente", "critica", "", 123, None, []]:
            with self.subTest(invalido=invalido):
                response = self.client.post(
                    "/api/asignaturas",
                    json={"nombre": "Álgebra", "prioridad": invalido},
                )
                self.assertEqual(response.status_code, 400)
                self.assertIn("prioridad", response.get_json()["error"].lower())

    def test_editar_asignatura_actualiza_dificultad_individual_o_combinada(self):
        """PATCH /api/asignaturas/<id> permite modificar dificultad sola o junto con el nombre."""
        self.registrar()
        asig = self.client.post(
            "/api/asignaturas",
            json={"nombre": "Cálculo", "dificultad": "baja"},
        ).get_json()

        # Modificación exclusiva de dificultad
        res_diff = self.client.patch(
            f"/api/asignaturas/{asig['id']}",
            json={"dificultad": "alta"},
        )
        self.assertEqual(res_diff.status_code, 200)
        self.assertEqual(res_diff.get_json()["dificultad"], "alta")
        self.assertEqual(res_diff.get_json()["nombre"], "Cálculo")

        # Modificación combinada de nombre y dificultad
        res_comb = self.client.patch(
            f"/api/asignaturas/{asig['id']}",
            json={"nombre": "Cálculo Avanzado", "dificultad": "media"},
        )
        self.assertEqual(res_comb.status_code, 200)
        self.assertEqual(res_comb.get_json()["nombre"], "Cálculo Avanzado")
        self.assertEqual(res_comb.get_json()["dificultad"], "media")

        # Verifica detalle individual y listado
        detalle = self.client.get(f"/api/asignaturas/{asig['id']}").get_json()
        self.assertEqual(detalle["dificultad"], "media")
        self.assertEqual(detalle["prioridad"], "media")

    def test_editar_asignatura_actualiza_prioridad_y_conserva_dificultad(self):
        """PATCH permite cambiar solo prioridad o junto con nombre y dificultad."""
        self.registrar()
        asig = self.client.post(
            "/api/asignaturas",
            json={"nombre": "Cálculo", "dificultad": "alta", "prioridad": "baja"},
        ).get_json()

        only_priority = self.client.patch(
            f"/api/asignaturas/{asig['id']}",
            json={"prioridad": "  ALTA  "},
        )
        self.assertEqual(only_priority.status_code, 200)
        self.assertEqual(only_priority.get_json()["prioridad"], "alta")
        self.assertEqual(only_priority.get_json()["dificultad"], "alta")

        combined = self.client.patch(
            f"/api/asignaturas/{asig['id']}",
            json={"nombre": "Cálculo II", "dificultad": "baja", "prioridad": "media"},
        )
        self.assertEqual(combined.status_code, 200)
        self.assertEqual(
            {
                key: combined.get_json()[key]
                for key in ("nombre", "dificultad", "prioridad")
            },
            {"nombre": "Cálculo II", "dificultad": "baja", "prioridad": "media"},
        )
        self.assertEqual(
            self.client.get(f"/api/asignaturas/{asig['id']}").get_json()["prioridad"],
            "media",
        )

    def test_editar_asignatura_rechaza_dificultad_invalida(self):
        """PATCH /api/asignaturas/<id> devuelve 400 si la dificultad es inválida y no muta datos."""
        self.registrar()
        asig = self.client.post(
            "/api/asignaturas",
            json={"nombre": "Química", "dificultad": "alta"},
        ).get_json()

        response = self.client.patch(
            f"/api/asignaturas/{asig['id']}",
            json={"dificultad": "imposible"},
        )
        self.assertEqual(response.status_code, 400)

        detalle = self.client.get(f"/api/asignaturas/{asig['id']}").get_json()
        self.assertEqual(detalle["dificultad"], "alta")

    def test_editar_asignatura_rechaza_prioridad_invalida_sin_mutar_datos(self):
        """PATCH devuelve 400 y conserva datos si la prioridad no es válida."""
        self.registrar()
        asig = self.client.post(
            "/api/asignaturas",
            json={"nombre": "Química", "dificultad": "alta", "prioridad": "baja"},
        ).get_json()

        response = self.client.patch(
            f"/api/asignaturas/{asig['id']}",
            json={"prioridad": "urgente"},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("prioridad", response.get_json()["error"].lower())
        detalle = self.client.get(f"/api/asignaturas/{asig['id']}").get_json()
        self.assertEqual(detalle["dificultad"], "alta")
        self.assertEqual(detalle["prioridad"], "baja")

    def test_crear_todo_prioridad_por_defecto_es_media(self):
        """POST /api/todos asigna prioridad 'media' por defecto si no se especifica."""
        self.registrar()

        response = self.client.post(
            "/api/todos",
            json={"titulo": "Estudiar Tema 1"},
        )
        data = response.get_json()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(data["titulo"], "Estudiar Tema 1")
        self.assertEqual(data["prioridad"], "media")

        # Verifica persistencia directa en base de datos
        with main_app.app.app_context():
            row = main_app.get_db().execute(
                "SELECT prioridad FROM todos WHERE id = ?",
                (data["id"],),
            ).fetchone()
            self.assertEqual(row["prioridad"], "media")

    def test_crear_todo_con_niveles_prioridad_validos(self):
        """POST /api/todos guarda correctamente prioridades 'baja', 'media' y 'alta'."""
        self.registrar()

        for nivel in ["baja", "media", "alta", "  ALTA  ", "Baja"]:
            with self.subTest(nivel=nivel):
                res = self.client.post(
                    "/api/todos",
                    json={"titulo": f"Tarea {nivel.strip()}", "prioridad": nivel},
                )
                self.assertEqual(res.status_code, 201)
                self.assertEqual(res.get_json()["prioridad"], nivel.strip().lower())

    def test_crear_todo_rechaza_prioridad_invalida(self):
        """POST /api/todos devuelve 400 si la prioridad no es baja, media o alta."""
        self.registrar()

        casos_invalidos = ["urgente", "critica", 1, None, ""]
        for invalido in casos_invalidos:
            with self.subTest(invalido=invalido):
                response = self.client.post(
                    "/api/todos",
                    json={"titulo": "Práctica", "prioridad": invalido},
                )
                self.assertEqual(response.status_code, 400)
                self.assertIn("error", response.get_json())
                self.assertIn("prioridad", response.get_json()["error"].lower())

    def test_update_todo_actualiza_prioridad_individual_o_combinada(self):
        """PATCH /api/todos/<id> permite modificar prioridad sola o junto con otros campos."""
        self.registrar()
        todo = self.client.post(
            "/api/todos",
            json={"titulo": "Hacer ejercicios", "prioridad": "baja"},
        ).get_json()

        # Actualizar solo prioridad
        res_prio = self.client.patch(
            f"/api/todos/{todo['id']}",
            json={"prioridad": "alta"},
        )
        self.assertEqual(res_prio.status_code, 200)
        self.assertEqual(res_prio.get_json()["prioridad"], "alta")
        self.assertEqual(res_prio.get_json()["titulo"], "Hacer ejercicios")

        # Actualizar combinado
        res_comb = self.client.patch(
            f"/api/todos/{todo['id']}",
            json={"titulo": "Hacer ejercicios de cálculo", "prioridad": "media", "completada": True},
        )
        self.assertEqual(res_comb.status_code, 200)
        self.assertEqual(res_comb.get_json()["titulo"], "Hacer ejercicios de cálculo")
        self.assertEqual(res_comb.get_json()["prioridad"], "media")
        self.assertTrue(res_comb.get_json()["completada"])

    def test_update_todo_rechaza_prioridad_invalida(self):
        """PATCH /api/todos/<id> rechaza prioridades desconocidas con 400 sin alterar datos."""
        self.registrar()
        todo = self.client.post(
            "/api/todos",
            json={"titulo": "Leer capítulo 3", "prioridad": "alta"},
        ).get_json()

        response = self.client.patch(
            f"/api/todos/{todo['id']}",
            json={"prioridad": "invalida"},
        )
        self.assertEqual(response.status_code, 400)

        # Comprueba que el valor original permanece intacto
        items = self.client.get("/api/todos").get_json()
        self.assertEqual(items[0]["prioridad"], "alta")

    def test_hu12_datos_guardados_y_disponibles_para_generador_hu06(self):
        """Criterio de aceptación 3: Dificultad y prioridad disponibles para HU06 vía modelo y API."""
        self.registrar()

        # Crea asignaturas con dificultad y prioridad independientes.
        asig_alta = self.client.post(
            "/api/asignaturas",
            json={"nombre": "Sistemas Operativos", "dificultad": "alta", "prioridad": "baja"},
        ).get_json()
        asig_baja = self.client.post(
            "/api/asignaturas",
            json={"nombre": "Inglés Técnico", "dificultad": "baja", "prioridad": "alta"},
        ).get_json()

        # Crea tareas con diferentes prioridades
        todo_urgente = self.client.post(
            "/api/todos",
            json={"titulo": "Entrega laboratorio SO", "prioridad": "alta"},
        ).get_json()
        todo_repaso = self.client.post(
            "/api/todos",
            json={"titulo": "Repaso vocabulario", "prioridad": "baja"},
        ).get_json()

        # 1. Disponibles vía listado API de asignaturas
        asigs_api = self.client.get("/api/asignaturas").get_json()
        asigs_dict = {a["nombre"]: a["dificultad"] for a in asigs_api}
        asigs_priority = {a["nombre"]: a["prioridad"] for a in asigs_api}
        self.assertEqual(asigs_dict["Sistemas Operativos"], "alta")
        self.assertEqual(asigs_dict["Inglés Técnico"], "baja")
        self.assertEqual(asigs_priority["Sistemas Operativos"], "baja")
        self.assertEqual(asigs_priority["Inglés Técnico"], "alta")

        # 2. Disponibles vía listado API de todos
        todos_api = self.client.get("/api/todos").get_json()
        todos_dict = {t["titulo"]: t["prioridad"] for t in todos_api}
        self.assertEqual(todos_dict["Entrega laboratorio SO"], "alta")
        self.assertEqual(todos_dict["Repaso vocabulario"], "baja")

        # 3. Disponibles en el modelo / función interna de backend para HU06
        with main_app.app.app_context():
            datos = main_app.obtener_datos_planificacion(1)
            self.assertIn("asignaturas", datos)
            self.assertIn("tareas", datos)
            asigs_modelo = {a["nombre"]: a["dificultad"] for a in datos["asignaturas"]}
            asigs_prioridad_modelo = {
                a["nombre"]: a["prioridad"] for a in datos["asignaturas"]
            }
            tareas_modelo = {t["titulo"]: t["prioridad"] for t in datos["tareas"]}
            self.assertEqual(asigs_modelo["Sistemas Operativos"], "alta")
            self.assertEqual(asigs_modelo["Inglés Técnico"], "baja")
            self.assertEqual(asigs_prioridad_modelo["Sistemas Operativos"], "baja")
            self.assertEqual(asigs_prioridad_modelo["Inglés Técnico"], "alta")
            self.assertEqual(tareas_modelo["Entrega laboratorio SO"], "alta")
            self.assertEqual(tareas_modelo["Repaso vocabulario"], "baja")

        # 4. Disponibles en endpoint específico de planificación
        plan_res = self.client.get("/api/plan/datos")
        self.assertEqual(plan_res.status_code, 200)
        self.assertEqual(plan_res.get_json(), datos)

    def test_aislamiento_dificultad_y_prioridad_entre_usuarios(self):
        """La dificultad y prioridad configuradas no se filtran ni alteran entre usuarios."""
        client1 = main_app.app.test_client()
        client2 = main_app.app.test_client()
        self.registrar("alumno1@ucm.es", client=client1, nombre="Estudiante 1")
        asig1 = client1.post(
            "/api/asignaturas",
            json={"nombre": "IS1 Privada", "dificultad": "alta", "prioridad": "alta"},
        ).get_json()
        todo1 = client1.post(
            "/api/todos",
            json={"titulo": "Tarea Privada", "prioridad": "alta"},
        ).get_json()

        self.registrar("alumno2@ucm.es", client=client2, nombre="Estudiante 2")

        # Usuario 2 no puede modificar ningún atributo de una asignatura ajena.
        res_asig = client2.patch(
            f"/api/asignaturas/{asig1['id']}",
            json={"dificultad": "baja", "prioridad": "baja"},
        )
        self.assertEqual(res_asig.status_code, 404)

        # Usuario 2 no puede modificar prioridad de tarea ajena
        res_todo = client2.patch(
            f"/api/todos/{todo1['id']}",
            json={"prioridad": "baja"},
        )
        self.assertEqual(res_todo.status_code, 404)

        # Los valores de Usuario 1 siguen siendo 'alta'
        self.assertEqual(
            client1.get(f"/api/asignaturas/{asig1['id']}").get_json()["dificultad"],
            "alta",
        )
        self.assertEqual(
            client1.get(f"/api/asignaturas/{asig1['id']}").get_json()["prioridad"],
            "alta",
        )
        self.assertEqual(
            client1.get("/api/todos").get_json()[0]["prioridad"],
            "alta",
        )

    def test_todo_y_asignatura_to_dict_manejan_dificultad_y_prioridad(self):
        """todo_to_dict y asignatura_to_dict serializan correctamente dificultad y prioridad."""
        connection = sqlite3.connect(":memory:")
        connection.row_factory = sqlite3.Row
        row_todo = connection.execute(
            """SELECT 10 AS id, 2 AS usuario_id, 'Hacer ejercicio' AS titulo,
                      0 AS completada, 'alta' AS prioridad, '2026-11-15' AS fecha_creacion"""
        ).fetchone()
        row_asig = connection.execute(
            """SELECT 5 AS id, 2 AS usuario_id, 'Redes' AS nombre,
                      'alta' AS dificultad, 'baja' AS prioridad"""
        ).fetchone()

        dict_todo = main_app.todo_to_dict(row_todo)
        dict_asig = main_app.asignatura_to_dict(row_asig)
        connection.close()

        self.assertEqual(dict_todo["prioridad"], "alta")
        self.assertEqual(dict_asig["dificultad"], "alta")
        self.assertEqual(dict_asig["prioridad"], "baja")


    # HU04: pruebas de API y persistencia sobre la base temporal de cada caso.
    def crear_actividad(self, **cambios):
        datos = {**ACTIVIDAD_HU04, **cambios}
        respuesta = self.client.post("/api/tareas", json=datos)
        self.assertEqual(respuesta.status_code, 201, respuesta.get_json())
        return respuesta.get_json()

    def test_hu04_ciclo_completo_de_los_tres_tipos(self):
        self.registrar()
        for tipo in ("tarea", "entrega", "examen"):
            with self.subTest(tipo=tipo):
                creada = self.crear_actividad(tipo=tipo)
                ruta = f"/api/tareas/{creada['id']}"
                self.assertEqual(self.client.get("/api/tareas").get_json(), [creada])
                cambios = dict(titulo="Nuevo título", tipo="entrega" if tipo == "tarea" else "tarea",
                               fecha_limite=(main_app.hoy_planificador() + timedelta(days=2)).isoformat(),
                               minutos_estimados=120)
                editada = self.client.patch(ruta, json=cambios)
                self.assertEqual(editada.status_code, 200)
                self.assertEqual(editada.get_json(), {**creada, **cambios})
                main_app.initialize_database()
                self.assertEqual(self.client.get("/api/tareas").get_json(), [editada.get_json()])
                self.assertEqual(self.client.delete(ruta).status_code, 204)
                self.assertEqual(self.client.get("/api/tareas").get_json(), [])
                self.assertEqual(self.client.delete(ruta).status_code, 404)
                self.assertEqual(self.client.patch(ruta, json={"titulo": "Otra"}).status_code, 404)

    def test_hu04_edicion_parcial_y_rechazo_atomico(self):
        self.registrar()
        creada = self.crear_actividad()
        ruta = f"/api/tareas/{creada['id']}"
        respuesta = self.client.patch(ruta, json={"minutos_estimados": 1})
        self.assertEqual(respuesta.get_json(), {**creada, "minutos_estimados": 1})
        invalida = self.client.patch(ruta, json={"titulo": "Descartar", "fecha_limite": "2027-02-29"})
        self.assertEqual(invalida.status_code, 400)
        self.assertEqual(self.client.get("/api/tareas").get_json(), [respuesta.get_json()])

    def test_hu04_requiere_sesion_en_todas_las_operaciones(self):
        for metodo, ruta in (("GET", "/api/tareas"), ("POST", "/api/tareas"),
                            ("PATCH", "/api/tareas/1"), ("DELETE", "/api/tareas/1")):
            with self.subTest(metodo=metodo):
                respuesta = self.client.open(ruta, method=metodo, json=ACTIVIDAD_HU04)
                self.assertEqual(respuesta.status_code, 401)

    def test_hu04_aislamiento_de_cuentas_en_crud_plan_y_avisos(self):
        self.registrar()
        creada = self.crear_actividad(fecha_limite=main_app.hoy_planificador().isoformat())
        ruta = f"/api/tareas/{creada['id']}"
        otra = main_app.app.test_client()
        self.registrar(email="otra@ucm.es", client=otra)
        self.assertEqual(otra.get("/api/tareas").get_json(), [])
        self.assertEqual(otra.get("/api/plan/datos").get_json()["tareas_planificadas"], [])
        self.assertEqual(otra.get("/api/recordatorios").get_json()["recordatorios"], [])
        self.assertEqual(otra.patch(ruta, json={"titulo": "Otra"}).status_code, 404)
        self.assertEqual(otra.delete(ruta).status_code, 404)
        self.assertEqual(self.client.get("/api/tareas").get_json(), [creada])

    def test_hu04_plazos_ordenados_y_separados_de_todos(self):
        self.registrar()
        self.crear_todo("Nota rápida")
        hoy = main_app.hoy_planificador()
        tarde = self.crear_actividad(fecha_limite=(hoy + timedelta(days=1)).isoformat())
        pronto = self.crear_actividad(fecha_limite=hoy.isoformat())
        empate = self.crear_actividad(fecha_limite=hoy.isoformat())
        esperadas = [pronto, empate, tarde]
        self.assertEqual(self.client.get("/api/tareas").get_json(), esperadas)
        plan = self.client.get("/api/plan/datos").get_json()
        self.assertEqual(plan["tareas_planificadas"], esperadas)
        self.assertEqual([t["titulo"] for t in plan["tareas"]], ["Nota rápida"])
        self.assertEqual(len(self.client.get("/api/todos").get_json()), 1)

    def test_hu04_recordatorios_reflejan_altas_ediciones_y_bajas(self):
        self.registrar()
        hoy = main_app.hoy_planificador()
        with patch.object(main_app, "hoy_planificador", return_value=hoy - timedelta(days=1)):
            self.crear_actividad(tipo="tarea", fecha_limite=(hoy - timedelta(days=1)).isoformat())
        for dias, tipo in ((0, "tarea"), (7, "entrega"), (8, "entrega")):
            self.crear_actividad(titulo=f"Plazo {dias}", tipo=tipo,
                                 fecha_limite=(hoy + timedelta(days=dias)).isoformat())
        avisos = self.client.get("/api/recordatorios").get_json()["recordatorios"]
        self.assertEqual([(a["tipo"], a["dias_restantes"]) for a in avisos],
                         [("Tarea", 0), ("Entrega", 7)])
        actividades = self.client.get("/api/tareas").get_json()
        self.client.patch(f"/api/tareas/{actividades[1]['id']}",
                          json={"fecha_limite": (hoy + timedelta(days=9)).isoformat()})
        self.client.delete(f"/api/tareas/{actividades[2]['id']}")
        self.assertEqual(self.client.get("/api/recordatorios").get_json()["total"], 0)

    def test_hu04_fechas_ayer_hoy_y_manana_en_alta_y_edicion(self):
        self.registrar()
        hoy = main_app.hoy_planificador()
        ayer = (hoy - timedelta(days=1)).isoformat()
        manana = (hoy + timedelta(days=1)).isoformat()
        for tipo in ("tarea", "entrega", "examen"):
            with self.subTest(tipo=tipo):
                datos = {**ACTIVIDAD_HU04, "tipo": tipo, "fecha_limite": ayer}
                rechazo = self.client.post("/api/tareas", json=datos)
                self.assertEqual(rechazo.status_code, 400)
                self.assertIn("hoy", rechazo.get_json()["error"])
                self.crear_actividad(tipo=tipo, fecha_limite=hoy.isoformat())
                creada = self.crear_actividad(tipo=tipo, fecha_limite=manana)
                ruta = f"/api/tareas/{creada['id']}"
                for fecha, estado in ((ayer, 400), (hoy.isoformat(), 200), (manana, 200)):
                    self.assertEqual(self.client.patch(ruta, json={"fecha_limite": fecha}).status_code, estado)

    def test_hu04_editar_vencida_conservando_fecha(self):
        self.registrar()
        hoy = main_app.hoy_planificador()
        ayer = (hoy - timedelta(days=1)).isoformat()
        with patch.object(main_app, "hoy_planificador", return_value=date.fromisoformat(ayer)):
            creada = self.crear_actividad(fecha_limite=ayer)
        ruta = f"/api/tareas/{creada['id']}"
        self.assertEqual(self.client.get("/api/tareas").get_json(), [creada])
        for cambios in ({"titulo": "Corregido"}, {"fecha_limite": ayer, "minutos_estimados": 20}):
            respuesta = self.client.patch(ruta, json=cambios)
            self.assertEqual(respuesta.status_code, 200)
            self.assertEqual(respuesta.get_json()["fecha_limite"], ayer)
        rechazo = self.client.patch(ruta, json={"fecha_limite": (hoy - timedelta(days=2)).isoformat()})
        self.assertEqual(rechazo.status_code, 400)
        self.assertEqual(self.client.get("/api/tareas").get_json()[0]["fecha_limite"], ayer)
        self.assertEqual(self.client.patch(ruta, json={"fecha_limite": hoy.isoformat()}).status_code, 200)

    def test_hu04_examen_en_plan_y_recordatorios(self):
        self.registrar()
        examen = self.crear_actividad(tipo="examen", fecha_limite=main_app.hoy_planificador().isoformat())
        plan = self.client.get("/api/plan/datos").get_json()
        self.assertEqual(plan["tareas_planificadas"], [examen])
        avisos = self.client.get("/api/recordatorios").get_json()["recordatorios"]
        self.assertEqual([(a["tipo"], a["fecha"], a["dias_restantes"]) for a in avisos],
                         [("Examen", examen["fecha_limite"], 0)])

    def test_hu04_migracion_conserva_actividades_y_admite_examenes(self):
        self.registrar()
        with sqlite3.connect(main_app.DATABASE) as db:
            db.execute("DROP TABLE tareas_planificadas")
            db.execute("""CREATE TABLE tareas_planificadas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
                titulo TEXT NOT NULL, tipo TEXT NOT NULL CHECK (tipo IN ('tarea','entrega')),
                fecha_limite TEXT NOT NULL, minutos_estimados INTEGER NOT NULL CHECK (minutos_estimados > 0)
            )""")
            db.execute("CREATE INDEX idx_tareas_planificadas_plazo ON tareas_planificadas(usuario_id, fecha_limite, id)")
            for id_anterior in (5, 12):
                db.execute("INSERT INTO tareas_planificadas VALUES (?, 1, 'Antigua', 'entrega', '2020-01-01', 40)",
                           (id_anterior,))
            db.execute("DELETE FROM tareas_planificadas WHERE id = 12")
        main_app.initialize_database()
        main_app.initialize_database()
        antiguas = self.client.get("/api/tareas").get_json()
        self.assertEqual(antiguas, [dict(id=5, titulo="Antigua", tipo="entrega",
                                         fecha_limite="2020-01-01", minutos_estimados=40)])
        self.assertGreater(self.crear_actividad(tipo="examen")["id"], 12)

    def test_hu04_rechaza_peticiones_invalidas_sin_escribir(self):
        self.registrar()
        for cuerpo in ("{", "null", "[]", "{}", '{"usuario_id": 42}'):
            with self.subTest(cuerpo=cuerpo):
                respuesta = self.client.post("/api/tareas", data=cuerpo, content_type="application/json")
                self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(self.client.get("/api/tareas").get_json(), [])


ACTIVIDAD_HU04 = dict(titulo="Práctica de IS1", tipo="entrega",
                      fecha_limite=(main_app.hoy_planificador() + timedelta(days=30)).isoformat(), minutos_estimados=90)


class TestValidacionHU04(unittest.TestCase):
    """Reglas de dominio de la HU04, sin servidor ni conexión a SQLite."""

    def test_normaliza_titulo_y_acepta_fecha_bisiesta(self):
        esperados = {**ACTIVIDAD_HU04, "fecha_limite": "2028-02-29"}
        datos = {**esperados, "titulo": "  Práctica de IS1  "}
        with patch.object(main_app, "hoy_planificador", return_value=date(2028, 2, 28)):
            self.assertEqual(main_app.validar_tarea(datos), esperados)
        self.assertEqual(datos["titulo"], "  Práctica de IS1  ")

    def test_alta_exige_cada_campo_y_edicion_admite_uno(self):
        for campo in ACTIVIDAD_HU04:
            with self.subTest(campo=campo):
                parcial = ACTIVIDAD_HU04.copy()
                parcial.pop(campo)
                with self.assertRaises(ValueError):
                    main_app.validar_tarea(parcial)
                self.assertEqual(main_app.validar_tarea(parcial, parcial=True), parcial)

    def test_valores_invalidos(self):
        invalidos = {
            "titulo": [None, [], "   ", "x" * 201],
            "tipo": [None, [], "reunión"],
            "fecha_limite": [None, 20280229, "2026-02-29", "2028-13-01", "20280229", "2028-W01-1"],
            "minutos_estimados": [None, True, 0, -1, "15", 1.5, 2**63],
        }
        for campo, valores in invalidos.items():
            for valor in valores:
                with self.subTest(campo=campo, valor=valor), self.assertRaises(ValueError):
                    main_app.validar_tarea({**ACTIVIDAD_HU04, campo: valor})

    def test_rechaza_campos_protegidos_y_edicion_vacia(self):
        for datos in ({"id": 1}, {"usuario_id": 2}, {}, None, []):
            with self.subTest(datos=datos), self.assertRaises(ValueError):
                main_app.validar_tarea(datos, parcial=True)


if __name__ == "__main__":
    unittest.main()

# ==============================================================================
# PRUEBAS UNITARIAS - HISTORIA DE USUARIO 19 (HU19: RECORDATORIOS)
# ==============================================================================
class TestHU19Recordatorios(unittest.TestCase):

    def setUp(self):
        """Inicializa el cliente de pruebas de Flask antes de cada test."""
        main_app.app.config['TESTING'] = True
        main_app.app.config['SECRET_KEY'] = 'clave_secreta_pruebas'
        self.client = main_app.app.test_client()

    def test_recordatorios_sin_autenticacion(self):
        """Comprueba que sin iniciar sesión la API retorne 401 Unauthorized."""
        respuesta = self.client.get('/api/recordatorios')
        self.assertEqual(respuesta.status_code, 401)
        
        datos = respuesta.get_json()
        self.assertIn('error', datos)

    def test_recordatorios_usuario_autenticado(self):
        """Comprueba que con sesión activa retorne 200 OK y la lista de avisos."""
        with self.client.session_transaction() as sesion:
            sesion['user_id'] = 1

        respuesta = self.client.get('/api/recordatorios')
        self.assertEqual(respuesta.status_code, 200)

        datos = respuesta.get_json()
        self.assertEqual(datos['status'], 'success')
        self.assertIn('recordatorios', datos)
        self.assertIsInstance(datos['recordatorios'], list)

    
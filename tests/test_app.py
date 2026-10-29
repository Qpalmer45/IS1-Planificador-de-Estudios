"""Pruebas unitarias y de integración de las funciones de app.py.

Ejecución desde la raíz del proyecto:
    python -m unittest discover -s tests -v

Cada prueba usa una base SQLite temporal para no modificar todos.db.
Los comentarios de cada bloque indican la función cubierta y los casos probados.
"""
import os
import sqlite3
import tempfile
import unittest
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
        self.temp_dir.cleanup()

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
        finally:
            connection.close()

        self.assertTrue({"nombre", "fecha_creacion"}.issubset(user_columns))
        self.assertIn("fecha_creacion", todo_columns)

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
    # home muestra el dashboard si hay sesión; login_view y registro_view
    # muestran sus formularios a visitantes y evitan que usuarios autenticados
    # vuelvan a las pantallas de acceso.
    # Casos: redirección de visitantes, renderizado de cada página y redirección
    # al dashboard cuando la sesión ya está iniciada.
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


if __name__ == "__main__":
    unittest.main()

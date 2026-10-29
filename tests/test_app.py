"""Pruebas unitarias y de integración para IS1 - Planificador de Estudios.

Cubre:
- HU20: Registro de usuario
- HU21: Inicio de sesión y control de acceso
- HU27: Gestión y aislamiento de lista de To-Dos rápidos
"""
import os
import tempfile
import unittest

import app as main_app


class TestStudyPlannerApp(unittest.TestCase):
    def setUp(self):
        # Crear base de datos temporal
        self.db_fd, self.db_path = tempfile.mkstemp(suffix=".db")
        os.close(self.db_fd)  # Cerrar descriptor para evitar bloqueos en Windows
        main_app.DATABASE = self.db_path
        main_app.app.config["TESTING"] = True
        main_app.app.config["SECRET_KEY"] = "test-secret-key"
        self.client = main_app.app.test_client()

        # Inicializar tablas en la BD de test
        main_app.initialize_database()

    def tearDown(self):
        with main_app.app.app_context():
            main_app.close_db()
        if os.path.exists(self.db_path):
            try:
                os.remove(self.db_path)
            except PermissionError:
                pass

    # --------------------------------------------------------------------------
    # HU20: Registro de usuarios
    # --------------------------------------------------------------------------
    def test_registro_usuario_exitoso(self):
        """HU20: Un usuario puede registrarse con datos válidos."""
        res = self.client.post(
            "/api/registro",
            json={
                "nombre": "Elena García",
                "email": "elena@ucm.es",
                "password": "mi_password123",
            },
        )
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["usuario"]["email"], "elena@ucm.es")
        self.assertEqual(data["usuario"]["nombre"], "Elena García")

    def test_registro_email_duplicado(self):
        """HU20: No se permite registrar el mismo correo dos veces."""
        self.client.post(
            "/api/registro",
            json={"nombre": "Elena", "email": "elena@ucm.es", "password": "password123"},
        )
        res = self.client.post(
            "/api/registro",
            json={"nombre": "Elena 2", "email": "elena@ucm.es", "password": "password456"},
        )
        self.assertEqual(res.status_code, 409)
        self.assertIn("ya está registrado", res.get_json()["error"])

    def test_registro_validaciones(self):
        """HU20: Validación de formato de correo y longitud de contraseña."""
        # Correo inválido
        res = self.client.post(
            "/api/registro",
            json={"nombre": "Test", "email": "correo-no-valido", "password": "password123"},
        )
        self.assertEqual(res.status_code, 400)

        # Contraseña demasiado corta (< 6)
        res = self.client.post(
            "/api/registro",
            json={"nombre": "Test", "email": "test@ucm.es", "password": "123"},
        )
        self.assertEqual(res.status_code, 400)

    # --------------------------------------------------------------------------
    # HU21: Inicio de sesión y logout
    # --------------------------------------------------------------------------
    def test_login_exitoso_y_fallido(self):
        """HU21: Inicio de sesión correcto y detección de credenciales inválidas."""
        self.client.post(
            "/api/registro",
            json={"nombre": "Carlos", "email": "carlos@ucm.es", "password": "password123"},
        )
        self.client.post("/api/logout")

        # Login con contraseña errónea
        res_fail = self.client.post(
            "/api/login",
            json={"email": "carlos@ucm.es", "password": "password_erroneo"},
        )
        self.assertEqual(res_fail.status_code, 401)
        self.assertIn("incorrectos", res_fail.get_json()["error"])

        # Login con credenciales válidas
        res_ok = self.client.post(
            "/api/login",
            json={"email": "carlos@ucm.es", "password": "password123"},
        )
        self.assertEqual(res_ok.status_code, 200)
        self.assertEqual(res_ok.get_json()["usuario"]["email"], "carlos@ucm.es")

    def test_proteccion_rutas_sin_autenticacion(self):
        """HU21: Rutas protegidas devuelven redirección a login o 401 en APIs."""
        res_web = self.client.get("/")
        self.assertEqual(res_web.status_code, 302)
        self.assertIn("/login", res_web.headers["Location"])

        res_api = self.client.get("/api/todos")
        self.assertEqual(res_api.status_code, 401)

    # --------------------------------------------------------------------------
    # HU27: Lista de To-Dos y aislamiento por usuario
    # --------------------------------------------------------------------------
    def test_todos_crud_completo(self):
        """HU27: Añadir, editar, completar y eliminar To-Dos."""
        self.client.post(
            "/api/registro",
            json={"nombre": "Laura", "email": "laura@ucm.es", "password": "password123"},
        )

        # 1. Crear To-Do
        res_create = self.client.post(
            "/api/todos",
            json={"titulo": "Comprar libreta para IS1"},
        )
        self.assertEqual(res_create.status_code, 201)
        todo = res_create.get_json()
        self.assertEqual(todo["titulo"], "Comprar libreta para IS1")
        self.assertFalse(todo["completada"])
        todo_id = todo["id"]

        # 2. Listar To-Dos
        res_list = self.client.get("/api/todos")
        self.assertEqual(res_list.status_code, 200)
        todos = res_list.get_json()
        self.assertEqual(len(todos), 1)

        # 3. Marcar como completada
        res_patch_done = self.client.patch(
            f"/api/todos/{todo_id}",
            json={"completada": True},
        )
        self.assertEqual(res_patch_done.status_code, 200)
        self.assertTrue(res_patch_done.get_json()["completada"])

        # 4. Editar título
        res_patch_title = self.client.patch(
            f"/api/todos/{todo_id}",
            json={"titulo": "Comprar libreta cuadriculada"},
        )
        self.assertEqual(res_patch_title.status_code, 200)
        self.assertEqual(res_patch_title.get_json()["titulo"], "Comprar libreta cuadriculada")

        # 5. Eliminar To-Do
        res_delete = self.client.delete(f"/api/todos/{todo_id}")
        self.assertEqual(res_delete.status_code, 200)

        # Verificar lista vacía
        res_list_after = self.client.get("/api/todos")
        self.assertEqual(len(res_list_after.get_json()), 0)

    def test_aislamiento_todos_entre_usuarios(self):
        """HU27 + HU20: Cada usuario solo ve y puede modificar sus propios To-Dos."""
        # Usuario 1
        client1 = main_app.app.test_client()
        client1.post(
            "/api/registro",
            json={"nombre": "User1", "email": "user1@ucm.es", "password": "password123"},
        )
        res_t1 = client1.post("/api/todos", json={"titulo": "Nota secreta de User 1"})
        t1_id = res_t1.get_json()["id"]

        # Usuario 2
        client2 = main_app.app.test_client()
        client2.post(
            "/api/registro",
            json={"nombre": "User2", "email": "user2@ucm.es", "password": "password123"},
        )

        # User 2 no debe ver las tareas de User 1
        res_t2_list = client2.get("/api/todos")
        self.assertEqual(len(res_t2_list.get_json()), 0)

        # User 2 no debe poder editar tareas de User 1
        res_tamper = client2.patch(f"/api/todos/{t1_id}", json={"titulo": "Hackeado"})
        self.assertEqual(res_tamper.status_code, 404)

        # User 2 no debe poder eliminar tareas de User 1
        res_delete_tamper = client2.delete(f"/api/todos/{t1_id}")
        self.assertEqual(res_delete_tamper.status_code, 404)


if __name__ == "__main__":
    unittest.main()

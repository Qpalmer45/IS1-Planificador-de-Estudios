"""Pruebas de la lógica del backend de IS1 (sin interfaz gráfica).

Ejecución: python -m unittest discover -s tests -v
Cada prueba usa una base de datos SQLite temporal y aislada.
"""
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import app as backend


class BackendTestCase(unittest.TestCase):
    def setUp(self):
        """Prepara una base SQLite temporal y un cliente Flask nuevo para aislar cada prueba."""
        self.temp = tempfile.TemporaryDirectory()
        self.db_patch = patch.object(backend, "DATABASE", Path(self.temp.name) / "test.db")
        self.db_patch.start()
        backend.initialize_database()
        backend.app.config.update(TESTING=True)
        self.client = backend.app.test_client()

    def tearDown(self):
        """Restaura la ruta de base de datos original y elimina los archivos temporales."""
        self.db_patch.stop()
        self.temp.cleanup()

    def registrar(self, email="alumno@ucm.es", password="clave123"):
        """Envía una petición de registro con los datos indicados y devuelve la respuesta HTTP."""
        return self.client.post("/api/registro", json={"email": email, "password": password})

    def login(self, email="alumno@ucm.es", password="clave123"):
        """Envía una petición de inicio de sesión para reutilizarla en los escenarios de autenticación."""
        return self.client.post("/api/login", json={"email": email, "password": password})

    def tarea(self, titulo="Estudiar álgebra"):
        """Crea una tarea mediante la API y devuelve su respuesta para preparar otros escenarios."""
        return self.client.post("/api/todos", json={"titulo": titulo})

    def test_pagina_principal(self):
        """Comprueba que la ruta raíz responde y renderiza la vista principal de tareas."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Mis tareas", response.data)

    def test_pagina_inicio_sesion(self):
        """Comprueba que la ruta de acceso responde y contiene su formulario de login."""
        response = self.client.get("/login")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b' id="login-form"', response.data)

    def test_pagina_registro(self):
        """Comprueba que la ruta de registro responde y contiene su formulario de alta."""
        response = self.client.get("/registro")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b' id="registro-form"', response.data)

    def test_esquema_base_datos(self):
        """Verifica que la inicialización crea las tablas de usuarios y tareas."""
        with backend.get_connection() as con:
            tablas = {r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertTrue({"usuarios", "todos"}.issubset(tablas))

    def test_inicializacion_idempotente(self):
        """Comprueba que inicializar varias veces no falla ni elimina las tablas existentes."""
        backend.initialize_database()
        backend.initialize_database()
        with backend.get_connection() as con:
            tablas = {r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertTrue({"usuarios", "todos"}.issubset(tablas))

    def test_conexion_devuelve_filas_accesibles_por_nombre(self):
        """Comprueba que get_connection configura SQLite para acceder a columnas por nombre."""
        with backend.get_connection() as con:
            fila = con.execute("SELECT 7 AS valor").fetchone()
        self.assertEqual(fila["valor"], 7)

    def test_conversion_fila_a_diccionario(self):
        """Comprueba que to_dict conserva los campos y convierte el estado 1 en True."""
        fila = {"id": 7, "titulo": "Repasar", "completada": 1}
        self.assertEqual(backend.to_dict(fila), {"id": 7, "titulo": "Repasar", "completada": True})

    def test_conversion_completada_falsa(self):
        """Comprueba que to_dict convierte el estado almacenado 0 en False."""
        self.assertFalse(backend.to_dict({"id": 1, "titulo": "A", "completada": 0})["completada"])

    def test_registro_valido_normaliza_correo(self):
        """Comprueba que un correo con espacios y mayúsculas se guarda normalizado."""
        r = self.registrar("  Alumno@UCM.ES  ")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.get_json()["email"], "alumno@ucm.es")

    def test_registro_guarda_hash_y_no_password(self):
        """Comprueba que el registro guarda un hash verificable y no la contraseña original."""
        self.registrar()
        with backend.get_connection() as con:
            usuario = con.execute("SELECT password_hash FROM usuarios").fetchone()
        self.assertNotEqual(usuario["password_hash"], "clave123")
        self.assertTrue(backend.check_password_hash(usuario["password_hash"], "clave123"))

    def test_registro_rechaza_correo_vacio(self):
        """Comprueba que el registro rechaza un correo vacío con estado HTTP 400."""
        self.assertEqual(self.registrar("").status_code, 400)

    def test_registro_rechaza_correo_sin_arroba(self):
        """Comprueba que el registro rechaza un correo sin el separador @."""
        self.assertEqual(self.registrar("correo-invalido").status_code, 400)

    def test_registro_rechaza_password_corto(self):
        """Comprueba que el registro rechaza contraseñas de menos de seis caracteres."""
        self.assertEqual(self.registrar(password="12345").status_code, 400)

    def test_registro_acepta_password_de_seis_caracteres(self):
        """Comprueba el límite válido mínimo de seis caracteres para la contraseña."""
        self.assertEqual(self.registrar(password="123456").status_code, 201)

    def test_registro_rechaza_duplicado_ignorando_mayusculas(self):
        """Comprueba que no se registra dos veces el mismo correo con distinta capitalización."""
        self.registrar("alumno@ucm.es")
        self.assertEqual(self.registrar("ALUMNO@UCM.ES").status_code, 409)

    def test_registro_sin_json(self):
        """Comprueba que enviar el registro sin cuerpo JSON produce una respuesta 400."""
        self.assertEqual(self.client.post("/api/registro").status_code, 400)

    def test_login_correcto(self):
        """Comprueba que unas credenciales válidas crean sesión y devuelven el correo."""
        self.registrar()
        self.client.post("/api/logout")
        r = self.login()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["email"], "alumno@ucm.es")

    def test_login_password_incorrecto(self):
        """Comprueba que una contraseña incorrecta no autentica al usuario."""
        self.registrar()
        self.client.post("/api/logout")
        self.assertEqual(self.login(password="incorrecta").status_code, 401)

    def test_login_usuario_inexistente(self):
        """Comprueba que intentar acceder con un correo no registrado devuelve 401."""
        self.assertEqual(self.login().status_code, 401)

    def test_login_sin_json(self):
        """Comprueba que una petición de login sin cuerpo JSON se rechaza como no autenticada."""
        self.assertEqual(self.client.post("/api/login").status_code, 401)

    def test_login_normaliza_email(self):
        """Comprueba que el login normaliza espacios y mayúsculas del correo recibido."""
        self.registrar()
        self.client.post("/api/logout")
        self.assertEqual(self.login(" ALUMNO@UCM.ES ").status_code, 200)

    def test_usuario_actual_no_autenticado(self):
        """Comprueba que la API informa de una sesión anónima cuando no hay usuario."""
        self.assertEqual(self.client.get("/api/usuario_actual").get_json(), {"autenticado": False})

    def test_usuario_actual_autenticado(self):
        """Comprueba que la API informa del correo tras completar el registro y autenticarse."""
        self.registrar()
        self.assertEqual(self.client.get("/api/usuario_actual").get_json(),
                         {"autenticado": True, "email": "alumno@ucm.es"})

    def test_logout_elimina_sesion(self):
        """Comprueba que cerrar sesión devuelve 204 y elimina el estado autenticado."""
        self.registrar()
        self.assertEqual(self.client.post("/api/logout").status_code, 204)
        self.assertFalse(self.client.get("/api/usuario_actual").get_json()["autenticado"])

    def test_listado_inicial_vacio(self):
        """Comprueba que el listado no contiene tareas antes de crear ninguna."""
        self.assertEqual(self.client.get("/api/todos").get_json(), [])

    def test_crear_tarea_valida(self):
        """Comprueba que crear una tarea recorta espacios y devuelve su estado inicial."""
        r = self.tarea("  Estudiar álgebra  ")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.get_json()["titulo"], "Estudiar álgebra")
        self.assertFalse(r.get_json()["completada"])

    def test_crear_tarea_vacia(self):
        """Comprueba que una tarea vacía o formada solo por espacios se rechaza."""
        self.assertEqual(self.tarea("   ").status_code, 400)

    def test_crear_tarea_maximo_200(self):
        """Comprueba que el título en el límite permitido de 200 caracteres se acepta."""
        self.assertEqual(self.tarea("x" * 200).status_code, 201)

    def test_crear_tarea_mas_de_200(self):
        """Comprueba que un título que supera los 200 caracteres se rechaza."""
        self.assertEqual(self.tarea("x" * 201).status_code, 400)

    def test_crear_tarea_sin_json(self):
        """Comprueba que crear una tarea sin cuerpo JSON devuelve una respuesta 400."""
        self.assertEqual(self.client.post("/api/todos").status_code, 400)

    def test_listado_orden_descendente(self):
        """Comprueba que las tareas se devuelven desde la más reciente hasta la más antigua."""
        primero = self.tarea("Primera").get_json()["id"]
        segundo = self.tarea("Segunda").get_json()["id"]
        ids = [t["id"] for t in self.client.get("/api/todos").get_json()]
        self.assertEqual(ids, [segundo, primero])

    def test_tareas_separadas_entre_usuarios(self):
        """Comprueba que un usuario autenticado solo ve las tareas asociadas a su cuenta."""
        self.registrar("uno@ucm.es")
        self.tarea("Privada uno")
        self.client.post("/api/logout")
        self.registrar("dos@ucm.es")
        self.tarea("Privada dos")
        self.assertEqual([t["titulo"] for t in self.client.get("/api/todos").get_json()],
                         ["Privada dos"])

    def test_tareas_anonimas_no_aparecen_a_usuario(self):
        """Comprueba que las tareas anónimas no se mezclan con el listado de un usuario."""
        self.tarea("Anónima")
        self.registrar()
        self.assertEqual(self.client.get("/api/todos").get_json(), [])

    def test_actualizar_titulo(self):
        """Comprueba que PATCH actualiza el título y recorta sus espacios exteriores."""
        id_ = self.tarea().get_json()["id"]
        r = self.client.patch(f"/api/todos/{id_}", json={"titulo": "  Nuevo  "})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["titulo"], "Nuevo")

    def test_marcar_tarea_completada(self):
        """Comprueba que PATCH cambia una tarea pendiente al estado completado."""
        id_ = self.tarea().get_json()["id"]
        r = self.client.patch(f"/api/todos/{id_}", json={"completada": True})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.get_json()["completada"])

    def test_desmarcar_tarea(self):
        """Comprueba que PATCH permite volver una tarea completada al estado pendiente."""
        id_ = self.tarea().get_json()["id"]
        self.client.patch(f"/api/todos/{id_}", json={"completada": True})
        r = self.client.patch(f"/api/todos/{id_}", json={"completada": False})
        self.assertFalse(r.get_json()["completada"])

    def test_actualizar_titulo_y_estado_en_una_peticion(self):
        """Comprueba que PATCH actualiza título y estado cuando recibe ambos campos juntos."""
        id_ = self.tarea().get_json()["id"]
        response = self.client.patch(
            f"/api/todos/{id_}",
            json={"titulo": "Repasar física", "completada": True},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["titulo"], "Repasar física")
        self.assertTrue(response.get_json()["completada"])

    def test_actualizar_titulo_vacio(self):
        """Comprueba que actualizar el título con espacios se rechaza con estado 400."""
        id_ = self.tarea().get_json()["id"]
        self.assertEqual(self.client.patch(f"/api/todos/{id_}", json={"titulo": " "}).status_code, 400)

    def test_actualizar_titulo_demasiado_largo(self):
        """Comprueba que actualizar con un título de más de 200 caracteres se rechaza."""
        id_ = self.tarea().get_json()["id"]
        self.assertEqual(self.client.patch(f"/api/todos/{id_}", json={"titulo": "x" * 201}).status_code, 400)

    def test_actualizar_sin_cambios(self):
        """Comprueba que PATCH sin campos modificables devuelve una respuesta 400."""
        id_ = self.tarea().get_json()["id"]
        self.assertEqual(self.client.patch(f"/api/todos/{id_}", json={}).status_code, 400)

    def test_eliminar_tarea(self):
        """Comprueba que borrar una tarea existente devuelve 204 y la quita del listado."""
        id_ = self.tarea().get_json()["id"]
        self.assertEqual(self.client.delete(f"/api/todos/{id_}").status_code, 204)
        self.assertEqual(self.client.get("/api/todos").get_json(), [])

    def test_eliminar_tarea_inexistente(self):
        """Comprueba que borrar un identificador inexistente devuelve 404."""
        self.assertEqual(self.client.delete("/api/todos/9999").status_code, 404)

    # Pendientes: señalan defectos existentes; expectedFailure evita dar la
    # impresión de que estas reglas ya están implementadas.
    @unittest.expectedFailure
    def test_pendiente_no_editar_tarea_de_otro_usuario(self):
        """Pendiente: debe impedir que una segunda cuenta modifique la tarea de la primera."""
        self.registrar("uno@ucm.es")
        id_ = self.tarea("Privada").get_json()["id"]
        self.client.post("/api/logout")
        self.registrar("dos@ucm.es")
        r = self.client.patch(f"/api/todos/{id_}", json={"titulo": "Intrusión"})
        self.assertIn(r.status_code, (403, 404))

    @unittest.expectedFailure
    def test_pendiente_no_borrar_tarea_de_otro_usuario(self):
        """Pendiente: debe impedir que una segunda cuenta elimine la tarea de la primera."""
        self.registrar("uno@ucm.es")
        id_ = self.tarea("Privada").get_json()["id"]
        self.client.post("/api/logout")
        self.registrar("dos@ucm.es")
        r = self.client.delete(f"/api/todos/{id_}")
        self.assertIn(r.status_code, (403, 404))

    @unittest.expectedFailure
    def test_pendiente_actualizar_tarea_inexistente_da_404(self):
        """Pendiente: debe responder 404 al modificar una tarea que no existe."""
        r = self.client.patch("/api/todos/9999", json={"titulo": "No existe"})
        self.assertEqual(r.status_code, 404)

    @unittest.expectedFailure
    def test_pendiente_rechazar_estado_completada_no_booleano(self):
        """Pendiente: debe rechazar un entero distinto de booleano como estado de tarea."""
        id_ = self.tarea().get_json()["id"]
        r = self.client.patch(f"/api/todos/{id_}", json={"completada": 2})
        self.assertEqual(r.status_code, 400)


if __name__ == "__main__":
    unittest.main()

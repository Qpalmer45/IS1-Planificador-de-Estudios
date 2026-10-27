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
        self.temp = tempfile.TemporaryDirectory()
        self.db_patch = patch.object(backend, "DATABASE", Path(self.temp.name) / "test.db")
        self.db_patch.start()
        backend.initialize_database()
        backend.app.config.update(TESTING=True)
        self.client = backend.app.test_client()

    def tearDown(self):
        self.db_patch.stop()
        self.temp.cleanup()

    def registrar(self, email="alumno@ucm.es", password="clave123"):
        return self.client.post("/api/registro", json={"email": email, "password": password})

    def login(self, email="alumno@ucm.es", password="clave123"):
        return self.client.post("/api/login", json={"email": email, "password": password})

    def tarea(self, titulo="Estudiar álgebra"):
        return self.client.post("/api/todos", json={"titulo": titulo})

    def test_esquema_base_datos(self):
        with backend.get_connection() as con:
            tablas = {r[0] for r in con.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        self.assertTrue({"usuarios", "todos"}.issubset(tablas))

    def test_inicializacion_idempotente(self):
        backend.initialize_database()
        backend.initialize_database()

    def test_conversion_fila_a_diccionario(self):
        fila = {"id": 7, "titulo": "Repasar", "completada": 1}
        self.assertEqual(backend.to_dict(fila), {"id": 7, "titulo": "Repasar", "completada": True})

    def test_conversion_completada_falsa(self):
        self.assertFalse(backend.to_dict({"id": 1, "titulo": "A", "completada": 0})["completada"])

    def test_registro_valido_normaliza_correo(self):
        r = self.registrar("  Alumno@UCM.ES  ")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.get_json()["email"], "alumno@ucm.es")

    def test_registro_guarda_hash_y_no_password(self):
        self.registrar()
        with backend.get_connection() as con:
            usuario = con.execute("SELECT password_hash FROM usuarios").fetchone()
        self.assertNotEqual(usuario["password_hash"], "clave123")
        self.assertTrue(backend.check_password_hash(usuario["password_hash"], "clave123"))

    def test_registro_rechaza_correo_vacio(self):
        self.assertEqual(self.registrar("").status_code, 400)

    def test_registro_rechaza_correo_sin_arroba(self):
        self.assertEqual(self.registrar("correo-invalido").status_code, 400)

    def test_registro_rechaza_password_corto(self):
        self.assertEqual(self.registrar(password="12345").status_code, 400)

    def test_registro_acepta_password_de_seis_caracteres(self):
        self.assertEqual(self.registrar(password="123456").status_code, 201)

    def test_registro_rechaza_duplicado_ignorando_mayusculas(self):
        self.registrar("alumno@ucm.es")
        self.assertEqual(self.registrar("ALUMNO@UCM.ES").status_code, 409)

    def test_registro_sin_json(self):
        self.assertEqual(self.client.post("/api/registro").status_code, 400)

    def test_login_correcto(self):
        self.registrar()
        self.client.post("/api/logout")
        r = self.login()
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["email"], "alumno@ucm.es")

    def test_login_password_incorrecto(self):
        self.registrar()
        self.client.post("/api/logout")
        self.assertEqual(self.login(password="incorrecta").status_code, 401)

    def test_login_usuario_inexistente(self):
        self.assertEqual(self.login().status_code, 401)

    def test_login_normaliza_email(self):
        self.registrar()
        self.client.post("/api/logout")
        self.assertEqual(self.login(" ALUMNO@UCM.ES ").status_code, 200)

    def test_usuario_actual_no_autenticado(self):
        self.assertEqual(self.client.get("/api/usuario_actual").get_json(), {"autenticado": False})

    def test_usuario_actual_autenticado(self):
        self.registrar()
        self.assertEqual(self.client.get("/api/usuario_actual").get_json(),
                         {"autenticado": True, "email": "alumno@ucm.es"})

    def test_logout_elimina_sesion(self):
        self.registrar()
        self.assertEqual(self.client.post("/api/logout").status_code, 204)
        self.assertFalse(self.client.get("/api/usuario_actual").get_json()["autenticado"])

    def test_listado_inicial_vacio(self):
        self.assertEqual(self.client.get("/api/todos").get_json(), [])

    def test_crear_tarea_valida(self):
        r = self.tarea("  Estudiar álgebra  ")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.get_json()["titulo"], "Estudiar álgebra")
        self.assertFalse(r.get_json()["completada"])

    def test_crear_tarea_vacia(self):
        self.assertEqual(self.tarea("   ").status_code, 400)

    def test_crear_tarea_maximo_200(self):
        self.assertEqual(self.tarea("x" * 200).status_code, 201)

    def test_crear_tarea_mas_de_200(self):
        self.assertEqual(self.tarea("x" * 201).status_code, 400)

    def test_crear_tarea_sin_json(self):
        self.assertEqual(self.client.post("/api/todos").status_code, 400)

    def test_listado_orden_descendente(self):
        primero = self.tarea("Primera").get_json()["id"]
        segundo = self.tarea("Segunda").get_json()["id"]
        ids = [t["id"] for t in self.client.get("/api/todos").get_json()]
        self.assertEqual(ids, [segundo, primero])

    def test_tareas_separadas_entre_usuarios(self):
        self.registrar("uno@ucm.es")
        self.tarea("Privada uno")
        self.client.post("/api/logout")
        self.registrar("dos@ucm.es")
        self.tarea("Privada dos")
        self.assertEqual([t["titulo"] for t in self.client.get("/api/todos").get_json()],
                         ["Privada dos"])

    def test_tareas_anonimas_no_aparecen_a_usuario(self):
        self.tarea("Anónima")
        self.registrar()
        self.assertEqual(self.client.get("/api/todos").get_json(), [])

    def test_actualizar_titulo(self):
        id_ = self.tarea().get_json()["id"]
        r = self.client.patch(f"/api/todos/{id_}", json={"titulo": "  Nuevo  "})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.get_json()["titulo"], "Nuevo")

    def test_marcar_tarea_completada(self):
        id_ = self.tarea().get_json()["id"]
        r = self.client.patch(f"/api/todos/{id_}", json={"completada": True})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.get_json()["completada"])

    def test_desmarcar_tarea(self):
        id_ = self.tarea().get_json()["id"]
        self.client.patch(f"/api/todos/{id_}", json={"completada": True})
        r = self.client.patch(f"/api/todos/{id_}", json={"completada": False})
        self.assertFalse(r.get_json()["completada"])

    def test_actualizar_titulo_vacio(self):
        id_ = self.tarea().get_json()["id"]
        self.assertEqual(self.client.patch(f"/api/todos/{id_}", json={"titulo": " "}).status_code, 400)

    def test_actualizar_titulo_demasiado_largo(self):
        id_ = self.tarea().get_json()["id"]
        self.assertEqual(self.client.patch(f"/api/todos/{id_}", json={"titulo": "x" * 201}).status_code, 400)

    def test_actualizar_sin_cambios(self):
        id_ = self.tarea().get_json()["id"]
        self.assertEqual(self.client.patch(f"/api/todos/{id_}", json={}).status_code, 400)

    def test_eliminar_tarea(self):
        id_ = self.tarea().get_json()["id"]
        self.assertEqual(self.client.delete(f"/api/todos/{id_}").status_code, 204)
        self.assertEqual(self.client.get("/api/todos").get_json(), [])

    def test_eliminar_tarea_inexistente(self):
        self.assertEqual(self.client.delete("/api/todos/9999").status_code, 404)

    # Pendientes: señalan defectos existentes; expectedFailure evita dar la
    # impresión de que estas reglas ya están implementadas.
    @unittest.expectedFailure
    def test_pendiente_no_editar_tarea_de_otro_usuario(self):
        self.registrar("uno@ucm.es")
        id_ = self.tarea("Privada").get_json()["id"]
        self.client.post("/api/logout")
        self.registrar("dos@ucm.es")
        r = self.client.patch(f"/api/todos/{id_}", json={"titulo": "Intrusión"})
        self.assertIn(r.status_code, (403, 404))

    @unittest.expectedFailure
    def test_pendiente_no_borrar_tarea_de_otro_usuario(self):
        self.registrar("uno@ucm.es")
        id_ = self.tarea("Privada").get_json()["id"]
        self.client.post("/api/logout")
        self.registrar("dos@ucm.es")
        r = self.client.delete(f"/api/todos/{id_}")
        self.assertIn(r.status_code, (403, 404))

    @unittest.expectedFailure
    def test_pendiente_actualizar_tarea_inexistente_da_404(self):
        r = self.client.patch("/api/todos/9999", json={"titulo": "No existe"})
        self.assertEqual(r.status_code, 404)

    @unittest.expectedFailure
    def test_pendiente_rechazar_estado_completada_no_booleano(self):
        id_ = self.tarea().get_json()["id"]
        r = self.client.patch(f"/api/todos/{id_}", json={"completada": 2})
        self.assertEqual(r.status_code, 400)


if __name__ == "__main__":
    unittest.main()

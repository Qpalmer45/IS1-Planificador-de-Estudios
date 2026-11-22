"""Pruebas HU19: preferencias persistentes y aislamiento entre usuarios."""
import unittest
from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
import app as backend


class ConfiguracionRecordatoriosTests(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.patcher = patch.object(backend, "DATABASE", Path(self.tmp.name) / "test.db")
        self.patcher.start()
        backend.initialize_database()
        backend.app.config["TESTING"] = True
        self.client = backend.app.test_client()
        with backend.app.app_context():
            with backend.get_db() as db:
                db.execute("INSERT INTO usuarios (id,nombre,email,password_hash) VALUES (1,'Uno','uno@test.es','x')")
                db.execute("INSERT INTO usuarios (id,nombre,email,password_hash) VALUES (2,'Dos','dos@test.es','x')")
        self.login(1)

    def tearDown(self):
        self.patcher.stop()
        self.tmp.cleanup()

    def login(self, user):
        with self.client.session_transaction() as sesion:
            if user is None:
                sesion.clear()
            else:
                sesion["usuario_id"] = user

    def test_por_defecto_siete_dias(self):
        self.assertEqual(self.client.get("/api/recordatorios/configuracion").json["dias_anticipacion"], 7)

    def test_guardar_y_recuperar_configuracion(self):
        self.assertEqual(self.client.put("/api/recordatorios/configuracion", json={"dias_anticipacion": 14}).status_code, 200)
        self.assertEqual(self.client.get("/api/recordatorios/configuracion").json["dias_anticipacion"], 14)

    def test_validacion_estricta(self):
        for valor in (-1, 366, True, 2.5, "7", None):
            with self.subTest(valor=valor):
                self.assertEqual(self.client.put("/api/recordatorios/configuracion", json={"dias_anticipacion": valor}).status_code, 400)
        self.assertEqual(self.client.put("/api/recordatorios/configuracion", json=[]).status_code, 400)

    def test_preferencias_separadas(self):
        self.client.put("/api/recordatorios/configuracion", json={"dias_anticipacion": 30})
        self.login(2)
        self.assertEqual(self.client.get("/api/recordatorios/configuracion").json["dias_anticipacion"], 7)
        self.client.put("/api/recordatorios/configuracion", json={"dias_anticipacion": 1})
        self.login(1)
        self.assertEqual(self.client.get("/api/recordatorios/configuracion").json["dias_anticipacion"], 30)

    def test_no_autenticado(self):
        self.login(None)
        self.assertEqual(self.client.get("/api/recordatorios/configuracion").status_code, 401)
        self.assertEqual(self.client.put("/api/recordatorios/configuracion", json={"dias_anticipacion": 7}).status_code, 401)

    def test_filtro_de_recordatorios_usa_la_preferencia(self):
        hoy = backend.hoy_planificador()
        for dias in (3, 10):
            respuesta = self.client.post("/api/tareas", json={
                "titulo": f"Entrega en {dias} días", "tipo": "entrega",
                "fecha_limite": (hoy + timedelta(days=dias)).isoformat(),
                "minutos_estimados": 30
            })
            self.assertEqual(respuesta.status_code, 201, respuesta.json)
        self.client.put("/api/recordatorios/configuracion", json={"dias_anticipacion": 3})
        primero = self.client.get("/api/recordatorios")
        self.assertEqual(primero.status_code, 200)
        self.assertEqual(primero.json["total"], 1)
        self.client.put("/api/recordatorios/configuracion", json={"dias_anticipacion": 14})
        segundo = self.client.get("/api/recordatorios")
        self.assertEqual(segundo.json["total"], 2)

if __name__ == "__main__":
    unittest.main()

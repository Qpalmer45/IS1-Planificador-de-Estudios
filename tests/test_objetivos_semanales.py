"""Regresión de objetivos semanales (HU13, HU04, HU06)."""
import unittest
from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import app as backend
from planificador import generar_semana


class ObjetivosSemanalesTests(unittest.TestCase):
    def setUp(self):
        self.temp = TemporaryDirectory()
        self.patch = patch.object(backend, "DATABASE", Path(self.temp.name) / "test.db")
        self.patch.start()
        backend.initialize_database()
        backend.app.config["TESTING"] = True
        self.client = backend.app.test_client()
        with backend.app.app_context():
            db = backend.get_db()
            with db:
                db.execute("INSERT INTO usuarios (id, nombre, email, password_hash) VALUES (1,'Uno','uno@test.es','x')")
                db.execute("INSERT INTO usuarios (id, nombre, email, password_hash) VALUES (2,'Dos','dos@test.es','x')")
        with self.client.session_transaction() as sesion:
            sesion["usuario_id"] = 1

    def tearDown(self):
        self.patch.stop()
        self.temp.cleanup()

    def test_asignatura_crear_editar_y_listar_objetivo(self):
        creado = self.client.post("/api/asignaturas", json={"nombre": "Álgebra", "minutos_semanales": 180})
        self.assertEqual(creado.status_code, 201)
        self.assertEqual(creado.json["minutos_semanales"], 180)
        identificador = creado.json["id"]
        actualizado = self.client.patch(f"/api/asignaturas/{identificador}", json={"minutos_semanales": 240})
        self.assertEqual(actualizado.status_code, 200)
        self.assertEqual(actualizado.json["minutos_semanales"], 240)
        self.assertEqual(self.client.get("/api/asignaturas").json[0]["minutos_semanales"], 240)

    def test_valores_invalidos_no_se_guardan(self):
        for valor in (-1, 10081, 1.5, "60", True, None):
            with self.subTest(valor=valor):
                respuesta = self.client.post("/api/asignaturas", json={"nombre": "X", "minutos_semanales": valor})
                self.assertEqual(respuesta.status_code, 400)

    def test_objetivo_de_asignatura_no_se_puede_modificar_desde_otra_cuenta(self):
        creado = self.client.post("/api/asignaturas", json={"nombre": "Propia", "minutos_semanales": 120})
        with self.client.session_transaction() as sesion:
            sesion["usuario_id"] = 2
        self.assertEqual(self.client.patch(f"/api/asignaturas/{creado.json['id']}",
                                           json={"minutos_semanales": 300}).status_code, 404)

    def test_actividad_crear_y_editar_objetivo(self):
        fecha = (backend.hoy_planificador() + timedelta(days=3)).isoformat()
        datos = {"titulo": "Entrega", "tipo": "entrega", "fecha_limite": fecha,
                 "minutos_estimados": 300, "minutos_semanales": 120}
        creado = self.client.post("/api/tareas", json=datos)
        self.assertEqual(creado.status_code, 201)
        self.assertEqual(creado.json["minutos_semanales"], 120)
        actualizado = self.client.patch(f"/api/tareas/{creado.json['id']}", json={"minutos_semanales": 180})
        self.assertEqual(actualizado.status_code, 200)
        self.assertEqual(actualizado.json["minutos_semanales"], 180)
        self.assertEqual(self.client.get("/api/tareas").json[0]["minutos_semanales"], 180)

    def test_plan_respeta_objetivo_semanal_de_asignatura(self):
        materias = [{"id": 1, "nombre": "Álgebra", "prioridad": "alta",
                     "dificultad": "alta", "minutos_semanales": 120}]
        plan = generar_semana("2026-11-23", materias, [], [], [],
                             hora_inicio="16:00", hora_fin="21:00", duracion=60, descanso=0)
        self.assertEqual(plan["minutos_por_asignatura"][1], 120)
        self.assertEqual(plan["total_sesiones"], 2)

    def test_objetivo_no_multiplo_de_sesion_es_exacto(self):
        materias = [{"id": 1, "nombre": "Álgebra", "prioridad": "media",
                     "dificultad": "media", "minutos_semanales": 95}]
        plan = generar_semana("2026-11-23", materias, [], [], [],
                             hora_inicio="16:00", hora_fin="21:00", duracion=60, descanso=15)
        self.assertEqual(plan["minutos_por_asignatura"][1], 95)
        self.assertEqual(plan["total_sesiones"], 2)
        self.assertEqual(plan["dias"][0]["sesiones"][1]["fin"], "17:50")

    def test_actividad_sin_asignatura_puede_planificarse(self):
        tareas = [{"id": 3, "titulo": "Preparar examen", "tipo": "examen",
                   "fecha_limite": "2026-11-27", "minutos_estimados": 95,
                   "minutos_semanales": 95}]
        plan = generar_semana("2026-11-23", [], tareas, [], [],
                             hora_inicio="16:00", hora_fin="21:00", duracion=60, descanso=15)
        self.assertEqual(plan["minutos_por_actividad"][3], 95)
        self.assertEqual(plan["dias"][0]["sesiones"][0]["asignatura"], "Actividad pendiente")

    def test_plan_respeta_objetivo_semanal_de_actividad(self):
        tareas = [{"id": 7, "titulo": "Práctica", "tipo": "entrega",
                   "fecha_limite": "2026-11-28", "minutos_estimados": 300,
                   "minutos_semanales": 120}]
        plan = generar_semana("2026-11-23", [], tareas, [], [],
                             hora_inicio="16:00", hora_fin="21:00", duracion=60, descanso=0)
        self.assertEqual(plan["minutos_por_actividad"][7], 120)
        self.assertEqual(plan["total_sesiones"], 2)


if __name__ == "__main__":
    unittest.main()

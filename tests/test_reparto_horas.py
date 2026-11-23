"""Regresión: exámenes sin horas independientes y reparto por objetivos."""
import unittest
from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import app as backend
from planificador import generar_semana, minutos


class RepartoObjetivosTests(unittest.TestCase):
    def test_objetivos_y_sobrante(self):
        materias = [
            {"id": 1, "nombre": "Difícil", "minutos_semanales": 120, "prioridad": "alta", "dificultad": "alta"},
            {"id": 2, "nombre": "Fácil", "minutos_semanales": 60, "prioridad": "baja", "dificultad": "baja"},
        ]
        plan = generar_semana("2026-11-23", materias, [], [], [],
                             hora_inicio="16:00", hora_fin="17:00", duracion=60, descanso=0)
        self.assertGreaterEqual(plan["minutos_por_asignatura"][1], 120)
        self.assertGreaterEqual(plan["minutos_por_asignatura"][2], 60)
        self.assertGreater(plan["minutos_por_asignatura"][1], plan["minutos_por_asignatura"][2])
        self.assertEqual(plan["deficit_minutos_por_asignatura"], {1: 0, 2: 0})

    def test_falta_de_huecos_comunica_deficit(self):
        materias = [{"id": 1, "nombre": "A", "minutos_semanales": 600,
                     "prioridad": "media", "dificultad": "media"}]
        plan = generar_semana("2026-11-23", materias, [], [], [],
                             hora_inicio="16:00", hora_fin="17:00", duracion=60, descanso=0)
        self.assertEqual(plan["minutos_por_asignatura"][1], 420)
        self.assertEqual(plan["deficit_minutos_por_asignatura"][1], 180)

    def test_horas_extra_se_intercalan_y_la_tarea_mas_urgente_va_primero(self):
        materias = [{"id": 1, "nombre": "Álgebra", "minutos_semanales": 0,
                     "prioridad": "media", "dificultad": "media"}]
        tareas = [{"id": 2, "titulo": "Tarea urgente", "tipo": "tarea",
                   "fecha_limite": "2026-11-23", "minutos_estimados": 60,
                   "minutos_semanales": 0}]
        periodos = [{"fecha_inicio": "2026-11-24", "fecha_fin": "2026-11-29"}]

        plan = generar_semana("2026-11-23", materias, tareas, [], periodos,
                             hora_inicio="16:00", hora_fin="18:00", duracion=60, descanso=0)

        self.assertEqual(plan["minutos_por_actividad"][2], 60)
        self.assertEqual(plan["minutos_por_asignatura"][1], 60)
        self.assertEqual(plan["dias"][0]["sesiones"][0]["actividad"], "Tarea urgente")

    def test_entrega_sin_objetivo_semanal_se_planifica_tras_cubrir_objetivo_de_asignatura(self):
        materias = [{"id": 1, "nombre": "Álgebra", "minutos_semanales": 60,
                     "prioridad": "media", "dificultad": "media"}]
        entregas = [{"id": 2, "titulo": "Entrega", "tipo": "entrega",
                     "fecha_limite": "2026-11-29", "minutos_estimados": 120,
                     "minutos_semanales": 0}]

        plan = generar_semana("2026-11-23", materias, entregas, [], [],
                             hora_inicio="16:00", hora_fin="18:00", duracion=60, descanso=0)

        self.assertGreaterEqual(plan["minutos_por_asignatura"][1], 60)
        self.assertEqual(plan["minutos_por_actividad"][2], 120)

    def test_tarea_urgente_recibe_horas_aunque_quede_objetivo_de_asignatura(self):
        materias = [{"id": 1, "nombre": "Álgebra", "minutos_semanales": 10080,
                     "prioridad": "media", "dificultad": "media"}]
        tareas = [{"id": 2, "titulo": "Entrega hoy", "tipo": "entrega",
                   "fecha_limite": "2026-11-23", "minutos_estimados": 60,
                   "minutos_semanales": 0}]

        plan = generar_semana("2026-11-23", materias, tareas, [], [],
                             hora_inicio="16:00", hora_fin="17:00", duracion=60, descanso=0)

        self.assertEqual(plan["minutos_por_actividad"][2], 60)
        self.assertEqual(plan["dias"][0]["sesiones"][0]["actividad"], "Entrega hoy")

    def test_tarea_y_objetivo_semanal_se_intercalan_en_las_franjas(self):
        materias = [{"id": 1, "nombre": "Álgebra", "minutos_semanales": 60,
                     "prioridad": "media", "dificultad": "media"}]
        tareas = [{"id": 2, "titulo": "Entrega hoy", "tipo": "entrega",
                   "fecha_limite": "2026-11-23", "minutos_estimados": 120,
                   "minutos_semanales": 0}]

        plan = generar_semana("2026-11-23", materias, tareas, [], [],
                             hora_inicio="16:00", hora_fin="19:00", duracion=60, descanso=0)

        sesiones = plan["dias"][0]["sesiones"]
        self.assertEqual([sesion["actividad"] for sesion in sesiones],
                         ["Entrega hoy", None, "Entrega hoy"])

    def test_actividad_extra_con_plazo_mas_cercano_se_planifica_primero(self):
        actividades = [
            {"id": 1, "titulo": "Entrega posterior", "tipo": "entrega",
             "fecha_limite": "2026-11-29", "minutos_estimados": 60, "minutos_semanales": 0},
            {"id": 2, "titulo": "Tarea urgente", "tipo": "tarea",
             "fecha_limite": "2026-11-23", "minutos_estimados": 60, "minutos_semanales": 0},
        ]

        plan = generar_semana("2026-11-23", [], actividades, [], [],
                             hora_inicio="16:00", hora_fin="17:00", duracion=60, descanso=0)

        self.assertEqual(plan["dias"][0]["sesiones"][0]["actividad"], "Tarea urgente")

    def test_examen_no_añade_horas_al_objetivo(self):
        materias = [{"id": 1, "nombre": "Álgebra", "minutos_semanales": 120,
                     "prioridad": "media", "dificultad": "media"}]
        examen = [{"id": 3, "titulo": "Examen Álgebra", "tipo": "examen",
                   "fecha_limite": "2026-11-25", "minutos_estimados": 5000,
                   "minutos_semanales": 0, "asignatura_id": 1}]
        plan = generar_semana("2026-11-23", materias, examen, [], [],
                             hora_inicio="16:00", hora_fin="17:00", duracion=60, descanso=0)
        self.assertEqual(plan["minutos_por_actividad"], {})
        self.assertTrue(any(s["actividad"] == "Examen Álgebra" for d in plan["dias"] for s in d["sesiones"]))

    def test_no_hay_solapamientos_con_clases_ni_sesiones(self):
        materias = [{"id": 1, "nombre": "A", "minutos_semanales": 200,
                     "prioridad": "media", "dificultad": "media"}]
        clases = [{"dia_semana": "lunes", "hora_inicio": "17:00", "hora_fin": "18:00"}]
        plan = generar_semana("2026-11-23", materias, [], clases, [],
                             hora_inicio="16:00", hora_fin="20:00", duracion=60, descanso=15)
        for d in plan["dias"]:
            sesiones = d["sesiones"]
            for s in sesiones:
                if d["dia"] == "lunes":
                    self.assertFalse(minutos(s["inicio"]) < 1080 and minutos(s["fin"]) > 1020)
            for x, y in zip(sesiones, sesiones[1:]):
                self.assertGreaterEqual(minutos(y["inicio"]), minutos(x["fin"]))


class ExamenApiTests(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.patcher = patch.object(backend, "DATABASE", Path(self.tmp.name) / "test.db")
        self.patcher.start()
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
        self.asignatura = self.client.post("/api/asignaturas", json={"nombre": "Álgebra", "minutos_semanales": 120}).json["id"]
        self.datos = {"titulo": "Parcial", "tipo": "examen",
                      "fecha_limite": (backend.hoy_planificador() + timedelta(days=3)).isoformat(),
                      "minutos_estimados": 1, "asignatura_id": self.asignatura}

    def tearDown(self):
        self.patcher.stop()
        self.tmp.cleanup()

    def test_examen_exige_asignatura(self):
        datos = dict(self.datos)
        datos.pop("asignatura_id")
        self.assertEqual(self.client.post("/api/tareas", json=datos).status_code, 400)

    def test_examen_no_admite_objetivo_propio(self):
        self.assertEqual(self.client.post("/api/tareas", json={**self.datos, "minutos_semanales": 90}).status_code, 400)
        creado = self.client.post("/api/tareas", json=self.datos)
        self.assertEqual(creado.status_code, 201)
        self.assertEqual(creado.json["minutos_semanales"], 0)
        self.assertEqual(self.client.patch("/api/tareas/" + str(creado.json["id"]),
                                           json={"minutos_semanales": 60}).status_code, 400)
        self.assertEqual(self.client.patch("/api/tareas/" + str(creado.json["id"]),
                                           json={"asignatura_id": None}).status_code, 400)

    def test_no_puedo_asignar_examen_a_materia_ajena(self):
        with self.client.session_transaction() as sesion:
            sesion["usuario_id"] = 2
        otro = self.client.post("/api/asignaturas", json={"nombre": "Privada"}).json["id"]
        with self.client.session_transaction() as sesion:
            sesion["usuario_id"] = 1
        self.assertEqual(self.client.post("/api/tareas", json={**self.datos, "asignatura_id": otro}).status_code, 400)


if __name__ == "__main__":
    unittest.main()

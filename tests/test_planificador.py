"""Pruebas del generador semanal y de su API (HU42)."""
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path
from unittest.mock import patch

import app as backend
from planificador import generar_semana, minutos

ASIGNATURAS = [
    {"id": 1, "nombre": "Álgebra", "dificultad": "alta", "prioridad": "alta"},
    {"id": 2, "nombre": "Programación", "dificultad": "media", "prioridad": "media"},
]


class GeneradorSemanalTests(unittest.TestCase):
    def generar(self, **opciones):
        return generar_semana("2026-11-23", ASIGNATURAS, [], [], [], **opciones)

    def test_siete_dias_con_fechas_y_horas(self):
        plan = self.generar(hora_inicio="16:00", hora_fin="18:00", duracion=60, descanso=15)
        self.assertEqual(len(plan["dias"]), 7)
        self.assertEqual(plan["dias"][0]["dia"], "lunes")
        self.assertEqual(plan["dias"][-1]["fecha"], "2026-11-29")
        self.assertEqual(plan["dias"][0]["sesiones"][0]["inicio"], "16:00")
        self.assertEqual(plan["dias"][0]["sesiones"][0]["fin"], "17:00")
        self.assertTrue(plan["vista_previa"])

    def test_sesiones_no_se_solapan_entre_si(self):
        plan = self.generar(hora_inicio="15:00", hora_fin="22:00", duracion=50, descanso=10)
        for dia in plan["dias"]:
            for anterior, siguiente in zip(dia["sesiones"], dia["sesiones"][1:]):
                self.assertGreaterEqual(minutos(siguiente["inicio"]) - minutos(anterior["fin"]), 10)

    def test_clases_bloquean_sesiones_y_se_reanuda_despues(self):
        clases = [{"dia_semana": "lunes", "hora_inicio": "16:30", "hora_fin": "18:00"}]
        plan = generar_semana("2026-11-23", ASIGNATURAS, [], clases, [],
                             hora_inicio="16:00", hora_fin="20:00", duracion=60, descanso=0)
        lunes = plan["dias"][0]["sesiones"]
        self.assertTrue(lunes)
        self.assertEqual(lunes[0]["inicio"], "18:00")
        self.assertTrue(all(not (minutos(s["inicio"]) < 1080 and minutos(s["fin"]) > 990) for s in lunes))

    def test_periodos_bloqueados_no_generan_sesiones(self):
        periodos = [{"fecha_inicio": "2026-11-24", "fecha_fin": "2026-11-25"}]
        plan = generar_semana("2026-11-23", ASIGNATURAS, [], [], periodos)
        self.assertFalse(plan["dias"][1]["sesiones"])
        self.assertFalse(plan["dias"][2]["sesiones"])
        self.assertTrue(plan["dias"][1]["libre"])

    def test_examen_proximo_se_prioriza(self):
        actividades = [
            {"id": 1, "titulo": "Entrega", "tipo": "entrega", "fecha_limite": "2026-11-27", "minutos_estimados": 60},
            {"id": 2, "titulo": "Examen", "tipo": "examen", "fecha_limite": "2026-11-24", "minutos_estimados": 60},
        ]
        plan = generar_semana("2026-11-23", ASIGNATURAS, actividades, [], [],
                             hora_inicio="16:00", hora_fin="18:00", duracion=60, descanso=0)
        self.assertEqual(plan["dias"][0]["sesiones"][0]["actividad"], "Examen")

    def test_actividad_vencida_no_se_planifica(self):
        act = [{"id": 1, "titulo": "Pasada", "tipo": "tarea", "fecha_limite": "2026-11-22", "minutos_estimados": 60}]
        plan = generar_semana("2026-11-23", ASIGNATURAS, act, [], [])
        self.assertTrue(all(s["actividad"] is None for d in plan["dias"] for s in d["sesiones"]))

    def test_sin_asignaturas_no_hay_sesiones(self):
        plan = generar_semana("2026-11-23", [], [], [], [])
        self.assertEqual(plan["total_sesiones"], 0)

    def test_franjas_invalidas_se_rechazan(self):
        for kwargs in ({"hora_inicio": "20:00", "hora_fin": "16:00"},
                       {"hora_inicio": "25:00"},
                       {"duracion": 0}, {"descanso": -1}):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                self.generar(**kwargs)

    def test_prioridad_alta_recibe_mas_tiempo(self):
        plan = self.generar(hora_inicio="16:00", hora_fin="21:00", duracion=60, descanso=0)
        self.assertGreater(plan["minutos_por_asignatura"][1], plan["minutos_por_asignatura"][2])


class ApiPlanSemanalTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.db_path = Path(self.temp.name) / "test.db"
        self.patcher = patch.object(backend, "DATABASE", self.db_path)
        self.patcher.start()
        backend.initialize_database()
        backend.app.config["TESTING"] = True
        self.client = backend.app.test_client()
        with backend.app.app_context():
            db = backend.get_db()
            with db:
                db.execute("INSERT INTO usuarios (id, nombre, email, password_hash) VALUES (1,'Uno','uno@example.com','x')")
                db.execute("INSERT INTO usuarios (id, nombre, email, password_hash) VALUES (2,'Dos','dos@example.com','x')")
                db.execute("INSERT INTO asignaturas (usuario_id, nombre) VALUES (1, 'Álgebra')")
                db.execute("INSERT INTO asignaturas (usuario_id, nombre) VALUES (2, 'Privada')")
        self.inicio = backend.hoy_planificador().isoformat()

    def tearDown(self):
        self.patcher.stop()
        self.temp.cleanup()

    def login(self, usuario):
        with self.client.session_transaction() as sesion:
            sesion["usuario_id"] = usuario

    def test_requiere_autenticacion(self):
        self.assertEqual(self.client.get("/api/plan/semana").status_code, 401)

    def test_solo_aparecen_asignaturas_del_usuario(self):
        self.login(1)
        response = self.client.get("/api/plan/semana", query_string={"inicio": self.inicio})
        self.assertEqual(response.status_code, 200)
        sesiones = [s for d in response.json["dias"] for s in d["sesiones"]]
        self.assertTrue(sesiones)
        self.assertEqual({s["asignatura"] for s in sesiones}, {"Álgebra"})

    def test_parametros_invalidos_responden_400(self):
        self.login(1)
        for args in ({"inicio": "no-es-fecha"}, {"duracion": "0"},
                     {"descanso": "-1"}, {"desde": "22:00", "hasta": "16:00"}):
            with self.subTest(args=args):
                self.assertEqual(self.client.get("/api/plan/semana", query_string=args).status_code, 400)


if __name__ == "__main__":
    unittest.main()

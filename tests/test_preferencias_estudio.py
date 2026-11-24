"""Pruebas unitarias de las preferencias de aprendizaje (HU16)."""
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path
from unittest.mock import patch

import app as backend
from planificador import generar_semana


class PreferenciasEstudioAPITests(unittest.TestCase):
    """Pruebas de los endpoints GET/PUT /api/preferencias-estudio."""

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
                db.execute(
                    "INSERT INTO usuarios (id, nombre, email, password_hash) "
                    "VALUES (1, 'Ana', 'ana@example.com', 'x')"
                )
                db.execute(
                    "INSERT INTO usuarios (id, nombre, email, password_hash) "
                    "VALUES (2, 'Luis', 'luis@example.com', 'x')"
                )
                db.execute(
                    "INSERT INTO asignaturas (usuario_id, nombre, minutos_semanales) "
                    "VALUES (1, 'Matemáticas', 120)"
                )
                db.execute(
                    "INSERT INTO asignaturas (usuario_id, nombre, minutos_semanales) "
                    "VALUES (2, 'Historia', 60)"
                )

    def tearDown(self):
        self.patcher.stop()
        self.temp.cleanup()

    def login(self, usuario_id):
        with self.client.session_transaction() as s:
            s["usuario_id"] = usuario_id

    def test_get_sin_registro_devuelve_valores_por_defecto(self):
        self.login(1)
        r = self.client.get("/api/preferencias-estudio")
        self.assertEqual(r.status_code, 200)
        data = r.get_json()
        self.assertEqual(data["duracion_sesion_preferida"], 60)
        self.assertEqual(data["franja_concentracion"], "sin_preferencia")

    def test_get_sin_sesion_devuelve_401(self):
        r = self.client.get("/api/preferencias-estudio")
        self.assertEqual(r.status_code, 401)

    def test_put_sin_sesion_devuelve_401(self):
        r = self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 45, "franja_concentracion": "tarde"},
        )
        self.assertEqual(r.status_code, 401)

    def test_put_guarda_valores_validos(self):
        self.login(1)
        r = self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 45, "franja_concentracion": "tarde"},
        )
        self.assertEqual(r.status_code, 200)
        data = r.get_json()
        self.assertEqual(data["duracion_sesion_preferida"], 45)
        self.assertEqual(data["franja_concentracion"], "tarde")

    def test_put_persiste_tras_recargar(self):
        self.login(1)
        self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 90, "franja_concentracion": "noche"},
        )
        r = self.client.get("/api/preferencias-estudio")
        self.assertEqual(r.status_code, 200)
        data = r.get_json()
        self.assertEqual(data["duracion_sesion_preferida"], 90)
        self.assertEqual(data["franja_concentracion"], "noche")

    def test_put_actualiza_valores_existentes(self):
        self.login(1)
        self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 30, "franja_concentracion": "manana"},
        )
        self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 120, "franja_concentracion": "noche"},
        )
        r = self.client.get("/api/preferencias-estudio")
        data = r.get_json()
        self.assertEqual(data["duracion_sesion_preferida"], 120)
        self.assertEqual(data["franja_concentracion"], "noche")

    def test_put_rechaza_duracion_menor_a_15(self):
        self.login(1)
        r = self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 10, "franja_concentracion": "tarde"},
        )
        self.assertEqual(r.status_code, 400)

    def test_put_rechaza_duracion_mayor_a_240(self):
        self.login(1)
        r = self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 300, "franja_concentracion": "tarde"},
        )
        self.assertEqual(r.status_code, 400)

    def test_put_rechaza_duracion_booleana(self):
        self.login(1)
        r = self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": True, "franja_concentracion": "tarde"},
        )
        self.assertEqual(r.status_code, 400)

    def test_put_rechaza_duracion_decimal(self):
        self.login(1)
        r = self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 60.5, "franja_concentracion": "tarde"},
        )
        self.assertEqual(r.status_code, 400)

    def test_put_rechaza_duracion_string(self):
        self.login(1)
        r = self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": "60", "franja_concentracion": "tarde"},
        )
        self.assertEqual(r.status_code, 400)

    def test_put_rechaza_franja_invalida(self):
        self.login(1)
        r = self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 60, "franja_concentracion": "mediodia"},
        )
        self.assertEqual(r.status_code, 400)

    def test_aislamiento_entre_usuarios(self):
        self.login(1)
        self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 30, "franja_concentracion": "manana"},
        )
        self.login(2)
        r = self.client.get("/api/preferencias-estudio")
        data = r.get_json()
        self.assertEqual(data["duracion_sesion_preferida"], 60)
        self.assertEqual(data["franja_concentracion"], "sin_preferencia")

        self.client.put(
            "/api/preferencias-estudio",
            json={"duracion_sesion_preferida": 120, "franja_concentracion": "noche"},
        )
        self.login(1)
        r = self.client.get("/api/preferencias-estudio")
        data = r.get_json()
        self.assertEqual(data["duracion_sesion_preferida"], 30)
        self.assertEqual(data["franja_concentracion"], "manana")


class PreferenciasPlanificadorTests(unittest.TestCase):
    """Pruebas de la priorización por franja de concentración en el planificador."""

    MATERIAS = [
        {"id": 1, "nombre": "Álgebra", "dificultad": "alta", "prioridad": "alta",
         "minutos_semanales": 120},
    ]

    def test_franja_tarde_prioriza_huecos_de_tarde(self):
        """Con franja 'tarde', las sesiones deben asignarse primero en 14:00-20:00."""
        plan = generar_semana(
            "2026-11-23", self.MATERIAS, [], [], [],
            hora_inicio="08:00", hora_fin="22:00",
            duracion=60, descanso=0,
            franja_concentracion="tarde",
        )
        lunes = plan["dias"][0]["sesiones"]
        self.assertTrue(len(lunes) > 0, "Debe haber al menos una sesión el lunes")
        from planificador import minutos
        primera = lunes[0]
        inicio_min = minutos(primera["inicio"])
        self.assertGreaterEqual(inicio_min, 14 * 60,
            f"La primera sesión debería empezar en franja tarde, pero empieza a las {primera['inicio']}")
        self.assertLess(inicio_min, 20 * 60,
            f"La primera sesión debería empezar en franja tarde, pero empieza a las {primera['inicio']}")

    def test_sin_preferencia_orden_cronologico(self):
        """Con 'sin_preferencia', las sesiones siguen el orden cronológico habitual."""
        plan = generar_semana(
            "2026-11-23", self.MATERIAS, [], [], [],
            hora_inicio="08:00", hora_fin="22:00",
            duracion=60, descanso=0,
            franja_concentracion="sin_preferencia",
        )
        lunes = plan["dias"][0]["sesiones"]
        self.assertTrue(len(lunes) > 0)
        from planificador import minutos
        primera = lunes[0]
        self.assertEqual(minutos(primera["inicio"]), 8 * 60)

    def test_franja_noche_prioriza_huecos_de_noche(self):
        """Con franja 'noche', las sesiones se asignan primero en 20:00-23:59."""
        plan = generar_semana(
            "2026-11-23", self.MATERIAS, [], [], [],
            hora_inicio="08:00", hora_fin="23:00",
            duracion=60, descanso=0,
            franja_concentracion="noche",
        )
        lunes = plan["dias"][0]["sesiones"]
        self.assertTrue(len(lunes) > 0)
        from planificador import minutos
        primera = lunes[0]
        inicio_min = minutos(primera["inicio"])
        self.assertGreaterEqual(inicio_min, 20 * 60,
            f"La primera sesión debería empezar en franja noche, pero empieza a las {primera['inicio']}")

    def test_franja_manana_prioriza_huecos_de_manana(self):
        """Con franja 'manana', las sesiones se asignan primero en 08:00-14:00."""
        plan = generar_semana(
            "2026-11-23", self.MATERIAS, [], [], [],
            hora_inicio="06:00", hora_fin="22:00",
            duracion=60, descanso=0,
            franja_concentracion="manana",
        )
        lunes = plan["dias"][0]["sesiones"]
        self.assertTrue(len(lunes) > 0)
        from planificador import minutos
        primera = lunes[0]
        inicio_min = minutos(primera["inicio"])
        self.assertGreaterEqual(inicio_min, 8 * 60,
            f"La primera sesión debería empezar en franja mañana, pero empieza a las {primera['inicio']}")
        self.assertLess(inicio_min, 14 * 60,
            f"La primera sesión debería empezar en franja mañana, pero empieza a las {primera['inicio']}")

    def test_sesiones_finales_siguen_cronologicas(self):
        """Tras priorizar la franja, las sesiones devueltas mantienen orden cronológico."""
        plan = generar_semana(
            "2026-11-23", self.MATERIAS, [], [], [],
            hora_inicio="08:00", hora_fin="22:00",
            duracion=60, descanso=0,
            franja_concentracion="tarde",
        )
        from planificador import minutos
        for dia in plan["dias"]:
            inicios = [minutos(s["inicio"]) for s in dia["sesiones"]]
            self.assertEqual(inicios, sorted(inicios),
                f"Las sesiones del {dia['fecha']} no están en orden cronológico")


if __name__ == "__main__":
    unittest.main()

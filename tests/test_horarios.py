"""Pruebas unitarias y de integración para Horario de Clases y Días Libres.

Cubre:
- Creación, listado, edición y eliminación de clases (CRUD).
- Creación automática de asignaturas nuevas al registrar clases.
- Validaciones horarias (hora_inicio < hora_fin) y prevención de solapamientos.
- CRUD de días y períodos libres (festivos y vacaciones).
- Aislamiento de datos entre usuarios.
- Funciones auxiliares de disponibilidad y planificación (obtener_intervalos_ocupados e is_time_slot_available).
"""
from datetime import date, datetime, timedelta
from pathlib import Path
import sqlite3
import tempfile
import unittest

import app as main_app


class TestHorariosYPeriodosLibres(unittest.TestCase):
    """Prepara una base de datos temporal y sesiones para pruebas de disponibilidad."""

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.original_database = main_app.DATABASE
        self.original_testing = main_app.app.config.get("TESTING")
        self.original_secret_key = main_app.app.config.get("SECRET_KEY")

        main_app.DATABASE = Path(self.temp_dir.name) / "test_horarios.db"
        main_app.app.config.update(
            TESTING=True,
            SECRET_KEY="test-secret-key-horarios",
        )
        self.client = main_app.app.test_client()
        main_app.initialize_database()

    def tearDown(self):
        with main_app.app.app_context():
            main_app.close_db()
        main_app.DATABASE = self.original_database
        main_app.app.config["TESTING"] = self.original_testing
        main_app.app.config["SECRET_KEY"] = self.original_secret_key
        try:
            self.temp_dir.cleanup()
        except Exception:
            pass

    def registrar(self, email="estudiante@ucm.es", password="password123", nombre="Alumno"):
        return self.client.post("/api/registro", json={
            "nombre": nombre,
            "email": email,
            "password": password,
        })

    def crear_asignatura(self, nombre="Matemáticas"):
        return self.client.post("/api/asignaturas", json={"nombre": nombre})

    # -------------------------------------------------------------------------
    # HORARIOS: CREACIÓN Y SINCRONIZACIÓN CON ASIGNATURAS
    # -------------------------------------------------------------------------

    def test_crear_clase_con_asignatura_existente(self):
        """Permite registrar una clase vinculada a una asignatura ya creada."""
        self.registrar()
        res_asig = self.crear_asignatura("Física Cuántica")
        asig_id = res_asig.get_json()["id"]

        res = self.client.post("/api/horarios", json={
            "asignatura_id": asig_id,
            "dia_semana": "lunes",
            "hora_inicio": "09:00",
            "hora_fin": "11:00",
            "aula": "Aula 201",
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["asignatura_id"], asig_id)
        self.assertEqual(data["asignatura_nombre"], "Física Cuántica")
        self.assertEqual(data["dia_semana"], "lunes")
        self.assertEqual(data["hora_inicio"], "09:00")
        self.assertEqual(data["hora_fin"], "11:00")
        self.assertEqual(data["aula"], "Aula 201")

    def test_crear_clase_con_asignatura_nueva_la_crea_automaticamente(self):
        """Al escribir una asignatura nueva desde el horario, se crea en la tabla de asignaturas."""
        self.registrar()
        res = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Inteligencia Artificial",
            "dia_semana": "martes",
            "hora_inicio": "10:00",
            "hora_fin": "12:00",
            "aula": "Lab 3",
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["asignatura_nombre"], "Inteligencia Artificial")

        # Verificar que la asignatura ahora aparece en el listado de asignaturas
        res_asigs = self.client.get("/api/asignaturas")
        self.assertEqual(res_asigs.status_code, 200)
        nombres = [a["nombre"] for a in res_asigs.get_json()]
        self.assertIn("Inteligencia Artificial", nombres)

        # Verificar valores por defecto (media, media)
        asig_creada = next(a for a in res_asigs.get_json() if a["nombre"] == "Inteligencia Artificial")
        self.assertEqual(asig_creada["dificultad"], "media")
        self.assertEqual(asig_creada["prioridad"], "media")

    def test_crear_clase_reutiliza_asignatura_si_ya_existe_por_nombre(self):
        """Si se introduce el nombre de una asignatura ya existente, se asocia a esa en lugar de duplicarla."""
        self.registrar()
        res_asig = self.crear_asignatura("Álgebra")
        asig_id = res_asig.get_json()["id"]

        # Crear clase con el mismo nombre (con espacios y mayúsculas variadas)
        res = self.client.post("/api/horarios", json={
            "asignatura_nombre": "  álgebra  ",
            "dia_semana": "miercoles",
            "hora_inicio": "08:30",
            "hora_fin": "10:30",
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.get_json()["asignatura_id"], asig_id)

        # No debe haber asignaturas duplicadas
        res_asigs = self.client.get("/api/asignaturas")
        asigs_algebra = [a for a in res_asigs.get_json() if a["nombre"].lower() == "álgebra"]
        self.assertEqual(len(asigs_algebra), 1)

    # -------------------------------------------------------------------------
    # HORARIOS: VALIDACIONES HORARIAS Y SOLAPAMIENTOS
    # -------------------------------------------------------------------------

    def test_crear_clase_rechaza_hora_inicio_mayor_o_igual_a_fin(self):
        """Rechaza clases donde la hora de inicio no sea anterior a la de fin."""
        self.registrar()
        res_asig = self.crear_asignatura("Cálculo")
        asig_id = res_asig.get_json()["id"]

        # Caso igual
        res1 = self.client.post("/api/horarios", json={
            "asignatura_id": asig_id,
            "dia_semana": "jueves",
            "hora_inicio": "10:00",
            "hora_fin": "10:00",
        })
        self.assertEqual(res1.status_code, 400)
        self.assertIn("anterior", res1.get_json()["error"])

        # Caso inicio > fin
        res2 = self.client.post("/api/horarios", json={
            "asignatura_id": asig_id,
            "dia_semana": "jueves",
            "hora_inicio": "12:00",
            "hora_fin": "10:00",
        })
        self.assertEqual(res2.status_code, 400)
        self.assertIn("anterior", res2.get_json()["error"])

    def test_crear_clase_rechaza_horas_invalidas_o_dia_invalido(self):
        """Valida el formato de las horas y los días de la semana válidos."""
        self.registrar()
        res_asig = self.crear_asignatura("Química")
        asig_id = res_asig.get_json()["id"]

        # Día inválido
        res = self.client.post("/api/horarios", json={
            "asignatura_id": asig_id,
            "dia_semana": "juernes",
            "hora_inicio": "09:00",
            "hora_fin": "10:00",
        })
        self.assertEqual(res.status_code, 400)

        # Hora inválida
        res = self.client.post("/api/horarios", json={
            "asignatura_id": asig_id,
            "dia_semana": "viernes",
            "hora_inicio": "25:00",
            "hora_fin": "26:00",
        })
        self.assertEqual(res.status_code, 400)

    def test_crear_clase_evita_solapamientos_mismo_dia(self):
        """Impide registrar dos clases cuyas franjas horarias se solapen el mismo día."""
        self.registrar()
        res1 = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Biología",
            "dia_semana": "lunes",
            "hora_inicio": "10:00",
            "hora_fin": "12:00",
        })
        self.assertEqual(res1.status_code, 201)

        # Caso solapamiento interno (10:30 a 11:30)
        solap1 = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Historia",
            "dia_semana": "lunes",
            "hora_inicio": "10:30",
            "hora_fin": "11:30",
        })
        self.assertEqual(solap1.status_code, 400)
        self.assertIn("solapa", solap1.get_json()["error"].lower())

        # Caso solapamiento inicio (09:30 a 10:30)
        solap2 = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Historia",
            "dia_semana": "lunes",
            "hora_inicio": "09:30",
            "hora_fin": "10:30",
        })
        self.assertEqual(solap2.status_code, 400)

        # Caso solapamiento fin (11:30 a 12:30)
        solap3 = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Historia",
            "dia_semana": "lunes",
            "hora_inicio": "11:30",
            "hora_fin": "12:30",
        })
        self.assertEqual(solap3.status_code, 400)

    def test_permite_clases_adyacentes_o_en_dias_distintos(self):
        """Permite clases que terminan justo cuando empieza la siguiente o en otro día."""
        self.registrar()
        res1 = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Clase 1",
            "dia_semana": "lunes",
            "hora_inicio": "09:00",
            "hora_fin": "10:00",
        })
        self.assertEqual(res1.status_code, 201)

        # Adyacente posterior en lunes (10:00 a 11:00)
        res2 = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Clase 2",
            "dia_semana": "lunes",
            "hora_inicio": "10:00",
            "hora_fin": "11:00",
        })
        self.assertEqual(res2.status_code, 201)

        # Mismo horario pero en martes (09:00 a 10:00)
        res3 = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Clase 3",
            "dia_semana": "martes",
            "hora_inicio": "09:00",
            "hora_fin": "10:00",
        })
        self.assertEqual(res3.status_code, 201)

    # -------------------------------------------------------------------------
    # HORARIOS: CRUD COMPLETO Y EDICIÓN
    # -------------------------------------------------------------------------

    def test_horarios_crud_completo(self):
        """Crea, lista, actualiza y elimina bloques del horario."""
        self.registrar()
        c1 = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Redes",
            "dia_semana": "viernes",
            "hora_inicio": "15:00",
            "hora_fin": "17:00",
            "aula": "Lab 1",
        }).get_json()

        # Detalle
        detalle = self.client.get(f"/api/horarios/{c1['id']}")
        self.assertEqual(detalle.status_code, 200)
        self.assertEqual(detalle.get_json()["asignatura_nombre"], "Redes")

        # Actualizar horario a otra hora sin solapamiento
        act = self.client.patch(f"/api/horarios/{c1['id']}", json={
            "hora_inicio": "16:00",
            "hora_fin": "18:00",
            "aula": "Lab 2",
        })
        self.assertEqual(act.status_code, 200)
        self.assertEqual(act.get_json()["hora_inicio"], "16:00")
        self.assertEqual(act.get_json()["aula"], "Lab 2")

        # Eliminar
        borrado = self.client.delete(f"/api/horarios/{c1['id']}")
        self.assertEqual(borrado.status_code, 200)

        # Verificar que no está
        self.assertEqual(self.client.get(f"/api/horarios/{c1['id']}").status_code, 404)
        self.assertEqual(len(self.client.get("/api/horarios").get_json()), 0)

    # -------------------------------------------------------------------------
    # DÍAS Y PERÍODOS LIBRES: CRUD Y VALIDACIONES
    # -------------------------------------------------------------------------

    def test_crear_periodo_libre_un_solo_dia(self):
        """Permite registrar un festivo de un día concreto."""
        self.registrar()
        res = self.client.post("/api/periodos-libres", json={
            "fecha_inicio": "2026-12-06",
            "motivo": "Día de la Constitución",
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["fecha_inicio"], "2026-12-06")
        self.assertEqual(data["fecha_fin"], "2026-12-06")
        self.assertEqual(data["motivo"], "Día de la Constitución")

    def test_crear_periodo_libre_rango_fechas(self):
        """Permite registrar vacaciones con fecha de inicio y fin."""
        self.registrar()
        res = self.client.post("/api/periodos-libres", json={
            "fecha_inicio": "2026-12-23",
            "fecha_fin": "2027-01-07",
            "motivo": "Vacaciones de Navidad",
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["fecha_inicio"], "2026-12-23")
        self.assertEqual(data["fecha_fin"], "2027-01-07")

    def test_periodo_libre_rechaza_inicio_posterior_a_fin(self):
        """Rechaza rangos donde fecha_inicio > fecha_fin."""
        self.registrar()
        res = self.client.post("/api/periodos-libres", json={
            "fecha_inicio": "2026-12-10",
            "fecha_fin": "2026-12-05",
        })
        self.assertEqual(res.status_code, 400)

    def test_periodos_libres_crud_completo(self):
        """Flujo completo de días libres: crear, listar, modificar y borrar."""
        self.registrar()
        p = self.client.post("/api/periodos-libres", json={
            "fecha_inicio": "2026-11-01",
            "motivo": "Todos los Santos",
        }).get_json()

        # Listar
        lista = self.client.get("/api/periodos-libres").get_json()
        self.assertEqual(len(lista), 1)

        # Modificar
        act = self.client.patch(f"/api/periodos-libres/{p['id']}", json={
            "motivo": "Festivo Nacional",
        })
        self.assertEqual(act.status_code, 200)
        self.assertEqual(act.get_json()["motivo"], "Festivo Nacional")

        # Eliminar
        self.assertEqual(self.client.delete(f"/api/periodos-libres/{p['id']}").status_code, 200)
        self.assertEqual(len(self.client.get("/api/periodos-libres").get_json()), 0)

    # -------------------------------------------------------------------------
    # AISLAMIENTO ENTRE USUARIOS
    # -------------------------------------------------------------------------

    def test_aislamiento_de_horarios_y_dias_libres(self):
        """Verifica que un usuario no puede ver ni modificar los horarios ni períodos de otro."""
        # Usuario 1
        self.registrar(email="user1@test.com", password="password1")
        c1 = self.client.post("/api/horarios", json={
            "asignatura_nombre": "Asignatura U1",
            "dia_semana": "lunes",
            "hora_inicio": "09:00",
            "hora_fin": "11:00",
        }).get_json()
        p1 = self.client.post("/api/periodos-libres", json={
            "fecha_inicio": "2026-12-25",
            "motivo": "Navidad U1",
        }).get_json()

        # Usuario 2
        client2 = main_app.app.test_client()
        client2.post("/api/registro", json={
            "nombre": "User 2",
            "email": "user2@test.com",
            "password": "password2",
        })

        # Usuario 2 no debe ver el horario ni periodo de Usuario 1
        self.assertEqual(len(client2.get("/api/horarios").get_json()), 0)
        self.assertEqual(len(client2.get("/api/periodos-libres").get_json()), 0)
        self.assertEqual(client2.get(f"/api/horarios/{c1['id']}").status_code, 404)
        self.assertEqual(client2.get(f"/api/periodos-libres/{p1['id']}").status_code, 404)

        # Usuario 2 no puede modificar ni borrar recursos de Usuario 1
        self.assertEqual(client2.patch(f"/api/horarios/{c1['id']}", json={"aula": "Hack"}).status_code, 404)
        self.assertEqual(client2.delete(f"/api/horarios/{c1['id']}").status_code, 404)
        self.assertEqual(client2.delete(f"/api/periodos-libres/{p1['id']}").status_code, 404)

    # -------------------------------------------------------------------------
    # ARQUITECTURA / PREPARACIÓN PARA FUTURA PLANIFICACIÓN
    # -------------------------------------------------------------------------

    def test_funciones_auxiliares_de_disponibilidad(self):
        """Verifica obtener_intervalos_ocupados e is_time_slot_available."""
        self.registrar()
        user_info = self.client.get("/api/usuario_actual").get_json()
        uid = user_info["id"]

        # Crear clase lunes 10:00 a 12:00
        self.client.post("/api/horarios", json={
            "asignatura_nombre": "Arquitectura Software",
            "dia_semana": "lunes",
            "hora_inicio": "10:00",
            "hora_fin": "12:00",
        })

        # Crear festivo el 2026-11-23 (un lunes)
        self.client.post("/api/periodos-libres", json={
            "fecha_inicio": "2026-11-23",
            "fecha_fin": "2026-11-23",
            "motivo": "Festivo Universitario",
        })

        with main_app.app.app_context():
            # Caso 1: Lunes normal (2026-11-16 es lunes)
            info_lunes = main_app.obtener_intervalos_ocupados(uid, "2026-11-16")
            self.assertFalse(info_lunes["es_dia_libre"])
            self.assertEqual(len(info_lunes["clases"]), 1)
            self.assertEqual(info_lunes["clases"][0]["asignatura_nombre"], "Arquitectura Software")

            # Hueco 08:00 a 09:30 está disponible
            self.assertTrue(main_app.is_time_slot_available(uid, "2026-11-16T08:00:00", duration_minutes=90))

            # Hueco 10:30 a 11:30 NO está disponible porque se solapa con la clase (10:00 - 12:00)
            self.assertFalse(main_app.is_time_slot_available(uid, "2026-11-16T10:30:00", duration_minutes=60))

            # Caso 2: Lunes festivo (2026-11-23)
            info_festivo = main_app.obtener_intervalos_ocupados(uid, "2026-11-23")
            self.assertTrue(info_festivo["es_dia_libre"])
            self.assertEqual(info_festivo["motivo_dia_libre"], "Festivo Universitario")
            # En día festivo no hay disponibilidad para sesiones lectivas
            self.assertFalse(main_app.is_time_slot_available(uid, "2026-11-23T08:00:00", duration_minutes=60))

    # -------------------------------------------------------------------------
    # INTERFAZ DE USUARIO: PLANTILLA Y ELEMENTOS HTML
    # -------------------------------------------------------------------------

    def test_interfaz_horario_presente_en_pantalla_principal(self):
        """Verifica que index.html contiene la pestaña Horario, la cuadrícula y el modal accesible."""
        self.registrar()
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        html = res.get_data(as_text=True)

        # Botón de navegación principal para la pestaña de horario
        self.assertIn('data-tab="horarios"', html)
        self.assertIn('id="tab-nav-horarios"', html)
        self.assertIn("<span>Horario</span>", html)

        # Sección de la pestaña y cuadrícula semanal
        self.assertIn('id="tab-horarios"', html)
        self.assertIn('id="schedule-grid"', html)
        self.assertIn('id="btn-add-schedule-class"', html)
        self.assertIn('id="btn-view-weekdays"', html)
        self.assertIn('id="btn-view-all-days"', html)

        # Sección de días y períodos libres
        self.assertIn('id="free-days-form"', html)
        self.assertIn('id="free-start-date"', html)
        self.assertIn('id="free-days-list"', html)

        # Modal de añadir/editar clase
        self.assertIn('id="class-modal"', html)
        self.assertIn('id="class-modal-title"', html)
        self.assertIn('id="class-subject-select"', html)
        self.assertIn('id="class-start-input"', html)
        self.assertIn('id="class-end-input"', html)

        # Inclusión del script horario.js
        self.assertIn('src="/static/horario.js"', html)


if __name__ == "__main__":
    unittest.main()

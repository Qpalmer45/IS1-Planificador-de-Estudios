"""Motor determinista de vista previa semanal. Sin efectos en base de datos."""
from datetime import date, timedelta

DIAS = ("lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo")
PESO = {"baja": 1, "media": 2, "alta": 3}


def minutos(hora):
    partes = hora.split(":")
    if len(partes) != 2 or not all(p.isdigit() for p in partes):
        raise ValueError("Hora inválida; usa HH:MM.")
    h, m = map(int, partes)
    if not (0 <= h <= 23 and 0 <= m <= 59):
        raise ValueError("Hora fuera de rango.")
    return h * 60 + m


def formato(valor):
    return f"{valor // 60:02d}:{valor % 60:02d}"


def generar_semana(inicio, asignaturas, actividades, clases, periodos, *,
                   hora_inicio="16:00", hora_fin="21:00",
                   duracion=60, descanso=15):
    """Genera siete días sin conflictos, priorizando entregas cercanas.

    No guarda sesiones; usa solo los datos recibidos del usuario autenticado.
    """
    if isinstance(inicio, str):
        inicio = date.fromisoformat(inicio)
    if not isinstance(inicio, date):
        raise ValueError("Fecha de inicio inválida.")
    desde, hasta = minutos(hora_inicio), minutos(hora_fin)
    if desde >= hasta or not (25 <= duracion <= 180) or not (0 <= descanso <= 60):
        raise ValueError("Revisa la franja, duración y descanso.")
    if not isinstance(duracion, int) or not isinstance(descanso, int):
        raise ValueError("Duración y descanso deben ser enteros.")

    materias = [dict(a) for a in asignaturas]
    materias.sort(key=lambda a: a["id"])
    pendientes = []
    for act in actividades:
        try:
            fecha = date.fromisoformat(act["fecha_limite"])
        except (KeyError, TypeError, ValueError):
            continue
        if fecha >= inicio:
            pendientes.append({**dict(act), "_fecha": fecha, "_restante": int(act["minutos_estimados"])})
    pendientes.sort(key=lambda a: (a["_fecha"], a["id"]))
    minutos_actividad = {a["id"]: 0 for a in pendientes}
    dias = []
    minutos_materia = {a["id"]: 0 for a in materias}

    for desplazamiento in range(7):
        actual = inicio + timedelta(days=desplazamiento)
        fecha = actual.isoformat()
        libre = any(p["fecha_inicio"] <= fecha <= p["fecha_fin"] for p in periodos)
        ocupados = []
        if not libre:
            for clase in clases:
                if clase["dia_semana"] == DIAS[actual.weekday()]:
                    ocupados.append((minutos(clase["hora_inicio"]), minutos(clase["hora_fin"])))
        ocupados.sort()
        sesiones = []
        cursor = desde
        while materias and not libre and cursor + duracion <= hasta:
            final = cursor + duracion
            choque = next(((a, b) for a, b in ocupados if cursor < b and final > a), None)
            if choque:
                cursor = max(cursor, choque[1])
                continue
            candidatos = [a for a in pendientes if a["_restante"] > 0 and a["_fecha"] >= actual and (not a.get("minutos_semanales") or minutos_actividad[a["id"]] < a["minutos_semanales"])]
            if candidatos:
                # Plazos más cercanos primero; empate por fecha e identificador.
                tarea = min(candidatos, key=lambda a: (a["_fecha"], a["id"]))
                materia = next((a for a in materias if a["id"] == tarea.get("asignatura_id")), None)
                # HU04 no tiene campo asignatura_id: no inventamos esa relación.
                # Las actividades independientes se muestran como tal.
                tarea["_restante"] = max(0, tarea["_restante"] - duracion)
                minutos_actividad[tarea["id"]] += duracion
            else:
                tarea = None
                elegibles = [a for a in materias if not a.get("minutos_semanales") or minutos_materia[a["id"]] < a["minutos_semanales"]]
                if not elegibles:
                    break
                materia = min(elegibles, key=lambda a: (
                    minutos_materia[a["id"]] / PESO.get(a.get("prioridad"), 2),
                    -PESO.get(a.get("dificultad"), 2), a["id"]))
            if materia is not None:
                minutos_materia[materia["id"]] += duracion
            sesiones.append({
                "fecha": fecha, "inicio": formato(cursor), "fin": formato(final),
                "asignatura_id": materia["id"] if materia else None,
                "asignatura": materia["nombre"] if materia else "Actividad pendiente",
                "actividad": tarea["titulo"] if tarea else None,
                "tipo": tarea["tipo"] if tarea else None,
            })
            cursor = final + descanso
        dias.append({"fecha": fecha, "dia": DIAS[actual.weekday()],
                     "libre": libre, "sesiones": sesiones})
    return {"dias": dias, "total_sesiones": sum(len(d["sesiones"]) for d in dias),
            "minutos_por_asignatura": minutos_materia,
            "minutos_por_actividad": minutos_actividad, "vista_previa": True}

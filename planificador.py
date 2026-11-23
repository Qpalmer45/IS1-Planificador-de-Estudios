"""Generador semanal: primero objetivos y después distribución ponderada de huecos."""
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
                   hora_inicio="16:00", hora_fin="21:00", duracion=60, descanso=15, bloqueos=None):
    if isinstance(inicio, str):
        inicio = date.fromisoformat(inicio)
    if not isinstance(inicio, date):
        raise ValueError("Fecha inválida.")
    desde, hasta = minutos(hora_inicio), minutos(hora_fin)
    if type(duracion) is not int or type(descanso) is not int or not 25 <= duracion <= 180 or not 0 <= descanso <= 60 or desde >= hasta:
        raise ValueError("Franja, duración o descanso inválidos.")
    bloqueos = [] if bloqueos is None else bloqueos
    if not isinstance(bloqueos, list) or len(bloqueos) > 100:
        raise ValueError("Demasiados bloqueos.")
    fechas_semana = {(inicio + timedelta(days=i)).isoformat() for i in range(7)}
    normalizados = []
    for item in bloqueos:
        if not isinstance(item, dict) or item.get("fecha") not in fechas_semana:
            raise ValueError("Fecha del bloqueo fuera de la semana.")
        a, b = minutos(item.get("inicio", "")), minutos(item.get("fin", ""))
        motivo = item.get("motivo")
        if a >= b or not isinstance(motivo, str) or not motivo.strip() or len(motivo.strip()) > 120:
            raise ValueError("Bloqueo inválido: revisa horas y motivo.")
        normalizados.append({"fecha": item["fecha"], "inicio": formato(a), "fin": formato(b), "motivo": motivo.strip()})
    materias = sorted([dict(m) for m in asignaturas], key=lambda m: m["id"])
    ids = {m["id"] for m in materias}
    pendientes = []
    for act in actividades:
        try:
            fecha = date.fromisoformat(act["fecha_limite"])
        except (KeyError, TypeError, ValueError):
            continue
        if fecha < inicio:
            continue
        item = dict(act)
        item["_fecha"] = fecha
        item["_restante"] = max(0, int(item.get("minutos_estimados", 0)))
        # Los exámenes son hitos: nunca consumen horas adicionales a la materia.
        if item.get("tipo") == "examen":
            continue
        pendientes.append(item)
    pendientes.sort(key=lambda a: (a["_fecha"], a["id"]))
    usados_m = {m["id"]: 0 for m in materias}
    usados_a = {a["id"]: 0 for a in pendientes}
    sesiones_dia = []

    # Dos fases sobre las mismas franjas: primero cubrir objetivos explícitos;
    # solo después, repartir huecos sobrantes según prioridad y dificultad.
    for desplazamiento in range(7):
        actual = inicio + timedelta(days=desplazamiento)
        fecha = actual.isoformat()
        libre = any(p["fecha_inicio"] <= fecha <= p["fecha_fin"] for p in periodos)
        ocupados = sorted(
            [(minutos(c["hora_inicio"]), minutos(c["hora_fin"]))
             for c in clases if c["dia_semana"] == DIAS[actual.weekday()]]
            + [(minutos(b["inicio"]), minutos(b["fin"]))
               for b in normalizados if b["fecha"] == fecha]
        ) if not libre else []
        franjas = []
        cursor = desde
        if not libre:
            for a, b in ocupados + [(hasta, hasta)]:
                if b <= cursor:
                    continue
                if a > cursor:
                    franjas.append((cursor, min(a, hasta)))
                cursor = max(cursor, b)
                if cursor >= hasta:
                    break
        sesiones_dia.append({"fecha": fecha, "dia": DIAS[actual.weekday()],
                             "libre": libre, "sesiones": [],
                             "bloqueos": [dict(b) for b in normalizados if b["fecha"] == fecha],
                             "_franjas": franjas})

    def peso(m):
        return PESO.get(m.get("prioridad"), 2) * PESO.get(m.get("dificultad"), 2)

    # Primero objetivos semanales de asignaturas y actividades, con plazos.
    for fase in ("objetivos", "extras"):
        for dia in sesiones_dia:
            fecha = date.fromisoformat(dia["fecha"])
            nuevas = []
            for comienzo, final_franja in dia["_franjas"]:
                cursor = comienzo
                while cursor < final_franja:
                    candidatos = []
                    if fase == "objetivos":
                        for m in materias:
                            falta = max(0, int(m.get("minutos_semanales") or 0) - usados_m[m["id"]])
                            if falta:
                                examen = min((a for a in actividades if a.get("tipo") == "examen"
                                              and a.get("asignatura_id") == m["id"]
                                              and a.get("fecha_limite", "") >= dia["fecha"]),
                                             key=lambda a: a["fecha_limite"], default=None)
                                candidatos.append((0 if examen else 2, examen["fecha_limite"] if examen else "9999-12-31",
                                                   -peso(m), m["id"], "materia", m, falta, examen))
                        for a in pendientes:
                            if a["_fecha"] >= fecha:
                                limite = int(a.get("minutos_semanales") or 0)
                                falta = min(a["_restante"], max(0, limite - usados_a[a["id"]])) if limite else 0
                                if falta:
                                    candidatos.append((1, a["fecha_limite"], 0, a["id"], "actividad", a, falta, None))
                    else:
                        # Extras únicamente si no queda ningún objetivo explícito
                        # pendiente que pueda utilizar este hueco.
                        for m in materias:
                            candidatos.append((0, "9999-12-31", -peso(m), m["id"], "materia", m, duracion, None))
                        for a in pendientes:
                            if a["_fecha"] >= fecha and a["_restante"] > 0 and not a.get("minutos_semanales"):
                                candidatos.append((1, a["fecha_limite"], 0, a["id"], "actividad", a, a["_restante"], None))
                    capacidad = final_franja - cursor
                    candidatos = [c for c in candidatos if min(duracion, c[6]) <= capacidad]
                    if not candidatos:
                        break
                    # En fase de extras se escoge la materia menos favorecida
                    # respecto a su peso, no siempre la misma.
                    if fase == "extras":
                        candidatos.sort(key=lambda c: (
                            usados_m[c[5]["id"]] / peso(c[5]) if c[4] == "materia" else float("inf"),
                            c[2], c[3]))
                    else:
                        candidatos.sort(key=lambda c: c[:4])
                    _, _, _, _, tipo, objeto, restante, examen = candidatos[0]
                    bloque = min(duracion, restante, final_franja - cursor)
                    if bloque <= 0:
                        break
                    fin = cursor + bloque
                    if tipo == "materia":
                        materia = objeto
                        usados_m[materia["id"]] += bloque
                        actividad = examen["titulo"] if examen else None
                        tipo_actividad = "examen" if examen else None
                    else:
                        materia = next((m for m in materias if m["id"] == objeto.get("asignatura_id")), None)
                        objeto["_restante"] -= bloque
                        usados_a[objeto["id"]] += bloque
                        actividad, tipo_actividad = objeto["titulo"], objeto["tipo"]
                    nuevas.append({"fecha": dia["fecha"], "inicio": formato(cursor),
                                   "fin": formato(fin), "asignatura_id": materia["id"] if materia else None,
                                   "asignatura": materia["nombre"] if materia else "Actividad pendiente",
                                   "actividad": actividad, "tipo": tipo_actividad})
                    cursor = fin + descanso
            if fase == "objetivos":
                dia["sesiones"] = nuevas
                # En fase extras se recalculan los huecos después de reservar
                # sesiones de objetivos.
                franjas = []
                for a, b in dia["_franjas"]:
                    cursor = a
                    for ses in nuevas:
                        si, sf = minutos(ses["inicio"]), minutos(ses["fin"])
                        if si >= a and si < b:
                            if si > cursor:
                                franjas.append((cursor, si))
                            cursor = max(cursor, sf + descanso)
                    if cursor < b:
                        franjas.append((cursor, b))
                dia["_franjas"] = franjas
            else:
                dia["sesiones"].extend(nuevas)
                dia["sesiones"].sort(key=lambda s: s["inicio"])

    deficit = {m["id"]: max(0, int(m.get("minutos_semanales") or 0) - usados_m[m["id"]])
               for m in materias}
    deficit_actividades = {a["id"]: max(0, min(a["_restante"] + usados_a[a["id"]],
                            int(a.get("minutos_semanales") or 0)) - usados_a[a["id"]])
                          for a in pendientes if a.get("minutos_semanales")}
    for dia in sesiones_dia:
        dia.pop("_franjas")
    return {"dias": sesiones_dia,
            "total_sesiones": sum(len(d["sesiones"]) for d in sesiones_dia),
            "minutos_por_asignatura": usados_m,
            "minutos_por_actividad": usados_a,
            "deficit_minutos_por_asignatura": deficit,
            "deficit_minutos_por_actividad": deficit_actividades,
            "vista_previa": True}

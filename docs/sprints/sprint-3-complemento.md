# Sprint 3 — Planificación, seguimiento y documentación

> **Documento complementario preparado para incorporar a la Wiki.** No reemplaza ni presupone el contenido original de la página «Sprint 3», que no ha sido accesible para lectura o edición desde la conexión disponible. La planificación aquí es **propuesta**, pendiente de contraste con esa página y aprobación del equipo. Corte de documentación: **02/11/2026**.

## 1. Contexto y objetivo (Sprint Goal)

**Objetivo propuesto:** consolidar la gestión segura de la lista personal de To-Dos, comprobar mediante pruebas automatizadas la lógica del backend y mejorar la consulta de tareas con filtros y búsqueda. Mantener una base verificable para avanzar hacia el planificador de estudios.

Este objetivo se apoya en la funcionalidad de registro, inicio de sesión y lista de To-Dos presente en `app.py`. No implica que las nuevas funcionalidades o correcciones ya estén terminadas.

## 2. Sprint Planning

- **Producto:** Planificador de Estudios (Ingeniería del Software I, UCM).
- **Cadencia de referencia:** sprints semanales, según el README; fecha de inicio y fin efectivas del Sprint 3 **por confirmar con el equipo**.
- **Equipo:** el documentado en el README. Product Owner, Scrum Master, reparto de trabajo y asistencia a reuniones: **por confirmar; no se inventan actas**.
- **Tecnologías vigentes observadas en código:** Python, Flask y SQLite; HTML/CSS/JavaScript para la interfaz. El README conserva una propuesta anterior React/Node/TypeScript/PostgreSQL, por lo que debe actualizarse tras validación del equipo.
- **Rama de trabajo acordada:** `main`. No se crean ramas adicionales en esta propuesta.
- **Estimaciones:** orientativas, no aprobadas como compromiso por el equipo.

### 2.1 Sprint Backlog propuesto

| Referencia | Trabajo | Estimación | Estado verificable/documental |
|---|---|---:|---|
| [HU27 / #29](../issues/29) | Lista sencilla de To-Dos | — | Issue cerrado; hay implementación en `app.py`; no equivale a aceptación global |
| [#32](../issues/32) | Evitar que se editen To-Dos de otro usuario | Por estimar | Abierto |
| [#33](../issues/33) | Evitar que se eliminen To-Dos de otro usuario | Por estimar | Abierto |
| [#34](../issues/34) | Manejar con 404 la edición de un To-Do inexistente | Por estimar | Abierto |
| [#35](../issues/35) | Validar tipo booleano en campo `completada` | Por estimar | Abierto |
| [HU28 / #36](../issues/36) | Filtrar To-Dos por estado | 1 día orientativo | Nueva propuesta, abierta, no implementada |
| [HU29 / #37](../issues/37) | Buscar To-Dos por título | 1 día orientativo | Nueva propuesta, abierta, no implementada |
| [Pruebas de backend](../blob/main/tests/test_backend.py) | Batería de pruebas provisional | Por estimar | Código añadido; ejecución y validación pendientes |

**Nota:** los enlaces anteriores a issues son referencias internas orientativas para GitHub; al copiar esta página a la Wiki, utilizar enlaces absolutos si la vista no resuelve las rutas relativas.

### 2.2 Historias de usuario añadidas

**HU28 — Filtrar To-Dos por estado (#36)**

Como usuario, quiero filtrar mis To-Dos por todas, pendientes o completadas para identificar lo que debo hacer.

Criterios de aceptación: filtrado coherente, sin alterar tareas; aislamiento entre usuarios; lista vacía válida; pruebas de lógica del backend.

**HU29 — Buscar To-Dos por título (#37)**

Como usuario, quiero buscar tareas por una parte de su título para encontrar una tarea rápidamente.

Criterios de aceptación: coincidencia parcial sin distinguir mayúsculas/minúsculas; sin resultados se devuelve una lista vacía; respeta permisos de acceso; no modifica información; pruebas del backend.

Ambas historias amplían la HU27 sin duplicar la HU04 (tareas y entregas con fecha límite).

## 3. Evidencias técnicas disponibles

- `app.py`: registro, inicio/cierre de sesión, consulta de sesión y operaciones sobre To-Dos usando Flask y SQLite.
- `tests/test_backend.py`: batería provisional de **40 pruebas**, de las cuales **4 están marcadas como fallos esperados**; no consta una ejecución verificada en entorno de desarrollo.
- `tests/README.md`: instrucciones de ejecución y limitaciones.
- Issues [#32](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/32), [#33](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/33), [#34](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/34) y [#35](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/35): defectos identificados mediante análisis del código.

Comando para ejecutar las pruebas desde la raíz del repositorio:

```bash
pip install -r requirements.txt
python -m unittest discover -s tests -v
```

Las pruebas usan SQLite temporal, sin modificar la base de datos real. **No se declaran aprobadas hasta ejecutar y registrar el resultado.**

## 4. Plan de trabajo recomendado

1. Reproducir y ejecutar los tests, documentando resultados reales.
2. Corregir **#32** y **#33** (aislamiento de datos, prioridad alta).
3. Corregir **#34** y **#35** (validación y manejo de errores).
4. Retirar `@unittest.expectedFailure` de cada prueba solo cuando su requisito se cumpla.
5. Implementar HU28 y HU29 con separación entre lógica de backend y presentación.
6. Ampliar las pruebas para filtros, búsqueda y accesos entre usuarios.
7. Revisar cumplimiento de criterios de aceptación y decidir, en equipo, qué puede cerrarse.

## 5. Definition of Ready (DoR) propuesta

Una historia se considera preparada cuando: tiene descripción «Como..., quiero..., para...», valor y prioridad; criterios de aceptación verificables; dependencias identificadas; estimación acordada; y alcance suficientemente pequeño.

## 6. Definition of Done (DoD) propuesta

- Código integrado en la rama acordada y revisado por el equipo.
- Criterios de aceptación comprobados y registrados.
- Pruebas unitarias pertinentes ejecutadas sin errores inesperados; fallos esperados no cuentan como funcionalidad aceptada.
- Ausencia de acceso no autorizado a tareas ajenas.
- Documentación y issue actualizados con evidencia concreta.
- Demostración o revisión de la funcionalidad por el equipo.

## 7. Seguimiento, bloqueos y riesgos

| Riesgo o bloqueo | Impacto | Acción |
|---|---|---|
| Falta de controles de propiedad en edición/borrado | Alto: acceso indebido entre usuarios | Priorizar #32 y #33 |
| Manejo incorrecto de tareas inexistentes y estados inválidos | Medio: errores no controlados | Atender #34 y #35 |
| No se han ejecutado/verificado los tests aquí | Impide afirmar calidad o aceptación | Ejecutar y registrar resultados |
| Tecnología del README desactualizada respecto al código | Confusión documental | Acordar stack y actualizar README |
| Alcance y fechas originales del Sprint 3 no contrastados | Riesgo de documentación inconsistente | Revisar la página Wiki existente antes de fusionar este texto |

## 8. Daily Scrum / registro de seguimiento

**Pendiente de rellenar con reuniones reales.** Plantilla mínima para cada sesión: fecha; asistentes; trabajo terminado desde la reunión anterior; siguiente trabajo; bloqueos; cambios de alcance. No se incluyen reuniones ficticias.

## 9. Sprint Review (preparación, no acta celebrada)

**Elementos demostrables una vez verificados:** registro/login/logout; creación, listado, edición y borrado de To-Dos; resultados de pruebas; bloqueo de acceso ajeno; filtrado y búsqueda si se implementan.

**Pendiente:** fecha de review, asistentes, evidencias de demo, validación del Product Owner y elementos aceptados/rechazados. A 02/11/2026 **no se declara cerrado el Sprint 3**.

## 10. Sprint Retrospective (preparación, no acta celebrada)

Preguntas para el equipo: ¿qué funcionó en el flujo de trabajo?, ¿qué dificultó verificar el backend?, ¿cómo prevenir bugs de autorización?, ¿qué documentación conviene mantener junto al código? Registrar acuerdos, responsables y acciones únicamente después de la reunión.

## 11. Entregables y trazabilidad

- [Código del backend](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/main/app.py)
- [Pruebas del backend](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/main/tests/test_backend.py)
- [Documentación de pruebas](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/main/tests/README.md)
- [HU27 (#29)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/29)
- [HU28 (#36)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/36)
- [HU29 (#37)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/37)
- Correcciones pendientes: [#32](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/32), [#33](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/33), [#34](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/34), [#35](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/35).

## 12. Pendientes antes de dar por finalizada la documentación oficial

- Contrastar este complemento con el **Sprint 3 original de la Wiki** y conservar cualquier dato real que ya estuviera allí.
- Confirmar fechas, objetivo y contenido comprometido por el equipo.
- Registrar reuniones, responsables, estimaciones definitivas, resultados de tests, review, retrospective y aceptación real.
- Incorporar o enlazar este documento desde la Wiki cuando se disponga de edición de Wiki.

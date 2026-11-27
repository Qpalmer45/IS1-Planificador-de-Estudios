# Evaluación INVEST de las historias de usuario (HU01–HU29)

**Proyecto:** IS1 – Planificador de Estudios (UCM)  
**Fecha de revisión:** 6 de noviembre de 2026  
**Fuente:** issues del repositorio y apuntes de Scrum y estimación ágil de la asignatura.  
**Alcance:** calidad de redacción y refinamiento de historias, no ejecución de pruebas ni verificación de funcionalidades implementadas.

## 1. Criterios y significado

- **I – Independiente:** historia desplegable o desarrollable de forma incremental, con dependencias explícitas cuando existan.
- **N – Negociable:** la solución técnica y los detalles no esenciales pueden acordarse durante el refinamiento.
- **V – Valiosa:** el beneficio para el usuario queda explícito.
- **E – Estimable:** hay alcance suficiente para estimar el esfuerzo, reconociendo incertidumbres.
- **S – Small (pequeña):** se puede completar en un sprint; dividir cuando agrupe demasiado trabajo.
- **T – Testable:** los criterios de aceptación permiten diseñar verificaciones reproducibles.

**Convención:** ✅ evidencia suficiente en la redacción; △ cumplimiento condicionado a aclaración/refinamiento. Un criterio marcado △ **no debe presentarse como ya cumplido**. Todas las HU pueden refinarse hasta cumplir INVEST; ello no significa que ahora sean independientes ni que su código esté probado. El símbolo — indica que la historia está absorbida. Su alcance se evalúa en la historia que incorpora sus criterios de aceptación.

## 2. Revisión individual

| HU / issue | I | N | V | E | S | T | Observación y ajuste recomendado |
|---|---|---|---|---|---|---|---|
| [HU01 Asignaturas](../issues/1) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Añadir casos de nombre vacío/duplicado y reglas para borrar asignaturas con datos asociados. |
| [HU02 Disponibilidad](../issues/2) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Definir franjas inválidas, solapadas y límites horarios; separar introducción de franjas del consumo por el motor. |
| [HU03 Exámenes](../issues/3) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Definir rangos de importancia, fechas pasadas y pertenencia de la asignatura. |
| [HU04 Tareas y entregas](../issues/4) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Delimitar tareas con fecha límite frente a To-Dos simples (HU27); validar duración y fechas. |
| [HU05 Horario de clases](../issues/5) | △ | ✅ | ✅ | ✅ | ✅ | △ | Explicitar cómo se combina con HU02; test de conflicto entre clase y franja disponible. |
| [HU06 Generación automática](../issues/6) | △ | ✅ | ✅ | △ | △ | △ | Dependencias HU02–HU05 y criterios algorítmicos; dividir en versión mínima y mejoras, definir regla ante falta de horas y criterios deterministas. |
| [HU07 Calendario semanal](../issues/7) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Incluir hora de inicio y fin como criterios de aceptación (ver HU09), vistas vacías y orden cronológico. |
| [HU08 Priorización automática](../issues/8) | △ | ✅ | ✅ | △ | △ | △ | Se solapa con HU06: precisar regla de prioridad y ejemplos verificables; tratar como refinamiento del generador. |
| [HU09 Horas de las sesiones](../issues/9) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | Redundancia con HU07; preferible integrarla como criterio de aceptación de HU07 y conservar enlace histórico. |
| [HU10 Edición manual](../issues/10) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Definir rechazo o aviso ante solapamiento, límites de disponibilidad y persistencia. |
| [HU11 Descansos](../issues/11) | △ | ✅ | ✅ | ✅ | ✅ | △ | Distinguir configuración del descanso (HU11) del algoritmo que lo aplica (HU06); casos 0, máximo y falta de espacio. |
| [HU12 Dificultad/prioridad](../issues/12) | △ | ✅ | ✅ | ✅ | ✅ | △ | Distinguir dificultad de prioridad; definir escala y efecto esperado sin duplicar HU08. |
| [HU13 Horas por asignatura](../issues/13) | △ | ✅ | ✅ | ✅ | ✅ | △ | Distinguir guardar preferencias de aplicar el motor; aceptar 0 o prohibirlo explícitamente; sobreasignación. |
| [HU14 Sesiones completadas](../issues/14) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Definir transición de estados y persistencia, y efecto sobre estadísticas. |
| [HU15 Replanificación](../issues/15) | △ | ✅ | ✅ | △ | △ | △ | Depende de HU06 y HU14; definir horizonte, orden de asignación y comportamiento cuando no hay huecos. |
| [HU16 Perfil de aprendizaje](../issues/16) | △ | ✅ | ✅ | △ | △ | △ | Preferencias demasiado generales; delimitar campos, validación y relación con HU11 y HU06. |
| [HU17 Importación por imagen](../issues/17) | ✅ | ✅ | ✅ | △ | △ | △ | OCR/interpretación inciertos; separar carga, extracción propuesta, validación manual y guardado; test con imagen ilegible. |
| [HU18 Estadísticas](../issues/18) | △ | ✅ | ✅ | △ | △ | △ | Genérica y solapada con HU22, HU24 y HU25; diseñar un único dashboard y especificar indicadores. |
| [HU19 Recordatorios](../issues/19) | ✅ | ✅ | ✅ | △ | △ | △ | Definir canal, antelación, zona horaria, duplicados y permisos; quizá primera iteración solo recordatorios internos. |
| [HU20 Registro](../issues/20) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Precisar email duplicado/inválido, longitud de contraseña, almacenamiento seguro y respuestas de error. |
| [HU21 Inicio de sesión](../issues/22) | △ | ✅ | ✅ | ✅ | ✅ | △ | Depende de que exista cuenta (HU20); añadir cierre de sesión, sesión expirada y protección de datos privados. |
| [HU22 Horas semanales](../issues/23) | △ | ✅ | ✅ | ✅ | ✅ | △ | Métrica de HU18; precisar semana, sesiones computables, redondeo y períodos vacíos. |
| [HU23 Apartado por asignatura](../issues/24) | △ | ✅ | ✅ | ✅ | ✅ | △ | Depende de HU01; concretar contenidos y prueba de aislamiento entre asignaturas. |
| [HU24 Sesiones completadas/saltadas](../issues/25) | △ | ✅ | ✅ | ✅ | ✅ | △ | Métrica de HU18; definir «saltada», sesiones futuras y cambio de estado. |
| [HU25 Asignaturas estudiadas](../issues/26) | △ | ✅ | ✅ | ✅ | ✅ | △ | Métrica de HU18; añadir deduplicación, calendario semanal y sesiones eliminadas. |
| [HU26 Temario por asignatura](../issues/27) | △ | ✅ | ✅ | ✅ | ✅ | △ | Depende de HU01; definir progreso por tema y operaciones sobre asignatura eliminada. |
| [HU27 Lista de To-Dos](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/29) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Parcialmente implementada. Estimación total de 3 días. La gestión y el filtro por estado están implementados. Quedan pendientes la búsqueda por título y su verificación en combinación con el filtro. |
| [HU28 Filtrar To-Dos](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/36) | — | — | — | — | — | — | Absorbida por HU27. El filtro por estado está implementado. Sus criterios se recogen en HU27-CA04, CA07 y CA08. |
| [HU29 Buscar To-Dos](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/37) | — | — | — | — | — | — | Absorbida por HU27. La búsqueda por título y su combinación con el filtro siguen pendientes. Sus criterios se recogen en HU27-CA05 a CA08. |

### Justificación INVEST de HU27

- **I — Independiente:** La lista rápida es una funcionalidad propia. Su gestión, filtrado y búsqueda pueden entregarse juntos sin depender del calendario ni de las actividades académicas de HU04. La sesión iniciada permite acceder a los datos propios.
- **N — Negociable:** Los criterios fijan qué tareas aparecen al buscar o filtrar. El equipo puede decidir dónde colocar el campo de búsqueda y cómo obtener los resultados.
- **V — Valiosa:** El estudiante puede anotar tareas rápidas y encontrar una concreta por estado o por parte de su título.
- **E — Estimable:** El alcance identifica las operaciones de gestión, las opciones del filtro, la búsqueda parcial y los casos de comprobación. El conjunto se estima en 3 días.
- **S — Pequeña:** Las operaciones se concentran en una sola vista. Se considera que 3 días de trabajo caben en un sprint, con esa capacidad disponible en el equipo.
- **T — Comprobable:** CA01–CA08 permiten verificar la gestión básica, los filtros, las coincidencias parciales, la combinación, la lista vacía y el aislamiento por cuenta. Si hay dos tareas con «Examen» en el título y solo una está pendiente, buscar `exam` con el filtro **Pendientes** debe devolver únicamente esa tarea.



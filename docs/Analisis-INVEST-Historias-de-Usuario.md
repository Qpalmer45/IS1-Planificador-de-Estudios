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

**Convención:** ✅ evidencia suficiente en la redacción; △ cumplimiento condicionado a aclaración/refinamiento. Un criterio marcado △ **no debe presentarse como ya cumplido**. Todas las HU pueden refinarse hasta cumplir INVEST; ello no significa que ahora sean independientes ni que su código esté probado.

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
| [HU27 Lista de To-Dos](../issues/29) | ✅ | ✅ | ✅ | ✅ | △ | △ | Contiene alta/edición/borrado/estado en una HU; cabe solo si el equipo confirma esfuerzo; añadir aislamiento por usuario y errores, distinto de HU04. |
| [HU28 Filtrar To-Dos](../issues/36) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | Requiere HU27 y autenticación; criterios adecuados, fijar si filtra backend o frontend. Propuesta, no implementada. |
| [HU29 Buscar To-Dos](../issues/37) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | Requiere HU27 y autenticación; criterios adecuados, definir coincidencia parcial y espacios. Propuesta, no implementada. |

## 3. Hallazgos transversales y acciones

1. **Dependencias y solapamientos:** identificar HU06 como motor y HU02/HU05/HU08/HU11/HU12/HU13 como fuentes de configuración o reglas; evitar dependencias circulares. HU07 absorbe preferiblemente HU09. HU18 puede actuar como historia contenedora del dashboard y HU22/HU24/HU25 como subhistorias o indicadores. Documentar claramente que HU04 es gestión de entregas con fechas y HU27 es una lista rápida.
2. **Criterios verificables:** añadir para cada HU casos válidos, inválidos, vacíos, límites y permisos de acceso cuando aplique. Evitar «correctamente», «próximos» o «importante» sin umbral observable.
3. **Estimación:** los issues incluyen estimaciones iniciales en días, pero las notas de estimación ágil explican puntos de historia relativos y Planning Poker. Reestimar en equipo y registrar incertidumbre; no confundir estimación con duración garantizada.
4. **Pruebas:** distinguir aceptación funcional/caja negra de pruebas unitarias del backend. En HU20/HU21/HU27–HU29 revisar aislamiento de usuarios; no declarar ejecución exitosa sin resultados.
5. **Trazabilidad y Scrum:** enlazar HU ↔ criterios ↔ tareas/PR ↔ pruebas ↔ defectos; mantener estados reales, Sprint Goal y Definition of Done. La existencia de criterios de aceptación no demuestra la entrega de un incremento.
6. **Refinamiento propuesto, no cambio aplicado:** conservar las historias originales hasta la decisión del equipo; este documento no cierra issues ni modifica el alcance aprobado.

## 4. Conclusión de conformidad

**Conclusión responsable:** las **29 historias son susceptibles de cumplir INVEST tras el refinamiento descrito**, y todas expresan valor para el usuario y un enunciado negociable. No es verificable afirmar que **todas cumplen ya los seis criterios**: hay dependencias, redundancias, incertidumbres de tamaño y criterios de aceptación ambiguos. La tabla registra estas reservas de forma explícita y accionable.

**Diferencia crucial:** *INVEST evalúa la calidad de las historias de usuario*, no el resultado de las pruebas del código. Ninguna marca de esta tabla debe interpretarse como «test pasado».

## 5. Referencias de la asignatura

- **03b-Scrum.pdf** y **wuolah-free-T2-Scrum.pdf**: Product Backlog, refinamiento, criterios de incremento, transparencia, inspección y adaptación.
- **02c-Técnicas de estimación en modelos ágiles.pdf**: puntos de historia, estimación relativa, Planning Poker, priorización y MVP.
- **03-Pruebas orientadas a objetos.pdf**: pruebas de unidad, integración, sistema y validación; caja blanca y caja negra.
- **05-GarantiaCalidadSoftware.pdf**: revisiones, prevención de defectos, documentación de desviaciones y SQA.
- Registro complementario: [issue #31: contradicciones y solapamientos](../issues/31).

> Documento de análisis de requisitos y calidad del backlog, no acta de aceptación ni certificado de pruebas.

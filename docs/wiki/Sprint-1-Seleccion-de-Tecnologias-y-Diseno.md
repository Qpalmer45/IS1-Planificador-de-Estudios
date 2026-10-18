# Sprint 1 — Selección de tecnologías y diseño inicial

> Documento preparado para trasladar a la Wiki de GitHub. Número del sprint: **1**. Fechas: pendientes de confirmar.

## Objetivo del sprint
Seleccionar la pila tecnológica de la aplicación y diseñar las funcionalidades de registro, inicio de sesión y lista de To-Dos. El objetivo es obtener decisiones técnicas y diseños revisables, sin presuponer que se hayan implementado.

## Alcance
- Comparar y elegir tecnologías de frontend, backend y base de datos.
- Diseñar el registro de usuarios.
- Diseñar el inicio de sesión.
- Diseñar una lista de To-Dos convencional.
- Registrar acuerdos, riesgos y tareas pendientes.

## Historias de usuario relacionadas
- HU20 — Registro (Issue #20).
- HU21 — Inicio de sesión (Issue #22).
- HU28 — Lista de To-Dos (Issue #29).
Revisar posibles solapamientos con HU27 — Lista de tareas (Issue #28) y aclarar si es la misma funcionalidad.

## Alternativas tecnológicas
| Área | Alternativas | Criterios |
|---|---|---|
| Frontend | **HTML + CSS + JavaScript (elección definitiva del equipo)**. HTML define la estructura, CSS los estilos y JavaScript la interacción. React + TypeScript se valoró como alternativa. | Facilidad de aprendizaje, componentes, mantenimiento |
| Backend | **Python + Django (elección definitiva del equipo)**. Alternativas valoradas: Python + FastAPI, Java + Spring Boot, TypeScript + Express, C++ + Drogon | Familiaridad del equipo, tiempo, ecosistema, seguridad |
| Base de datos | PostgreSQL; MySQL; SQLite; MongoDB | Modelo de datos, facilidad de despliegue, consultas |
| Control de versiones | Git y GitHub | Historial y colaboración |
| Gestión Scrum | GitHub Issues y Projects | Trazabilidad y seguimiento |

**Decisiones confirmadas por el equipo:** backend en **Python + Django** y frontend en **HTML + CSS + JavaScript** (sin framework frontend). **Propuesta pendiente de aprobación:** PostgreSQL como base de datos.

## Diseño: registro
**Objetivo:** permitir crear una cuenta.
- Pantalla prevista: nombre (si se necesita), correo electrónico, contraseña, confirmación de contraseña y botón de registro.
- Validaciones previstas: campos obligatorios, correo válido, contraseñas coincidentes, correo no duplicado.
- Resultado esperado: cuenta creada o mensaje de error comprensible.
- Seguridad a concretar: hash seguro de contraseñas, protección de datos, manejo de errores.
**Pendiente:** wireframe aprobado, modelo de datos y decisiones de autenticación.

## Diseño: inicio de sesión
**Objetivo:** permitir al usuario acceder a su cuenta y planificación.
- Pantalla prevista: correo, contraseña, botón de acceso y enlace al registro.
- Flujo: introducir credenciales → validar → acceder a la aplicación o mostrar error.
- Considerar cierre de sesión, sesiones seguras y mensajes que no revelen información sensible.
**Pendiente:** wireframe aprobado, mecanismo de sesión/token y criterios de seguridad.

## Diseño: lista de To-Dos
**Objetivo:** gestionar una lista sencilla de pendientes, separada de la planificación automática si así lo decide el equipo.
- Vista prevista: campo para nueva tarea, listado de pendientes y completadas.
- Acciones: crear, editar, marcar/desmarcar como completada y eliminar.
- Modelo conceptual mínimo: identificador, texto, estado, usuario propietario (si se asocia a cuenta).
- Estados: pendiente y completada.
**Pendiente:** wireframe aprobado y decisión sobre persistencia.

## Scrum — evidencias del sprint
### Sprint Planning
- Sprint Goal: seleccionar tecnologías y diseñar registro, login y To-Dos.
- Sprint Backlog: enlazar las Issues y las tareas de investigación/diseño efectivamente asumidas.
- Capacidad y responsables: pendientes de registrar.

### Seguimiento / Daily Scrum
Registrar para cada reunión fecha, progreso hacia el Sprint Goal, impedimentos y próximos pasos. No inventar reuniones que no se celebraron.

### Sprint Review
Mostrar comparación de tecnologías, decisión aprobada (si existe) y diseños/wireframes de las tres funcionalidades. Recoger feedback y cambios del Product Backlog.

### Sprint Retrospective
Registrar qué funcionó, qué no funcionó y 1–3 acciones de mejora con responsables. Completar después de celebrarla.

## Definition of Done del sprint (propuesta)
- Python + Django elegidos como backend y HTML + CSS + JavaScript como frontend; base de datos comparada y aprobada antes de marcarla como definitiva.
- Diseños de registro, inicio de sesión y To-Dos accesibles y revisados por el equipo.
- Historias y criterios de aceptación coherentes y sin duplicados.
- Sprint Review y Retrospective documentadas.
- No se afirma que exista implementación si no se ha verificado.

## Documentación complementaria pendiente
1. Acta de Sprint Planning: fecha, participantes, Sprint Goal, capacidad y Sprint Backlog.
2. Registro de decisión de arquitectura (ADR): alternativas, criterios, decisión y razones.
3. Wireframes de registro, inicio de sesión y To-Dos, con enlaces a archivos.
4. Flujos de usuario y validaciones de los tres diseños.
5. Modelo de datos inicial y contratos API preliminares, solo si se han diseñado.
6. Sprint Review: entregables mostrados, feedback y ajustes.
7. Retrospectiva: mejoras acordadas y responsables.
8. Riesgos, dudas abiertas y próximos pasos.

## Estado y siguiente sprint
**Documentado:** objetivo, alcance y propuestas de diseño y tecnologías.
**Por verificar:** decisiones finales del equipo, diseños reales, fechas, responsables, reuniones y evidencias.
**Siguiente paso propuesto:** aprobar decisiones y diseños antes de implementar.

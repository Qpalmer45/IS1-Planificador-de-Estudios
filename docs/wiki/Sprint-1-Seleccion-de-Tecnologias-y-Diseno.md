# Sprint 1 — Selección de tecnologías y diseño inicial

> Documento preparado para trasladar a la Wiki de GitHub. Número del sprint: **1**. Fechas: pendientes de confirmar.

## Objetivo del sprint
Seleccionar la pila tecnológica de la aplicación y diseñar las funcionalidades de registro, inicio de sesión y lista de To-Dos. El objetivo es obtener decisiones técnicas y diseños revisables, sin presuponer que se hayan implementado.

## Alcance
- Seleccionar tecnologías básicas para una aplicación web y dejar documentadas las decisiones pendientes.
- Diseñar el registro de usuarios.
- Diseñar el inicio de sesión.
- Diseñar una lista de To-Dos convencional.
- Registrar acuerdos, riesgos y tareas pendientes.

## Historias de usuario relacionadas
- HU20 — Registro (Issue #20).
- HU21 — Inicio de sesión (Issue #22).
- HU28 — Lista de To-Dos (Issue #29).
Revisar posibles solapamientos con HU27 — Lista de tareas (Issue #28) y aclarar si es la misma funcionalidad.

## Tecnologías elegidas por el equipo
La aplicación será **web**. Por decisión actual del equipo, se utilizarán **Python, HTML, CSS y JavaScript**, y **SQLite** como base de datos. No se ha elegido todavía framework de servidor ni otras dependencias.

| Tecnología | Función en el planificador |
|---|---|
| Python | Lógica de negocio, tareas, asignaturas y algoritmo de planificación |
| HTML | Estructura de las pantallas y formularios |
| CSS | Estilos y presentación visual |
| JavaScript | Interacciones de usuario y comunicación con el servidor cuando se implemente |
| SQLite | Almacenamiento persistente de usuarios, asignaturas, exámenes, tareas y horarios; Python puede acceder mediante el módulo estándar sqlite3 |

### Decisiones y alternativas descartadas o aplazadas
- **Python en lugar de Java:** decisión actual del equipo para simplificar el conjunto de tecnologías y programar la lógica en Python.
- **HTML, CSS y JavaScript sin React:** permite empezar con tecnologías web básicas sin un framework adicional.
- **Django, Spring Boot y Spring Web:** no se utilizarán por ahora. Los dos últimos corresponden al ecosistema Java; Django es una posible alternativa Python, pero no está elegido.
- **SQLite frente a PostgreSQL y MySQL:** SQLite se elige para simplificar el prototipo universitario, sin configurar un servidor de base de datos. PostgreSQL o MySQL pueden ser mejores si aumenta la concurrencia y el despliegue multiusuario; la migración podría valorarse más adelante.
- **Maven, Spring Security, JUnit y Spring Data JPA:** fuera del conjunto actual de tecnologías.

### Aspectos técnicos pendientes
Para que una interfaz en el navegador envíe datos a Python, habrá que preparar un **servidor HTTP** y definir rutas para recibir peticiones y devolver respuestas. Puede desarrollarse con herramientas de la biblioteca estándar de Python o decidirse un framework más adelante. No afirmar que la comunicación ni la persistencia estén implementadas. Quedan pendientes el diseño del esquema y la ubicación/persistencia del archivo SQLite en el servidor, la autenticación segura, el despliegue y las pruebas. En una aplicación web el archivo SQLite debe estar en el servidor, no en el navegador del usuario.

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
**Pendiente:** wireframe aprobado, mecanismo de autenticación y sesión web y criterios de seguridad.

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
- Python y HTML + CSS + JavaScript elegidos; conexión HTTP, esquema SQLite y autenticación pendientes de definir.
- Diseños de registro, inicio de sesión y To-Dos accesibles y revisados por el equipo.
- Historias y criterios de aceptación coherentes y sin duplicados.
- Sprint Review y Retrospective documentadas.
- No se afirma que exista implementación si no se ha verificado.

## Documentación complementaria pendiente
1. Acta de Sprint Planning: fecha, participantes, Sprint Goal, capacidad y Sprint Backlog.
2. Registro de decisión de arquitectura (ADR): alternativas, criterios, decisión y razones.
3. Wireframes de registro, inicio de sesión y To-Dos, con enlaces a archivos.
4. Flujos de usuario y validaciones de los tres diseños.
5. Modelo de datos inicial y rutas HTTP y modelo de datos preliminares, solo si se han diseñado.
6. Sprint Review: entregables mostrados, feedback y ajustes.
7. Retrospectiva: mejoras acordadas y responsables.
8. Riesgos, dudas abiertas y próximos pasos.

## Estado y siguiente sprint
**Documentado:** objetivo, alcance y propuestas de diseño y tecnologías.
**Por verificar:** decisiones finales del equipo, diseños reales, fechas, responsables, reuniones y evidencias.
**Siguiente paso propuesto:** aprobar decisiones y diseños antes de implementar.

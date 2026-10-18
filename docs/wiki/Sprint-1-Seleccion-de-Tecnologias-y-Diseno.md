# Sprint 1 — Selección de tecnologías y diseño inicial

> Documento preparado para trasladar a la Wiki de GitHub. Número del sprint: **1**. Fechas: pendientes de confirmar.

## Objetivo del sprint
Seleccionar la pila tecnológica de la aplicación y diseñar las funcionalidades de registro, inicio de sesión y lista de To-Dos. El objetivo es obtener decisiones técnicas y diseños revisables, sin presuponer que se hayan implementado.

## Alcance
- Comparar y elegir tecnologías de interfaz, lógica y almacenamiento para escritorio.
- Diseñar el registro de usuarios.
- Diseñar el inicio de sesión.
- Diseñar una lista de To-Dos convencional.
- Registrar acuerdos, riesgos y tareas pendientes.

## Historias de usuario relacionadas
- HU20 — Registro (Issue #20).
- HU21 — Inicio de sesión (Issue #22).
- HU28 — Lista de To-Dos (Issue #29).
Revisar posibles solapamientos con HU27 — Lista de tareas (Issue #28) y aclarar si es la misma funcionalidad.

## Tecnologías para la aplicación de escritorio (decisión actual)
El equipo ha elegido **Java** como lenguaje principal y **HTML, CSS y JavaScript** para la interfaz de escritorio. Se recomienda **JavaFX + WebView** para mostrar la interfaz web dentro de una ventana nativa, y **SQLite + JDBC** para almacenamiento local. JavaFX, WebView y SQLite son propuestas técnicas pendientes de una prueba de concepto.

| Tecnología | Uso en IS1 | Justificación |
|---|---|---|
| Java | Algoritmo de planificación, tareas, usuarios y reglas de negocio | Lenguaje elegido por el equipo; orientación a objetos y ecosistema sólido |
| HTML | Estructura de pantallas y formularios | Sencillo para organizar la interfaz |
| CSS | Estilos visuales | Separa diseño y estructura |
| JavaScript | Eventos y actualización de la interfaz | Permite interacción sin rehacer la ventana |
| JavaFX | Ventanas y ciclo de vida de la aplicación de escritorio | Integra código Java y componentes gráficos |
| WebView / WebEngine | Renderizar HTML, CSS y JavaScript en JavaFX | Reutiliza tecnologías web sin servidor web |
| Puente Java-JavaScript | Conectar acciones de la interfaz con métodos Java | Ejecuta la lógica Java desde controles HTML |
| SQLite | Base de datos local | No necesita servidor de base de datos |
| JDBC y driver SQLite | Acceso a datos desde Java | API estándar y sencilla para consultas |
| Maven | Dependencias y construcción | Reproducibilidad del proyecto |
| JUnit 5 | Pruebas unitarias | Validar lógica y evitar regresiones |
| jpackage | Empaquetado para Windows | Preparar una aplicación instalable |
| Git y GitHub | Versionado y colaboración | Historial compartido |
| GitHub Issues y Projects | Organización Scrum | Historias y seguimiento |

### Alternativas valoradas
- Java frente a Python: el equipo prefiere Java; Python habría permitido prototipos rápidos.
- JavaFX + WebView frente a Electron: integración directa con la lógica Java frente a una plataforma basada en JavaScript/Node.js.
- HTML/CSS/JavaScript frente a controles JavaFX nativos: interfaz web flexible, a costa de mantener un puente Java-JavaScript.
- WebView frente a Swing/JEditorPane: soporte más adecuado para HTML y JavaScript, aunque el motor web puede tener limitaciones de compatibilidad.
- SQLite frente a PostgreSQL/MySQL: más simple para una aplicación local; no ofrece por sí sola sincronización entre ordenadores.
- JDBC frente a Hibernate: menos capas para un modelo de datos inicial pequeño.
- Maven frente a Gradle: ambos sirven; Maven se propone por sencillez de configuración.
- JUnit frente a pruebas solo manuales: automatiza la verificación.
- jpackage frente a entregar un archivo JAR: facilita distribución a usuarios finales.

**Cambio de arquitectura:** Python + Django dejan de ser la elección del proyecto. Django sirve para aplicaciones web con servidor y no es necesario en esta arquitectura local. HTML/CSS/JavaScript siguen siendo la interfaz, pero dentro de JavaFX WebView.

**Pendiente de validar:** ventana JavaFX que cargue HTML local, comunicación JavaScript-Java, persistencia SQLite, compatibilidad del motor WebView y empaquetado. No consta implementación de estas pruebas.

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
**Pendiente:** wireframe aprobado, mecanismo de autenticación local y criterios de seguridad.

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
- Java y HTML + CSS + JavaScript elegidos; JavaFX/WebView y SQLite sujetos a validación técnica.
- Diseños de registro, inicio de sesión y To-Dos accesibles y revisados por el equipo.
- Historias y criterios de aceptación coherentes y sin duplicados.
- Sprint Review y Retrospective documentadas.
- No se afirma que exista implementación si no se ha verificado.

## Documentación complementaria pendiente
1. Acta de Sprint Planning: fecha, participantes, Sprint Goal, capacidad y Sprint Backlog.
2. Registro de decisión de arquitectura (ADR): alternativas, criterios, decisión y razones.
3. Wireframes de registro, inicio de sesión y To-Dos, con enlaces a archivos.
4. Flujos de usuario y validaciones de los tres diseños.
5. Modelo de datos inicial y interfaces Java-JavaScript preliminares, solo si se han diseñado.
6. Sprint Review: entregables mostrados, feedback y ajustes.
7. Retrospectiva: mejoras acordadas y responsables.
8. Riesgos, dudas abiertas y próximos pasos.

## Estado y siguiente sprint
**Documentado:** objetivo, alcance y propuestas de diseño y tecnologías.
**Por verificar:** decisiones finales del equipo, diseños reales, fechas, responsables, reuniones y evidencias.
**Siguiente paso propuesto:** aprobar decisiones y diseños antes de implementar.

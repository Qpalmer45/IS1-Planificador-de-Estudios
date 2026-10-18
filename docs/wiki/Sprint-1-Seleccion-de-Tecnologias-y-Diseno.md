# Sprint 1 — Selección de tecnologías y diseño inicial

> Documento preparado para trasladar a la Wiki de GitHub. Número del sprint: **1**. Fechas: pendientes de confirmar.

## Objetivo del sprint
Seleccionar la pila tecnológica de la aplicación y diseñar las funcionalidades de registro, inicio de sesión y lista de To-Dos. El objetivo es obtener decisiones técnicas y diseños revisables, sin presuponer que se hayan implementado.

## Alcance
- Comparar y elegir tecnologías de interfaz, backend y almacenamiento para aplicación web.
- Diseñar el registro de usuarios.
- Diseñar el inicio de sesión.
- Diseñar una lista de To-Dos convencional.
- Registrar acuerdos, riesgos y tareas pendientes.

## Historias de usuario relacionadas
- HU20 — Registro (Issue #20).
- HU21 — Inicio de sesión (Issue #22).
- HU28 — Lista de To-Dos (Issue #29).
Revisar posibles solapamientos con HU27 — Lista de tareas (Issue #28) y aclarar si es la misma funcionalidad.

## Arquitectura actual: aplicación web con Java
**Decisión del equipo:** aplicación web, Java como lenguaje de backend, HTML + CSS + JavaScript como interfaz. **Recomendaciones técnicas para validar:** Spring Boot, Spring Web, Spring Security, Spring Data JPA, PostgreSQL, Maven y JUnit 5. No se afirma que estén implementadas.

| Tecnología | Función | Motivo principal |
|---|---|---|
| Java | Algoritmo de planificación y reglas de negocio | Lenguaje elegido por el equipo, orientado a objetos |
| Spring Boot | Arranque y configuración del servidor web Java | Reduce configuración frente a Spring manual o servlets |
| Spring Web | Rutas y peticiones HTTP | Conecta navegador y código Java |
| HTML | Estructura de páginas y formularios | Estándar web sencillo |
| CSS | Diseño visual | Separa estilos de contenido |
| JavaScript | Interacciones y peticiones fetch | Interfaz dinámica sin framework adicional |
| PostgreSQL | Persistencia central de usuarios, tareas y horarios | Base de datos relacional robusta y multiusuario |
| Spring Data JPA | Acceso a datos mediante entidades y repositorios | Menos SQL repetitivo que JDBC manual |
| Spring Security | Autenticación, sesiones y autorización | Evita implementar mecanismos sensibles desde cero |
| Maven | Compilación y dependencias | Construcción reproducible |
| JUnit 5 | Pruebas unitarias | Validar reglas y algoritmo |
| Git y GitHub | Versionado y colaboración | Trabajo en equipo |
| GitHub Issues y Projects | Gestión Scrum | Trazabilidad del sprint |

### Por qué estas tecnologías y no otras
- **Java frente a Python:** Java es una elección válida para el proyecto y la preferida por el equipo; Python + Django también sería adecuado y podría resultar más rápido al principio. No es necesario cambiar a Python.
- **Spring Boot frente a Django:** Django exige usar Python; Spring Boot permite conservar Java y aporta herramientas para servidor y backend.
- **Spring Boot frente a servlets Java manuales:** automatiza configuración, servidor embebido y gestión de dependencias.
- **HTML/CSS/JavaScript sin React:** menor curva de aprendizaje y suficiente para las pantallas iniciales; React puede valorarse si la interfaz crece.
- **PostgreSQL frente a SQLite:** mejor opción propuesta para cuentas y datos centralizados entre usuarios; SQLite sería más sencillo para prototipo local.
- **PostgreSQL frente a MySQL:** ambos son válidos; PostgreSQL se propone por su ecosistema y soporte de relaciones y consultas.
- **Spring Data JPA frente a JDBC:** reduce código repetitivo, aunque introduce conceptos ORM.
- **Spring Security frente a autenticación casera:** proporciona componentes establecidos para contraseñas, sesiones y permisos; requiere configuración correcta.
- **Maven frente a Gradle:** ambos sirven; Maven es una opción declarativa y habitual en Java.
- **JUnit 5 frente a solo pruebas manuales:** permite comprobar el algoritmo de forma repetible.

**Arquitectura:** navegador (HTML/CSS/JS) → peticiones HTTP → servidor Java con Spring Boot → lógica de planificación y PostgreSQL. JavaFX y WebView se descartan porque corresponden a la propuesta anterior de escritorio. Django se descarta porque el equipo prefiere Java.

**Pendiente:** prueba de concepto de formulario HTML/JavaScript que envía una petición a Spring Boot y guarda un registro en PostgreSQL; decidir despliegue, configuración de seguridad y modelo de datos. No consta implementación.

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
- Java y HTML + CSS + JavaScript elegidos; Spring Boot y PostgreSQL sujetos a validación técnica.
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

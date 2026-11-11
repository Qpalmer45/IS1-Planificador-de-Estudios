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
La aplicación será **web**. Por decisión actual del equipo, se utilizarán **Python, HTML, CSS y JavaScript**, y **SQLite** como base de datos. Se elige **Flask** como framework ligero de servidor Python. No se han elegido otras dependencias adicionales.

| Tecnología | Función en el planificador |
|---|---|
| Python | Lógica de negocio, tareas, asignaturas y algoritmo de planificación |
| Flask | Servidor web Python: define rutas HTTP y recibe/responde a las peticiones de JavaScript |
| HTML | Estructura de las pantallas y formularios |
| CSS | Estilos y presentación visual |
| JavaScript | Interacciones de usuario y comunicación con el servidor cuando se implemente |
| SQLite | Almacenamiento persistente de usuarios, asignaturas, exámenes, tareas y horarios; Python puede acceder mediante el módulo estándar sqlite3 |



### Aspectos técnicos pendientes
La comunicación entre JavaScript y Python se implementará mediante **fetch y peticiones HTTP con JSON**, aun tenemos que averiguar bien como funciona.



## Scrum — evidencias del sprint
### Sprint Planning
- Sprint Goal: seleccionar tecnologías y diseñar registro, login y To-Dos.
- Sprint Backlog: enlazar las Issues y las tareas de investigación/diseño efectivamente asumidas.


### Sprint Review
Mostrar comparación de tecnologías, decisión aprobada (si existe) y diseños/wireframes de las tres funcionalidades. Recoger feedback y cambios del Product Backlog.

### Sprint Retrospective
Registrar qué funcionó, qué no funcionó y 1–3 acciones de mejora con responsables. Completar después de celebrarla.


## Estado y siguiente sprint
**Documentado:** objetivo, alcance y propuestas de diseño y tecnologías.
**Por verificar:** decisiones finales del equipo, diseños reales, fechas, responsables, reuniones y evidencias.
**Siguiente paso propuesto:** aprobar decisiones y diseños antes de implementar.

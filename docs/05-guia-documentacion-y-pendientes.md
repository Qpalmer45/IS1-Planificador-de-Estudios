# Guía ordenada de documentación y siguientes pasos

## Estado anterior comprobado

A 18/10/2026, antes de esta implementación, la rama main contenía README.md y LICENSE (MIT). El README documentaba descripción, objetivos, tecnologías propuestas, equipo, sprints de una semana y flujo del tablero. Seguía describiendo el backlog inicial de 20 historias.

Se comprobaron 29 issues: 27 abiertos y 2 cerrados (#21 y #28). #21 se solapa con inicio de sesión y #28 con lista de tareas; sus estados cerrados no prueban implementación. Las historias activas de este trabajo son #20, #22 y #29. No había pull requests en la consulta realizada. La implementación anterior de la aplicación no estaba en main.

En conversaciones anteriores se organizó un tablero de GitHub Projects; su configuración actual no se ha inspeccionado en esta sesión. No se confirma que exista una wiki publicada ni se inventa contenido de ella. La planificación anterior puede documentarse como preparación del producto; no debe presentarse como un incremento de software si no lo hubo.

## Dónde escribir

Usad `docs/` en el repositorio como documentación técnica y Scrum versionada. El README actúa como índice; GitHub Issues y Projects contienen el trabajo y su estado. No necesitáis copiar toda la información en una wiki y mantener dos versiones.

Para editar desde GitHub:

1. Abrir el repositorio y entrar en la rama de esta PR o crear una rama nueva desde main tras integrarla.
2. Abrir `docs/` y el documento correspondiente; pulsar el lápiz.
3. Sustituir campos «Pendiente» por datos reales, sin borrar las evidencias existentes.
4. Pulsar «Commit changes» con un mensaje descriptivo.
5. Si es una rama nueva, abrir Pull request, pedir revisión y fusionar después de comprobar cambios.

Para un documento nuevo: `Add file → Create new file`, escribir por ejemplo `docs/sprints/sprint-03.md`, completar su contenido y seguir el mismo flujo.

## Orden recomendado para completar lo pendiente

### 1. Revisar y ejecutar esta implementación

Dónde: pull request, README y `04-pruebas.md`.

- Un compañero descarga la rama e instala siguiendo el README.
- Ejecuta la demo y las pruebas; anota sistema, fecha, comando y resultado real.
- Comprueba los checks de GitHub Actions con PostgreSQL.
- Deja su revisión en la PR; corregid cualquier fallo antes de integrar.
- En el tablero, estas historias pueden pasar a In Review; no a Completed mientras falten condiciones de la DoD.

### 2. Confirmar la elección de tecnologías

Dónde: `01-tecnologias-y-arquitectura.md`.

- Leer la tabla y comprobar que todos pueden ejecutar el proyecto.
- Acordar la elección con el equipo; anotar fecha, participantes y motivo.
- Cambiar el estado del ADR de «pendiente de revisión» a «aceptada» solo cuando ocurra.
- Si el profesor impone otra tecnología, registrar esa restricción y el cambio necesario.

### 3. Completar la ficha del sprint actual

Dónde: `02-sprint-actual.md` y GitHub Projects.

- Escribir número real, inicio y fin del sprint.
- Mantener el objetivo confirmado: cuentas + tareas personales + tecnología.
- Enlazar #20, #22 y #29 y la PR; asignar responsables con el equipo, sin atribuir automáticamente todo a una persona.
- Desglosar, si hace falta, formulario, API, persistencia, pruebas y revisión como tareas; no duplicar las historias.
- Reestimar según el trabajo restante. No registrar estimaciones como horas efectivamente trabajadas.

### 4. Acordar roles y Definition of Done

Dónde: README (equipo/roles) y `03-definition-of-done.md`.

- Elegir un Product Owner responsable del orden del backlog.
- Identificar Scrum Master y Developers; pueden compatibilizar responsabilidades según el equipo.
- Acordar la DoD y anotar fecha. No he asignado estos roles a compañeros sin vuestra decisión.
- Revisar requisitos específicos de la asignatura. Si exige una memoria o actas concretas, añadirlas a esta guía.

### 5. Actualizar el Product Backlog

Dónde: Issues y Projects; `06-backlog.md` sirve de inventario de referencia.

- Corregir la descripción antigua de «20 HU iniciales» sin borrar el historial.
- Ordenar por valor, dependencias y capacidad, con el Product Owner.
- Revisar posibles solapamientos: HU18 con las estadísticas desglosadas; HU04 y HU28 tienen alcances diferentes.
- HU04 incorpora entregas académicas, plazo y duración para planificar; HU28 son To-Dos simples.
- Afinar criterios de aceptación antes de seleccionar nuevas historias.
- No crear otro issue de registro/acceso/tareas: usar los existentes.

### 6. Completar pruebas y evidencia

Dónde: `04-pruebas.md`, comentarios de PR y resultados de Actions.

- Registrar la demo: cuenta A, tarea A, recarga y cuenta B sin tarea A.
- Guardar capturas relevantes en un comentario de la PR o en `docs/evidencias/`, sin contraseñas ni datos reales innecesarios.
- Anotar comando y resultado, incluyendo fallos pendientes. No marcar como ejecutado lo que solo se ha escrito.

### 7. Integrar y actualizar estado

Dónde: PR, issues y tablero.

- Con checks correctos, revisión y DoD cumplida, fusionar a main.
- La descripción de PR enlaza y cierra #20, #22 y #29 al fusionarse.
- Comprobar manualmente que el tablero refleja Completed; el cierre de issue y el campo Status de Projects pueden no sincronizarse.
- Si algo no está terminado, mantenerlo abierto y devolver trabajo pendiente al backlog al acabar el sprint.

### 8. Celebrar y documentar la Sprint Review

Dónde: apartado Review de `02-sprint-actual.md`.

- Demostrar software ejecutable y recoger comentarios de interesados/profesor cuando corresponda.
- Anotar fecha, asistentes, objetivo logrado o no, demo, feedback y cambios acordados.
- No rellenar una reunión ficticia por adelantado.

### 9. Celebrar y documentar la retrospectiva

Dónde: apartado Retrospectiva del mismo documento.

- Hablar de colaboración, dificultades y calidad.
- Elegir al menos una mejora realizable y cuándo revisarla.
- Registrar hechos y decisiones reales.

### 10. Planificar el siguiente sprint

Dónde: nuevo documento en `docs/sprints/` y Projects.

- Acordar un objetivo de producto, no solo una lista de issues.
- Seleccionar trabajo que quepa en una semana; no comprometer todo el backlog.
- Propuesta inicial: «El usuario puede registrar sus asignaturas y su disponibilidad» (#1 y #2), si la capacidad lo permite.
- Desglosar tareas, estimar y actualizar el plan durante el sprint.

## Orden propuesto del desarrollo restante

Este es un orden por dependencias, no sprints ya pactados:

1. Cerrar la revisión de este sprint y asegurar que el equipo puede ejecutar el proyecto.
2. Asignaturas (#1), apartado individual (#24) y temario (#27).
3. Disponibilidad (#2), horario de clases (#5), exámenes (#3), tareas académicas/entregas (#4).
4. Dificultad/prioridad (#12), horas objetivo (#13) y descansos (#11).
5. Plan automático básico (#6), calendario (#7), horas de sesión (#9) y priorización (#8), divididos si son demasiado grandes.
6. Edición de sesiones (#10), completadas (#14) y replanificación (#15).
7. Seguimiento y estadísticas (#18, #23, #25, #26), revisando solapamientos.
8. Preferencias de aprendizaje (#16), recordatorios (#19) e importación de horario mediante imagen (#17), según valor y tiempo.
9. Preparación del despliegue, copias de seguridad y pruebas de uso finales si entran en el alcance académico. Son trabajo por refinar, no issues añadidos automáticamente.

## Qué exige Scrum y qué es apoyo práctico

Los artefactos de Scrum son Product Backlog, Sprint Backlog e Incremento. Sus compromisos son Product Goal, Sprint Goal y Definition of Done. La guía no prescribe un dossier fijo, actas de todas las reuniones, burndown, UML ni story points. Esta documentación os ayuda a mantener transparencia, trazabilidad y una entrega académica comprensible. El profesor puede pedir documentación adicional.

Referencia: https://scrumguides.org/scrum-guide.html

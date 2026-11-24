# Índice único del Product Backlog

Primera versión. Tabla de correspondencia entre identificador de HU, número de issue, estado y dependencias. Es el Paso 1 de la auditoría de historias de usuario del 23 de noviembre de 2026.

- **Estado en GitHub:** leído de las issues el 25 de noviembre de 2026. Ese día se crearon las issues de HU45–HU47 (#56–#58) y se alinearon con docs los títulos de #14, #20, #54 y #55.
- **Estado en docs:** el que declara `docs/Historias-de-usuario.md` en su ficha.
- **Valor y estimación:** copiados de `docs/Historias-de-usuario.md`; no se han modificado.
- **Prioridad:** la que declara cada ficha de `docs/Historias-de-usuario.md` en «Valor y prioridad», resumida a un nivel (Máxima, Alta, Media-alta, Media, Media-baja, Baja). «Sin definir» = la ficha no indica prioridad de ejecución. No se ha podido contrastar con GitHub Projects: ni el repositorio ni sus miembros consultados tienen un tablero accesible.
- **Sprint:** el Sprint Backlog de las páginas Sprint 1–5 de la Wiki (leídas el 25 de noviembre de 2026). «Sin asignar» = no aparece en ningún Sprint Backlog. La página Sprint 5 aún no tiene historias comprometidas.
- **Dependencias:** propuesta funcional de la auditoría (no son relaciones `blocked_by` de GitHub). `SP` = sesiones planificadas persistentes; `TR` = registro de tiempo real; `AF` = amistades y consentimiento. Son tareas propuestas, no HU creadas.
- El identificador HU y el número de issue son distintos (p. ej. HU21 es #22, HU27 es #29, HU28 es #36).

| HU | Issue | Título | Estado en GitHub | Estado en docs | Valor | Prioridad | Estimación | Sprint | Dependencias | Discrepancia |
|---|---|---|---|---|---|---|---|---|---|---|
| HU01 | [#1](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/1) | Gestión de asignaturas | Cerrada (completed) | Terminada | Muy alto | Máxima | 1 día | Sprint 2–3 | — | |
| HU02 | [#2](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/2) | Disponibilidad semanal | Cerrada (completed) | Preparada | Muy alto | Alta | 1 día | Sin asignar | HU05, HU06 (integración) | Docs dicen preparada pero la issue está cerrada |
| HU03 | [#3](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/3) | Registro de exámenes | Cerrada (duplicada) | Absorbida | — | — | — | — | Absorbida por [HU04 (#4)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4) | |
| HU04 | [#4](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4) | Gestión de tareas, entregas y exámenes | Cerrada (completed) | Terminada | Muy alto | Alta | 2 días | Sprint 4 | HU01 (exámenes) | |
| HU05 | [#5](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/5) | Horario de clases | Cerrada (completed) | Terminada | Muy alto | Alta | 1 día | Sprint 4 | HU01 | |
| HU06 | [#6](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6) | Generación automática del plan de estudio | Cerrada (completed) | Terminada | Muy alto | Máxima | 3 días | Sin asignar | HU01, HU02, HU04, HU05, HU11, HU12, HU13 | |
| HU07 | [#7](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/7) | Calendario semanal | Cerrada (completed) | Terminada | Muy alto | Máxima | 2 días | Sprint 4 | HU06 (sesiones) | |
| HU08 | [#8](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/8) | Priorización automática | Cerrada (duplicada) | Absorbida | — | — | — | — | Absorbida por [HU06 (#6)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6) | |
| HU09 | [#9](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/9) | Horas de inicio y fin de las sesiones | Abierta | Absorbida | — | — | — | — | Absorbida por HU07 | Docs dicen absorbida pero la issue está abierta |
| HU10 | [#10](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/10) | Edición manual de sesiones | Abierta | Propuesta | Alto | Media-alta | 2 días | Sin asignar | SP, HU06, HU07 | |
| HU11 | [#11](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/11) | Descansos entre sesiones | Abierta | Terminada | Alto | Sin definir | 1 día | Sin asignar | HU06 (consumo) | Docs dicen terminada pero la issue está abierta |
| HU12 | [#12](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/12) | Dificultad y prioridad de asignaturas | Cerrada (completed) | Terminada | Alto | Sin definir | 1 día | Sprint 4 | HU01; HU04 | |
| HU13 | [#13](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/13) | Horas deseadas por asignatura | Cerrada (completed) | Terminada | Muy alto | Sin definir | 1 día | Sin asignar | HU01; HU06 (consumo) | |
| HU14 | [#14](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/14) | Sesiones completadas y estado de seguimiento | Abierta | Propuesta | Medio | Media | 1,5 días | Sin asignar | SP, HU06 | |
| HU15 | [#15](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/15) | Replanificación de sesiones pendientes | Abierta | Propuesta | Medio | Media | 2 días | Sin asignar | HU06, HU14, SP | |
| HU16 | [#16](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/16) | Perfil y preferencias de aprendizaje | Cerrada (completed) | Terminada | Medio | Media-baja | 2 días | Sin asignar | HU06 (preferencias) | |
| HU17 | [#17](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/17) | Importación del horario mediante imagen | Abierta | Propuesta | Bajo | Baja | 3 días | Sin asignar | HU05; HU01 | |
| HU18 | [#18](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18) | Estadísticas y seguimiento del estudio | Abierta | Propuesta | Medio | Media | 3 días | Sin asignar | HU14, SP, HU01, HU06 | |
| HU19 | [#19](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/19) | Recordatorios | Cerrada (completed) | Terminada | Bajo-medio | Sin definir | 2 días | Sprint 4 | HU04; SP y HU06 si avisa de sesiones | |
| HU20 | [#20](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/20) | Registro de usuario | Cerrada (completed) | Terminada | Alto (base transversal) | Sin definir | 2 días | Sprint 2 | — | |
| HU21 | [#22](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/22) | Inicio de sesión | Cerrada (completed) | Terminada | Alto (base transversal) | Sin definir | 1 día | Sprint 2 | HU20 | |
| HU22 | [#23](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/23) | Horas estudiadas semanalmente | Cerrada (duplicada) | Absorbida | — | — | — | — | Absorbida por [HU18 (#18)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18) | |
| HU23 | [#24](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/24) | Apartado individual por asignatura | Cerrada (completed) | Terminada | Alto | Sin definir | 1 día | Sprint 2–3 | HU01 | |
| HU24 | [#25](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/25) | Seguimiento de sesiones de estudio | Cerrada (duplicada) | Absorbida | — | — | — | — | Absorbida por [HU18 (#18)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18) | |
| HU25 | [#26](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/26) | Asignaturas estudiadas semanalmente | Cerrada (duplicada) | Absorbida | — | — | — | — | Absorbida por [HU18 (#18)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18) | |
| HU26 | [#27](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/27) | Gestión del temario por asignatura | Cerrada (completed) | Terminada | Alto | Sin definir | 1 día | Sprint 4 | HU01, HU23 | |
| HU27 | [#29](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/29) | Lista de To-Dos | Cerrada (completed) | Terminada | Medio | Sin definir | 1 día | Sprint 2 | — | |
| HU28 | [#36](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/36) | Filtrar To-Dos por estado | Cerrada (completed) | Terminada | Medio | Sin definir | 1 día | Sin asignar | HU27 | |
| HU29 | [#37](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/37) | Buscar To-Dos por título | Abierta | Preparada | Medio | Media-baja | 1 día | Sin asignar | HU27 | |
| HU30 | [#38](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/38) | Navegación completa mediante teclado | Abierta | Preparada | Alto | Alta | 2 días | Sin asignar | Vistas a cubrir | |
| HU31 | [#39](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/39) | Etiquetas accesibles para lectores de pantalla | Abierta | Preparada | Alto | Alta | 2 días | Sin asignar | Vistas a cubrir | |
| HU32 | [#40](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/40) | Modo de alto contraste | Abierta | Preparada | Medio | Media | 1 día | Sin asignar | HU40 | |
| HU33 | [#41](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/41) | Adaptación a texto ampliado | Abierta | Preparada | Medio | Media | 2 días | Sin asignar | Vistas a cubrir (HU07) | |
| HU34 | [#42](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/42) | Preferencia de movimiento reducido | Abierta | Preparada | Medio | Media | 1 día | Sin asignar | Animaciones existentes | |
| HU35 | [#43](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/43) | Errores de formularios comprensibles y accesibles | Abierta | Preparada | Alto | Alta | 2 días | Sin asignar | HU01, HU04, HU20, HU21 | |
| HU36 | [#44](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/44) | Exportación del calendario a archivo ICS | Abierta | Preparada | Medio | Media | 2 días | Sin asignar | HU06; SP si exporta historial | |
| HU37 | [#45](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/45) | Exportación de datos personales | Abierta | Preparada | Medio | Media | 2 días | Sin asignar | HU01, HU04, sesiones; HU27 | |
| HU38 | [#46](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/46) | Deshacer eliminación de una tarea rápida | Abierta | Preparada | Medio | Media-baja | 2 días | Sin asignar | HU27 | |
| HU39 | [#47](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/47) | Confirmación antes de descartar cambios | Abierta | Preparada | Medio | Media-baja | 1 día | Sin asignar | HU01, HU04 | |
| HU40 | [#50](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/50) | Elegir entre modo claro y oscuro | Cerrada (completed) | Terminada | Medio | Sin definir | 1 día | Sin asignar | — | |
| HU41 | [#51](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/51) | Aprovechar el ancho disponible del panel principal | Abierta | En revisión | Medio-alto | Sin definir | 0,5 días | Sin asignar | HU40 | |
| HU42 | [#52](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/52) | Generar y visualizar el horario semanal de estudio automático | Cerrada (duplicada) | Absorbida | — | — | — | — | Absorbida por [HU06 (#6)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6), [HU07 (#7)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/7), [HU09 (#9)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/9), [HU11 (#11)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/11) | |
| HU43 | [#53](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/53) | Recuperación segura de contraseña | Abierta | Preparada | Alto | Alta | 3 días | Sin asignar | HU20, HU21 | |
| HU44 | [#54](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/54) | Resolver retos diarios de ajedrez para activar la mente | Cerrada (completed) | Terminada | Bajo-medio | Sin definir | 2 días | Sin asignar | Cuenta (progreso por usuario) | |
| HU45 | [#56](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/56) | Resolver reto diario de Sudoku | Abierta | Terminada | Bajo | Sin definir | 1,5 días | Sin asignar | Por definir | Docs dicen terminada pero la issue está abierta (falta verificar `npm run test:frontend`) |
| HU46 | [#57](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/57) | Jugar partida de 2048 en descansos | Abierta | Terminada | Bajo | Sin definir | 1 día | Sin asignar | Por definir | Docs dicen terminada pero la issue está abierta (falta verificar `npm run test:frontend`) |
| HU47 | [#58](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/58) | Jugar reto de memoria secuencial (Simon) | Abierta | Terminada | Bajo | Sin definir | 1 día | Sin asignar | Por definir | Docs dicen terminada pero la issue está abierta (falta verificar `npm run test:frontend`) |
| HU48 | [#55](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/55) | Ranking privado de horas reales de estudio con amigos | Abierta | Propuesta | Bajo-medio | Baja | 5 días | Sin asignar | TR, AF | |

## Discrepancias entre GitHub y docs

- HU02 (#2): Docs dicen preparada pero la issue está cerrada.
- HU09 (#9): Docs dicen absorbida pero la issue está abierta.
- HU11 (#11): Docs dicen terminada pero la issue está abierta.
- HU45–HU47 (#56–#58): Docs dicen terminadas pero las issues están abiertas hasta verificar `npm run test:frontend`.

## Issues que no son historias

- #31 — [Aviso] Importante que lean esto(no necesariamente para mañana) para acomodar contradicciones con las historias de usuarios (abierta)
- #32 — [Bug][Backend] Impedir editar tareas de otro usuario (cerrada)
- #33 — [Bug][Backend] Impedir eliminar tareas de otro usuario (cerrada)
- #34 — [Bug][Backend] Devolver 404 al actualizar una tarea inexistente (abierta)
- #35 — [Bug][Backend] Validar que el campo completada sea booleano (abierta)
- #48 — [Bug][HU04] Se permiten fechas límite anteriores al día actual al crear o editar tareas (cerrada)
- #49 — el clanedario se ve muy feo (abierta)

## Pendiente para cerrar el Paso 1

- Contrastar prioridad y sprint con el tablero de GitHub Projects, si existe (requiere acceso del propietario).
- Resolver las discrepancias de estado (HU02, HU09, HU11, HU45–HU47); corresponden sobre todo a los Pasos 2 y 9.

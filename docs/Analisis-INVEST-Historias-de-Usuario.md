# Evaluación INVEST de las historias de usuario de IS1

**Proyecto:** IS1 – Planificador de Estudios (UCM)  
**Revisión inicial:** 6 de noviembre de 2026  
**Revisión completa:** 27 de noviembre de 2026  
**Alcance:** HU01–HU48 del Product Backlog. Se evalúan los requisitos, la estimación y las dependencias. Los estados de implementación se indican según la ficha y las comprobaciones documentales citadas. La ejecución de pruebas requiere su propia evidencia.

[Historias de usuario](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/f7ab848ce331f7abffdf4c027e7f09ac36b56096/docs/Historias-de-usuario.md) · [Índice del backlog](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/f7ab848ce331f7abffdf4c027e7f09ac36b56096/docs/Indice-backlog.md) · [Guía de revisión técnica](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/f7ab848ce331f7abffdf4c027e7f09ac36b56096/docs/guia-revision-rtf.md)

## 1. Criterios y significado

- **I · Independiente.** La historia se puede desarrollar y entregar como incremento. Cuando requiere un incremento que todavía no está disponible, se registra la dependencia y el orden de entrega.
- **N · Negociable.** Se acuerda el resultado que necesita el usuario y se conserva margen para decidir la solución.
- **V · Valiosa.** El requisito identifica un beneficio observable para el usuario.
- **E · Estimable.** El alcance permite estimar el esfuerzo y se identifican las incertidumbres que pueden cambiarlo.
- **S · Pequeña.** El alcance y la estimación permiten comprometer la entrega en un sprint con capacidad suficiente.
- **T · Comprobable.** Los criterios permiten preparar casos con un resultado esperado reproducible.

**Convención.** ✅ indica que la redacción aporta base suficiente para esa dimensión. △ identifica una condición que debe resolverse. — indica una historia absorbida cuyos criterios se evalúan en la historia receptora. Una marca de comprobabilidad indica que se puede diseñar una prueba. El estado de la entrega indica si la funcionalidad está implementada o pendiente.

## 2. Revisión individual del Product Backlog

| Historia | Issue | I | N | V | E | S | T | Estado y observación |
|---|---|---|---|---|---|---|---|---|
| [HU01](#hu01) Gestión de asignaturas | [#1](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/1) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU02](#hu02) Disponibilidad semanal | [#2](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/2) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU03](#hu03) Registro de exámenes | [#3](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/3) | — | — | — | — | — | — | Absorbida en HU04. |
| [HU04](#hu04) Gestión de tareas, entregas y exámenes | [#4](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU05](#hu05) Horario de clases | [#5](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/5) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU06](#hu06) Generación automática del plan de estudio | [#6](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6) | △ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU07](#hu07) Calendario semanal | [#7](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/7) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU08](#hu08) Priorización automática | [#8](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/8) | — | — | — | — | — | — | Absorbida en HU06. |
| [HU09](#hu09) Horas de inicio y fin de las sesiones | [#9](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/9) | — | — | — | — | — | — | Absorbida en HU07. |
| [HU10](#hu10) Edición manual de sesiones | [#10](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/10) | △ | ✅ | ✅ | ✅ | ✅ | △ | Propuesta. |
| [HU11](#hu11) Descansos entre sesiones | [#11](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/11) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU12](#hu12) Dificultad y prioridad de asignaturas | [#12](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/12) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU13](#hu13) Horas deseadas por asignatura | [#13](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/13) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Terminada. |
| [HU14](#hu14) Sesiones completadas y estado de seguimiento | [#14](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/14) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | Propuesta. |
| [HU15](#hu15) Replanificación de sesiones pendientes | [#15](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/15) | △ | ✅ | ✅ | ✅ | ✅ | △ | Propuesta. |
| [HU16](#hu16) Perfil y preferencias de aprendizaje | [#16](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/16) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU17](#hu17) Importación del horario mediante imagen | [#17](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/17) | ✅ | ✅ | ✅ | △ | ✅ | △ | Propuesta. |
| [HU18](#hu18) Estadísticas y seguimiento del estudio | [#18](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18) | △ | ✅ | ✅ | ✅ | ✅ | △ | Propuesta. |
| [HU19](#hu19) Recordatorios | [#19](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/19) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU20](#hu20) Registro de usuario | [#20](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/20) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU21](#hu21) Inicio de sesión | [#22](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/22) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Terminada. |
| [HU22](#hu22) Horas estudiadas semanalmente | [#23](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/23) | — | — | — | — | — | — | Absorbida en HU18. |
| [HU23](#hu23) Apartado individual por asignatura | [#24](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/24) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Figura como terminada en la ficha. Cobertura del apartado individual pendiente de confirmar en navegador. |
| [HU24](#hu24) Seguimiento de sesiones de estudio | [#25](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/25) | — | — | — | — | — | — | Absorbida en HU18. |
| [HU25](#hu25) Asignaturas estudiadas semanalmente | [#26](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/26) | — | — | — | — | — | — | Absorbida en HU18. |
| [HU26](#hu26) Gestión del temario por asignatura | [#27](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/27) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Terminada. |
| [HU27](#hu27) Lista de To-Dos | [#29](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/29) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Gestión y filtro implementados. Búsqueda por título pendiente. |
| [HU28](#hu28) Filtrar To-Dos por estado | [#36](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/36) | — | — | — | — | — | — | Absorbida en HU27. |
| [HU29](#hu29) Buscar To-Dos por título | [#37](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/37) | — | — | — | — | — | — | Absorbida en HU27. |
| [HU30](#hu30) Navegación completa mediante teclado | [#38](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/38) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU31](#hu31) Etiquetas accesibles para lectores de pantalla | [#39](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/39) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU32](#hu32) Modo de alto contraste | [#40](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/40) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU33](#hu33) Adaptación a texto ampliado | [#41](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/41) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU34](#hu34) Preferencia de movimiento reducido | [#42](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/42) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU35](#hu35) Errores de formularios comprensibles y accesibles | [#43](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/43) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Preparada. |
| [HU36](#hu36) Exportación del calendario a archivo ICS | [#44](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/44) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU37](#hu37) Exportación de datos personales | [#45](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/45) | △ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU38](#hu38) Deshacer eliminación de una tarea rápida | [#46](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/46) | △ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU39](#hu39) Confirmación antes de descartar cambios | [#47](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/47) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Preparada. |
| [HU40](#hu40) Elegir entre modo claro y oscuro | [#50](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/50) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Terminada. |
| [HU41](#hu41) Aprovechar el ancho disponible del panel principal | [#51](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/51) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | En revisión. |
| [HU42](#hu42) Generar y visualizar el horario semanal de estudio automático | [#52](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/52) | — | — | — | — | — | — | Absorbida en HU06, HU07 y HU11. |
| [HU43](#hu43) Recuperación segura de contraseña | [#53](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/53) | △ | ✅ | ✅ | △ | ✅ | ✅ | Preparada. |
| [HU44](#hu44) Resolver retos diarios de ajedrez para activar la mente | [#54](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/54) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Terminada. |
| [HU45](#hu45) Resolver reto diario de Sudoku | [#56](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/56) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Implementada según la ficha. Verificación de integración frontend pendiente. |
| [HU46](#hu46) Jugar partida de 2048 en descansos | [#57](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/57) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Implementada según la ficha. Verificación de integración frontend pendiente. |
| [HU47](#hu47) Jugar reto de memoria secuencial (Simon) | [#58](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/58) | ✅ | ✅ | ✅ | ✅ | ✅ | △ | Implementada según la ficha. Verificación de integración frontend pendiente. |
| [HU48](#hu48) Ranking privado de horas reales de estudio con amigos | [#55](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/55) | △ | ✅ | ✅ | △ | △ | △ | Propuesta. |

## 3. Justificación por historia

### HU01

**Gestión de asignaturas** · [#1](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/1)

- **I · Independiente ✅.** La gestión de materias se puede entregar con una cuenta existente.
- **N · Negociable ✅.** El alta, edición y borrado admiten distintos diseños de formulario.
- **V · Valiosa ✅.** El estudiante mantiene separadas las materias de su plan.
- **E · Estimable ✅.** El CRUD, las validaciones y el aislamiento tienen un alcance de 1 día.
- **S · Pequeña ✅.** Se acota a la ficha de asignatura y sus operaciones básicas.
- **T · Comprobable △.** CA01–CA04 permiten probar las operaciones y la propiedad. «Nombre válido» y los efectos del borrado requieren precisión.

### HU02

**Disponibilidad semanal** · [#2](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/2)

- **I · Independiente ✅.** El usuario puede guardar su disponibilidad sin generar un plan.
- **N · Negociable ✅.** El equipo puede decidir cómo editar las franjas semanales.
- **V · Valiosa ✅.** Permite indicar cuándo se dispone de tiempo para estudiar.
- **E · Estimable ✅.** Un patrón por día, persistencia y validación delimitan la estimación de 1 día.
- **S · Pequeña ✅.** El incremento se ocupa de gestionar la disponibilidad. HU06 consume las franjas.
- **T · Comprobable △.** CA02 permite rechazar o fusionar el mismo solapamiento.

### HU03

**Registro de exámenes** · [#3](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/3)

**Trazabilidad de la absorción.** CA02–CA04 cubren la gestión de exámenes, su fecha y la pertenencia de la asignatura.

### HU04

**Gestión de tareas, entregas y exámenes** · [#4](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4)

- **I · Independiente ✅.** Se puede entregar el registro de actividades con asignaturas existentes. El motor puede consumirlas después.
- **N · Negociable ✅.** Las pantallas y los formularios pueden organizarse de varias formas.
- **V · Valiosa ✅.** Permite registrar fechas, esfuerzo y entregas o exámenes de una materia.
- **E · Estimable ✅.** Tipos de actividad, campos y validaciones delimitan 2 días orientativos.
- **S · Pequeña ✅.** El incremento reúne operaciones sobre las actividades académicas y sus fechas.
- **T · Comprobable △.** CA03 y CA04 permiten comprobar fechas y propiedad. CA01 deja abiertos varios límites de minutos.

### HU05

**Horario de clases** · [#5](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/5)

- **I · Independiente ✅.** El horario de clases se puede mantener sin generar sesiones.
- **N · Negociable ✅.** La vista semanal y sus controles admiten alternativas.
- **V · Valiosa ✅.** El usuario registra las horas de clase y los días no lectivos.
- **E · Estimable ✅.** Las franjas, los períodos libres y la persistencia delimitan 1 día orientativo.
- **S · Pequeña ✅.** La configuración se entrega como una unidad y el motor la consume después.
- **T · Comprobable △.** CA01–CA04 cubren persistencia y solapamientos. El alcance menciona una edición de períodos no lectivos que CA02 no exige expresamente.

### HU06

**Generación automática del plan de estudio** · [#6](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6)

- **I · Independiente △.** El motor usa asignaturas y restricciones de otras historias. Conviene explicitar las entradas disponibles para el alcance vigente.
- **N · Negociable ✅.** El algoritmo puede variar dentro de las reglas de reparto y conflicto acordadas.
- **V · Valiosa ✅.** El estudiante obtiene una propuesta semanal con sus objetivos y huecos libres.
- **E · Estimable ✅.** La ventana de siete días, los bloqueos y el reparto acotan la estimación orientativa de 3 días.
- **S · Pequeña ✅.** La entrega genera una vista previa semanal. El seguimiento de sesiones se planifica en otro incremento.
- **T · Comprobable △.** CA03–CA05 permiten comprobar bloqueos, déficit y recuperación local. Las reglas de reparto necesitan ejemplos con resultados esperados.

### HU07

**Calendario semanal** · [#7](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/7)

- **I · Independiente ✅.** La vista puede desarrollarse sobre un plan de ejemplo con la estructura de HU06.
- **N · Negociable ✅.** La disposición de las tarjetas se puede adaptar manteniendo la información exigida.
- **V · Valiosa ✅.** El usuario ve cuándo estudiar y qué actividad corresponde a cada sesión.
- **E · Estimable ✅.** La ventana de siete días, las horas y el estado vacío delimitan 2 días.
- **S · Pequeña ✅.** La historia entrega una vista y su resumen.
- **T · Comprobable △.** CA01–CA04 cubren fechas, orden, intervalos y aislamiento. Falta hacer explícita la comprobación de los bloqueos prometidos en el alcance.

### HU08

**Priorización automática** · [#8](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/8)

**Trazabilidad de la absorción.** CA02 recoge la ordenación y el reparto por proximidad, prioridad y dificultad.

### HU09

**Horas de inicio y fin de las sesiones** · [#9](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/9)

**Trazabilidad de la absorción.** CA02 exige mostrar hora de inicio y hora de fin en cada sesión.

### HU10

**Edición manual de sesiones** · [#10](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/10)

- **I · Independiente △.** La edición requiere sesiones individuales guardadas. HU14 asigna ese incremento a la persistencia y debe coordinarse con HU10.
- **N · Negociable ✅.** El punto de entrada a la edición y el diseño del formulario se pueden acordar.
- **V · Valiosa ✅.** El estudiante puede ajustar una sesión cuando cambia su disponibilidad.
- **E · Estimable ✅.** Fecha, hora, duración y conflictos delimitan el trabajo. Los 2 días son orientativos.
- **S · Pequeña ✅.** La edición de sesiones propias es una entrega acotada si ya existe el modelo persistente.
- **T · Comprobable △.** CA02 admite rechazo o aviso para el mismo conflicto. CA03 permite comprobar la persistencia después de recargar.

### HU11

**Descansos entre sesiones** · [#11](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/11)

- **I · Independiente ✅.** La configuración del descanso se puede verificar como entrada del planificador.
- **N · Negociable ✅.** El control de entrada puede variar mientras valide la duración acordada.
- **V · Valiosa ✅.** El estudiante puede espaciar sus sesiones según sus preferencias.
- **E · Estimable ✅.** Un valor en minutos, persistencia y validación delimitan 1 día.
- **S · Pequeña ✅.** La historia se concentra en una preferencia y su transferencia al motor.
- **T · Comprobable △.** CA01 acepta cero y CA03 rechaza negativos. Falta expresar el máximo y la respuesta ante decimales.

### HU12

**Dificultad y prioridad de asignaturas** · [#12](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/12)

- **I · Independiente ✅.** La edición de dificultad y prioridad puede entregarse sobre asignaturas existentes con independencia del reparto del plan.
- **N · Negociable ✅.** La presentación de los niveles puede adaptarse al formulario.
- **V · Valiosa ✅.** El usuario expresa qué materias requieren más atención.
- **E · Estimable ✅.** Dos campos, validación y persistencia delimitan 1 día.
- **S · Pequeña ✅.** Es una ampliación acotada de la ficha de asignatura.
- **T · Comprobable △.** CA01–CA03 permiten probar ambos campos, pero la escala y los valores por defecto están implícitos.

### HU13

**Horas deseadas por asignatura** · [#13](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/13)

- **I · Independiente ✅.** El objetivo se puede guardar y consultar con una asignatura existente. HU06 aplica el reparto.
- **N · Negociable ✅.** El formulario puede presentar los minutos sin imponer un diseño visual.
- **V · Valiosa ✅.** El estudiante indica cuánto estudio semanal desea para una materia.
- **E · Estimable ✅.** Un campo con rango y efecto del cero delimita 1 día.
- **S · Pequeña ✅.** Se concentra en la configuración de un objetivo.
- **T · Comprobable ✅.** CA01–CA03 fijan de 0 a 10 080, significado de cero y rechazo de valores fuera del rango o ajenos. Se pueden preparar pruebas de frontera.

### HU14

**Sesiones completadas y estado de seguimiento** · [#14](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/14)

- **I · Independiente △.** Necesita coordinar cuándo la vista previa de HU06 se convierte en sesiones identificables. La ficha prevé introducir la persistencia en este incremento.
- **N · Negociable ✅.** El control para marcar estados puede variar mientras se conserven las transiciones.
- **V · Valiosa ✅.** El estudiante registra qué sesiones completó y cuáles no realizó.
- **E · Estimable ✅.** Tres estados, persistencia y actualización visual acotan una estimación de 1,5 días.
- **S · Pequeña ✅.** El alcance corresponde al seguimiento individual y su almacenamiento.
- **T · Comprobable ✅.** CA01–CA04 permiten probar reversión, persistencia, aislamiento y repetición sin duplicados.

### HU15

**Replanificación de sesiones pendientes** · [#15](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/15)

- **I · Independiente △.** La replanificación necesita las sesiones de HU14 y las entradas de disponibilidad y horario.
- **N · Negociable ✅.** Se puede elegir cómo presentar las sesiones recolocadas y el déficit.
- **V · Valiosa ✅.** Permite recuperar estudio perdido y conocer el tiempo que queda sin asignar.
- **E · Estimable ✅.** La detección, búsqueda de huecos y prevención de duplicados delimitan 2 días orientativos.
- **S · Pequeña ✅.** Se concentra en recolocar sesiones propias elegibles.
- **T · Comprobable △.** CA01 distingue sesiones vencidas, futuras y completadas. CA03 deja abierto el horizonte y el caso de colocación parcial.

### HU16

**Perfil y preferencias de aprendizaje** · [#16](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/16)

- **I · Independiente ✅.** Las preferencias se pueden guardar antes de usarlas en un plan generado.
- **N · Negociable ✅.** La interfaz para seleccionar duración y franja admite alternativas.
- **V · Valiosa ✅.** El usuario empieza nuevos planes con preferencias de estudio propias.
- **E · Estimable ✅.** Dos preferencias, persistencia e integración delimitan 2 días.
- **S · Pequeña ✅.** Se acota al perfil de aprendizaje y sus valores iniciales.
- **T · Comprobable △.** CA01 y CA03 hablan de rango y valores válidos sin enumerarlos.

### HU17

**Importación del horario mediante imagen** · [#17](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/17)

- **I · Independiente ✅.** La extracción y revisión se pueden desarrollar con imágenes de prueba y usar la interfaz de guardado de HU05.
- **N · Negociable ✅.** El proveedor de reconocimiento puede elegirse según los resultados de una prueba técnica.
- **V · Valiosa ✅.** Reduce la introducción manual de horarios y permite corregir errores antes de guardar.
- **E · Estimable △.** Los 3 días son orientativos y dependen del reconocimiento de imágenes representativas.
- **S · Pequeña ✅.** La propuesta se limita a importar un horario mediante revisión manual asistida.
- **T · Comprobable △.** CA01–CA03 cubren formato, revisión y guardado. Falta el límite de tamaño y el resultado cuando la imagen es válida y no contiene clases reconocibles.

### HU18

**Estadísticas y seguimiento del estudio** · [#18](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18)

- **I · Independiente △.** Las estadísticas consumen sesiones persistidas y sus estados de HU14.
- **N · Negociable ✅.** La presentación de los indicadores puede adaptarse sin cambiar las reglas de cómputo.
- **V · Valiosa ✅.** El estudiante conoce su dedicación y cumplimiento semanal.
- **E · Estimable ✅.** Cuatro indicadores y un panel semanal justifican una estimación orientativa de 3 días.
- **S · Pequeña ✅.** Los indicadores se agrupan en una sola vista del mismo período.
- **T · Comprobable △.** CA04 ya distingue cero completadas de cero no realizadas. Queda aclarar si «Sin asignatura» solo aparece en el desglose o cuenta como asignatura distinta.

### HU19

**Recordatorios** · [#19](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/19)

- **I · Independiente ✅.** El aviso interno puede entregarse sobre actividades ya registradas.
- **N · Negociable ✅.** La presentación de avisos y su orden visual pueden acordarse.
- **V · Valiosa ✅.** El usuario puede anticipar actividades y exámenes próximos.
- **E · Estimable ✅.** Un panel interno y una preferencia de antelación acotan 2 días.
- **S · Pequeña ✅.** El alcance se limita a avisos de próximas actividades.
- **T · Comprobable △.** El rango y valor inicial están definidos. Falta explicitar la inclusión del día en el límite y el resultado para eventos vencidos.

### HU20

**Registro de usuario** · [#20](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/20)

- **I · Independiente ✅.** El alta de cuentas puede comprobarse por separado de los flujos académicos.
- **N · Negociable ✅.** El diseño del formulario y la presentación de errores admiten alternativas.
- **V · Valiosa ✅.** El usuario obtiene una cuenta con sus datos separados de los de otras personas.
- **E · Estimable ✅.** Formulario, validación y persistencia delimitan 2 días.
- **S · Pequeña ✅.** Se acota a crear la cuenta.
- **T · Comprobable △.** CA01–CA03 cubren correo, duplicados y almacenamiento. Conviene enlazar la política concreta de contraseña y sus límites.

### HU21

**Inicio de sesión** · [#22](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/22)

- **I · Independiente ✅.** El inicio de sesión se entrega con una cuenta existente y se puede verificar con una cuenta de prueba.
- **N · Negociable ✅.** La presentación de acceso y errores admite distintas soluciones.
- **V · Valiosa ✅.** El usuario recupera su espacio personal y puede cerrar la sesión.
- **E · Estimable ✅.** Credenciales, sesión activa y control de rutas delimitan 1 día.
- **S · Pequeña ✅.** El alcance se concentra en entrar, salir y proteger el acceso.
- **T · Comprobable ✅.** CA01–CA03 permiten verificar credenciales correctas e incorrectas, cierre y rechazo de peticiones sin sesión. Los casos se pueden separar por página y API.

### HU22

**Horas estudiadas semanalmente** · [#23](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/23)

**Trazabilidad de la absorción.** CA01–CA02 recogen el total semanal de tiempo de las sesiones completadas y su desglose.

### HU23

**Apartado individual por asignatura** · [#24](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/24)

- **I · Independiente ✅.** El apartado se puede desarrollar sobre una asignatura propia con datos de ejemplo.
- **N · Negociable ✅.** La presentación del detalle puede variar manteniendo el contenido acordado.
- **V · Valiosa ✅.** El usuario consulta en un sitio los datos de una materia.
- **E · Estimable ✅.** La navegación, consulta y filtrado por materia delimitan 1 día orientativo.
- **S · Pequeña ✅.** El incremento es un detalle por asignatura.
- **T · Comprobable △.** CA02 exige pertenencia y el alcance promete contenidos concretos. La revisión del diálogo encontró nombre, dificultad, prioridad y temas. Queda confirmar en navegador el objetivo semanal, las entregas y los exámenes.

### HU24

**Seguimiento de sesiones de estudio** · [#25](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/25)

**Trazabilidad de la absorción.** CA03–CA04 recogen los contadores semanales. HU14 registra los estados que consume el panel.

### HU25

**Asignaturas estudiadas semanalmente** · [#26](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/26)

**Trazabilidad de la absorción.** CA03 recoge el número y los nombres de las asignaturas distintas estudiadas.

### HU26

**Gestión del temario por asignatura** · [#27](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/27)

- **I · Independiente ✅.** El temario se puede probar sobre una asignatura propia sin usar el planificador.
- **N · Negociable ✅.** La edición y visualización de temas admite diferentes presentaciones.
- **V · Valiosa ✅.** El estudiante organiza contenidos y registra lo ya estudiado.
- **E · Estimable ✅.** Operaciones de temas y estado acotan 1 día.
- **S · Pequeña ✅.** Es una ampliación del apartado de asignatura centrada en el temario.
- **T · Comprobable ✅.** CA01–CA03 permiten probar alta, edición, borrado, reversión de estado y separación entre asignaturas y cuentas.

### HU27

**Lista de To-Dos** · [#29](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/29)

- **I · Independiente ✅.** La lista rápida puede entregarse sin depender del calendario ni de las actividades de HU04. Utiliza una cuenta iniciada.
- **N · Negociable ✅.** El equipo decide la ubicación del buscador y cómo calcula las coincidencias.
- **V · Valiosa ✅.** El estudiante anota tareas y encuentra una por estado o por parte de su título.
- **E · Estimable ✅.** CA01–CA08 delimitan gestión y consultas. La estimación total acordada es de 3 días.
- **S · Pequeña ✅.** La historia se concentra en una vista. Los 3 días caben en un sprint si el equipo dispone de esa capacidad.
- **T · Comprobable ✅.** CA04–CA08 permiten probar búsqueda parcial, filtro combinado, lista vacía y aislamiento. Con «Examen IS1» pendiente y «Examen BD» completada, buscar «exam» en Pendientes muestra solo la primera.

### HU28

**Filtrar To-Dos por estado** · [#36](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/36)

**Trazabilidad de la absorción.** CA04, CA07 y CA08 incorporan el filtro por estado, el resultado vacío y la conservación y el aislamiento de los datos. El filtro está implementado.

### HU29

**Buscar To-Dos por título** · [#37](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/37)

**Trazabilidad de la absorción.** CA05–CA08 incorporan la búsqueda parcial, la combinación con el filtro, el resultado vacío y el aislamiento. La búsqueda y su verificación siguen pendientes.

### HU30

**Navegación completa mediante teclado** · [#38](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/38)

- **I · Independiente ✅.** Los recorridos de teclado se pueden mejorar por pantallas.
- **N · Negociable ✅.** La implementación del foco puede adaptarse al control.
- **V · Valiosa ✅.** El usuario puede gestionar tareas y consultar el plan sin ratón.
- **E · Estimable ✅.** Los flujos de CA03 y los diálogos acotan la estimación de 2 días.
- **S · Pequeña ✅.** Es una mejora acotada a recorridos principales.
- **T · Comprobable △.** CA01 asigna Intro o Espacio a todos los controles. Las teclas esperadas varían según el tipo de elemento.

### HU31

**Etiquetas accesibles para lectores de pantalla** · [#39](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/39)

- **I · Independiente ✅.** El etiquetado y los anuncios se pueden incorporar sobre las pantallas existentes.
- **N · Negociable ✅.** Etiquetas y anuncios admiten mecanismos semánticos equivalentes.
- **V · Valiosa ✅.** El lector de pantalla puede identificar campos, acciones y cambios.
- **E · Estimable ✅.** Los formularios, regiones y avisos delimitan una estimación de 2 días.
- **S · Pequeña ✅.** El incremento se acota a las vistas principales.
- **T · Comprobable △.** CA01 y CA02 enumeran elementos. CA03 no enumera los cambios relevantes que deben anunciarse.

### HU32

**Modo de alto contraste** · [#40](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/40)

- **I · Independiente ✅.** El selector de alto contraste se puede incorporar a las vistas y combinar con los temas de HU40.
- **N · Negociable ✅.** La paleta y los indicadores pueden elegirse según el diseño.
- **V · Valiosa ✅.** El estudiante distingue textos, controles y estados con mayor facilidad.
- **E · Estimable ✅.** Selector, persistencia y revisión de contraste acotan 1 día orientativo.
- **S · Pequeña ✅.** El incremento se centra en una preferencia visual.
- **T · Comprobable △.** CA02 requiere contraste AA. Falta fijar elementos, fondos y regla aplicable de cada comprobación.

### HU33

**Adaptación a texto ampliado** · [#41](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/41)

- **I · Independiente ✅.** Cada vista se puede comprobar al ampliar el texto y adaptar de forma incremental.
- **N · Negociable ✅.** Los cambios de rejilla y composición pueden variar por pantalla.
- **V · Valiosa ✅.** El contenido sigue disponible cuando el usuario amplía la página.
- **E · Estimable ✅.** Zoom al 200 %, formularios y calendario delimitan 2 días orientativos.
- **S · Pequeña ✅.** La entrega se centra en ajustar la presentación de flujos existentes.
- **T · Comprobable △.** CA01 fija el zoom. CA03 deja sin concretar las anchuras y cómo se detecta que el desplazamiento bloquea una acción.

### HU34

**Preferencia de movimiento reducido** · [#42](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/42)

- **I · Independiente ✅.** La preferencia del sistema se aplica sobre animaciones existentes.
- **N · Negociable ✅.** Las transiciones se pueden desactivar o sustituir por otras más discretas.
- **V · Valiosa ✅.** Reduce el movimiento que encuentra el usuario al navegar.
- **E · Estimable ✅.** La detección de la preferencia y la revisión de vistas delimitan 1 día.
- **S · Pequeña ✅.** El alcance es una adaptación visual sin crear nuevos flujos.
- **T · Comprobable △.** CA01–CA03 identifican el cambio de preferencia. «Al mínimo» no indica qué animaciones deben desaparecer.

### HU35

**Errores de formularios comprensibles y accesibles** · [#43](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/43)

- **I · Independiente ✅.** Los mensajes se pueden mejorar sobre los formularios que ya existen.
- **N · Negociable ✅.** Los textos y su ubicación pueden adaptarse a cada campo conservando su asociación.
- **V · Valiosa ✅.** La persona puede identificar y corregir errores sin volver a rellenar todo.
- **E · Estimable ✅.** Mensajes, asociación y conservación de valores acotan 2 días.
- **S · Pequeña ✅.** Se trata de una mejora transversal sobre formularios delimitados.
- **T · Comprobable ✅.** CA01–CA03 permiten probar identificación del error, asociación accesible y conservación de los datos válidos tras un rechazo.

### HU36

**Exportación del calendario a archivo ICS** · [#44](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/44)

- **I · Independiente ✅.** La exportación se puede desarrollar con un plan de ejemplo de HU06 y probarse aparte del calendario visual.
- **N · Negociable ✅.** La selección y descarga admiten distintas interfaces conservando iCalendar.
- **V · Valiosa ✅.** Permite llevar el horario a un calendario externo.
- **E · Estimable ✅.** Serialización, descarga e importación delimitan 2 días orientativos.
- **S · Pequeña ✅.** Se limita a exportar un archivo para un período.
- **T · Comprobable △.** CA03 comprueba importación y lista vacía. CA01–CA02 dejan abiertos el período y la interpretación de zona horaria.

### HU37

**Exportación de datos personales** · [#45](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/45)

- **I · Independiente △.** Las sesiones registradas dependen de qué datos expongan la vista previa y la persistencia de HU14.
- **N · Negociable ✅.** La estructura JSON puede evolucionar mediante un contrato versionado.
- **V · Valiosa ✅.** El estudiante conserva una copia utilizable de sus propios datos.
- **E · Estimable ✅.** Las familias de datos y las exclusiones de privacidad acotan 2 días orientativos.
- **S · Pequeña ✅.** La entrega se limita a exportar, sin restauración.
- **T · Comprobable △.** CA01–CA03 cubren propiedad y colecciones vacías. Falta precisar qué sesiones se exportan y cómo se reconoce la versión.

### HU38

**Deshacer eliminación de una tarea rápida** · [#46](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/46)

- **I · Independiente △.** Depende del borrado de tareas rápidas de HU27.
- **N · Negociable ✅.** El aviso puede presentarse de distintas formas manteniendo la recuperación dentro del plazo.
- **V · Valiosa ✅.** Permite recuperar una tarea borrada por error.
- **E · Estimable ✅.** Plazo, restauración y casos de concurrencia delimitan 2 días orientativos.
- **S · Pequeña ✅.** Se limita a deshacer el borrado de To-Dos.
- **T · Comprobable △.** CA01 fija un plazo mínimo. CA02 omite la prioridad y CA03 deja abiertos los resultados de varios borrados o recargas.

### HU39

**Confirmación antes de descartar cambios** · [#47](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/47)

- **I · Independiente ✅.** La confirmación puede integrarse sobre los formularios existentes.
- **N · Negociable ✅.** El diseño del aviso y su reutilización quedan abiertos.
- **V · Valiosa ✅.** Evita perder datos escritos por error al salir de una edición.
- **E · Estimable ✅.** El seguimiento de cambios y un diálogo delimitan 1 día.
- **S · Pequeña ✅.** El alcance se concentra en confirmar o continuar la edición.
- **T · Comprobable △.** CA02–CA03 permiten comprobar ambas acciones. CA01 debe delimitar formularios y el caso de volver al valor original.

### HU40

**Elegir entre modo claro y oscuro** · [#50](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/50)

- **I · Independiente ✅.** El tema puede aplicarse independientemente de las funciones académicas.
- **N · Negociable ✅.** La paleta y el diseño del control admiten alternativas.
- **V · Valiosa ✅.** El usuario puede adaptar la interfaz a sus preferencias de lectura.
- **E · Estimable ✅.** Selector, variables visuales y persistencia delimitan 1 día.
- **S · Pequeña ✅.** El incremento es un ajuste visual con dos temas.
- **T · Comprobable △.** CA01–CA02 permiten comprobar cambio y persistencia. CA03 usa «contraste adecuado» sin concretar el resultado por pantalla.

### HU41

**Aprovechar el ancho disponible del panel principal** · [#51](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/51)

- **I · Independiente ✅.** El diseño del panel se puede revisar sobre las vistas actuales.
- **N · Negociable ✅.** La rejilla y los márgenes pueden resolverse con distintas técnicas.
- **V · Valiosa ✅.** El usuario aprovecha el ancho y mantiene los controles operables en ventanas pequeñas.
- **E · Estimable ✅.** Un ajuste de rejilla y verificación visual está estimado en medio día.
- **S · Pequeña ✅.** El alcance se limita a la distribución del panel.
- **T · Comprobable △.** CA02 enumera columnas por rangos sin definir los anchos de prueba.

### HU42

**Generar y visualizar el horario semanal de estudio automático** · [#52](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/52)

**Trazabilidad de la absorción.** HU06 genera el plan y aplica los descansos. HU07 muestra las sesiones y sus horas. HU11 configura la duración de la pausa.

### HU43

**Recuperación segura de contraseña** · [#53](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/53)

- **I · Independiente △.** El flujo depende de cuentas y acceso de HU20 y HU21 y de un servicio de correo.
- **N · Negociable ✅.** La integración de correo puede elegirse según lo que el equipo pueda validar.
- **V · Valiosa ✅.** La persona recupera el acceso a su cuenta y conserva sus datos de estudio.
- **E · Estimable △.** Los 3 días son orientativos hasta verificar el envío de correo.
- **S · Pequeña ✅.** El incremento se centra en solicitar y completar un restablecimiento.
- **T · Comprobable ✅.** CA01–CA03 permiten comprobar mensaje genérico, expiración a 30 minutos, uso único y efecto sobre la sesión anterior.

### HU44

**Resolver retos diarios de ajedrez para activar la mente** · [#54](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/54)

- **I · Independiente ✅.** El apartado se puede entregar sin depender de los otros minijuegos.
- **N · Negociable ✅.** Se puede acordar la presentación del tablero y las pistas manteniendo las jugadas previstas.
- **V · Valiosa ✅.** El estudiante puede realizar una pausa breve con cinco ejercicios diarios.
- **E · Estimable ✅.** Tablero, validación y respaldo acotan 2 días.
- **S · Pequeña ✅.** Se limita a los retos de mate en una jugada.
- **T · Comprobable ✅.** CA01–CA03 permiten probar desplazamiento, respuestas, pista, reinicio individual, persistencia y uso de los retos locales si falla el proveedor.

### HU45

**Resolver reto diario de Sudoku** · [#56](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/56)

- **I · Independiente ✅.** El reto diario se entrega como minijuego autónomo.
- **N · Negociable ✅.** La presentación del tablero puede variar mientras preserve pistas y reglas.
- **V · Valiosa ✅.** Ofrece una pausa con un reto diario y permite retomarlo.
- **E · Estimable ✅.** Generación, validación y persistencia delimitan 1,5 días.
- **S · Pequeña ✅.** Una sola mecánica y un tablero diario acotan la entrega.
- **T · Comprobable ✅.** CA01–CA03 permiten probar pistas, solución válida e inválida y conservación del progreso por fecha y cuenta. La ficha indica que falta verificar la integración frontend.

### HU46

**Jugar partida de 2048 en descansos** · [#57](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/57)

- **I · Independiente ✅.** El minijuego se puede entregar separado del planificador y de los otros juegos.
- **N · Negociable ✅.** Los controles y la presentación visual pueden adaptarse a móvil y escritorio.
- **V · Valiosa ✅.** Permite una partida breve con puntuación y reanudación.
- **E · Estimable ✅.** Movimiento, fusión, controles y persistencia delimitan 1 día.
- **S · Pequeña ✅.** Se acota a una mecánica y su marcador.
- **T · Comprobable △.** CA01 fija una fusión por ficha y movimiento. Falta determinar si una dirección sin efecto puede generar ficha.

### HU47

**Jugar reto de memoria secuencial (Simon)** · [#58](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/58)

- **I · Independiente ✅.** El minijuego se puede entregar independientemente del resto.
- **N · Negociable ✅.** La presentación y el ritmo de la secuencia pueden acordarse.
- **V · Valiosa ✅.** El estudiante realiza una pausa con un reto progresivo y conserva su récord.
- **E · Estimable ✅.** Secuencia, validación y récord delimitan 1 día.
- **S · Pequeña ✅.** Se concentra en una mecánica con reinicio.
- **T · Comprobable △.** CA01–CA03 cubren progresión y fallo. Falta concretar cuándo una ronda cuenta para el récord.

### HU48

**Ranking privado de horas reales de estudio con amigos** · [#55](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/55)

- **I · Independiente △.** El ranking depende de amistades, consentimiento y tiempo cronometrado. Las dos primeras capacidades del producto se pueden entregar antes del ranking.
- **N · Negociable ✅.** El equipo puede acordar la presentación y las reglas complementarias de clasificación.
- **V · Valiosa ✅.** El usuario compara tiempo real de estudio con amistades autorizadas.
- **E · Estimable △.** La previsión global de 5 días necesita desglosarse por capacidad y dependencia.
- **S · Pequeña △.** La propia ficha reúne amistades, cronómetro y ranking. Hace falta dividirla antes de comprometerla en sprint.
- **T · Comprobable △.** CA01–CA03 cubren visibilidad y cálculo general. La regla de empates y los límites de semana y mes quedan abiertos.

## 4. Plan de resolución para los criterios condicionados

La tabla recoge cada historia con alguna marca △, las letras afectadas y la acción de cierre. Cuando una misma historia tiene varias marcas, se mantienen condicionadas hasta resolver las acciones correspondientes.

### 4.1. Dependencias entre entregas

Acordar el contrato de sesiones persistentes que propone HU14 y su relación con la vista previa de HU06. HU10, HU15, HU18 y, según el alcance elegido, HU37 pueden preparar casos con datos de prueba mientras se concreta el orden de entrega. HU38 consume la gestión de To-Dos de HU27 y HU43 necesita el flujo de cuenta de HU20 y HU21. HU28 y HU29 están absorbidas por HU27. La búsqueda pendiente queda registrada en esa historia.

### 4.2. Incertidumbre de estimación

En HU17, comprobar el reconocimiento de imágenes con horarios representativos antes de cerrar la estimación. En HU43, verificar la disponibilidad del correo de prueba y el recorrido del enlace. El plan prevé una exploración de 4 horas para cada historia. Registrar el resultado, las limitaciones y la estimación revisada.

### 4.3. Desglose del ranking privado

Para HU48, proponer tres entregas con sus criterios y estimación. La primera gestiona amistades y consentimiento. La segunda registra tiempo real con pausas. La tercera presenta el ranking con los datos de las dos anteriores. El plan conserva como punto de partida 1,5 días para amistades y consentimiento, 2 días para el cronómetro y 1,5 días para el ranking. El equipo debe confirmar el alcance y esas estimaciones antes de comprometer las entregas.

### 4.4. Acciones y comprobaciones de cierre

| Historia | Criterios condicionados | Acción y comprobación |
|---|---|---|
| [HU01](#hu01) | T | Definir nombres vacíos, espacios y duplicados. Crear una asignatura con datos asociados, borrarla y comprobar el resultado acordado para cada tipo de dato. |
| [HU02](#hu02) | T | Elegir rechazo o fusión y documentar la regla. Con 09:00–11:00 y 10:30–12:00, verificar el mensaje y las franjas finales. |
| [HU04](#hu04) | T | Fijar mínimos de minutos totales y semanales y decidir si el objetivo semanal puede superar el total. Probar los valores en el límite y fuera de él. |
| [HU05](#hu05) | T | Acordar si se editan los períodos no lectivos. Si entra en alcance, cambiar la fecha final de un período y verificar su persistencia y su efecto en HU06. |
| [HU06](#hu06) | I, T | Listar entradas actuales y previstas. Probar una semana con examen próximo, déficit y empate y documentar qué resultado acepta el equipo. |
| [HU07](#hu07) | T | Crear un bloqueo de 10:00 a 11:00 y especificar cómo debe aparecer en cada vista prevista. |
| [HU10](#hu10) | I, T | Enlazar el incremento que guarda las sesiones, evitar duplicar su estimación y elegir la política de conflicto. Mover una sesión a una franja de clase y comprobar el horario resultante. |
| [HU11](#hu11) | T | Contrastar el límite del formulario con el servidor. Probar cero, el máximo, un valor superior, un negativo y un decimal. |
| [HU12](#hu12) | T | Documentar los niveles admitidos y el valor por defecto tras contrastarlos con las pruebas. Cambiar solo prioridad y comprobar que se conserva dificultad. |
| [HU14](#hu14) | I | Especificar cuándo se crea el registro persistente y qué identificador se conserva al regenerar. Marcar dos veces una sesión de 45 minutos y comprobar que se cuenta una sola vez. |
| [HU15](#hu15) | I, T | Definir el horizonte y decidir si se dividen sesiones. Verificar el plan y el déficit con 90 minutos pendientes y solo 60 disponibles. |
| [HU16](#hu16) | T | Contrastar y documentar los límites y las opciones reales. Probar una cuenta nueva y valores por debajo y por encima del rango. |
| [HU17](#hu17) | E, T | Probar horarios representativos, una imagen ilegible y un archivo dañado. Fijar tamaño máximo y resultado esperado sin guardar clases vacías. |
| [HU18](#hu18) | I, T | Acordar ese tratamiento y comprobar una actividad sin asignatura, una sesión completada y dos no realizadas. Mantener el enlace al incremento de persistencia. |
| [HU19](#hu19) | T | Fijar qué entra con antelación 0 y 7. Probar ayer, hoy, el límite exacto y el primer día fuera de la ventana. |
| [HU20](#hu20) | T | Documentar la regla vigente y compartir su referencia con HU43. Probar exactamente el límite y un valor inferior. |
| [HU23](#hu23) | T | Abrir una materia con 120 minutos semanales, tema, entrega y examen. Enumerar en CA02 lo que deba verse y ajustar el estado con lo observado. |
| [HU30](#hu30) | T | Enumerar teclas y resultado por tipo de control. Verificar tabulación, activación, entrada y devolución de foco al cerrar un diálogo. |
| [HU31](#hu31) | T | Acordar y probar al menos creación de una tarea, error de validación y confirmación de borrado. |
| [HU32](#hu32) | T | Crear una tabla de elementos evaluados y verificar las cuatro combinaciones de tema claro u oscuro y contraste activado o desactivado. |
| [HU33](#hu33) | T | Fijar el tamaño de ventana de prueba. Usar un nombre largo y comprobar lectura completa y acceso a acciones del calendario. |
| [HU34](#hu34) | T | Inventariar transiciones decorativas y esenciales. Comprobar la navegación, el diálogo y el tablero con la preferencia activada y desactivada. |
| [HU36](#hu36) | T | Precisar si se exporta la semana visible o un rango y la hora esperada al importar. Probar una sesión a las 10:00 y una exportación vacía. |
| [HU37](#hu37) | I, T | Decidir si la vista previa se exporta. Documentar la versión del esquema y probar cuenta vacía, cuenta con solo vista previa y cuenta con sesiones persistidas. |
| [HU38](#hu38) | I, T | Fijar si cada borrado tiene su propio plazo y si se recupera tras recargar. Borrar dos tareas y comprobar que deshacer una recupera su título, estado y prioridad sin recuperar la otra. |
| [HU39](#hu39) | T | Enumerar los formularios incluidos. Cambiar y revertir un campo, intentar salir y verificar si aparece el aviso conforme a la regla acordada. |
| [HU40](#hu40) | T | Fijar pantallas y criterio de contraste y verificar acceso, registro y calendario en ambos temas. |
| [HU41](#hu41) | T | Fijar tres anchos y las columnas esperadas. Comprobar menú, recortes y temas en cada uno. |
| [HU43](#hu43) | I, E | Validar el envío en un entorno de pruebas, registrar la dependencia del proveedor y revisar la estimación. Preparar casos de enlace válido, caducado y ya usado. |
| [HU46](#hu46) | T | Acordar el resultado de una dirección sin efecto y probar una fusión con tres fichas alineadas. Verificar también la integración frontend indicada en la ficha. |
| [HU47](#hu47) | T | Definir si el récord equivale a rondas completas o a la mayor longitud reproducida. Probar fallo, reinicio y persistencia y verificar la integración frontend. |
| [HU48](#hu48) | I, E, S, T | Definir historias de amistades y consentimiento, cronómetro y ranking. Estimar cada una, fijar desempates y calendario y comprobar la retirada de consentimiento. |

## 5. Conclusiones del refinamiento

- La matriz incluye HU01–HU48. Las 39 historias vigentes tienen una justificación para cada letra y las nueve absorbidas identifican sus criterios de destino.
- La configuración de disponibilidad, clases, descansos, dificultad, objetivos y preferencias se especifica por separado del cálculo del plan que realiza HU06. HU45, HU46 y HU47 tienen fichas propias y su verificación de integración sigue indicada en sus estados.
- HU27 incluye la gestión, el filtro por estado y la búsqueda por título, con una estimación total de tres días. Se conserva el supuesto de capacidad del sprint. El filtro ya está implementado y la búsqueda sigue pendiente.
- La siguiente revisión debe contrastar especialmente el contenido visible de HU23, las condiciones de entrega de sesiones persistentes y las reglas de aceptación identificadas en el plan.

# Historias de usuario

Recopilación del Product Backlog a partir de las [issues de GitHub](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues). Se conservan el valor, la estimación y los criterios de aceptación publicados en cada issue. En GitHub, el valor se expresa como nivel (por ejemplo, «Muy alto»); no se sustituye por una prioridad distinta.

Para garantizar la coherencia funcional y el cumplimiento de los criterios **INVEST** (*Independent, Negotiable, Valuable, Estimable, Small, Testable*) a lo largo de todas las historias de usuario (`HU01`–`HU44`), se establecen las siguientes definiciones base del sistema:

* **Sesión de estudio:** Unidad básica de planificación temporal dentro de StudyPlan. Representa un bloque continuo de tiempo asignado a una **asignatura** (o a una tarea/entrega vinculada a una asignatura), definido por una fecha, hora de inicio, hora de fin y duración en minutos.
  
  * *Evolución técnica:* En la fase inicial de generación y visualización (`HU06`, `HU07`, `HU09`), las sesiones se calculan dinámicamente a partir de las restricciones del usuario. Para soportar edición manual (`HU10`), registro de cumplimiento (`HU14`), replanificación (`HU15`) y estadísticas (`HU18`), cada sesión requiere persistencia individual en SQLite con tres estados explícitos: `pendiente`, `completada` y `no_realizada`.
  * 
* **Disponibilidad semanal neta:** Tiempo útil real disponible para estudiar en una semana concreta. Se obtiene restando a la disponibilidad bruta recurrente del usuario (`HU02`) tanto su horario fijo de clases (`HU05`) como sus compromisos puntuales bloqueados para esa semana (`HU06`).
* 
* **Hitos académicos vs. Objetivos de estudio:**
  * Las **asignaturas** (`HU01`) tienen un objetivo semanal de minutos deseados (`HU13`), dificultad y prioridad (`HU12`).
  * Las **tareas y entregas** (`HU04`) tienen fecha límite y minutos estimados propios.
  * Los **exámenes** (`HU03`, `HU04`) actúan como hitos temporales vinculados a una asignatura: no añaden minutos propios al cálculo, sino que incrementan la urgencia de estudiar su asignatura asociada conforme se acerca su fecha.
  * 
* **Independencia y trazabilidad (INVEST):** Aunque las funcionalidades siguen un flujo lógico de datos (gestión de cuenta $\rightarrow$ asignaturas y restricciones $\rightarrow$ motor de planificación $\rightarrow$ visualización y seguimiento), cada historia se especifica y verifica de forma autocontenida mediante datos de prueba aislados, evitando mezclar criterios de aceptación entre historias distintas.

## HU01 — Gestión de asignaturas

- **Issue:** [Issue #1](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/1)
  
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
  
- **Historia:** Como usuario, quiero añadir, editar y eliminar asignaturas para indicar qué materias tengo que estudiar.
  
- **Alcance:** Incluye el alta, consulta, edición y borrado de asignaturas propias del usuario.
 
- **Valor y prioridad:** Muy alto. Es la entidad raíz del planificador sobre la que se vinculan clases, exámenes, temas y sesiones; prioridad máxima de ejecución (Sprint 1).
 
- **Estimación:** 1 día (orientativa; operaciones CRUD básicas con validaciones y aislamiento por cuenta).
 
- **Criterios de aceptación:**
  - **CA01:** El usuario puede crear asignaturas indicando un nombre válido.
  - **CA02:** El usuario puede editar el nombre.
  - **CA03:** El usuario puede eliminar una asignatura existente
  - **CA04:** Cada usuario visualiza y gestiona únicamente sus propias asignaturas.
   
- **Evidencias:** Implementado en `main` (`app.py`, `templates/index.html`, `static/app.js`) y verificado mediante `tests/test_app.py` y `tests/editar-asignaturas.test.js`.


## HU02 — Disponibilidad semanal

- **Issue:** [Issue #2](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/2)
  
- **Estado:** Preparada (Abierta — pendiente de implementar disponibilidad recurrente por día de la semana)
 
- **Historia:** Como usuario, quiero definir mi disponibilidad semanal recurrente mediante franjas horarias por día de la semana para que la aplicación sepa cuándo puedo estudiar habitualmente.
 
- **Alcance:** Incluye la configuración de un patrón semanal recurrente (de lunes a domingo) con una o varias franjas horarias disponibles por día en SQLite, evolucionando el selector global único `Desde`/`Hasta` actual del generador. No incluye clases (`HU05`) ni bloqueos puntuales por fecha (`HU06`).
 
- **Valor y prioridad:** Muy alto. Permite personalizar las horas disponibles de cada día de la semana sin depender de una misma franja global para los siete días; prioridad alta para el próximo incremento.
 
- **Estimación:** 1 día (orientativa; incluye persistencia en SQLite, endpoints por usuario, interfaz de franjas por día y pruebas unitarias).
 
- **Criterios de aceptación:**
  - **CA01:** El usuario puede definir una o varias franjas horarias disponibles (hora de inicio y hora de fin) de forma independiente para cada día de la semana (lunes a domingo), pudiendo dejar días sin franjas.
  - **CA02:** El sistema valida que la hora de fin sea posterior a la de inicio (`fin > inicio`) y rechaza o fusiona franjas que se solapen dentro del mismo día.
  - **CA03:** El usuario puede editar y eliminar franjas existentes, conservándose el patrón en SQLite para cualquier semana futura mientras no lo modifique.
  - **CA04:** Cada usuario consulta y modifica únicamente su propia disponibilidad semanal.
   
- **Evidencias:** En `main` existe actualmente una versión inicial simplificada mediante rango único diario (`Desde`/`Hasta`) en `templates/index.html` y `static/plan.js`. Pendiente implementar la disponibilidad granular por día en backend/frontend y sus pruebas automatizadas.

## HU03 — Registro de exámenes

- **Issue:** [Issue #3](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/3)
  
- **Estado:** Absorbida (Cerrada — funcionalidad consolidada en [HU04](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4))
 
- **Historia:** Como estudiante, quiero registrar exámenes asociados a una asignatura indicando su fecha para organizar mi preparación.
  
- **Alcance:** Funcionalidad integrada íntegramente dentro de `HU04` (*Gestión de tareas, entregas y exámenes*). La antigua regla de «importancia» manual del examen se sustituyó en el modelo vigente por el objetivo semanal de la asignatura vinculada (`HU13`) y la proximidad de la fecha del examen en el generador (`HU06`). No se contabiliza estimación separada.

- **Evidencias:** Consolidada en `HU04` (`#4`).

## HU04 — Gestión de tareas, entregas y exámenes

- **Issue:** [Issue #4](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4)
  
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
  
- **Historia:** Como usuario, quiero registrar, editar y eliminar tareas, entregas y exámenes para integrarlos en mi planificación.
  
- **Alcance:** Incluye el CRUD completo de actividades académicas en SQLite por usuario: tareas y entregas (con o sin asignatura asociada, fecha límite, minutos estimados totales y objetivo semanal editable) y exámenes (vinculados obligatoriamente a una asignatura propia y con fecha de examen, sin objetivo de minutos independiente). No incluye prioridad manual por actividad (la urgencia se determina por fecha límite/proximidad) ni la lista rápida de To-Dos (`HU27`).
  
- **Valor y prioridad:** Muy alto. Alimenta directamente el motor de planificación semanal y los avisos de próximos eventos; prioridad alta (Sprint 2 / Sprint 4).
- **Estimación:** 2 días (orientativa; abarca formularios, endpoints, validaciones de fechas/pertenencia y pruebas).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario puede crear, editar y eliminar tareas y entregas indicando título, fecha límite, minutos estimados totales y objetivo semanal editable (pudiendo vincularlas o no a una asignatura propia).
  - **CA02:** El usuario puede crear, editar y eliminar exámenes asociados obligatoriamente a una asignatura propia indicando su fecha, sin minutos semanales propios (su dedicación proviene del objetivo semanal de la asignatura sin duplicarse).
  - **CA03:** Al crear o modificar la fecha de una tarea, entrega o examen, el sistema admite la fecha local actual o futura y rechaza fechas anteriores al día actual (permitiendo editar otros campos de actividades ya vencidas sin obligar a cambiar su fecha, según `#48`).
  - **CA04:** Todas las operaciones validan la propiedad en el servidor (SQLite) y rechazan asociaciones o modificaciones sobre asignaturas o actividades de otros usuarios.
   
- **Evidencias:** Implementado en `main` (`app.py`, `templates/index.html`, `static/app.js`) y verificado en la ejecución de pruebas (`157` Jest / `178` Python), incluyendo `tests/test_app.py`, `tests/test_objetivos_semanales.py` y `tests/examenes-form.test.js`.
  
## HU05 — Horario de clases

- **Issue:** [Issue #5](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/5)
  
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
  
- **Historia:** Como usuario, quiero introducir mi horario de clases para registrar mis horas lectivas ocupadas.
  
- **Alcance:** Incluye el alta, consulta, edición y borrado de franjas de clases semanales recurrentes (de lunes a domingo) y de días o períodos no lectivos (festivos o vacaciones) en SQLite por cuenta. La exclusión efectiva de estas franjas al generar sesiones corresponde al motor de `HU06`.
  
- **Valor y prioridad:** Muy alto. Define las restricciones académicas fijas del estudiante; prioridad alta.
  
- **Estimación:** 1 día (orientativa; abarca cuadrícula semanal, gestión de períodos libres, validación de intervalos y persistencia).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario puede registrar clases indicando asignatura, día de la semana, hora de inicio y hora de fin, y consultarlas en la vista semanal.
  - **CA02:** El usuario puede editar o eliminar clases existentes, así como registrar y eliminar días o períodos no lectivos (festivos o vacaciones).
  - **CA03:** El sistema valida que la hora de fin sea posterior a la de inicio (`fin > inicio`) y rechaza clases que se solapen en el mismo día.
  - **CA04:** Los datos persisten en SQLite asociados exclusivamente al usuario autenticado.
    
- **Evidencias:** Implementado en `main` (`app.py`, `templates/index.html`, `static/app.js`) y verificado mediante `tests/test_app.py` y `tests/test_planificador.py`.

## HU06 — Generación automática del plan de estudio

- **Issue:** [Issue #6](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6)
  
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
  
- **Historia:** Como usuario, quiero generar automáticamente un plan de estudio semanal de 7 días que respete mis restricciones y reparta mis objetivos según prioridad, dificultad y plazos.
  
- **Alcance:** Incluye el cálculo automático de sesiones para una ventana de 7 días desde la fecha de inicio elegida, respetando el rango horario configurado (`Desde`/`Hasta`), duración de sesión, descansos (`HU11`), clases y festivos (`HU05`), y bloqueos puntuales por fecha guardados en `localStorage` del navegador. Genera una vista previa semanal persistida en `localStorage` por cuenta (no guarda sesiones individuales en SQLite).
  
- **Valor y prioridad:** Muy alto. Es el núcleo funcional de la aplicación; prioridad máxima.
  
- **Estimación:** 3 días (orientativa; historia integradora que combina motor de reparto en backend y gestión de bloqueos puntuales en frontend).
  
- **Criterios de aceptación:**
  - **CA01:** El generador asigna primero los objetivos semanales explícitos de asignaturas (`HU13`) y tareas/entregas (`HU04`), evitando clases, días libres (`HU05`), bloqueos puntuales y solapamientos.
  - **CA02:** Los exámenes vinculados (`HU04`) no añaden minutos propios, pero su proximidad adelanta la preparación de su asignatura; el tiempo libre sobrante se reparte alternando materias y actividades según prioridad/dificultad de asignatura (`HU12`) y urgencia de fecha límite.
  - **CA03:** Antes de generar, el usuario puede añadir o eliminar franjas ocupadas puntuales (con fecha dentro de los 7 días, inicio, fin y motivo), conservándose en `localStorage` por usuario y mostrándose identificadas en el horario resultante.
  - **CA04:** Se respetan la duración de sesión y el descanso entre bloques (`HU11`), mostrando un aviso de déficit de minutos cuando los objetivos superan el tiempo disponible.
  - **CA05:** El último plan generado y sus parámetros se conservan en `localStorage` separados por correo del usuario, aislando los datos entre cuentas en el backend.
    
- **Evidencias:** Implementado en `main` (`app.py`, `planificador.py`, `static/plan.js`, `templates/index.html`) y verificado en `tests/test_planificador.py`, `tests/test_reparto_horas.py`, `tests/test_objetivos_semanales.py` y `tests/plan.test.js`.

## HU07 — Calendario semanal

- **Issue:** [Issue #7](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/7) 
  
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
  
- **Historia:** Como usuario, quiero visualizar mi planificación mediante un calendario semanal con las horas de inicio y fin de cada sesión para saber qué debo estudiar en cada momento.
  
- **Alcance:** Incluye la vista semanal de 7 días de las sesiones de estudio generadas por `HU06` (mostrada en *Plan de Estudio* y resumida en el bloque *Mi plan de estudio semanal* de *Inicio*), indicando en cada tarjeta su hora de inicio, hora de fin y asignatura o actividad asociada, así como los compromisos puntuales bloqueados. Absorbe los criterios de `HU09` (*Horas de inicio y fin de las sesiones*). La persistencia individual de sesiones en SQLite para seguimiento pertenece a `HU14`.
  
- **Valor y prioridad:** Muy alto. Permite consultar de forma clara y ordenada las sesiones de estudio de la semana; prioridad máxima.
  
- **Estimación:** 2 días (orientativa; abarca vista semanal de 7 días, formateo horario de sesiones, estado vacío y lectura desde almacenamiento local).
  
- **Criterios de aceptación:**
  - **CA01:** Dado un plan de 7 días, el calendario muestra cada fecha con sus sesiones de estudio ordenadas cronológicamente tanto en *Plan de Estudio* como en el resumen de *Inicio*.
  - **CA02:** Cada sesión muestra de forma visible su hora de inicio, hora de fin y la asignatura o actividad correspondiente (indicando el examen o entrega vinculada cuando aplique, o identificando la actividad si no tiene asignatura).
  - **CA03:** Cuando no existe un plan guardado para el usuario activo, se muestra un estado vacío informativo con acceso directo para generarlo, sin representar sesiones ficticias.
  - **CA04:** La consulta del calendario no modifica el plan y muestra únicamente los datos de la cuenta autenticada.
    
- **Evidencias:** Implementado en `main` (`templates/index.html`, `static/plan.js`, `static/style.css`) y verificado mediante `tests/plan.test.js`.

## HU08 — Priorización automática

- **Issue:** [Issue #8](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/8)
  
- **Estado:** Absorbida (Cerrada como duplicada de [HU06](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6))
  
- **Historia:** Como usuario, quiero que el planificador priorice automáticamente según proximidad de exámenes, plazos y dificultad/prioridad para optimizar mi estudio.
  
- **Alcance:** Regla interna de ordenación y reparto consolidada íntegramente dentro del motor de `HU06`. No se contabiliza estimación separada.
  
- **Evidencias:** Consolidada en `HU06` (`#6`).

## HU09 — Horas de inicio y fin de las sesiones

- **Issue:** [Issue #9](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/9)
  
- **Estado:** Absorbida (Funcionalidad integrada en [HU07](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/7))
  
- **Historia:** Como usuario, quiero ver la hora de inicio y fin de cada sesión de estudio para seguir el horario generado.
  
- **Alcance:** La visualización del intervalo horario (`HH:MM–HH:MM`) es un elemento inseparable de cada sesión en el calendario semanal; queda absorbida en `CA02` de `HU07` sin duplicar estimación.
  
- **Evidencias:** Verificado en la vista semanal de `HU07` (`static/plan.js`, `tests/plan.test.js`).

## HU10 — Edición manual de sesiones

- **Issue:** [Issue #10](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/10)
  
- **Estado:** Propuesta (Abierta — requiere persistencia individual de sesiones en SQLite)
  
- **Historia:** Como usuario, quiero mover o modificar sesiones planificadas cuando tenga un imprevisto para adaptar mi horario.
  
- **Alcance:** Incluye el cambio de fecha, hora de inicio/fin o duración de una sesión individual persistida en SQLite, validando conflictos y conservando los cambios al regenerar otras partes del plan. No cubre el bloqueo previo de franjas antes de generar (ya resuelto en `HU06`).
  
- **Valor y prioridad:** Alto. Aporta flexibilidad tras generar el plan; prioridad media-alta para el incremento de seguimiento de sesiones.
  
- **Estimación:** 2 días (orientativa; incluye modelo persistente de sesiones en SQLite, validación de solapamientos y actualización en `HU07`).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario puede cambiar la fecha, hora de inicio o duración de una sesión propia existente.
  - **CA02:** El sistema comprueba conflictos con clases (`HU05`), descansos (`HU11`) u otras sesiones y rechaza o advierte antes de guardar solapamientos inválidos.
  - **CA03:** La modificación persiste en SQLite por usuario y se refleja inmediatamente en el calendario semanal (`HU07`), protegiendo las sesiones editadas o completadas frente a futuras regeneraciones.
  - **CA04:** Un usuario no puede consultar ni modificar sesiones pertenecientes a otras cuentas.
    
- **Evidencias:** Pendiente de implementación (actualmente las sesiones de `HU06`/`HU07` se almacenan solo como vista previa en `localStorage`).
  
## HU11 — Descansos entre sesiones

- **Issue:** [Issue #11](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/11)
  
- **Estado:** Terminada (Implementada y verificada en `main`; actualizar estado en GitHub)
  
- **Historia:** Como usuario, quiero configurar la duración de los descansos entre sesiones de estudio para adaptar el plan a mi ritmo.
  
- **Alcance:** Incluye la selección de minutos de descanso entre bloques consecutivos de estudio en el formulario de planificación y su conservación en el navegador junto con los parámetros del plan. La inserción efectiva de los intervalos de separación entre sesiones corresponde al motor de `HU06`.
  
- **Valor y prioridad:** Alto. Mejora la viabilidad y el realismo del horario generado; implementada junto al núcleo planificador.
  
- **Estimación:** 1 día (orientativa; campo de configuración, validación de valores enteros no negativos y consumo por `HU06`).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario puede establecer la duración del descanso entre sesiones en minutos (admitiendo `0` para sesiones sin pausa y valores enteros válidos).
  - **CA02:** El valor configurado se conserva en el navegador asociado al usuario actual y se envía al generador (`HU06`) para separar bloques consecutivos.
  - **CA03:** Se rechazan valores negativos o no numéricos con mensajes comprensibles.
- **Evidencias:** Implementado en `main` (`templates/index.html`, `static/plan.js`, `planificador.py`) y verificado en `tests/test_planificador.py` y `tests/plan.test.js`.

## HU12 — Dificultad y prioridad de asignaturas

- **Issue:** [Issue #12](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/12)
  
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
  
- **Historia:** Como usuario, quiero indicar la dificultad y prioridad de mis asignaturas para que el planificador distribuya mejor el tiempo de estudio disponible.
  
- **Alcance:** Incluye la configuración y edición de los niveles de dificultad y prioridad en cada asignatura (`HU01`) guardados en SQLite por usuario. Las actividades académicas con plazo (`HU04`) se ordenan por proximidad de fecha límite sin campo de prioridad manual, y la prioridad de los To-Dos rápidos (`HU27`) es meramente visual y no interviene en el planificador. El reparto efectivo pertenece a `HU06`.
  
- **Valor y prioridad:** Alto. Personaliza el reparto automático del tiempo sobrante entre materias.
- **Estimación:** 1 día (orientativa; campos en modelo SQLite de asignaturas, formulario y validación).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario puede asignar y modificar un nivel válido de dificultad y un nivel válido de prioridad al crear o editar cada asignatura propia.
  - **CA02:** Los valores se persisten en SQLite asociados a la asignatura y al usuario autenticado, aplicando valores por defecto válidos si no se especifican.
  - **CA03:** Se rechazan niveles fuera de la escala permitida y se impide modificar asignaturas de otros usuarios.
   
- **Evidencias:** Implementado en `main` (`app.py`, `templates/index.html`, `static/app.js`) y verificado en `tests/test_app.py`, `tests/editar-asignaturas.test.js` y `tests/test_reparto_horas.py`.

## HU13 — Horas deseadas por asignatura

- **Issue:** [Issue #13](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/13)
  
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
  
- **Historia:** Como usuario, quiero fijar y cambiar los minutos semanales deseados de cada asignatura para que el planificador reserve esa dedicación.
  
- **Alcance:** Incluye el campo de objetivo semanal en minutos (`0` a `10080`) al crear o editar una asignatura en SQLite, donde `0` indica reparto automático según tiempo disponible y prioridad/dificultad. Los exámenes vinculados (`HU04`) toman su tiempo de este objetivo sin sumar horas duplicadas. La asignación de bloques corresponde a `HU06`.
  
- **Valor y prioridad:** Muy alto. Permite garantizar una carga semanal concreta por materia.
  
- **Estimación:** 1 día (orientativa; campo en SQLite, validación de rango entero y consumo por `HU06`).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario puede establecer y editar el objetivo de minutos semanales al crear o modificar una asignatura.
  - **CA02:** El sistema persiste el valor en SQLite por usuario y valida que sea un número entero entre `0` y `10080` (interpretando `0` como reparto automático).
  - **CA03:** Se rechazan valores negativos, decimales o superiores a `10080`, así como modificaciones sobre asignaturas de otros usuarios.
    
- **Evidencias:** Implementado en `main` (`app.py`, `templates/index.html`, `static/app.js`) y verificado mediante `tests/test_objetivos_semanales.py` y `tests/editar-asignaturas.test.js`.

## HU14 — Sesiones completadas y estado de seguimiento

- **Issue:** [Issue #14](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/14)
  
- **Estado:** Propuesta (Abierta — requiere persistencia individual de sesiones en SQLite)
  
- **Historia:** Como usuario, quiero registrar el resultado de mis sesiones de estudio como completadas o no realizadas para llevar un seguimiento real de mi planificación.
  
- **Alcance:** Incluye el cambio de estado de cada sesión individual persistida en SQLite entre `pendiente`, `completada` y `no_realizada` (así como la reversión de estado en caso de error), reflejándose visualmente en el calendario (`HU07`). Requiere incorporar la persistencia individual de sesiones en SQLite en este incremento.
  
- **Valor y prioridad:** Medio. Habilita el seguimiento del progreso real y alimenta las estadísticas (`HU18`) y la replanificación (`HU15`); prioridad media tras consolidar el núcleo de planificación.
  
- **Estimación:** 1,5 días (orientativa; incluye persistencia individual de sesiones en SQLite, endpoints de cambio de estado y actualización visual).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario puede marcar una sesión propia como `completada` o `no_realizada`, así como devolverla a `pendiente` si la marcó por error.
  - **CA02:** El estado seleccionado persiste en SQLite asociado a la sesión y al usuario autenticado tras recargar o iniciar sesión en otro navegador, reflejándose visualmente en el calendario (`HU07`).
  - **CA03:** Repetir la misma actualización de estado es idempotente y no duplica sesiones ni tiempos contabilizados; al regenerar planes futuros se conservan las sesiones ya marcadas.
  - **CA04:** Un usuario no puede consultar ni modificar el estado de sesiones pertenecientes a otras cuentas.
    
- **Evidencias:** Pendiente de implementación (actualmente las sesiones de `HU06`/`HU07` son vistas previas en `localStorage` sin tabla de sesiones en SQLite).

## HU15 — Replanificación de sesiones pendientes

- **Issue:** [Issue #15](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/15)
  
- **Estado:** Propuesta (Abierta)
  
- **Historia:** Como usuario, quiero replanificar mis sesiones vencidas no realizadas en futuras franjas disponibles para recuperar el estudio pendiente.
  
- **Alcance:** Incluye la detección explícita de sesiones en estado `no_realizada` o vencidas en estado `pendiente` (excluyendo sesiones futuras aún no llegadas) y su recolocación automática en huecos disponibles futuros respetando clases (`HU05`), disponibilidad (`HU02`), descansos (`HU11`) y fechas límite (`HU04`).
  
- **Valor y prioridad:** Medio. Permite recuperar estudio perdido sin rehacer manualmente todo el horario; prioridad media tras `HU14`.
  
- **Estimación:** 2 días (orientativa; detección de sesiones elegibles, búsqueda de huecos sin solapamientos y protección frente a duplicados).
  
- **Criterios de aceptación:**
  - **CA01:** El sistema identifica únicamente las sesiones propias marcadas como `no_realizada` o vencidas en estado `pendiente`, sin alterar sesiones `completadas` ni sesiones futuras.
  - **CA02:** Al ejecutar la replanificación, los minutos pendientes se recolocan en franjas disponibles futuras respetando clases, bloqueos, descansos y plazos de entrega.
  - **CA03:** Si el tiempo libre disponible en el horizonte elegido no basta para absorber todas las sesiones pendientes, se informa claramente del déficit de minutos.
  - **CA04:** Ejecutar la replanificación varias veces no duplica sesiones ya recolocadas y mantiene el aislamiento entre usuarios.
    
- **Evidencias:** Pendiente de implementación.

## HU16 — Perfil y preferencias de aprendizaje

- **Issue:** [Issue #16](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/16)
  
- **Estado:** Propuesta (Abierta)
  
- **Historia:** Como usuario, quiero configurar un perfil de aprendizaje con mis preferencias de estudio para personalizar la generación de mis sesiones.
  
- **Alcance:** Incluye la configuración en SQLite por usuario de parámetros académicos de estudio: duración estándar preferida por bloque de estudio (en minutos) y franja horaria preferente de concentración (mañana, tarde o noche), sin duplicar la configuración de descansos (`HU11`) ni mezclarse con la personalización visual del avatar. Su aplicación efectiva en el reparto pertenece a `HU06`.
  
- **Valor y prioridad:** Medio. Adapta el tamaño y ubicación de las sesiones a los hábitos del estudiante; prioridad media-baja.
  
- **Estimación:** 2 días (orientativa; formulario de preferencias, persistencia en SQLite e integración con el generador `HU06`).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario puede configurar y modificar su duración preferida de sesión (validando un rango entero positivo) y su franja horaria preferente de concentración.
  - **CA02:** Las preferencias se guardan en SQLite asociadas al usuario autenticado y se aplican como parámetros por defecto al generar nuevos planes (`HU06`).
  - **CA03:** Si el usuario no ha configurado un perfil personalizado, el sistema aplica valores predeterminados válidos sin errores y aísla los datos entre cuentas.
    
- **Evidencias:** Pendiente de implementación (la personalización visual del avatar en *Inicio* se gestiona como mejora independiente de interfaz).

## HU17 — Importación del horario mediante imagen

- **Issue:** [Issue #17](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/17)
  
- **Estado:** Propuesta (Abierta)
  
- **Historia:** Como usuario, quiero subir una imagen de mi horario académico para que la aplicación detecte mis clases y pueda confirmarlas sin introducirlas una a una.
  
- **Alcance:** Incluye la subida de una imagen (PNG/JPG/WebP), la extracción asistida de propuestas de asignaturas, días y franjas horarias, y una pantalla de revisión manual antes de guardarlas en el horario de clases (`HU05`). No garantiza reconocimiento automático sin confirmación del usuario.
  
- **Valor y prioridad:** Bajo. Comodidad opcional de incorporación inicial, dado que el horario puede registrarse manualmente en `HU05`; prioridad baja.
  
- **Estimación:** 3 días (orientativa; sujeta a prueba técnica previa de librería OCR y reglas de revisión).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario puede subir una imagen en formato válido (`PNG`, `JPG`, `WebP`) dentro del límite de tamaño permitido, rechazándose archivos inválidos o dañados con mensajes claros.
  - **CA02:** El sistema extrae propuestas estructuradas de días y franjas horarias y las presenta en un formulario editable antes de persistirlas.
  - **CA03:** El usuario puede corregir, descartar o confirmar las clases detectadas, guardándose en SQLite bajo su cuenta y evitando duplicar franjas ya existentes.
    
- **Evidencias:** Pendiente de implementación.

## HU18 — Estadísticas y seguimiento del estudio

- **Issue:** [Issue #18](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18)
  
- **Estado:** Propuesta (Abierta)
  
- **Historia:** Como usuario, quiero consultar un resumen semanal de mi actividad de estudio para conocer el tiempo dedicado por asignatura y mi grado de cumplimiento.
  
- **Alcance:** Incluye un panel semanal (de lunes a domingo según fecha local) con cuatro indicadores calculados a partir de las sesiones persistidas en SQLite: tiempo total planificado en sesiones `completadas`, desglose por asignatura (agrupando tareas sin materia bajo «Sin asignatura»), recuento de sesiones `completadas` frente a `no_realizada`, y número y nombres de asignaturas distintas estudiadas. No incluye cronómetro de tiempo real (`#55`), gráficos avanzados ni históricos multianuales. Absorbe `HU22`, `HU24` y `HU25`.
  
- **Valor y prioridad:** Medio. Permite evaluar el cumplimiento semanal del plan; prioridad media tras disponer de sesiones con estado (`HU14`).
  
- **Estimación:** 3 días (orientativa; consolidando en una única entrega los indicadores de `HU22`, `HU24` y `HU25`).
  
- **Criterios de aceptación:**
  - **CA01:** El usuario consulta los indicadores correspondientes a la semana en curso (lunes a domingo), calculando las horas estudiadas únicamente a partir de la duración planificada de las sesiones marcadas como `completada`.
  - **CA02:** Se muestra el desglose de tiempo estudiado por asignatura (incluyendo la categoría «Sin asignatura» si existen sesiones de tareas no vinculadas a materia), cuya suma coincide con el total semanal.
  - **CA03:** Se muestra el número de sesiones `completadas` y el número de sesiones marcadas explícitamente como `no_realizada` (excluyendo las sesiones `pendientes`), así como el número y nombre de las asignaturas distintas con al menos una sesión completada.
  - **CA04:** Si no hay sesiones completadas en la semana, se muestran valores `0` sin errores; las métricas solo agregan datos del usuario autenticado y se actualizan al modificar o eliminar sesiones.
- **Evidencias:** Pendiente de implementación (requiere tabla persistente de sesiones de `HU14`).
  
## HU19 — Recordatorios

- **Issue:** [Issue #19](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/19)
  
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
  
- **Historia:** Como usuario, quiero recibir recordatorios dentro de la aplicación sobre mis próximos exámenes, tareas y entregas para no olvidar fechas importantes.
  
- **Alcance:** Incluye la generación y visualización de avisos internos en el panel *Inicio* para tareas, entregas y exámenes (`HU04`) próximos según el margen de antelación configurado por el usuario en SQLite (selector rápido en interfaz de mismo día, `1`, `3`, `7`, `14`, `30` o `60` días; validación en API entre `0` y `365` días; valor por defecto `7` días). No incluye notificaciones push, correos electrónicos ni recordatorios de sesiones de estudio individuales.
  
- **Valor y prioridad:** Bajo-medio. Facilita detectar entregas y exámenes cercanos desde el panel principal
  .
- **Estimación:** 2 días (orientativa; detección de eventos próximos, filtro por ventana de antelación y configuración persistente por usuario).
  
- **Criterios de aceptación:**
  - **CA01:** El panel *Inicio* muestra los recordatorios de tareas, entregas y exámenes propios cuya fecha cae dentro de la ventana de antelación configurada por el usuario (por defecto `7` días).
  - **CA02:** Cada recordatorio identifica claramente el título del evento, su tipo, la fecha y la asignatura asociada (si la tiene).
  - **CA03:** El usuario puede modificar los días de antelación desde *Inicio* sin recargar la página, validándose en el servidor el rango entero `0–365` días y persistiendo la preferencia en SQLite por usuario.
  - **CA04:** Los recordatorios y su configuración están aislados por cuenta autenticada y no muestran eventos de otros usuarios.
    
- **Evidencias:** Implementado en `main` (`app.py`, `templates/index.html`, `static/app.js`) y verificado mediante `tests/test_configuracion_recordatorios.py`, `tests/test_app.py` y `tests/examenes-form.test.js`.

## HU20 — Registro de usuario

- **Issue:** [Issue #20](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/20)

- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)

- **Historia:** Como usuario, quiero poder registrarme con una cuenta propia para guardar mi planificación y acceder a ella posteriormente.

- **Alcance:** Incluye el alta de nuevas cuentas mediante nombre/usuario, correo electrónico y contraseña en SQLite, habilitando el aislamiento de todos los datos académicos y de planificación por usuario. No incluye recuperación de contraseña (`HU43`).

- **Valor y prioridad:** Alto (base transversal). Aunque no es una función específica de estudio, resulta indispensable para persistir y aislar los datos de cada estudiante; implementada en Sprint 1.

- **Estimación:** 2 días (orientativa; formulario, validaciones de correo/contraseña y almacenamiento seguro en SQLite).

- **Criterios de aceptación:**
  - **CA01:** El usuario puede crear una cuenta nueva introduciendo datos válidos (usuario, correo con formato válido y contraseña conforme a la política de la aplicación).
  - **CA02:** El sistema rechaza correos ya registrados o campos vacíos/inválidos mostrando mensajes comprensibles sin crear duplicados.
  - **CA03:** Las credenciales se almacenan de forma segura (hash de contraseña, nunca en texto plano) y todos los registros posteriores quedan vinculados exclusivamente a esa cuenta.

- **Evidencias:** Implementado en `main` (`app.py`, `templates/login.html` / `templates/register.html`) y verificado mediante `tests/test_app.py`.

## HU21 — Inicio de sesión

- **Issue:** [Issue #22](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/22)

- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)

- **Historia:** Como usuario, quiero iniciar y cerrar sesión para acceder de forma privada a mi cuenta y a mi planificación guardada.

- **Alcance:** Incluye la autenticación mediante credenciales registradas, gestión de sesión de usuario en Flask, cierre de sesión y bloqueo de acceso a vistas y endpoints privados para usuarios no autenticados.

- **Valor y prioridad:** Alto (base transversal). Permite recuperar y proteger los datos privados de cada cuenta; implementada en Sprint 1.

- **Estimación:** 1 día (orientativa; verificación de credenciales, sesión activa y control de acceso).

- **Criterios de aceptación:**
  - **CA01:** El usuario puede iniciar sesión con sus credenciales válidas y acceder a sus asignaturas, horarios, tareas y planificación.
  - **CA02:** Ante credenciales incorrectas o inexistentes, el sistema deniega el acceso e informa mediante un mensaje claro sin exponer datos internos.
  - **CA03:** El usuario puede cerrar sesión en cualquier momento; las rutas y APIs privadas rechazan peticiones sin sesión autenticada.

- **Evidencias:** Implementado en `main` (`app.py`, `static/app.js`) y verificado mediante `tests/test_app.py`.

## HU22 — Horas estudiadas semanalmente

- **Issue:** [Issue #23](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/23)

- **Estado:** Absorbida (Cerrada como duplicada de [HU18](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18))

- **Historia:** Como usuario, quiero consultar el total de horas estudiadas durante la semana para evaluar mi dedicación.

- **Alcance:** Indicador consolidado íntegramente como criterio de aceptación dentro del panel semanal de `HU18` (*Estadísticas y seguimiento del estudio*). No se estima ni desarrolla por separado.

- **Evidencias:** Absorbida documentalmente en `HU18` (`#18`).

## HU23 — Apartado individual por asignatura

- **Issue:** [Issue #24](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/24)

- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)

- **Historia:** Como usuario, quiero disponer de un apartado individual para cada asignatura para consultar y organizar de forma separada la información de cada materia.

- **Alcance:** Incluye una vista de detalle filtrada por asignatura accesible desde la lista de materias (`HU01`), mostrando sus parámetros configurados (`HU12`, `HU13`), temario (`HU26`) y actividades o exámenes vinculados (`HU04`).

- **Valor y prioridad:** Alto. Facilita organizar el contenido y seguimiento específico de cada materia; implementada en Sprint 2.

- **Estimación:** 1 día (orientativa; navegación por asignatura y consultas filtradas por materia y usuario).

- **Criterios de aceptación:**
  - **CA01:** Cada asignatura creada dispone de su propio apartado o vista individual accesible desde la lista de asignaturas.
  - **CA02:** El apartado muestra exclusivamente la información, temas y actividades asociadas a la asignatura seleccionada.
  - **CA03:** El usuario solo puede acceder a los apartados de sus propias asignaturas, rechazándose el acceso a materias de otras cuentas.

- **Evidencias:** Implementado en `main` (`app.py`, `templates/index.html`, `static/app.js`) y verificado mediante `tests/test_app.py`.

## HU24 — Seguimiento de sesiones de estudio

- **Issue:** [Issue #25](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/25)

- **Estado:** Absorbida (Cerrada como duplicada de [HU18](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18))

- **Historia:** Como usuario, quiero ver cuántas sesiones he completado y cuántas no he realizado en la semana para medir mi cumplimiento.

- **Alcance:** Recuento de sesiones `completadas` y `no_realizada` consolidado dentro de `HU18` (*Estadísticas y seguimiento del estudio*), apoyándose en el registro de estado de `HU14`. No se estima por separado.

- **Evidencias:** Absorbida documentalmente en `HU18` (`#18`).

## HU25 — Asignaturas estudiadas semanalmente

- **Issue:** [Issue #26](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/26)

- **Estado:** Absorbida (Cerrada como duplicada de [HU18](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18))

- **Historia:** Como usuario, quiero consultar el número y nombre de las asignaturas distintas estudiadas en la semana para comprobar si reparto bien mi estudio.

- **Alcance:** Indicador consolidado íntegramente dentro de `HU18` (*Estadísticas y seguimiento del estudio*). No se estima ni desarrolla por separado.

- **Evidencias:** Absorbida documentalmente en `HU18` (`#18`).
  
## HU26 — Gestión del temario por asignatura

- **Issue:** [Issue #27](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/27)

- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)

- **Historia:** Como usuario, quiero añadir y gestionar el temario de cada asignatura marcando los temas pendientes o estudiados para controlar los contenidos que me faltan por preparar.

- **Alcance:** Incluye el alta, consulta, edición, borrado y cambio de estado (`pendiente` / `estudiado`, con posibilidad de reversión) de los temas asociados a cada asignatura propia dentro de su apartado individual (`HU23`) en SQLite.

- **Valor y prioridad:** Alto. Permite desglosar el contenido de cada materia y seguir su avance; implementada en Sprint 2 / Sprint 4.

- **Estimación:** 1 día (orientativa; operaciones CRUD de temas vinculados a asignaturas, estado y validación de pertenencia).

- **Criterios de aceptación:**
  - **CA01:** El usuario puede añadir, editar y eliminar temas o contenidos dentro de cualquiera de sus asignaturas propias.
  - **CA02:** El usuario puede marcar cada tema como estudiado o devolverlo a pendiente, consultando claramente qué contenidos quedan por estudiar.
  - **CA03:** El sistema rechaza títulos vacíos y garantiza en SQLite que ningún usuario pueda consultar o modificar el temario de asignaturas ajenas.

- **Evidencias:** Implementado en `main` (`app.py`, `templates/index.html`, `static/app.js`) y verificado mediante `tests/test_app.py`.

## HU27 — Lista de To-Dos

- **Issue:** [Issue #29](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/29)

- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)

- **Historia:** Como usuario, quiero disponer de una lista rápida de To-Dos para anotar y gestionar tareas pendientes sueltas sin fecha límite obligatoria.

- **Alcance:** Incluye el alta, edición, borrado y cambio de estado (`pendiente` / `completada`, reversible) de notas rápidas persistidas en SQLite por usuario en la vista *To-Dos Rápidos*. No incluye fechas límite ni planificación automática en el calendario (cubiertas por `HU04` y `HU06`).

- **Valor y prioridad:** Medio. Facilita anotar recordatorios o tareas rápidas del día a día sin sobrecargar el planificador académico; implementada en Sprint 1.

- **Estimación:** 1 día (orientativa; operaciones CRUD de To-Dos, cambio de estado y persistencia por usuario).

- **Criterios de aceptación:**
  - **CA01:** El usuario puede crear un nuevo To-Do con título válido, editar su texto y eliminarlo.
  - **CA02:** El usuario puede marcar un To-Do como completado o desmarcarlo a pendiente, diferenciándose visualmente ambos estados.
  - **CA03:** La API valida las entradas (rechazando títulos vacíos o valores no booleanos en el estado, y devolviendo `404` si el elemento no existe o pertenece a otra cuenta) y persiste los datos en SQLite por usuario.

- **Evidencias:** Implementado en `main` (`app.py`, `templates/index.html`, `static/app.js`) y verificado mediante `tests/test_app.py` (incluidas las validaciones de `#34` y `#35`).

## HU28 — Filtrar To-Dos por estado

- **Issue:** [Issue #36](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/36)

- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)

- **Historia:** Como usuario, quiero filtrar mi lista de To-Dos entre todas, pendientes y completadas para centrarme en las tareas que requieren atención.

- **Alcance:** Incluye el filtrado visual en la vista *To-Dos Rápidos* (`HU27`) para mostrar todas las tareas, solo las pendientes o solo las completadas del usuario activo, sin alterar los registros almacenados en SQLite.

- **Valor y prioridad:** Medio. Mejora la claridad cuando la lista rápida acumula varias tareas; implementada en Sprint 3.

- **Estimación:** 1 día (orientativa; lógica de filtrado por estado, manejo de lista vacía y aislamiento por usuario).

- **Criterios de aceptación:**
  - **CA01:** El usuario puede alternar entre visualizar todas las tareas rápidas, únicamente las pendientes o únicamente las completadas.
  - **CA02:** Aplicar o cambiar el filtro es una operación de consulta que no modifica ni elimina los datos persistidos en SQLite.
  - **CA03:** Cuando no existen tareas que coincidan con el filtro seleccionado, se muestra un estado vacío sin errores y respetando el aislamiento entre usuarios.

- **Evidencias:** Implementado en `main` (`templates/index.html`, `static/app.js`) y verificado en `tests/test_app.py`.

## HU29 — Buscar To-Dos por título

- **Issue:** [Issue #37](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/37)

- **Estado:** Preparada (Abierta)

- **Historia:** Como usuario, quiero buscar tareas de mi lista de To-Dos por palabras de su título para localizar rápidamente una anotación cuando tenga muchas.

- **Alcance:** Incluye un campo de búsqueda por texto sobre los títulos de la lista *To-Dos Rápidos* (`HU27`). No busca sobre las actividades académicas de `HU04`.

- **Valor y prioridad:** Medio. Agiliza localizar notas rápidas en listas extensas sin bloquear el uso básico de `HU27`; prioridad media-baja.

- **Estimación:** 1 día (orientativa; filtrado por coincidencia parcial de texto y pruebas con filtro combinado).

- **Criterios de aceptación:**
  - **CA01:** El usuario puede filtrar sus To-Dos escribiendo texto parcial contenido en el título, sin distinguir entre mayúsculas y minúsculas.
  - **CA02:** La búsqueda puede combinarse con el filtro de estado (`HU28`) y muestra un resultado vacío sin errores cuando no hay coincidencias.
  - **CA03:** La consulta no modifica los datos almacenados y opera exclusivamente sobre los To-Dos del usuario autenticado.

- **Evidencias:** Pendiente de implementación.

## HU30 — Navegación completa mediante teclado

- **Issue:** [Issue #38](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/38)

- **Estado:** Preparada (Abierta)

- **Historia:** Como usuario, quiero acceder y manejar las funciones principales mediante el teclado para poder usar el planificador con autonomía sin depender del ratón.

- **Alcance:** Incluye el recorrido lógico mediante teclado y foco visible en las pantallas principales: menú lateral, autenticación (`HU20`, `HU21`), gestión de asignaturas (`HU01`), actividades (`HU04`), lista de To-Dos (`HU27`) y calendario semanal (`HU07`).

- **Valor y prioridad:** Alto. Elimina una barrera crítica de acceso para usuarios que operan sin ratón; prioridad alta de accesibilidad.

- **Estimación:** 2 días (orientativa; revisión de orden de tabulación, gestión de foco en modales y pruebas manuales sin ratón).

- **Criterios de aceptación:**
  - **CA01:** Todos los controles interactivos de las vistas principales pueden recorrerse en orden lógico mediante `Tab` y `Mayús+Tab` y activarse con `Intro` o `Espacio`.
  - **CA02:** El indicador de foco es claramente visible en todo momento y no queda atrapado en menús, diálogos ni controles personalizados (devolviendo el foco al cerrar modales).
  - **CA03:** El usuario puede completar sin ratón los flujos principales de crear una tarea/asignatura y consultar el calendario semanal.

- **Evidencias:** Pendiente de implementación y verificación manual mediante navegación exclusiva por teclado.

## HU31 — Etiquetas accesibles para lectores de pantalla

- **Issue:** [Issue #39](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/39)

- **Estado:** Preparada (Abierta)

- **Historia:** Como usuario, quiero que los controles y mensajes tengan nombres accesibles y una estructura semántica comprensible para poder utilizar el planificador mediante un lector de pantalla

- **Alcance:** Incluye la incorporación de etiquetas asociadas, jerarquía de encabezados, regiones ARIA de navegación y anuncios de estado en las vistas principales (acceso, asignaturas, tareas, To-Dos y calendario), sin alterar la lógica de negocio.

- **Valor y prioridad:** Alto. Permite comprender y operar la interfaz a personas que dependen de tecnología asistiva; prioridad alta de accesibilidad.

- **Estimación:** 2 días (orientativa; auditoría semántica HTML/ARIA y comprobación con lector de pantalla).

- **Criterios de aceptación:**
  - **CA01:** Todos los campos de formulario (registro, inicio de sesión, asignaturas, actividades y To-Dos) cuentan con etiquetas accesibles inequívocas asociadas (`label` o `aria-label`).
  - **CA02:** Las vistas presentan encabezados jerarquizados (`h1`–`h3`), regiones de navegación identificables y nombres descriptivos en los botones compuestos únicamente por iconos.
  - **CA03:** Los cambios relevantes de estado o confirmación se comunican de forma perceptible al lector de pantalla (`aria-live` o equivalente).

- **Evidencias:** Pendiente de implementación y comprobación con lector de pantalla.

## HU32 — Modo de alto contraste

- **Issue:** [Issue #40](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/40)

- **Estado:** Preparada (Abierta)

- **Historia:**Como usuario, quiero activar un modo de alto contraste para distinguir con claridad todos los textos, bordes y controles de la interfaz.

- **Alcance:** Incluye un selector accesible de modo de alto contraste aplicado a las vistas principales, formularios y calendario, conservando la preferencia en el navegador (`localStorage`) y coexistiendo con los temas claro y oscuro de `HU40`.

- **Valor y prioridad:** Medio. Mejora la legibilidad para baja visión sin modificar la lógica del planificador; prioridad media.

- **Estimación:** 1 día (orientativa; paleta de alto contraste, selector persistente y comprobación de ratios WCAG AA).

- **Criterios de aceptación:**
  - **CA01:** El usuario puede activar y desactivar el modo de alto contraste desde la interfaz sin recargar la página, conservándose la elección en el navegador entre sesiones.
  - **CA02:** Textos, bordes de tarjetas, iconos informativos y controles interactivos cumplen como mínimo el contraste exigido por WCAG AA frente a su fondo.
  - **CA03:** Ninguna información o estado se comunica exclusivamente mediante color (se acompaña de texto, iconos o bordes diferenciados) y el modo coexiste sin conflictos con `HU40`.

- **Evidencias:** Pendiente de implementación y revisión visual de contraste.

## HU33 — Adaptación a texto ampliado

- **Issue:** [Issue #41](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/41)

- **Estado:** Preparada (Abierta)

- **Historia:** Como usuario, quiero poder ampliar el texto o el zoom del navegador sin perder información ni funciones para leer cómodamente el horario y las tareas.

- **Alcance:** Incluye el ajuste responsivo de contenedores, formularios, listas y calendario semanal (`HU07`) para soportar ampliación hasta el 200 % sin recortes ni solapamientos.

- **Valor y prioridad:** Medio. Evita pérdida de contenido o controles inaccesibles al aumentar el tamaño de fuente; prioridad media.

- **Estimación:** 2 días (orientativa; ajustes CSS adaptables y pruebas manuales al 200 % de zoom).

- **Criterios de aceptación:**
  - **CA01:** Con el zoom del navegador al 200 %, todos los textos, etiquetas y botones principales siguen siendo legibles y operables.
  - **CA02:** No se recortan nombres de asignaturas, horas ni acciones esenciales sin ofrecer visibilidad completa o alternativa accesible.
  - **CA03:** Formularios, tarjetas y calendario semanal se redistribuyen sin superposiciones ni desplazamiento horizontal bloqueante en anchuras reducidas.

- **Evidencias:** Pendiente de implementación y verificación manual al 200 % de zoom.

## HU34 — Preferencia de movimiento reducido

- **Issue:** [Issue #42](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/42)

- **Estado:** Preparada (Abierta)

- **Historia:** Como usuario, quiero que la interfaz reduzca los movimientos y transiciones visuales cuando así lo tenga configurado para utilizarla sin distracciones ni molestias.

- **Alcance:** Incluye la detección de la preferencia del sistema operativo (`prefers-reduced-motion: reduce`) en las hojas de estilo de la aplicación para desactivar animaciones decorativas y transiciones no esenciales.

- **Valor y prioridad:** Medio. Reduce barreras visuales para usuarios sensibles al movimiento con un cambio acotado en estilos; prioridad media.

- **Estimación:** 1 día (orientativa; reglas CSS de movimiento reducido y comprobación en navegación).

- **Criterios de aceptación:**
  - **CA01:** Cuando el sistema operativo tiene activada la preferencia de movimiento reducido, las animaciones decorativas y transiciones no esenciales se desactivan o reducen al mínimo.
  - **CA02:** Si el usuario cambia la preferencia en su sistema, la interfaz actualiza su comportamiento sin requerir cambios en sus datos.
  - **CA03:** Todas las vistas, modales y acciones siguen funcionando completamente sin depender de animaciones.

- **Evidencias:** Pendiente de implementación.

## HU35 — Errores de formularios comprensibles y accesibles

- **Issue:** [Issue #43](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/43)

- **Estado:** Preparada (Abierta)

- **Historia:** Como usuario, quiero recibir mensajes claros y accesibles cuando introduzco datos incorrectos en un formulario para saber cómo corregirlos sin perder lo escrito.

- **Alcance:** Incluye la validación comprensible y vinculación accesible de mensajes de error en los formularios principales (registro, inicio de sesión, asignaturas, horarios, tareas/exámenes y To-Dos).

- **Valor y prioridad:** Alto. Evita bloqueos ante fallos de entrada de datos y mejora la usabilidad general y con tecnologías asistivas; prioridad alta.

- **Estimación:** 2 días (orientativa; mensajes asociados por campo, conservación de datos válidos y pruebas de validación).

- **Criterios de aceptación:**
  - **CA01:** Cada campo con datos inválidos muestra un mensaje claro junto al campo indicando el motivo del error y cómo corregirlo, sin depender únicamente del color.
  - **CA02:** El mensaje de error está programáticamente asociado al campo correspondiente (`aria-describedby` / `aria-invalid`) para su lectura por tecnologías asistivas.
  - **CA03:** Tras un error de validación en cliente o servidor, se conservan los datos válidos ya introducidos en el formulario para no obligar a reescribirlos.

- **Evidencias:** Pendiente de implementación.
  
## HU36 — Exportación ICS

[Issue #44](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/44)

**Alcance y criterios principales:** Exportar sesiones propias en calendario interoperable.

## HU37 — Exportación de datos personales

[Issue #45](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/45)

**Alcance y criterios principales:** Descargar JSON propio sin credenciales ni datos de terceros.

## HU38 — Deshacer eliminación de To-Do

[Issue #46](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/46)

**Alcance y criterios principales:** Recuperar eliminación accidental durante al menos diez segundos.

## HU39 — Confirmación de cambios sin guardar

[Issue #47](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/47)

**Alcance y criterios principales:** Avisar antes de descartar formularios modificados.

## HU40 — Modo claro y oscuro

[Issue #50](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/50)

**Alcance y criterios principales:** Alternar tema, persistir elección y respetar preferencia del sistema.

## HU41 — Aprovechamiento del ancho del panel

[Issue #51](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/51)

**Alcance y criterios principales:** Diseño adaptable que aprovecha el espacio y distribuye las tarjetas.

## HU42 — Horario semanal automático

[Issue #52](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/52)

**Alcance y criterios principales:** Issue cerrada como duplicada de HU06, HU07, HU09 y HU11; no duplicar desarrollo.

## HU43 — Recuperación segura de contraseña

[Issue #53](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/53)

**Alcance y criterios principales:** Solicitud de enlace de un solo uso, caducidad, protección contra enumeración de cuentas y restablecimiento.

## HU44 — Reto diario de ajedrez

[Issue #54](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/54)

**Alcance y criterios principales:** Tablero 8×8; cinco ejercicios diarios de mate en una jugada; pistas, reintentos y progreso local por usuario y fecha. La sección actual se llama **Ajedrez**. Flask obtiene problemas de Chess Puzzle API y mantiene cinco puzzles locales de reserva si el servicio falla o devuelve datos incompletos; las soluciones no se envían al navegador.

## Cambios funcionales relacionados, sin HU nueva

- **HU02/HU06/HU07:** selección interactiva de franjas horarias bloqueadas, generación y recuperación del horario semanal (`static/plan.js`, `tests/plan.test.js`).
- **HU04:** validación de fechas límite y distinción entre tareas y exámenes (bug [#48](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/48)).
- **HU16:** avatar personalizable con banderas y escudos de equipos de LaLiga Primera y Segunda, Premier League, Bundesliga, Serie A y Ligue 1 (`static/avatar-flags.js`, `app.py`; `tests/avatar-flags.test.js`, `tests/test_escudos.py`). Los escudos dependen de un proveedor externo.
- **HU40:** ajustes de la paleta roja del tema claro.
- **HU44:** reto diario disponible en la pestaña Ajedrez; `tests/daily-chess.test.js` contiene pruebas con respuestas simuladas.

**Verificación:** tras integrar los cambios del dashboard, `npm.cmd run test:all` pasó el 23/11/2026: 157 pruebas Jest y 178 Python. **Reejecución posterior, tras corregir el reparto de horas extra y el módulo de tareas/entregas (23/11/2026):** 157 pruebas Jest y 178 Python. **Última reejecución, tras permitir desvincular tareas y equilibrar su planificación con los objetivos de las asignaturas (23/11/2026):** 157 pruebas Jest y 178 Python. La API externa no se probó en vivo y no se hizo una revisión visual completa en navegador; además, el test frontend titulado «fallo de la API se muestra al usuario» no tiene aserciones.


## Actualización de estados — 22/11/2026

Se han marcado como **Completed** en GitHub las historias con implementación incorporada a `main`:

- **HU07 — Calendario semanal:** [issue #7](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/7).
- **HU40 — Modo claro y oscuro:** [issue #50](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/50).
- **HU44 — Reto diario de ajedrez:** [issue #54](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/54).

El cierre indica que se ha incorporado la funcionalidad; **no certifica una ejecución satisfactoria de la batería de pruebas ni una revisión manual**. HU06, HU13 y HU41 conservan su estado abierto por verificaciones o criterios pendientes; las propuestas no implementadas no se marcan como completadas.


### 22/11/2026 — HU44: cinco ejercicios diarios y corrección de «Reintentar»

- Se amplía el reto a **cinco ejercicios diarios** de mate en una jugada, resueltos consecutivamente, con progreso visible de 0/5 a 5/5 y orden dependiente de la fecha.
- Se corrige el botón **Reintentar**: reinicia la posición y permite repetir incluso tras completar los cinco, conservando los ejercicios anteriores; el ejercicio repetido se descuenta hasta volver a resolverlo.
- Se utiliza `localStorage` con clave versión `v2`, separada por correo y fecha, para guardar el conjunto de ejercicios completados.
- En esa entrega se documentaron siete pruebas frontend. El archivo ha cambiado desde entonces; consultar la suite actual y la verificación posterior de 23/11/2026.
- Cambios en `static/daily-chess.js` y `tests/daily-chess.test.js`; [HU44 #54](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/54) permanece cerrada como implementada, sin afirmar validación de pruebas.


## 22/11/2026 — HU44: migración del ajedrez a API externa

**Cambio:** las cinco posiciones ya no están definidas en `static/daily-chess.js`. Flask consulta [Chess Puzzle API](https://github.com/mauricioulloa/chess-puzzle-api), basada en la base abierta de puzzles de Lichess (CC0), solicitando cinco problemas con tema `mateIn1`. La fuente entrega `positionFen` y el color del jugador; las soluciones se consultan por ID mediante `/v1/puzzles/{id}/solution`. La API externa no requiere clave según su documentación pública.

**Arquitectura:** navegador → `GET /api/ajedrez/diario` (Flask) → Chess Puzzle API; navegador → `POST /api/ajedrez/comprobar` → Flask. Las soluciones se guardan únicamente en la caché del backend y no se incluyen en la respuesta que carga el tablero. Caché en memoria por día, sin persistencia en base de datos; progreso de los cinco ejercicios en `localStorage` por usuario y fecha (`studyplan:chess-daily:api:v1`).

**Comportamiento inicial (antes del cambio de reserva local registrado más abajo):** tablero 8×8, cinco mates en una jugada, pistas, validación en el servidor y botón Reintentar. En esa primera versión, una indisponibilidad del proveedor podía producir 503 y no había puzzles de reserva. La implementación posterior añadió cinco puzzles locales para ese caso.

**Archivos:** `app.py`, `static/daily-chess.js`, `tests/daily-chess.test.js` y `tests/test_chess_api.py`. Las pruebas usan respuestas simuladas y no dependen de Internet. La integración externa real no está certificada por esas pruebas.

**Servicios utilizados en el proyecto:** países y banderas → [FlagCDN](https://flagcdn.com/) (CDN de imágenes PNG por código ISO, no API JSON); fútbol → [ESPN](https://site.api.espn.com/) (API JSON de equipos y escudos, consultada desde Flask); ajedrez → [Chess Puzzle API](https://chess.mauriulloa.com/) (API JSON de problemas basada en datos de Lichess).


## 22/11/2026 — HU44: pestaña propia de Ajedrez

- Se retira el tablero del panel **Inicio** y se añade **Ajedrez** a la navegación principal (`data-tab="ajedrez"`, `id="tab-ajedrez"`). Inicio vuelve a priorizar el saludo, las métricas y los módulos de estudio.
- El tablero, las pistas, Reintentar y el progreso 0/5–5/5 se mantienen dentro de la nueva sección. No se cambian los endpoints Flask ni el proveedor externo.
- **Carga diferida:** la API solo se consulta al abrir la sección Ajedrez; se conserva el acceso directo mediante `#ajedrez` y la lógica de pestañas existente.
- Archivos: `templates/index.html`, `static/daily-chess.js`, `tests/daily-chess.test.js` (caso añadido para evitar llamadas desde Inicio).
- Pendiente ejecutar pruebas y verificar visualmente la navegación, incluido acceso por URL y dispositivos móviles.


### 22/11/2026 — Corrección del tablero vacío en la pestaña Ajedrez

- **Síntoma:** se veían las 64 casillas, pero no aparecían piezas ni se iniciaba la carga de los cinco ejercicios.
- **Causa:** el listener de `static/daily-chess.js` comprobaba `tab-ajedrez.active` durante el clic, antes de que `static/app.js` terminara de activar la pestaña. La condición de carga diferida impedía ejecutar `init()`.
- **Solución:** programar la comprobación con `setTimeout(activate, 0)` para que ocurra después de los listeners del clic. Se mantiene la carga diferida y se evita pedir dos veces los ejercicios.
- **Prueba de regresión:** `tests/daily-chess.test.js` comprueba que al pasar de Inicio a Ajedrez se realiza una única petición y se dibujan las piezas. **Ejecución de tests y consulta real a la API pendientes de verificar.**


### 22/11/2026 — Corrección definitiva del tablero completamente blanco

Se identificó una **SyntaxError** en `static/daily-chess.js`: la edición anterior introdujo secuencias de texto literales `\\n` dentro del listener de la pestaña, fuera de cadenas. El navegador detenía toda la ejecución del archivo, de modo que ni siquiera se generaban las 64 casillas. Se sustituyeron por saltos de línea reales y se comprobó que el JavaScript resultante se puede compilar con `new Function(...)` sin errores de sintaxis. La verificación de la API real y de las pruebas completas sigue pendiente.


### 22/11/2026 — HU44: evitar tablero sin piezas cuando falla Chess Puzzle API

- Se mantiene Chess Puzzle API como proveedor principal de los cinco problemas de mate en una jugada.
- Si la API no responde, agota el tiempo o devuelve un lote incompleto, `app.py` utiliza **cinco posiciones locales de reserva** con FEN y solución UCI. El contrato de `/api/ajedrez/diario` y `/api/ajedrez/comprobar` permanece idéntico y las soluciones siguen ocultas al cliente.
- Esto evita que la indisponibilidad de la API externa deje el tablero sin piezas. La reserva se almacena en la caché diaria en memoria; el progreso del usuario continúa en `localStorage`.
- Se añade prueba backend `test_external_api_down_uses_five_local_puzzles` con API simulada caída. La integración externa real y la ejecución de la batería completa siguen pendientes de verificación.


### 22/11/2026 — HU44: restauración de carga inicial del ajedrez

- Tras mover el módulo de Inicio a una pestaña propia, se había añadido una condición de carga diferida dependiente de `tab-ajedrez.active`. Ante el reporte persistente de tablero sin piezas, se elimina esa dependencia.
- `static/daily-chess.js` vuelve a ejecutar `init()` al cargar el documento, igual que cuando el ajedrez estaba en Inicio. La sección sigue siendo independiente y oculta hasta seleccionarla, pero el tablero se rellena en segundo plano.
- `tests/daily-chess.test.js` sustituye los casos de carga diferida por una regresión que comprueba la obtención de piezas aun cuando la pestaña no esté activa.
- No se cambia el proveedor Chess Puzzle API ni los endpoints Flask; se mantiene el respaldo local si falla el proveedor.
- En ese momento quedaba pendiente ejecutar las pruebas y comprobar el comportamiento en un navegador; el resultado posterior se registra a continuación.

### 23/11/2026 — Verificación posterior de HU44

- `npm.cmd run test:all` pasó con 157 pruebas Jest y 178 pruebas Python tras integrar los cambios del dashboard.
- Reejecución posterior, tras corregir el reparto de horas extra y el módulo de tareas/entregas: 157 pruebas Jest y 178 pruebas Python.
- Última reejecución tras corregir la desvinculación y el reparto de tiempo de las tareas: 157 pruebas Jest y 178 pruebas Python.
- La suite incluye una prueba backend con fallo externo simulado que comprueba los cinco puzzles locales de reserva.
- No se hizo una petición de verificación al proveedor externo real; su disponibilidad queda fuera del resultado de la suite.

### 23/11/2026 — HU40: rediseño visual del modo claro (Ocean)

- Se sustituye la paleta de marca rojo granate por azul marino, azul eléctrico y turquesa; fondos blanco y gris azulado, tipografía oscura de alto contraste.
- Se actualizan las variables CSS globales del tema claro, el encabezado de bienvenida, avatar, navegación activa y hover, badges, estados del planificador, bordes y enfoque por teclado.
- Se conservan colores semánticos de errores (rojo), éxito (verde) y avisos (ámbar); no se cambia el modo oscuro ni la lógica JavaScript.
- Archivo: `static/style.css`. Pendiente validación visual en navegador y revisión de contraste en todas las vistas.

### 23/11/2026 — HU06/HU07: resumen semanal del plan en Inicio

- Se añade al final del dashboard **Mi plan de estudio semanal**, con tarjetas para los siete días y las sesiones.
- Si no hay un plan válido guardado para el usuario en el navegador, aparece **«Aún no has generado tu plan de estudio»** y un botón para abrir Plan de Estudio.
- Se reutiliza la clave `studyplan:plan-semanal:v1:<correo>` de `localStorage`; Inicio muestra el plan al generarlo y al restaurarlo, sin peticiones adicionales.
- El botón «Ver plan completo» abre la sección donde se genera el horario. La vista se adapta a pantallas pequeñas y a ambos temas.
- Archivos: `templates/index.html`, `static/plan.js`, `static/style.css` y `tests/plan.test.js`.
- Las pruebas automatizadas pasaron tras resolver el merge: 157 pruebas Jest y 178 Python. En la reejecución posterior a las correcciones de reparto y tareas/entregas, pasaron 157 pruebas Jest y 178 Python; la última reejecución, tras los cambios de desvinculación y reparto de tareas, pasó 157 pruebas Jest y 178 Python. Queda pendiente la comprobación visual manual.


## 23/11/2026 — Minijuegos junto al ajedrez: Sudoku diario, 2048 y Simon

**Alcance:** sección de navegación «Juegos mentales» (antigua «Ajedrez»), que conserva el reto de cinco problemas de ajedrez y añade tres tarjetas responsive.

**Sudoku diario (API REST propia Flask):** `GET /api/juegos/sudoku/diario` devuelve fecha y cuadrícula 9×9 sin solución; `POST /api/juegos/sudoku/comprobar` recibe la cuadrícula, valida formato y pistas inmutables y comprueba filas, columnas y bloques 3×3. El tablero se genera de manera determinista con fecha y SHA-256; el progreso se guarda en `localStorage` por usuario y fecha. El generador elimina 45 celdas de una solución válida; **no garantiza unicidad de solución**, por lo que el servidor acepta cualquier solución válida que respete las pistas. Sin API externa ni clave.

**2048 (Web APIs estándar):** implementación propia de desplazamiento y fusión de fichas (cada ficha se fusiona como máximo una vez por movimiento), generación de fichas 2/4 con `crypto.getRandomValues` cuando está disponible, teclado/flechas táctiles, puntuación, nueva partida y persistencia por usuario con `localStorage`. No necesita API externa ni acceso a red. La ruta `GET /api/juegos/configuracion` expone reglas de 2048 y Simon.

**Simon (Web APIs estándar):** cuatro colores, secuencia aleatoria con Web Crypto cuando está disponible, reproducción con `setTimeout`, verificación de pulsaciones, incremento de rondas, reintento y récord por usuario en `localStorage`. Sin API externa ni claves.

**Legalidad y atribución:** todo el código nuevo es original; se usan APIs estándar del navegador y endpoints propios del backend, no se copian recursos de terceros. El servicio de ajedrez mantiene su integración externa separada. El uso de APIs públicas del navegador no requiere licencia comercial adicional ni API key.

**Archivos:** `templates/index.html`, `static/mini-games.js`, `static/style.css`, `app.py`, `package.json`, `tests/mini-games.test.js`, `tests/test_mini_games.py`.

**Pruebas escritas:** cinco casos frontend (sintaxis, Sudoku, 2048 tablero, movimiento, Simon) y siete backend (generación determinista, reglas de Sudoku, contrato, validación, pistas, solución, configuración). **Pendiente ejecutar las baterías y revisión visual**; no se afirma que estén pasando.

**Criterios de aceptación:** acceso desde Juegos mentales; ajedrez preservado; Sudoku estable en el mismo día con validación del servidor; 2048 fusiona correctamente y conserva puntuación; Simon reproduce y comprueba secuencias; interfaz adaptable a móvil; estado conservado por usuario.


## HU55 — Ranking privado de horas de estudio con amigos (pendiente)

**Como** estudiante registrado, **quiero** añadir amigos y consultar un ranking de las horas reales que hemos estudiado, **para** comparar nuestro progreso y motivarnos.

**GitHub:** https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/55

**Resumen:** solicitudes de amistad, registro de sesiones reales con pausas, clasificación privada semanal/mensual/acumulada, consentimiento para compartir estadísticas, estados vacíos y diseño responsive. El servidor debe calcular los minutos efectivos y verificar la autorización de cada consulta; las horas planificadas no cuentan como estudiadas.

**Aceptación:** autenticación; amistad aceptada; sesiones finalizadas y sin pausas; cálculo correcto por periodo; empates; privacidad; retirada de consentimiento; pruebas unitarias backend y frontend.

**Estado:** pendiente de desarrollo. No se ha modificado la aplicación.

# Historias de usuario

Recopilación del Product Backlog a partir de las [issues de GitHub](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues). Se conservan el valor, la estimación y los criterios de aceptación publicados en cada issue. En GitHub, el valor se expresa como nivel (por ejemplo, «Muy alto»); no se sustituye por una prioridad distinta.

Estado histórico del documento original (HU01–HU27). Las HU posteriores se incorporan a continuación; consultar cada issue para conocer su estado actual.

Para garantizar la coherencia funcional y el cumplimiento de los criterios **INVEST** (*Independent, Negotiable, Valuable, Estimable, Small, Testable*) a lo largo de todas las historias de usuario (`HU01`–`HU44`), se establecen las siguientes definiciones base del sistema:

* **Sesión de estudio:** Unidad básica de planificación temporal dentro de StudyPlan. Representa un bloque continuo de tiempo asignado a una **asignatura** (o a una tarea/entrega vinculada a una asignatura), definido por una fecha, hora de inicio, hora de fin y duración en minutos.
  * *Evolución técnica:* En la fase inicial de generación y visualización (`HU06`, `HU07`, `HU09`), las sesiones se calculan dinámicamente a partir de las restricciones del usuario. Para soportar edición manual (`HU10`), registro de cumplimiento (`HU14`), replanificación (`HU15`) y estadísticas (`HU18`), cada sesión requiere persistencia individual en SQLite con tres estados explícitos: `pendiente`, `completada` y `no_realizada`.
* **Disponibilidad semanal neta:** Tiempo útil real disponible para estudiar en una semana concreta. Se obtiene restando a la disponibilidad bruta recurrente del usuario (`HU02`) tanto su horario fijo de clases (`HU05`) como sus compromisos puntuales bloqueados para esa semana (`HU06`).
* **Hitos académicos vs. Objetivos de estudio:**
  * Las **asignaturas** (`HU01`) tienen un objetivo semanal de minutos deseados (`HU13`), dificultad y prioridad (`HU12`).
  * Las **tareas y entregas** (`HU04`) tienen fecha límite y minutos estimados propios.
  * Los **exámenes** (`HU03`, `HU04`) actúan como hitos temporales vinculados a una asignatura: no añaden minutos propios al cálculo, sino que incrementan la urgencia de estudiar su asignatura asociada conforme se acerca su fecha.
* **Independencia y trazabilidad (INVEST):** Aunque las funcionalidades siguen un flujo lógico de datos (gestión de cuenta $\rightarrow$ asignaturas y restricciones $\rightarrow$ motor de planificación $\rightarrow$ visualización y seguimiento), cada historia se especifica y verifica de forma autocontenida mediante datos de prueba aislados, evitando mezclar criterios de aceptación entre historias distintas.

## HU01 — Gestión de asignaturas

- **Issue:** [Issue #1](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/1)
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
- **Historia:** Como estudiante, quiero añadir, editar y eliminar asignaturas para indicar qué materias tengo que estudiar.
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
- **Historia:** Como estudiante, quiero definir mi disponibilidad semanal recurrente mediante franjas horarias por día de la semana para que la aplicación sepa cuándo puedo estudiar habitualmente.
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

- **Issue:** [Issue #4](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4) · Incidencia vinculada: [Bug #48](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/48)
- **Estado:** Terminada (Cerrada en GitHub como `completed` y verificada)
- **Historia:** Como estudiante, quiero registrar, editar y eliminar tareas, entregas y exámenes para integrarlos en mi planificación.
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
- **Historia:** Como estudiante, quiero introducir mi horario de clases para registrar mis horas lectivas ocupadas.
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
- **Historia:** Como estudiante, quiero generar automáticamente un plan de estudio semanal de 7 días que respete mis restricciones y reparta mis objetivos según prioridad, dificultad y plazos.
- **Alcance:** Incluye el cálculo automático de sesiones para una ventana de 7 días desde la fecha de inicio elegida, respetando el rango horario configurado (`Desde`/`Hasta`), duración de sesión, descansos (`HU11`), clases y festivos (`HU05`), y bloqueos puntuales por fecha guardados en `localStorage` del navegador. Genera una vista previa semanal persistida en `localStorage` por cuenta (no guarda sesiones individuales en SQLite).
- **Valor y prioridad:** Muy alto. Es el núcleo funcional de la aplicación; prioridad máxima (Sprint 2 / Sprint 4).
- **Estimación:** 3 días (orientativa; historia integradora que combina motor de reparto en backend y gestión de bloqueos puntuales en frontend).
- **Criterios de aceptación:**
  - **CA01:** El generador asigna primero los objetivos semanales explícitos de asignaturas (`HU13`) y tareas/entregas (`HU04`), evitando clases, días libres (`HU05`), bloqueos puntuales y solapamientos.
  - **CA02:** Los exámenes vinculados (`HU04`) no añaden minutos propios, pero su proximidad adelanta la preparación de su asignatura; el tiempo libre sobrante se reparte alternando materias y actividades según prioridad/dificultad de asignatura (`HU12`) y urgencia de fecha límite.
  - **CA03:** Antes de generar, el usuario puede añadir o eliminar franjas ocupadas puntuales (con fecha dentro de los 7 días, inicio, fin y motivo), conservándose en `localStorage` por usuario y mostrándose identificadas en el horario resultante.
  - **CA04:** Se respetan la duración de sesión y el descanso entre bloques (`HU11`), mostrando un aviso de déficit de minutos cuando los objetivos superan el tiempo disponible.
  - **CA05:** El último plan generado y sus parámetros se conservan en `localStorage` separados por correo del usuario, aislando los datos entre cuentas en el backend.
- **Evidencias:** Implementado en `main` (`app.py`, `planificador.py`, `static/plan.js`, `templates/index.html`) y verificado en `tests/test_planificador.py`, `tests/test_reparto_horas.py`, `tests/test_objetivos_semanales.py` y `tests/plan.test.js`.

## HU07 - Calendario semanal

[Issue #7](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/7)

**Historia:** Como usuario, quiero visualizar mi planificación mediante un calendario semanal para saber qué debo estudiar en cada momento.

**Valor:** Muy alto  
**Estimación:** 2 días

**Criterios de aceptación:**
- Muestra los días de la semana.
- Muestra las sesiones planificadas.
- Cada sesión identifica la asignatura o tarea correspondiente.

## HU08 - Priorización automática

[Issue #8](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/8)

**Historia:** Como usuario, quiero que el plan priorice exámenes próximos, entregas y asignaturas importantes para distribuir mejor mi tiempo.

**Valor:** Muy alto  
**Estimación:** 2 días

**Criterios de aceptación:**
- Tiene en cuenta la proximidad de fechas límite.
- Tiene en cuenta la importancia configurada.
- La prioridad influye en la distribución del estudio.

## HU09 - Horas de inicio y fin de las sesiones

[Issue #9](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/9)

**Historia:** Como usuario, quiero ver la hora de inicio y fin de cada sesión de estudio para seguir el horario generado.

**Valor:** Alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Cada sesión muestra hora de inicio.
- Cada sesión muestra hora de fin.

## HU10 - Edición manual de sesiones

[Issue #10](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/10)

**Historia:** Como usuario, quiero mover o modificar sesiones cuando tenga un imprevisto para adaptar mi planificación.

**Valor:** Alto  
**Estimación:** 2 días

**Criterios de aceptación:**
- Se puede cambiar el día u hora de una sesión.
- La modificación se refleja en el calendario.

## HU11 - Descansos entre sesiones

[Issue #11](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/11)

**Historia:** Como usuario, quiero configurar descansos entre sesiones para adaptar el plan a mi forma de estudiar.

**Valor:** Alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se puede establecer una duración de descanso.
- El plan introduce los descansos configurados.

## HU12 - Dificultad y prioridad de asignaturas

[Issue #12](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/12)

**Historia:** Como usuario, quiero indicar la dificultad y la prioridad de mis asignaturas, así como la prioridad de mis tareas, para distribuir mejor el tiempo de estudio.

**Valor:** Alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Cada asignatura puede guardar una dificultad y una prioridad (baja, media o alta).
- Las tareas conservan su propio campo de prioridad (baja, media o alta).
- La API valida y devuelve ambos atributos de las asignaturas.
- El generador recibe la dificultad y prioridad de las asignaturas, y la prioridad de las tareas.

## HU13 - Horas deseadas por asignatura

[Issue #13](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/13)

**Historia:** Como usuario, quiero establecer las horas que deseo dedicar a cada asignatura para personalizar mi planificación.

**Valor:** Alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se pueden establecer horas objetivo por asignatura.
- El plan tiene en cuenta las horas configuradas.

## HU14 - Sesiones completadas

[Issue #14](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/14)

**Historia:** Como usuario, quiero marcar sesiones como completadas para llevar un seguimiento de mi planificación.

**Valor:** Medio  
**Estimación:** 1 día

**Criterios de aceptación:**
- Una sesión puede marcarse como completada.
- El estado queda reflejado en la planificación.

## HU15 - Replanificación de sesiones pendientes

[Issue #15](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/15)

**Historia:** Como usuario, quiero que las sesiones no realizadas se replanifiquen para poder recuperar el estudio pendiente.

**Valor:** Medio  
**Estimación:** 2 días

**Criterios de aceptación:**
- Se detectan sesiones no completadas.
- Se pueden recolocar en futuras franjas disponibles.

## HU16 - Perfil y preferencias de aprendizaje

[Issue #16](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/16)

**Historia:** Como usuario, quiero configurar un perfil de aprendizaje indicando hábitos y preferencias para personalizar mis sesiones.

**Valor:** Medio  
**Estimación:** 2 días

**Criterios de aceptación:**
- Se pueden indicar preferencias de duración y concentración.
- Las preferencias pueden modificarse.
- La planificación puede utilizar estas preferencias.

## HU17 - Importación del horario mediante imagen

[Issue #17](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/17)

**Historia:** Como usuario, quiero subir una foto de mi horario para que la aplicación detecte automáticamente mis clases y horas ocupadas.

**Valor:** Bajo  
**Estimación:** 3 días

**Criterios de aceptación:**
- Se puede subir una imagen del horario.
- El sistema extrae propuestas de días y horas.
- El usuario puede revisar/corregir los datos detectados antes de guardarlos.

## HU18 - Estadísticas de estudio

[Issue #18](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/18)

**Historia:** Como usuario, quiero consultar estadísticas de estudio para conocer mi progreso y las horas dedicadas a cada asignatura.

**Valor:** Bajo  
**Estimación:** 2 días

**Criterios de aceptación:**
- Se muestran las horas estudiadas.
- Se pueden consultar datos por asignatura.

## HU19 - Recordatorios

[Issue #19](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/19)

**Historia:** Como usuario, quiero recibir recordatorios de sesiones de estudios, exámenes y entregas para no olvidar eventos importantes.

**Valor:** Bajo  
**Estimación:** 2 días

**Criterios de aceptación:**
- Se generan recordatorios de eventos próximos.
- El recordatorio identifica el evento correspondiente.

## HU20 - Registro

[Issue #20](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/20)

**Historia:** Como usuario, quiero poder registrarme para guardar mi planificación y acceder a ella posteriormente.

**Valor:** Bajo  
**Estimación:** 2 días

**Criterios de aceptación:**
- Se puede crear una cuenta.
- Los datos del usuario quedan asociados a su cuenta.

## HU21 - Inicio de sesión

[Issue #22](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/22)

**Historia:** Como usuario, quiero iniciar sesión para acceder a mi cuenta y a mi planificación guardada.

**Valor:** Bajo  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se puede iniciar sesión con credenciales válidas.
- Si las credenciales son incorrectas, se informa al usuario.
- Al iniciar sesión correctamente, el usuario puede acceder a los datos asociados a su cuenta.

## HU22 - Horas estudiadas semanalmente

[Issue #23](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/23)

**Historia:** Como usuario, quiero consultar cuántas horas he estudiado durante la semana para conocer el tiempo total dedicado al estudio.

**Valor:** Medio  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se muestran las horas totales estudiadas durante la semana.
- El cálculo se realiza a partir de las sesiones de estudio registradas.
- La información se actualiza cuando se completan nuevas sesiones.

## HU23 - Apartado individual por asignatura

[Issue #24](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/24)

**Historia:** Como usuario, quiero disponer de un apartado individual para cada asignatura para consultar y organizar de forma separada la información de cada materia.

**Valor:** Alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Cada asignatura dispone de su propio apartado.
- El usuario puede acceder al apartado de una asignatura desde su lista de asignaturas.
- La información mostrada queda asociada únicamente a la asignatura correspondiente.

## HU24 - Seguimiento de sesiones de estudio

[Issue #25](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/25)

**Historia:** Como usuario, quiero consultar cuántas sesiones de estudio he completado y cuántas me he saltado durante la semana para conocer mi cumplimiento de la planificación.

**Valor:** Medio  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se muestra el número de sesiones completadas durante la semana.
- Se muestra el número de sesiones saltadas o no realizadas durante la semana.
- Los datos se actualizan según el estado de las sesiones de estudio.

## HU25 - Asignaturas estudiadas semanalmente

[Issue #26](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/26)

**Historia:** Como usuario, quiero consultar cuántas asignaturas distintas he estudiado durante la semana y cuáles son para conocer cómo he distribuido mi estudio.

**Valor:** Medio  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se muestra el número de asignaturas distintas estudiadas durante la semana.
- Se muestra cuáles son las asignaturas estudiadas.
- Una asignatura se considera estudiada cuando existe al menos una sesión de estudio completada asociada a ella.
- Los datos se actualizan a partir de las sesiones registradas.

## HU26 - Gestión del temario por asignatura

[Issue #27](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/27)

**Historia:** Como usuario, quiero añadir y gestionar el temario pendiente de cada asignatura para saber qué contenidos tengo que estudiar.

**Valor:** Alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- El usuario puede añadir temas o contenidos a una asignatura.
- El usuario puede editar el temario añadido.
- El usuario puede eliminar temas o contenidos.
- Se puede consultar qué contenidos están pendientes de estudiar.
- Cada tema o contenido queda asociado a la asignatura correspondiente.

## HU27 - Lista de To-Dos

[Issue #29](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/29)

**Historia:** Como usuario, quiero disponer de una lista de To-Dos sencilla para anotar y gestionar tareas pendientes de forma rápida.

**Valor:** Medio  
**Estimación:** 1 día

**Criterios de aceptación:**
- El usuario puede añadir un nuevo To-Do.
- El usuario puede marcar un To-Do como completado.
- El usuario puede desmarcar un To-Do completado.
- El usuario puede editar un To-Do.
- El usuario puede eliminar un To-Do.
- Se diferencian visualmente los To-Dos pendientes de los completados.

---

# Ampliación del Product Backlog — 22/11/2026

Las HU01–HU27 se mantienen con su descripción original. Este apartado incorpora las historias creadas después. **Los resúmenes no sustituyen los criterios de aceptación completos de las issues enlazadas.** La implementación no equivale a pruebas superadas.

## HU28 — Filtrar To-Dos por estado

[Issue #36](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/36)

**Alcance y criterios principales:** Filtrar todas, pendientes o completadas, sin alterar los datos ni mostrar To-Dos ajenos.

## HU29 — Buscar To-Dos por título

[Issue #37](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/37)

**Alcance y criterios principales:** Búsqueda parcial sin distinguir mayúsculas, con aislamiento por usuario.

## HU30 — Navegación mediante teclado

[Issue #38](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/38)

**Alcance y criterios principales:** Navegación, activación y foco visibles sin ratón.

## HU31 — Etiquetas accesibles

[Issue #39](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/39)

**Alcance y criterios principales:** Etiquetas, regiones y mensajes para lectores de pantalla.

## HU32 — Modo de alto contraste

[Issue #40](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/40)

**Alcance y criterios principales:** Preferencia persistente y contraste legible.

## HU33 — Texto ampliado

[Issue #41](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/41)

**Alcance y criterios principales:** Interfaz utilizable con zoom al 200 %.

## HU34 — Movimiento reducido

[Issue #42](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/42)

**Alcance y criterios principales:** Respetar preferencias del sistema y evitar animaciones innecesarias.

## HU35 — Errores de formularios accesibles

[Issue #43](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/43)

**Alcance y criterios principales:** Mensajes asociados a campos, comprensibles y sin pérdida de datos.

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

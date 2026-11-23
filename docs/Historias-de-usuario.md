# Historias de usuario

Recopilación del Product Backlog a partir de las [issues de GitHub](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues). Se conservan el valor, la estimación y los criterios de aceptación publicados en cada issue. En GitHub, el valor se expresa como nivel (por ejemplo, «Muy alto»); no se sustituye por una prioridad distinta.

Estado histórico del documento original (HU01–HU27). Las HU posteriores se incorporan a continuación; consultar cada issue para conocer su estado actual.

## HU01 - Gestión de asignaturas

[Issue #1](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/1)

**Historia:** Como usuario, quiero añadir, editar y eliminar asignaturas para indicar qué materias tengo que estudiar.

**Valor:** Muy alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se pueden añadir asignaturas.
- Se pueden editar asignaturas existentes.
- Se pueden eliminar asignaturas.

## HU02 - Disponibilidad semanal

[Issue #2](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/2)

**Historia:** Como usuario, quiero definir mi disponibilidad semanal mediante franjas horarias para que la aplicación sepa cuándo puedo estudiar.

**Valor:** Muy alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se pueden definir franjas horarias por día.
- Se pueden modificar y eliminar franjas.
- La planificación respeta las horas disponibles.

## HU03 - Registro de exámenes

[Issue #3](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/3)

**Historia:** Como usuario, quiero registrar exámenes, indicando asignatura, fecha e importancia, para organizar mi preparación.

**Valor:** Muy alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se puede seleccionar la asignatura.
- Se puede indicar fecha e importancia.
- Los exámenes se pueden modificar o eliminar.

## HU04 - Gestión de tareas y entregas

[Issue #4](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4)

**Historia:** Como usuario, quiero registrar tareas y entregas, indicando fecha límite y tiempo estimado, para incluirlas en mi planificación.

**Valor:** Muy alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se puede crear una tarea o entrega.
- Se puede indicar fecha límite y tiempo estimado.
- Se puede modificar o eliminar.

## HU05 - Horario de clases

[Issue #5](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/5)

**Historia:** Como usuario, quiero introducir mi horario de clases para evitar que se planifiquen sesiones durante mis clases.

**Valor:** Muy alto  
**Estimación:** 1 día

**Criterios de aceptación:**
- Se pueden registrar clases por día y franja horaria.
- Se pueden modificar o eliminar.
- No se generan sesiones de estudio durante las clases.

## HU06 - Generación automática del plan de estudio

[Issue #6](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6)

**Historia:** Como usuario, quiero que la aplicación genere automáticamente un plan de estudio según mi disponibilidad, asignaturas, exámenes y tareas.

**Valor:** Muy alto  
**Estimación:** 3 días

**Criterios de aceptación:**
- Solo utiliza horas disponibles.
- No coloca sesiones durante clases.
- Tiene en cuenta exámenes y entregas.
- Genera sesiones con hora de inicio y fin.

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

**Alcance y criterios principales:** Tablero 8×8; mate en una jugada; cinco ejercicios diarios en secuencia; pistas, reintentos, explicación y persistencia local por usuario y fecha. Pruebas en tests/daily-chess.test.js; ejecución pendiente.

## Cambios funcionales relacionados, sin HU nueva

- **HU02/HU06/HU07:** selección interactiva de franjas horarias bloqueadas, generación y recuperación del horario semanal (`static/plan.js`, `tests/plan.test.js`).
- **HU04:** validación de fechas límite y distinción entre tareas y exámenes (bug [#48](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/48)).
- **HU16:** avatar personalizable con banderas y escudos de equipos de LaLiga Primera y Segunda, Premier League, Bundesliga, Serie A y Ligue 1 (`static/avatar-flags.js`, `app.py`; `tests/avatar-flags.test.js`, `tests/test_escudos.py`). Los escudos dependen de un proveedor externo.
- **HU40:** ajustes de la paleta roja del tema claro.
- **HU44:** reto de ajedrez incorporado a Inicio, con siete pruebas frontend escritas.

**Verificación:** no consta una ejecución completa satisfactoria de las pruebas ni revisión manual de todos estos cambios; no se atribuye cierre funcional sin evidencias.


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
- Se amplía `tests/daily-chess.test.js` a **siete pruebas**; falta ejecutar la batería y realizar verificación manual.
- Cambios en `static/daily-chess.js` y `tests/daily-chess.test.js`; [HU44 #54](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/54) permanece cerrada como implementada, sin afirmar validación de pruebas.


## 22/11/2026 — HU44: migración del ajedrez a API externa

**Cambio:** las cinco posiciones ya no están definidas en `static/daily-chess.js`. Flask consulta [Chess Puzzle API](https://github.com/mauricioulloa/chess-puzzle-api), basada en la base abierta de puzzles de Lichess (CC0), solicitando cinco problemas con tema `mateIn1`. La fuente entrega `positionFen` y el color del jugador; las soluciones se consultan por ID mediante `/v1/puzzles/{id}/solution`. La API externa no requiere clave según su documentación pública.

**Arquitectura:** navegador → `GET /api/ajedrez/diario` (Flask) → Chess Puzzle API; navegador → `POST /api/ajedrez/comprobar` → Flask. Las soluciones se guardan únicamente en la caché del backend y no se incluyen en la respuesta que carga el tablero. Caché en memoria por día, sin persistencia en base de datos; progreso de los cinco ejercicios en `localStorage` por usuario y fecha (`studyplan:chess-daily:api:v1`).

**Comportamiento:** tablero 8×8, blancas o negras según la posición, cinco mates en una jugada, pista genérica, validación en el servidor y botón Reintentar que permite repetir el ejercicio sin perder los otros cuatro. En caso de indisponibilidad de la API se muestra un mensaje y Flask devuelve 503; no se inventan puzzles de respaldo.

**Archivos:** `app.py`, `static/daily-chess.js`, `tests/daily-chess.test.js` y nuevo `tests/test_chess_api.py`. Pruebas con respuestas simuladas, sin depender de Internet. **Pendiente:** ejecutar ambas baterías y comprobar en vivo que la API devuelve cinco problemas `mateIn1` compatibles con el formato documentado; no se declara validada la integración externa.

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
- **Pendiente:** ejecución de tests y comprobación real en el navegador. Si continúa vacío, revisar consola JavaScript y respuesta de `/api/ajedrez/diario` antes de atribuirlo a la API.


### 23/11/2026 — HU40: rediseño visual del modo claro (Ocean)

- Se sustituye la paleta de marca rojo granate por azul marino, azul eléctrico y turquesa; fondos blanco y gris azulado, tipografía oscura de alto contraste.
- Se actualizan las variables CSS globales del tema claro, el encabezado de bienvenida, avatar, navegación activa y hover, badges, estados del planificador, bordes y enfoque por teclado.
- Se conservan colores semánticos de errores (rojo), éxito (verde) y avisos (ámbar) para que sigan siendo distinguibles; no se cambia el modo oscuro ni la lógica JavaScript.
- Archivo: `static/style.css`. Pendiente validación visual en navegador y revisión de contraste en todas las vistas.


### 23/11/2026 — HU06/HU07: plan semanal visible al final de Inicio

- Se añade en la parte inferior del dashboard **Mi plan de estudio semanal**, debajo de los módulos existentes, con tarjetas para los siete días, asignaturas, actividades y horas de las sesiones.
- Si no existe un plan válido guardado para el usuario en el navegador, aparece **«Aún no has generado tu plan de estudio»** y un botón para abrir Plan de Estudio.
- Se reutiliza la clave existente `studyplan:plan-semanal:v1:<correo>` en localStorage; no se duplica la persistencia ni se realizan peticiones extra. La vista de Inicio se actualiza al generar y al restaurar el plan tras recargar.
- El botón Ver plan completo abre la sección original, donde se sigue editando y generando. Diseño responsive con paleta del tema claro y variables compartidas del oscuro.
- Archivos: `templates/index.html`, `static/plan.js`, `static/style.css`, `tests/plan.test.js` (dos casos añadidos: estado vacío y generación/restauración).
- Pendiente: ejecutar pruebas automatizadas y comprobación visual en navegador.

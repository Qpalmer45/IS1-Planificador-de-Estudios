# Registro de cambios de historias de usuario — 21/11/2026

> Documento de trabajo para incorporar al próximo documento de Sprint. **No es la Wiki ni el Sprint Doc definitivo.**
> Rama: `main`. Las pruebas se han añadido al repositorio, pero **no se ha confirmado su ejecución satisfactoria**. No confundir «código subido» con «historia validada».

## Historias existentes afectadas

### HU01 — Gestión de asignaturas · Issue #1
**Tipo:** corrección de defecto y mejora del formulario; no se crea HU nueva.

- Corregido el error JavaScript al editar una asignatura: se utilizaba `weeklyInput` sin definir.
- El formulario de edición permite cambiar nombre, dificultad, prioridad y minutos semanales.
- Se mejoró la distribución visual de los campos y su adaptación a pantallas estrechas.
- **Pruebas añadidas:** `tests/editar-asignaturas.test.js` (guardar y cancelar).
- **Verificación pendiente:** ejecución de pruebas y comprobación manual del formulario.

### HU04 — Gestión de tareas, entregas y exámenes · Issue #4
**Tipo:** ampliación de criterios y mejora de experiencia de usuario.

- Tareas y entregas admiten minutos estimados y objetivo semanal.
- Un examen exige una asignatura asociada; no permite configurar horas de estudio propias, porque toma el tiempo semanal de la asignatura.
- Se añade aviso contextual visible solo al seleccionar «Examen»: para modificar las horas, acudir a «Mis asignaturas».
- El backend valida la asociación y rechaza asignaturas ajenas u objetivos semanales propios de exámenes.
- **Pruebas añadidas/modificadas:** `tests/test_reparto_horas.py`, `tests/examenes-form.test.js`, pruebas previas del planificador.
- **Verificación pendiente:** ejecución completa y revisión de creación/edición de actividades.

### HU06 — Generación automática del plan de estudio · Issue #6
**Tipo:** modificación de la lógica de reparto.

- La generación semanal intenta cubrir primero los objetivos de tiempo establecidos.
- Los huecos sobrantes se distribuyen entre asignaturas según prioridad y dificultad.
- Los exámenes no consumen horas adicionales: su proximidad influye en la preparación de la asignatura asociada.
- Se consideran clases, periodos libres, franjas horarias y descansos.
- Se calculan déficits de minutos cuando la disponibilidad es insuficiente y se añade un aviso en la interfaz.
- **Pruebas añadidas/modificadas:** `tests/test_reparto_horas.py`, `tests/test_planificador.py`, `tests/test_objetivos_semanales.py`.
- **Verificación pendiente:** comprobar el reparto exacto, los casos límite, el aviso de déficit y la ausencia de solapamientos.

### HU12 — Dificultad y prioridad · Issue #12
**Tipo:** integración con HU06 y formulario de HU01.

- Los valores de dificultad y prioridad continúan siendo editables.
- Se utilizan en la asignación de huecos sobrantes del plan semanal.
- **Verificación pendiente:** comprobar que la ponderación se refleja correctamente en el horario generado.

### HU13 — Horas deseadas por asignatura · Issue #13
**Tipo:** ampliación funcional y corrección de edición.

- Se pueden establecer y modificar minutos semanales al crear/editar una asignatura.
- Persistencia en SQLite, validación de enteros entre 0 y 10080; 0 indica reparto automático.
- El planificador trata estos valores como objetivos a cubrir antes de repartir tiempo sobrante.
- Las horas de preparación de exámenes dependen de esta configuración.
- **Pruebas añadidas/modificadas:** `tests/test_objetivos_semanales.py`, `tests/test_reparto_horas.py`, `tests/editar-asignaturas.test.js`.
- **Verificación pendiente:** persistencia, migración de bases existentes, edición y plan generado.

## Archivos principales modificados

- Backend: `app.py`, `planificador.py`.
- Interfaz: `templates/index.html`, `static/app.js`, `static/tareas.js`, `static/plan.js`, `static/style.css`.
- Pruebas: `tests/test_reparto_horas.py`, `tests/test_objetivos_semanales.py`, `tests/test_planificador.py`, `tests/examenes-form.test.js`, `tests/editar-asignaturas.test.js` y `package.json`.

## Antes de cerrar las historias en el próximo Sprint Doc

1. Ejecutar toda la batería de pruebas del backend y frontend; documentar resultados y corregir fallos.
2. Comprobar manualmente crear/editar asignaturas y exámenes, incluyendo el aviso contextual.
3. Verificar que las horas objetivo se cumplen cuando hay capacidad y que el sobrante se reparte como se espera.
4. Probar incompatibilidades de horarios, semanas con capacidad insuficiente y datos de usuarios distintos.
5. Incorporar evidencias de ejecución y decisiones al documento definitivo del sprint.

## Referencias

- [HU01](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/1)
- [HU04](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4)
- [HU06](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6)
- [HU12](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/12)
- [HU13](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/13)

## Correcciones adicionales del mismo día

- **HU04:** se eliminan caracteres `\\n` que aparecían literalmente antes de la barra de botones; se ajustan los márgenes, la distribución y la presentación adaptable. La lista de exámenes deja de mostrar minutos ficticios y muestra «Estudio según asignatura».
- **HU06:** se conserva en `localStorage` el último plan semanal generado y los parámetros, separados por correo del usuario, para recuperarlos tras refrescar en **el mismo navegador**. No equivale a guardar en SQLite ni sincronizar entre dispositivos; si cambian los objetivos, hay que regenerar el plan.
- **Prueba añadida:** `tests/plan.test.js` incluye recuperación del plan y de los parámetros sin nueva petición a la API.
- **Pendiente:** ejecutar Jest y revisar visualmente la interfaz en escritorio y móvil.

## 22/11/2026 — HU19: configuración de recordatorios

- Se amplía la **HU19 existente** (issue #19), sin duplicarla.
- Panel de Inicio: selector de antelación (hoy, 1, 3, 7, 14, 30 o 60 días), botón Guardar y mensaje de resultado.
- Preferencia por usuario en SQLite mediante `preferencias_recordatorios` (migración no destructiva, 7 días por defecto).
- API autenticada: `GET/PUT /api/recordatorios/configuracion`, validación de 0 a 365 días.
- `GET /api/recordatorios` aplica el rango configurado.
- Pruebas: `tests/test_configuracion_recordatorios.py` (valor por defecto, guardado, errores, aislamiento, filtrado, autenticación) y `tests/examenes-form.test.js` (formulario).
- Alcance: recordatorios **dentro de la aplicación**, no correos ni notificaciones del sistema.
- Estado: cambios subidos a `main`; **pruebas pendientes de ejecución**.


## 22/11/2026 — Actualización de HU y funcionalidades recientes

- **HU02/HU06/HU07:** selector visual de bloqueos semanales, planificación y recuperación del horario. Archivos: `static/plan.js`, `static/style.css`, `tests/plan.test.js`.
- **HU04:** corrección de fechas límite anteriores al día actual; [bug #48](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/48) cerrado. Mantener pruebas de creación y edición.
- **HU16:** selector de avatar con banderas de países y territorios. Se corrige la normalización de acentos en búsquedas y se usan imágenes PNG con alternativa.
- **HU16:** escudos de equipos de LaLiga (Primera), LaLiga Hypermotion (Segunda), Premier League, Bundesliga, Serie A y Ligue 1; nueva API `GET /api/perfil/escudos?liga=...` con caché, búsqueda por equipo y selección persistida en el navegador. Pruebas: `tests/avatar-flags.test.js`, `tests/test_escudos.py`.
- **HU40:** paleta roja del tema claro, sin reemplazar el tema oscuro.
- **HU41:** cambios de diseño del panel principal para utilizar mejor el ancho disponible; issue #51.
- **HU42:** issue #52 cerrada como duplicada de HU06/HU07/HU09/HU11; no se cuenta como funcionalidad independiente.
- **HU43:** recuperación segura de contraseña, issue #53, documentada como pendiente de implementación; no se declara completada.
- **HU44:** [issue #54](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/54), reto diario de ajedrez en Inicio. Tablero de 64 casillas, mate en una jugada, cinco ejercicios diarios, ordenados por fecha, pistas, reintentos, explicación y progreso en localStorage. Archivos: `static/daily-chess.js`, `templates/index.html`, `static/style.css`. Cinco pruebas en `tests/daily-chess.test.js`, añadidas al script `test:frontend` de `package.json`.

**Documentación:** se amplía `docs/Historias-de-usuario.md` con HU28–HU44, preservando HU01–HU27. Las HU de accesibilidad, exportación y otras propuestas se documentan sin afirmar que están implementadas.

**Verificación pendiente:** ejecutar `npm run test:frontend` y `python -m unittest discover -s tests -p 'test_*.py'`; probar en navegador la selección de escudos, el ajedrez, el cambio de tema y la planificación. Los tests escritos no se declaran superados hasta ejecutar la batería.


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

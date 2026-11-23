# Cambios por Quim hechos esta sprint

**Proyecto:** IS1 — Planificador de Estudios  
**Semana:** 16–22 de noviembre de 2026  
**Finalidad:** resumen del trabajo realizado para incorporarlo al documento del sprint.  
**Ubicación:** repositorio GitHub, fuera de la Wiki.

## Resumen del trabajo

Durante esta semana se ha trabajado en la mejora de la gestión de asignaturas, tareas, entregas y exámenes; la planificación semanal del estudio; la conservación del horario al actualizar la página; y la configuración de recordatorios. También se han añadido pruebas y corregido detalles de presentación y usabilidad.

## Historias de usuario trabajadas

| HU | Historia | Trabajo realizado | Estado de la issue |
|---|---|---|---|
| [HU01](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/1) | Gestión de asignaturas | Corrección del error al editar asignaturas, posibilidad de modificar sus horas semanales y mejoras del formulario | Cerrada |
| [HU04](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/4) | Tareas, entregas y exámenes | Gestión de fechas y objetivos semanales; exámenes vinculados a asignaturas, sin horas independientes; aviso explicativo y correcciones visuales | Cerrada |
| [HU06](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/6) | Generación automática del plan | Reparto inicial según horas configuradas y posterior distribución de huecos según prioridad y dificultad; consideración de exámenes, descansos y disponibilidad; conservación del último horario en el navegador | Abierta |
| [HU12](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/12) | Dificultad y prioridad | Integración de los niveles de dificultad y prioridad en el reparto del estudio | Cerrada |
| [HU13](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/13) | Horas deseadas por asignatura | Configuración y modificación de objetivos semanales por asignatura, utilizados al generar el plan | Abierta |
| [HU19](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/19) | Recordatorios | Nueva sección para configurar la antelación de los avisos (0, 1, 3, 7, 14, 30 o 60 días), guardada por usuario | Cerrada |

**Importante:** «Cerrada» indica el estado actual de la issue en GitHub, no que todas las pruebas de los cambios de esta semana hayan sido ejecutadas satisfactoriamente.

## Mejoras y correcciones adicionales

- Corregida la edición de asignaturas.
- Mejorada la disposición de formularios y botones, especialmente en tareas y exámenes.
- Añadido un aviso que explica que las horas de preparación de exámenes se configuran en la asignatura correspondiente.
- Eliminada la visualización de minutos ficticios en exámenes.
- Corregido el cálculo de las horas reales planificadas cuando las sesiones tienen distinta duración.
- Evitado que una asignatura eliminada permanezca seleccionada en un formulario.
- Añadida la recuperación del último horario al refrescar la página, dentro del mismo navegador.
- Mejorada la gestión de horarios guardados incompletos y errores al regenerar.
- Incorporadas preferencias de antelación para recordatorios en el panel de inicio.

## Pruebas

Se han añadido o ampliado pruebas para:

- Edición y cancelación de cambios en asignaturas.
- Reparto de horas semanales, sobrantes y déficits.
- Exámenes asociados a asignaturas, sin horas independientes.
- Conservación y recuperación del horario semanal.
- Duraciones reales de las sesiones.
- Selección de asignaturas y tratamiento de elementos eliminados.
- Configuración, persistencia y aislamiento de recordatorios por usuario.

**Estado:** las pruebas están incorporadas al repositorio, pero no consta una ejecución completa y satisfactoria de toda la batería. Queda pendiente registrar sus resultados.

## README y documentación del sprint

- Se ha revisado el contenido del README existente como referencia: descripción del proyecto, tecnologías, metodología Scrum, instalación, ejecución, pruebas y estructura.
- No se atribuye una modificación concreta del README a esta semana sin evidencia de un cambio en su historial.
- Se ha creado y actualizado un registro de historias modificadas para preparar el próximo Sprint Doc.
- Se han actualizado criterios de aceptación de historias existentes, sin duplicarlas.
- Este documento resume el trabajo funcional y de documentación **sin incluir código fuente**.

## Pendientes antes de cerrar el sprint

1. Ejecutar las pruebas automatizadas y registrar los resultados.
2. Verificar manualmente los formularios de asignaturas, tareas y exámenes.
3. Revisar el reparto de horas y los casos con disponibilidad insuficiente.
4. Comprobar la recuperación del plan y el comportamiento de los recordatorios.
5. Incorporar evidencias, responsables y decisiones al Sprint Doc definitivo.

## Referencias

- [Repositorio del proyecto](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios)
- [README](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/main/README.md)
- [Registro detallado de cambios de historias](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/main/docs/registro-cambios-hu-2026-11-21.md)


## Actualización adicional — 22/11/2026

Se incorpora aquí el trabajo posterior al resumen inicial de esta semana, **sin atribuir como terminadas historias que todavía requieren comprobación**.

| Historia o área | Cambios incorporados | Pruebas o verificación |
|---|---|---|
| HU02 / HU06 / HU07 — Planificación semanal | Cuadrícula interactiva para bloquear franjas de estudio, generación del horario y persistencia local de la última planificación | `static/plan.js`, `tests/plan.test.js`; comprobación visual pendiente |
| HU04 — Tareas y exámenes | Validación de fechas límite, corrección del error que permitía seleccionar ayer, distinción entre examen y tarea | [Bug #48](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/48) cerrado; ejecución completa pendiente |
| HU16 — Personalización del perfil | Selector de banderas por país o territorio, búsqueda y persistencia de la elección | `static/avatar-flags.js`, `tests/avatar-flags.test.js` |
| HU16 — Escudos de fútbol | Selección de escudos por Primera y Segunda españolas, Premier League, Bundesliga, Serie A y Ligue 1; API `/api/perfil/escudos` con caché de 24 h | `app.py`, `tests/test_escudos.py`, `tests/avatar-flags.test.js`; fuente externa no verificada exhaustivamente |
| HU40 — Temas visuales | Ajustes de colores del tema claro hacia una paleta roja, conservando el tema oscuro | `static/style.css`; revisión visual pendiente |
| HU41 — Diseño adaptable | Mejor aprovechamiento del ancho del panel principal, según la issue existente | [HU41](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/51); no se afirma verificación completa |
| HU44 — Ajedrez diario | Nuevo módulo en Inicio: tablero 8×8, mate en una jugada, cinco ejercicios diarios en secuencia, pista, reintento, solución y progreso por usuario y día | `static/daily-chess.js`, `tests/daily-chess.test.js` (siete pruebas), incluidas en `npm run test:frontend` |

### Historias nuevas documentadas en el Product Backlog

Se actualizó `docs/Historias-de-usuario.md` para incluir las HU28–HU44 y los vínculos a sus issues. La HU42 está documentada como **duplicada** de HU06/HU07/HU09/HU11; HU43 (recuperación de contraseña) permanece pendiente de implementación; HU44 tiene código y pruebas escritas, pero no ejecución validada.

### Archivos y evidencias de esta ampliación

- Interfaz: `templates/index.html`, `static/style.css`.
- JavaScript: `static/plan.js`, `static/avatar-flags.js`, `static/daily-chess.js`.
- Backend: `app.py`, endpoint de escudos.
- Pruebas: `tests/plan.test.js`, `tests/avatar-flags.test.js`, `tests/daily-chess.test.js`, `tests/test_escudos.py`.
- Configuración de pruebas: `package.json`.

**Pendiente:** ejecutar las pruebas, revisar visualmente ambos temas y el tablero, verificar la disponibilidad de escudos en las seis competiciones y registrar resultados en el Sprint Doc. No se ha añadido un motor de ajedrez completo: se comprueba la solución prefijada de cada ejercicio.

[Backlog completo](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/main/docs/Historias-de-usuario.md) · [Registro detallado de cambios](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/blob/main/docs/registro-cambios-hu-2026-11-21.md)


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

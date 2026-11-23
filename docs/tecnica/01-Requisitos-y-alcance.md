# Requisitos y alcance de la aplicación

## 1. Para qué estamos haciendo el proyecto

En IS1 estamos desarrollando un planificador web de estudios. La idea es que un estudiante pueda introducir sus asignaturas, clases, exámenes, entregas y disponibilidad, y que la aplicación le ayude a repartir el tiempo sin tener que montar el horario desde cero.

El producto final que tenemos en mente es más amplio que la versión que hay ahora. Por eso separamos **lo que ya existe en el código** de **lo que sigue pendiente en el backlog**. Este documento no sustituye las historias de usuario de GitHub: las ordena para que sea más fácil entender el alcance.

## 2. Usuarios y funcionamiento general

El usuario principal es un estudiante que necesita organizar su tiempo de estudio. Cada cuenta debe mantener sus datos separados de los de otros estudiantes. La aplicación se usa desde un navegador y el servidor guarda la información en SQLite.

Recorrido disponible: crear una cuenta → añadir asignaturas, temas, clases, tareas y exámenes → configurar la franja diaria y generar una vista previa del plan semanal → consultar recordatorios. También hay To-Dos rápidos, bloqueos puntuales del plan, escudos deportivos y un reto diario de ajedrez.

## 3. Requisitos funcionales

| ID | Requisito | HU | Situación |
|---|---|---|---|
| RF01 | Registrar una cuenta con correo y contraseña | HU20 | Implementado |
| RF02 | Iniciar/cerrar sesión y consultar usuario actual | HU21 | Implementado |
| RF03 | Crear, consultar, editar, completar y borrar To-Dos rápidos | HU27 | Implementado |
| RF04 | Crear, listar, consultar, renombrar y eliminar asignaturas propias | HU01, HU23 | Implementado |
| RF05 | Configurar la franja diaria de estudio y los días no lectivos | HU02 | Implementado; los parámetros de planificación se conservan en el navegador |
| RF06 | Registrar clases y considerarlas ocupadas | HU05 | Implementado |
| RF07 | Guardar tareas, entregas y exámenes con fechas y estimación | HU03, HU04 | Implementado; un examen se asocia a una asignatura |
| RF08 | Generar y mostrar sesiones de una semana | HU06, HU07, HU09 | Implementado como vista previa; las sesiones no se guardan en SQLite |
| RF09 | Ponderar fechas próximas, dificultad y prioridad | HU08, HU12, HU13 | Implementado en el planificador |
| RF10 | Configurar descansos y modificar sesiones manualmente | HU10, HU11 | Parcial: se configuran descansos y se regenera el plan; no hay edición individual de sesiones |
| RF11 | Marcar sesiones realizadas y replanificar las no realizadas | HU14, HU15 | Pendiente; no hay sesiones persistidas |
| RF12 | Consultar estadísticas de estudio y seguimiento semanal | HU18, HU22, HU24, HU25 | Parcial: hay métricas del panel, no un historial de sesiones estudiadas |
| RF13 | Gestionar temario y preferencias por asignatura | HU16, HU26 | Implementado: temas, dificultad, prioridad y objetivo semanal |
| RF14 | Importar horarios por imagen y recibir recordatorios | HU17, HU19 | Parcial: hay recordatorios configurables; no hay importación por imagen |
| RF15 | Buscar y filtrar To-Dos rápidos | HU28, HU29 | Hay búsqueda y filtros en la interfaz; consultar las HU para su aceptación completa |

En las historias originales están las descripciones, el valor, las estimaciones y los criterios de aceptación: [Historias de usuario](../Historias-de-usuario.md). Para el refinamiento INVEST tenemos [este análisis](../Analisis-INVEST-Historias-de-Usuario.md).

## 4. Requisitos no funcionales que debemos cuidar

- **Privacidad:** los datos privados se consultan y modifican usando la identidad de la sesión; ninguna petición debe permitir trabajar con datos ajenos.
- **Seguridad de contraseñas:** no almacenar contraseñas en texto plano, sino su hash.
- **Persistencia:** la información debe seguir estando después de reiniciar la aplicación.
- **Validación:** los datos erróneos deben producir respuestas claras, no excepciones sin controlar.
- **Facilidad de uso:** formularios comprensibles y mensajes que ayuden a corregir un error.
- **Mantenibilidad:** nombres claros, documentación coherente con el código y pruebas para la lógica importante.

Son objetivos de calidad; no estamos diciendo que tengamos una auditoría completa que los certifique. Hay puntos por mejorar, como la configuración de secretos para un posible despliegue.

## 5. Límites conocidos y fuera del alcance

El planificador genera una vista previa semanal a partir de las asignaturas, actividades pendientes, clases, días libres, franja diaria, duración y descanso indicados. Los bloqueos puntuales y los parámetros del plan se guardan en `localStorage` por cuenta/navegador; el servidor no persiste sesiones generadas. Por eso todavía no se pueden completar sesiones ni replanificar automáticamente las no realizadas.

Los objetivos semanales de asignaturas y actividades compiten por las franjas con las tareas/entregas en modo automático (objetivo semanal 0). La distribución tiene en cuenta el tiempo ya asignado y la urgencia del plazo; las asignaturas se ponderan por prioridad y dificultad. Si quedan huecos, se siguen repartiendo entre las actividades pendientes y las asignaturas. Los exámenes utilizan el tiempo de su asignatura asociada.

La importación de horarios desde imágenes y las estadísticas basadas en un historial real de estudio siguen pendientes. Los To-Dos rápidos (HU27) son independientes de las tareas, entregas y exámenes planificables (HU04).

## 6. Cómo se validarán los requisitos

Cada requisito debe relacionarse con una HU y pruebas o demostración de aceptación. El 23 de noviembre de 2026, tras corregir los flujos de reparto y tareas/entregas, `npm.cmd run test:all` pasó con 157 pruebas Jest y 178 pruebas Python. La integración externa de ajedrez y escudos no se prueba en vivo; la documentación de pruebas recoge otras limitaciones.

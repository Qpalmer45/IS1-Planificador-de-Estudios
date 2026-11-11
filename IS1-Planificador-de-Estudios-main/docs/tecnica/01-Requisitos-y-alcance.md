# Requisitos y alcance de la aplicación

## 1. Para qué estamos haciendo el proyecto

En IS1 estamos desarrollando un planificador web de estudios. La idea es que un estudiante pueda introducir sus asignaturas, clases, exámenes, entregas y disponibilidad, y que la aplicación le ayude a repartir el tiempo sin tener que montar el horario desde cero.

El producto final que tenemos en mente es más amplio que la versión que hay ahora. Por eso separamos **lo que ya existe en el código** de **lo que sigue pendiente en el backlog**. Este documento no sustituye las historias de usuario de GitHub: las ordena para que sea más fácil entender el alcance.

## 2. Usuarios y funcionamiento general

El usuario principal es un estudiante que necesita organizar su tiempo de estudio. Cada cuenta debe mantener sus datos separados de los de otros estudiantes. La aplicación se usa desde un navegador y el servidor guarda la información en SQLite.

Recorrido previsto: crear una cuenta → añadir asignaturas → indicar disponibilidad y clases → registrar exámenes y entregas → generar un calendario de estudio → consultar y modificar las sesiones.

El recorrido **actual** llega hasta la creación de la cuenta, las notas rápidas y la gestión básica de asignaturas. Las demás etapas están planteadas en el Product Backlog.

## 3. Requisitos funcionales

| ID | Requisito | HU | Situación |
|---|---|---|---|
| RF01 | Registrar una cuenta con correo y contraseña | HU20 | Implementado |
| RF02 | Iniciar/cerrar sesión y consultar usuario actual | HU21 | Implementado |
| RF03 | Crear, consultar, editar, completar y borrar To-Dos rápidos | HU27 | Implementado |
| RF04 | Crear, listar, consultar, renombrar y eliminar asignaturas propias | HU01, HU23 | Implementado en su parte básica |
| RF05 | Definir las franjas semanales disponibles | HU02 | Pendiente |
| RF06 | Registrar el horario de clases y considerarlo ocupado | HU05 | Pendiente |
| RF07 | Guardar exámenes y entregas con sus fechas | HU03, HU04 | Pendiente |
| RF08 | Generar sesiones en horas libres y presentarlas en calendario | HU06, HU07, HU09 | Pendiente |
| RF09 | Dar mayor peso a fechas próximas y prioridades | HU08, HU12, HU13 | Pendiente |
| RF10 | Configurar descansos y cambiar sesiones manualmente | HU10, HU11 | Pendiente |
| RF11 | Marcar sesiones realizadas y replanificar las no realizadas | HU14, HU15 | Pendiente |
| RF12 | Consultar estadísticas de estudio y seguimiento semanal | HU18, HU22, HU24, HU25 | Pendiente |
| RF13 | Gestionar temario y preferencias por asignatura | HU16, HU26 | Pendiente |
| RF14 | Importar horarios por imagen y recibir recordatorios | HU17, HU19 | Pendiente |
| RF15 | Buscar y filtrar To-Dos rápidos | HU28, HU29 | Propuestas en backlog; hay filtrado cliente básico en la interfaz, pero debe verificarse la aceptación completa de las HU |

En las historias originales están las descripciones, el valor, las estimaciones y los criterios de aceptación: [Historias de usuario](../Historias-de-usuario.md). Para el refinamiento INVEST tenemos [este análisis](../Analisis-INVEST-Historias-de-Usuario.md).

## 4. Requisitos no funcionales que debemos cuidar

- **Privacidad:** los datos privados se consultan y modifican usando la identidad de la sesión; ninguna petición debe permitir trabajar con datos ajenos.
- **Seguridad de contraseñas:** no almacenar contraseñas en texto plano, sino su hash.
- **Persistencia:** la información debe seguir estando después de reiniciar la aplicación.
- **Validación:** los datos erróneos deben producir respuestas claras, no excepciones sin controlar.
- **Facilidad de uso:** formularios comprensibles y mensajes que ayuden a corregir un error.
- **Mantenibilidad:** nombres claros, documentación coherente con el código y pruebas para la lógica importante.

Son objetivos de calidad; no estamos diciendo que tengamos una auditoría completa que los certifique. Hay puntos por mejorar, como la configuración de secretos para un posible despliegue.

## 5. Fuera del alcance de la versión actual

Todavía no podemos afirmar que la web genere un plan real, importe un horario a partir de una imagen, mande recordatorios o calcule estadísticas de sesiones. Ver una pestaña en el dashboard no significa que su módulo ya esté implementado.

Tampoco debemos mezclar las tareas rápidas (HU27, sin planificación obligatoria) con tareas y entregas del calendario (HU04, con plazo y estimación de trabajo).

## 6. Cómo se validarán los requisitos

Cada requisito debe quedar relacionado con al menos una HU y con casos de prueba o una demostración de aceptación. Para comprobar RF01–RF04 están las pruebas de backend y frontend del repositorio. La documentación de pruebas explica su cobertura y sus limitaciones, pero sus resultados reales hay que obtenerlos ejecutándolas.

El cumplimiento final de RF05–RF14 dependerá de los incrementos de los próximos sprints.

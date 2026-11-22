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

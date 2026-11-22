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

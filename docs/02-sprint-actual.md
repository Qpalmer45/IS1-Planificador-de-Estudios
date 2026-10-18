# Sprint actual — cuentas, tareas y elección tecnológica

Registro preparado el 18/10/2026. Duración prevista de los sprints según el README: una semana.
Número del sprint, fecha de inicio y fecha de fin: **pendientes de completar por el equipo**.
No se inventan reuniones, responsables, estimaciones reales ni decisiones colectivas.

## Objetivo del sprint

Que una persona pueda registrarse, iniciar sesión y gestionar una lista personal de tareas persistente, dejando elegida y documentada la base tecnológica del proyecto.

El usuario confirmó que este sprint pretendía implementar estas historias y elegir tecnologías. Las tecnologías implementadas se explican en `01-tecnologias-y-arquitectura.md`; el equipo debe revisar la decisión.

## Sprint Backlog y trazabilidad

| Historia              | Issue             | Trabajo implementado                                                           | Estado                                                  |
| --------------------- | ----------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| HU20 Registro         | #20               | Formulario, validación, usuario persistente, correo único y hash de contraseña | Implementado en rama; revisión e integración pendientes |
| HU21 Inicio de sesión | #22               | Credenciales, cookie, restauración, caducidad y cierre de sesión               | Implementado en rama; revisión e integración pendientes |
| HU28 Lista de To-Dos  | #29               | Crear, listar, editar, eliminar, completar/desmarcar, filtros y propietario    | Implementado en rama; revisión e integración pendientes |
| Decisión técnica      | Documento ADR 001 | React/TS, Express/TS, PostgreSQL, pruebas y ejecución local                    | Escrita; revisión del equipo pendiente                  |

Las estimaciones originales son: registro 2 días, acceso 1 día y To-Dos 1 día. Son estimaciones del backlog, no horas realmente trabajadas ni un compromiso nuevo. Incluid también preparación del proyecto, revisión y pruebas al valorar la capacidad semanal.

## Trabajo técnico realizado

- [x] Base React/TypeScript, servidor Express y configuración de desarrollo.
- [x] Esquema PostgreSQL con usuarios, sesiones y tareas.
- [x] Registro y autenticación con validación de servidor.
- [x] Autorización por propietario en operaciones de tareas.
- [x] Interfaz adaptable, estados vacíos, errores y confirmación de borrado.
- [x] Pruebas automatizadas de API y recorrido de navegador escritas.
- [x] Flujo de CI y documentación de instalación.
- [ ] Revisión de la pull request por otra persona del equipo.
- [ ] Comprobar ejecución de CI con PostgreSQL real.
- [ ] Probar la instalación en el ordenador de un compañero.
- [ ] Revisión de criterios de aceptación y DoD por el equipo.
- [ ] Integrar la PR y actualizar el tablero cuando corresponda.
- [ ] Sprint Review y retrospectiva reales.

Consultar `04-pruebas.md` para resultados ejecutados y limitaciones. Una casilla de implementación no implica que la historia esté Done.

## Registro de trabajo diario (rellenar con hechos)

| Fecha     | Avance hacia el objetivo | Bloqueo | Próximo paso | Persona |
| --------- | ------------------------ | ------- | ------------ | ------- |
| Pendiente |                          |         |              |         |

La Daily es una conversación de Developers para inspeccionar el avance hacia el Sprint Goal y adaptar el plan. No necesita un acta extensa; basta actualizar tareas y anotar bloqueos relevantes.

## Sprint Review (rellenar después de celebrarla)

- Fecha y asistentes:
- Objetivo alcanzado: sí / parcialmente / no, con motivo.
- Demo: registro → acceso → tarea → edición → completar/desmarcar → recarga → salir.
- Comprobación con una segunda cuenta: no puede ver las tareas de la primera.
- Qué se ha terminado de acuerdo con la DoD:
- Qué queda sin terminar y vuelve al Product Backlog:
- Feedback recibido y cambios acordados en el backlog:
- Enlaces a PR, pruebas y capturas:

## Retrospectiva (rellenar después de celebrarla)

- Qué nos ayudó:
- Qué nos frenó:
- Una mejora concreta para el siguiente sprint:
- Responsable de impulsar la mejora:
- Cómo y cuándo comprobaremos que funciona:

Ejemplo orientativo, no decisión tomada: «Abrir PR antes del último día para que otra persona tenga tiempo de revisarla».

# Pruebas provisionales del backend (IS1)

Estas pruebas comprueban la lógica del backend Python/Flask, **no la interfaz de usuario**.

## Ejecutar

Desde la raíz del repositorio:

```bash
pip install -r requirements.txt
python -m unittest discover -s tests -v
```

Se utiliza la biblioteca estándar `unittest` y el cliente de pruebas de Flask.
Cada prueba trabaja con una base de datos SQLite temporal e independiente: **no modifica `todos.db`**.

## Cobertura provisional

- Vistas HTML: página principal, inicio de sesión y registro.
- Creación e inicialización de las tablas.
- Conexión SQLite y conversión de tareas a diccionario.
- Registro: normalización, validación, hash y duplicados.
- Inicio/cierre de sesión, credenciales incorrectas, petición sin JSON y estado de autenticación.
- Tareas: creación, validaciones, listado, orden, aislamiento por usuario, modificación de uno o varios campos y borrado.
- Asignaturas: creación, listado, detalle individual, edición, borrado, validación de entradas, autenticación y aislamiento por usuario.

## Casos pendientes conocidos

Hay **1 prueba marcada con `@unittest.expectedFailure`**:

1. Rechazar valores de `completada` que no sean booleanos (por ejemplo, `2`).

La suite actual no marca como fallidos esperados los casos de edición/borrado de tareas ajenas ni la actualización de tareas inexistentes: esos comportamientos cuentan con pruebas ordinarias. El caso pendiente de `completada` seguirá apareciendo como fallo esperado hasta que se implemente la validación en el backend y se retire el decorador.

## Pruebas de asignaturas

Las pruebas de asignaturas verifican el contrato de la API implementada en `app.py`. Comprueban creación, listado, detalle, edición, borrado, validación de entradas, autenticación y aislamiento por usuario.

El contrato usado por las pruebas es:

- `GET /api/asignaturas`: lista del usuario autenticado.
- `POST /api/asignaturas` con `{"nombre": "..."}`: creación (`201`).
- `GET /api/asignaturas/<id>`: detalle individual.
- `PATCH /api/asignaturas/<id>` con `{"nombre": "..."}`: edición.
- `DELETE /api/asignaturas/<id>`: borrado.
- El nombre se recorta y no puede faltar, quedar vacío ni ser de tipo distinto a texto.
- Las rutas requieren sesión; asignaturas inexistentes o pertenecientes a otra cuenta responden `404`.
- Las respuestas de detalle/creación incluyen `id`, `usuario_id` y `nombre`. El apartado individual devuelve solo la asignatura solicitada.

La historia no define aún cómo se modelan otros datos dentro del apartado (por ejemplo, temas o exámenes); estas pruebas verifican la identidad y separación de las asignaturas, no funcionalidades de esas otras historias. Tampoco prueban la navegación visual del navegador.

## Alcance

**Estado:** las pruebas de asignaturas ejercitan la implementación actual del backend. La interfaz de usuario no queda cubierta por estas pruebas.

## Metodología

La suite comprueba comportamientos mediante `unittest`, pero su estructura por sí sola no demuestra que se haya seguido TDD. Para afirmar TDD habría que verificar el historial de trabajo y confirmar el ciclo prueba fallida, implementación y refactorización. El único caso `expectedFailure` documenta una validación pendiente, no una funcionalidad aprobada.

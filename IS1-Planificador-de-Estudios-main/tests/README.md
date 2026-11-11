# Pruebas del proyecto (IS1)

El proyecto tiene pruebas del backend Python/Flask y pruebas del frontend JavaScript.
Las pruebas frontend usan un DOM simulado y respuestas HTTP falsas: no requieren
un servidor Flask ni modifican `todos.db`.

## Ejecutar las pruebas del backend

Desde la raíz del repositorio:

```bash
pip install -r requirements.txt
python -m unittest discover -s tests -p test_app.py -v
```

Se utiliza la biblioteca estándar `unittest` y el cliente de pruebas de Flask.
Cada prueba trabaja con una base de datos SQLite temporal e independiente: **no modifica `todos.db`**.

## Ejecutar las pruebas del frontend

Las pruebas del frontend usan **Jest** como ejecutor, junto con `jsdom` para simular
el navegador. Necesitas [Node.js 20 o posterior](https://nodejs.org/) y npm.
Abre el terminal integrado de VS Code en la raíz del repositorio y ejecuta:

```bash
npm.cmd install --no-package-lock
npm.cmd run test:frontend
```

El primer comando instala las dependencias de desarrollo declaradas en `package.json`
(Jest y jsdom). El segundo ejecuta `tests/app.test.js`, que comprueba el comportamiento
de `static/app.js` con un DOM y respuestas HTTP simulados: no inicia Flask ni contacta
con la API real. La opción de Node `--experimental-vm-modules` activa el soporte ESM que
Jest necesita para los imports del proyecto; por eso puede aparecer una advertencia de
Node sobre módulos VM experimentales.

Comandos útiles, siempre desde la raíz del repositorio:

```powershell
# Ejecutar solo las pruebas del frontend
npm.cmd run test:frontend

# Alias abreviado para las pruebas del frontend
npm.cmd test

# Ejecutar solo los casos cuyo nombre contenga el texto indicado
npm.cmd run test:frontend -- --testNamePattern="asignatura"

# Ejecutar las pruebas JavaScript y después las del backend Python
npm.cmd run test:all
```

Jest informa cuántas pruebas pasaron o fallaron y termina con un código de error distinto
de cero si alguna falla. Para repetir la ejecución tras cambiar el código, vuelve a lanzar
`npm.cmd run test:frontend`. El filtro `--testNamePattern` es útil para iterar sobre una
prueba concreta; si no coincide con ningún nombre, Jest no ejecutará casos.

En VS Code se pueden ejecutar estos comandos desde el terminal integrado de PowerShell.
Las pruebas Python continúan disponibles mediante `unittest`; las JavaScript se ejecutan
con Jest.

## Cobertura provisional

- Vistas HTML: página principal, inicio de sesión y registro.
- Creación e inicialización de las tablas.
- Conexión SQLite y conversión de tareas a diccionario.
- Registro: normalización, validación, hash y duplicados.
- Inicio/cierre de sesión, credenciales incorrectas, petición sin JSON y estado de autenticación.
- Tareas: creación, validaciones, listado, orden, aislamiento por usuario, modificación de uno o varios campos y borrado.
- Asignaturas: creación, listado, detalle individual, edición, borrado, validación de entradas, autenticación y aislamiento por usuario.
- Frontend: API HTTP simulada, navegación, feedback, listado/filtros/contadores de tareas, operaciones CRUD de tareas y asignaturas, diálogo accesible y carga inicial.

## Casos pendientes conocidos

En la suite de Python hay **1 prueba marcada con `@unittest.expectedFailure`**:

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

**Estado:** las pruebas de Python ejercitan el backend y las de `tests/app.test.js` ejercitan la lógica del frontend con un DOM simulado. No son pruebas visuales de navegador ni validan la integración con una API Flask en ejecución.

## Metodología

La suite comprueba comportamientos mediante `unittest`, pero su estructura por sí sola no demuestra que se haya seguido TDD. Para afirmar TDD habría que verificar el historial de trabajo y confirmar el ciclo prueba fallida, implementación y refactorización. El único caso `expectedFailure` documenta una validación pendiente, no una funcionalidad aprobada.

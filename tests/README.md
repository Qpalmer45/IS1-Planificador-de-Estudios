# Pruebas del proyecto (IS1)

El proyecto tiene pruebas del backend Python/Flask y pruebas del frontend JavaScript.
Las pruebas frontend usan un DOM simulado y respuestas HTTP falsas: no requieren
un servidor Flask ni modifican `todos.db`.

## Ejecutar las pruebas del backend

Desde la raíz del repositorio:

```bash
pip install -r requirements.txt
python -m unittest discover -s tests -p "test_*.py" -v
```

Para ejecutar solo las pruebas generales de Flask, se puede sustituir el patrón por `test_app.py`.
La suite utiliza la biblioteca estándar `unittest` y el cliente de pruebas de Flask.
`test_app.py` usa una base SQLite temporal para cada caso. Ten en cuenta que importar
`app.py` ejecuta `initialize_database()` sobre la ruta predeterminada antes de que
`test_app.py` cambie `DATABASE`; por tanto, el inicio de la suite puede crear o migrar
`todos.db`. No ejecutes las pruebas con datos importantes en esa base.

## Ejecutar las pruebas del frontend

Las pruebas del frontend usan **Jest** como ejecutor, junto con `jsdom` para simular
el navegador. Necesitas [Node.js 20 o posterior](https://nodejs.org/) y npm.
Abre el terminal integrado de VS Code en la raíz del repositorio y ejecuta:

```bash
npm.cmd install --no-package-lock
npm.cmd run test:frontend
```

El primer comando instala las dependencias de desarrollo declaradas en `package.json`
(Jest y jsdom). El segundo ejecuta ocho archivos: `app.test.js`, `theme.test.js`,
`plan.test.js`, `objetivos.test.js`, `examenes-form.test.js`,
`editar-asignaturas.test.js`, `avatar-flags.test.js` y `daily-chess.test.js`.
Comprueban lógica JavaScript con un DOM y respuestas simuladas: no inician Flask ni
contactan con proveedores externos. La opción de Node `--experimental-vm-modules` activa el soporte ESM que
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

- Backend: registro y sesiones; To-Dos; asignaturas y temas; tareas, entregas y exámenes; horarios y períodos libres; generación de planes, objetivos semanales y bloqueos; recordatorios; escudos y endpoints de ajedrez, incluido el fallback local.
- Frontend: navegación y feedback; operaciones de tareas y asignaturas; temas; plan semanal, descansos y bloqueos; formularios de objetivos y exámenes; tema visual; banderas y ajedrez.
- Para el listado exacto de módulos, consulta los patrones `tests/test_*.py` y `tests/*.test.js`, y los scripts de `package.json`.
- No hay todavía un caso que compruebe el reparto de horas extra entre asignaturas y actividades sin objetivo semanal; se ha observado que una actividad puede quedarse sin tiempo en esa combinación.

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

Las pruebas de asignaturas verifican la identidad y separación de esas entidades. Los temas y las actividades tienen pruebas y contratos propios; esta sección no sustituye esas pruebas ni comprueba la navegación visual en un navegador real.

## Alcance

**Estado:** las pruebas de Python ejercitan el backend con su cliente de pruebas; Jest ejercita ocho suites frontend con un DOM simulado. No son pruebas visuales en un navegador real ni validan en vivo las APIs externas de ajedrez y escudos.

## Metodología

La estructura de una suite no demuestra por sí sola que se haya seguido TDD; para afirmarlo habría que verificar el historial del ciclo prueba fallida, implementación y refactorización. El 23 de noviembre de 2026, `npm.cmd run test:all` terminó con 151 pruebas Jest y 171 pruebas Python superadas. Python emitió una advertencia no fatal de conexión SQLite abierta; la ejecución terminó con `OK`. La prueba frontend titulada «fallo de la API se muestra al usuario» todavía no contiene aserciones y no debe contarse como verificación efectiva de ese comportamiento.

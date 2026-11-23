# API del backend

> Contratos contrastados con `app.py` el 23 de noviembre de 2026.

## 1. Cómo hablamos con el servidor

La interfaz manda peticiones HTTP al servidor Flask. Para crear o modificar información envía objetos JSON con `Content-Type: application/json`. La respuesta suele ser otro JSON.

Los endpoints protegidos dependen de la sesión de Flask. Cuando no hay una sesión iniciada, responden con error 401. No se envía `usuario_id` en las peticiones para elegir el propietario: el servidor lo toma de la sesión.

Las rutas de datos privados requieren una sesión autenticada. Recordatorios comprueba la sesión manualmente y los endpoints de ajedrez y escudos no tienen el decorador de autenticación.

## 2. Páginas HTML

| Método y ruta | Uso |
|---|---|
| `GET /` | Dashboard; sin sesión redirige a login |
| `GET /login` | Formulario de inicio de sesión |
| `GET /registro` | Formulario de registro |

## 3. Cuentas y sesiones

| Método y ruta | Petición | Resultado habitual |
|---|---|---|
| `POST /api/registro` | `{"nombre":"Ana","email":"ana@ejemplo.es","password":"secreto123"}` | 201 con mensaje y objeto `usuario`; crea la sesión |
| `POST /api/login` | `{"email":"ana@ejemplo.es","password":"secreto123"}` | 200 con mensaje y objeto `usuario` |
| `POST /api/logout` | Sin cuerpo obligatorio | 200 con mensaje; borra la sesión |
| `GET /api/usuario_actual` | Sin cuerpo | 200: `{"autenticado":false}` o datos del usuario autenticado |

El correo se normaliza a minúsculas. El registro exige correo con formato básico y contraseña de al menos seis caracteres. Si el correo ya existe devuelve 409; un registro inválido devuelve 400. El login devuelve 401 para credenciales incorrectas.

Ejemplo de respuesta de registro/login:

```json
{
  "mensaje": "Inicio de sesión correcto.",
  "usuario": {"id": 1, "nombre": "Ana", "email": "ana@ejemplo.es"}
}
```

## 4. To-Dos rápidos (requieren sesión)

| Método y ruta | Acción | Respuesta normal |
|---|---|---|
| `GET /api/todos` | Listar To-Dos del usuario (más recientes primero) | 200, lista JSON |
| `POST /api/todos` | Crear con `{"titulo":"Repasar el tema 1"}` | 201, To-Do creado |
| `PATCH /api/todos/<id>` | Cambiar `titulo`, `completada` o ambos | 200, To-Do modificado |
| `DELETE /api/todos/<id>` | Borrar un To-Do propio | 200, mensaje |

Un To-Do tiene esta forma:

```json
{
  "id": 3,
  "usuario_id": 1,
  "titulo": "Repasar el tema 1",
  "completada": false,
  "prioridad": "media",
  "fecha_creacion": "2026-11-06 10:00:00"
}
```

La fecha es solo un ejemplo de formato. El título para crear To-Dos debe tener de 1 a 200 caracteres después de eliminar espacios exteriores. Las operaciones de edición o borrado sobre un recurso no disponible devuelven 404.

Al actualizar `completada`, la API exige un booleano JSON (`true` o `false`); números y otros tipos se rechazan.

## 5. Asignaturas (requieren sesión)

| Método y ruta | Acción | Respuesta normal |
|---|---|---|
| `GET /api/asignaturas` | Listar asignaturas propias | 200, lista JSON |
| `POST /api/asignaturas` | Crear con `{"nombre":"Cálculo Diferencial"}` | 201, asignatura |
| `GET /api/asignaturas/<id>` | Consultar asignatura propia | 200, asignatura |
| `PATCH /api/asignaturas/<id>` | Cambiar el nombre | 200, asignatura actualizada |
| `DELETE /api/asignaturas/<id>` | Eliminar asignatura | 200, mensaje |

Una asignatura devuelve identificador, propietario, nombre, dificultad, prioridad y objetivo semanal:

```json
{"id": 5, "usuario_id": 1, "nombre": "Cálculo Diferencial", "dificultad": "media", "prioridad": "media", "minutos_semanales": 0}
```

Para crear y modificar se exige un objeto JSON con `nombre` de tipo texto no vacío. Las asignaturas inexistentes o ajenas dan 404.

## 6. Horarios de Clases (HU05 - Requieren sesión)

| Método y ruta | Acción | Respuesta normal |
|---|---|---|
| `GET /api/horarios` | Listar bloques del horario semanal ordenados por día y hora | 200, lista JSON de bloques de clase |
| `POST /api/horarios` | Registrar nueva clase (soporta `asignatura_id` o `asignatura_nombre`) | 201, bloque creado |
| `GET /api/horarios/<id>` | Detalle de un bloque de horario propio | 200, bloque |
| `PATCH` o `PUT /api/horarios/<id>` | Actualizar día, hora, asignatura o aula | 200, bloque actualizado |
| `DELETE /api/horarios/<id>` | Eliminar bloque del horario | 200, mensaje |

Validaciones aplicadas:
- `hora_inicio < hora_fin` en formato `HH:MM`.
- Prevención de solapamientos horarios en el mismo día.
- Sincronización automática: si se especifica `asignatura_nombre` y no existe, se crea automáticamente en `asignaturas` con dificultad y prioridad `media`.

Ejemplo de bloque de clase:
```json
{
  "id": 1,
  "usuario_id": 1,
  "asignatura_id": 4,
  "asignatura_nombre": "Estructuras de Datos",
  "dia_semana": "lunes",
  "hora_inicio": "09:00",
  "hora_fin": "11:00",
  "aula": "Aula 201"
}
```

## 7. Días y Períodos Libres (HU02 - Requieren sesión)

| Método y ruta | Acción | Respuesta normal |
|---|---|---|
| `GET /api/periodos-libres` | Listar días y rangos libres ordenados por fecha | 200, lista JSON |
| `POST /api/periodos-libres` | Crear período (`fecha_inicio`, `fecha_fin`, `motivo`) | 201, período creado |
| `GET /api/periodos-libres/<id>` | Detalle de un período libre propio | 200, período |
| `PATCH` o `PUT /api/periodos-libres/<id>` | Modificar fechas o motivo | 200, período modificado |
| `DELETE /api/periodos-libres/<id>` | Eliminar día o período libre | 200, mensaje |

Validaciones aplicadas:
- Fechas en formato `AAAA-MM-DD`.
- `fecha_inicio <= fecha_fin`.

Ejemplo de período libre:
```json
{
  "id": 2,
  "usuario_id": 1,
  "fecha_inicio": "2026-12-23",
  "fecha_fin": "2027-01-07",
  "motivo": "Vacaciones de Navidad"
}
```

## 8. Temas, tareas y planificación (requieren sesión)

| Método y ruta | Acción | Respuesta habitual |
|---|---|---|
| `GET /api/asignaturas/<id>/temas` | Listar temas de una asignatura propia | 200, lista |
| `POST /api/asignaturas/<id>/temas` | Crear tema/apuntes | 201, tema |
| `PATCH /api/temas/<id>` | Editar tema o estado estudiado | 200, tema |
| `DELETE /api/temas/<id>` | Borrar tema propio | 200, mensaje |
| `GET /api/tareas` | Listar tareas, entregas y exámenes planificables | 200, lista |
| `POST /api/tareas` | Crear actividad con tipo, fecha y estimación | 201, actividad |
| `PATCH /api/tareas/<id>` | Modificar actividad propia | 200, actividad |
| `DELETE /api/tareas/<id>` | Borrar actividad propia | 204 |
| `GET /api/plan/datos` | Obtener asignaturas, To-Dos y actividades del usuario | 200, objeto JSON |
| `GET /api/plan/semana` | Generar vista previa con parámetros por query string | 200, plan semanal |
| `POST /api/plan/semana` | Generar vista previa con un objeto JSON | 200, plan semanal |

El cuerpo de `POST /api/plan/semana` admite `inicio` (fecha ISO), `desde`, `hasta` (`HH:MM`), `duracion` (25–180 minutos), `descanso` (0–60 minutos) y `bloqueos` (lista de `{fecha, inicio, fin, motivo}`). La ruta devuelve siete días, sesiones, bloqueos, déficits y `vista_previa: true`; no persiste sesiones. Si un examen está asociado a una asignatura, aumenta su prioridad de estudio, pero no crea horas de examen independientes.

Las tareas y entregas tienen fecha límite y minutos estimados. Los exámenes requieren una asignatura y utilizan los objetivos de esa asignatura.

## 9. Recordatorios (requieren sesión)

| Método y ruta | Acción |
|---|---|
| `GET /api/recordatorios` | Calcular los recordatorios próximos según las actividades y la preferencia del usuario |
| `GET /api/recordatorios/configuracion` | Consultar `dias_anticipacion` |
| `PUT /api/recordatorios/configuracion` | Guardar `{ "dias_anticipacion": 0..365 }` |

La preferencia predeterminada es 7 días. La autenticación se comprueba dentro de las rutas y una petición sin sesión devuelve 401.

## 10. Escudos y ajedrez

| Método y ruta | Acción | Respuesta habitual |
|---|---|---|
| `GET /api/perfil/escudos?liga=<código>` | Consultar equipos y escudos; códigos: `esp.1`, `esp.2`, `eng.1`, `ger.1`, `ita.1`, `fra.1` | 200; 400 para liga no válida; 503 si falla el proveedor y no hay caché |
| `GET /api/ajedrez/diario` | Obtener cinco ejercicios del día, sin exponer las soluciones | 200; 503 si no se puede formar un lote |
| `POST /api/ajedrez/comprobar` | Comprobar `{ "id": "...", "movimiento": "e2e4" }` en el servidor | 200 con `correcto`; 400 si la entrada es inválida; 404 si el ejercicio no está disponible |

El ajedrez consulta Chess Puzzle API y mantiene una caché diaria en memoria. Si el proveedor falla, excede el tiempo de espera o devuelve un lote incompleto, Flask utiliza cinco puzzles locales de reserva. En el funcionamiento normal, un fallo externo por sí solo no implica una respuesta 503. La prueba automatizada cubre este fallback; no verifica el proveedor externo en vivo.

## 11. Errores y convenciones

- **200**: petición realizada.
- **201**: recurso creado.
- **204**: recurso eliminado sin cuerpo de respuesta.
- **400**: datos inválidos, en los casos que valida el backend.
- **401**: sin sesión o credenciales incorrectas.
- **404**: recurso inexistente o no accesible para esa cuenta.
- **409**: correo ya registrado.
- **500**: error interno, por ejemplo durante la consulta de recordatorios.
- **503**: servicio externo no disponible y sin respuesta de reserva aplicable.

Las respuestas de error suelen utilizar `{"error":"mensaje"}`; las rutas de recordatorios también incluyen campos `status` o `mensaje`.

## 12. Funciones que todavía no tienen API

No existen rutas para guardar/completar sesiones generadas, mover una sesión concreta, replanificar sesiones no realizadas, importar un horario desde una imagen ni consultar estadísticas basadas en historial de estudio.

Documentación relacionada: [Arquitectura](02-Arquitectura-y-diseno.md), [Base de datos](03-Base-de-datos.md) y [Pruebas](../../tests/README.md).

# API del backend

## 1. Cómo hablamos con el servidor

La interfaz manda peticiones HTTP al servidor Flask. Para crear o modificar información envía objetos JSON con `Content-Type: application/json`. La respuesta suele ser otro JSON.

Los endpoints protegidos dependen de la sesión de Flask. Cuando no hay una sesión iniciada, responden con error 401. No se envía `usuario_id` en las peticiones para elegir el propietario: el servidor lo toma de la sesión.

Este documento refleja las rutas de `app.py` revisadas el 6 de noviembre de 2026.

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
  "fecha_creacion": "2026-11-06 10:00:00"
}
```

La fecha es solo un ejemplo de formato. El título para crear To-Dos debe tener de 1 a 200 caracteres después de eliminar espacios exteriores. Las operaciones de edición o borrado sobre un recurso no disponible devuelven 404.

**Limitación pendiente:** al actualizar `completada`, la implementación convierte el valor recibido según su verdad o falsedad. Falta rechazar explícitamente números y otros tipos que no sean `true` o `false` en JSON; no debe confundirse con un criterio ya validado.

## 5. Asignaturas (requieren sesión)

| Método y ruta | Acción | Respuesta normal |
|---|---|---|
| `GET /api/asignaturas` | Listar asignaturas propias | 200, lista JSON |
| `POST /api/asignaturas` | Crear con `{"nombre":"Cálculo Diferencial"}` | 201, asignatura |
| `GET /api/asignaturas/<id>` | Consultar asignatura propia | 200, asignatura |
| `PATCH /api/asignaturas/<id>` | Cambiar el nombre | 200, asignatura actualizada |
| `DELETE /api/asignaturas/<id>` | Eliminar asignatura | 200, mensaje |

Una asignatura se devuelve con `id`, `usuario_id` y `nombre`:

```json
{"id": 5, "usuario_id": 1, "nombre": "Cálculo Diferencial"}
```

Para crear y modificar se exige un objeto JSON con `nombre` de tipo texto no vacío. Las asignaturas inexistentes o ajenas dan 404.

## 6. Errores y convenciones

- **200**: petición realizada.
- **201**: recurso creado.
- **400**: datos inválidos, en los casos que valida el backend.
- **401**: sin sesión o credenciales incorrectas.
- **404**: recurso inexistente o no accesible para esa cuenta.
- **409**: correo ya registrado.

Las respuestas de error suelen utilizar `{"error":"mensaje" }`. No todos los casos mal formados se gestionan todavía con la misma precisión; la validación de tipos de entrada sigue siendo un punto de mejora.

## 7. Lo que todavía no tiene API

No existen en el backend actual rutas para disponibilidad semanal, clases, calendario, generación automática, exámenes, estadísticas o recordatorios. Las añadiremos cuando implementemos las historias correspondientes. Hasta entonces no se deben publicar ejemplos de llamadas a esas rutas como si funcionaran.

Documentación relacionada: [Arquitectura](02-Arquitectura-y-diseno.md), [Base de datos](03-Base-de-datos.md) y [Pruebas](../../tests/README.md).

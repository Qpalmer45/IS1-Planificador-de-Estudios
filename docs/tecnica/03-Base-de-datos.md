# Base de datos

## 1. Qué estamos usando

Guardamos los datos en un archivo SQLite llamado `todos.db`, en la raíz del repositorio de trabajo. Se crea automáticamente al arrancar la aplicación si no existe. Python se conecta mediante `sqlite3` desde `app.py`.

La función `initialize_database()` prepara las tablas y aplica dos pequeñas adaptaciones a bases antiguas: añadir `nombre` y `fecha_creacion` a usuarios, o `fecha_creacion` a To-Dos si faltan. No hay un sistema de migraciones independiente.

## 2. Tablas implementadas

### usuarios

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador |
| `nombre` | TEXT NOT NULL DEFAULT '' | Nombre mostrado en la web |
| `email` | TEXT UNIQUE NOT NULL | Correo único de acceso |
| `password_hash` | TEXT NOT NULL | Hash de la contraseña |
| `fecha_creacion` | DATETIME DEFAULT CURRENT_TIMESTAMP | Momento de alta |

No guardamos la contraseña original. El hash lo genera Werkzeug.

### todos

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador del To-Do |
| `usuario_id` | INTEGER NOT NULL | Propietario, referencia a `usuarios.id` |
| `titulo` | TEXT NOT NULL | Texto de la tarea rápida |
| `completada` | INTEGER NOT NULL DEFAULT 0 | 0 pendiente, 1 completada |
| `fecha_creacion` | DATETIME DEFAULT CURRENT_TIMESTAMP | Momento de creación |

La columna `completada` tiene una restricción `CHECK (completada IN (0, 1))`. La API devuelve este valor como booleano. En la versión revisada, al actualizarla con Python se utiliza la verdad/falsedad del valor recibido y todavía falta exigir que sea un booleano JSON real; aparece señalado en las pruebas.

### asignaturas

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador |
| `usuario_id` | INTEGER NOT NULL | Propietario, referencia a `usuarios.id` |
| `nombre` | TEXT NOT NULL | Nombre de la asignatura |
| `fecha_creacion` | DATETIME DEFAULT CURRENT_TIMESTAMP | Momento de creación |

Por ahora solo se guarda el nombre de cada asignatura. Las futuras notas de temario, fechas de examen u horas objetivo no tienen todavía su propia tabla implementada.

## 3. Relaciones

```text
usuarios (1)
   ├──────── (N) todos
   └──────── (N) asignaturas
```

Cada To-Do y cada asignatura pertenece exactamente a un usuario. Las dos claves foráneas llevan `ON DELETE CASCADE`, por lo que si se elimina un usuario a nivel de base de datos también se eliminan sus registros relacionados. En las conexiones normales se activa `PRAGMA foreign_keys = ON`.

## 4. Acceso a los datos

La función `get_db()` abre una conexión por contexto de petición Flask y utiliza `sqlite3.Row` para leer columnas por nombre. `close_db()` cierra esa conexión cuando acaba la petición.

Los valores de las consultas SQL se envían como parámetros `?`, evitando concatenar directamente los datos del formulario. Las operaciones sobre registros privados filtran mediante `usuario_id` extraído de la sesión.

## 5. Datos de desarrollo y pruebas

Las pruebas de backend utilizan una base temporal, según `tests/README.md`, para evitar modificar la base de uso normal. No conviene subir copias de `todos.db` con datos de usuarios reales al repositorio. Si se necesita compartir ejemplos, es mejor preparar datos ficticios.

## 6. Cambios previstos

Para HU02 y HU05 tendremos que estudiar nuevas tablas de disponibilidad y clases. Más adelante harán falta modelos de exámenes, entregas, sesiones de estudio y resultados. Sus campos, claves y restricciones deberán aprobarse con las respectivas HU antes de dar el diseño por definitivo.

El diseño de datos descrito aquí corresponde a lo que hace `initialize_database()` en el código actual, no al producto final.

# Base de datos

## 1. Qué estamos usando

Guardamos los datos en un archivo SQLite llamado `todos.db`, junto a `app.py`. Se crea automáticamente al importar la aplicación si no existe. Python se conecta mediante `sqlite3`.

`initialize_database()` crea las tablas e incorpora columnas que falten en instalaciones anteriores. `preparar_tabla_actividades()` migra el esquema antiguo de actividades para admitir también exámenes. No hay un sistema de migraciones independiente.

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
| `prioridad` | TEXT NOT NULL DEFAULT 'media' | Prioridad baja, media o alta |
| `fecha_creacion` | DATETIME DEFAULT CURRENT_TIMESTAMP | Momento de creación |

La columna `completada` tiene una restricción `CHECK (completada IN (0, 1))`. La API exige un booleano JSON real al actualizarla y devuelve el valor como booleano.

### asignaturas

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador |
| `usuario_id` | INTEGER NOT NULL | Propietario, referencia a `usuarios.id` |
| `nombre` | TEXT NOT NULL | Nombre de la asignatura |
| `dificultad` | TEXT NOT NULL DEFAULT 'media' | Dificultad ('baja', 'media', 'alta') |
| `prioridad` | TEXT NOT NULL DEFAULT 'media' | Prioridad ('baja', 'media', 'alta') |
| `minutos_semanales` | INTEGER NOT NULL DEFAULT 0 | Objetivo semanal de estudio |
| `fecha_creacion` | DATETIME DEFAULT CURRENT_TIMESTAMP | Momento de creación |

### temas (HU26)

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador del tema |
| `usuario_id` | INTEGER NOT NULL | Propietario |
| `asignatura_id` | INTEGER NOT NULL | Asignatura a la que pertenece |
| `titulo` | TEXT NOT NULL | Nombre del tema |
| `contenido` | TEXT NOT NULL DEFAULT '' | Apuntes asociados |
| `estudiado` | INTEGER NOT NULL DEFAULT 0 | Estado del tema, restringido a 0 o 1 |

### tareas_planificadas (HU04)

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador de la actividad |
| `usuario_id` | INTEGER NOT NULL | Propietario |
| `titulo` | TEXT NOT NULL | Nombre de tarea, entrega o examen |
| `tipo` | TEXT NOT NULL | `tarea`, `entrega` o `examen` |
| `fecha_limite` | TEXT NOT NULL | Fecha límite en formato ISO |
| `minutos_estimados` | INTEGER NOT NULL | Trabajo estimado, debe ser positivo |
| `minutos_semanales` | INTEGER NOT NULL DEFAULT 0 | Objetivo semanal; los exámenes usan el objetivo de su asignatura |
| `asignatura_id` | INTEGER, opcional | Asignatura asociada, validada por la API |

Los To-Dos rápidos se guardan en `todos`; no son las tareas/entregas/exámenes planificables de `tareas_planificadas`.

### horarios_clases (HU05)

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador del bloque de horario |
| `usuario_id` | INTEGER NOT NULL | Propietario, referencia a `usuarios.id` (ON DELETE CASCADE) |
| `asignatura_id` | INTEGER NOT NULL | Asignatura asociada, referencia a `asignaturas.id` (ON DELETE CASCADE) |
| `dia_semana` | TEXT NOT NULL | Día de la semana ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') |
| `hora_inicio` | TEXT NOT NULL | Hora de inicio formato 'HH:MM' (24h) |
| `hora_fin` | TEXT NOT NULL | Hora de fin formato 'HH:MM' (24h) |
| `aula` | TEXT NOT NULL DEFAULT '' | Aula o ubicación de la clase (opcional) |
| `fecha_creacion` | DATETIME DEFAULT CURRENT_TIMESTAMP | Momento de registro |

### periodos_libres (HU02)

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Identificador del período libre |
| `usuario_id` | INTEGER NOT NULL | Propietario, referencia a `usuarios.id` (ON DELETE CASCADE) |
| `fecha_inicio` | TEXT NOT NULL | Fecha de inicio en formato 'AAAA-MM-DD' |
| `fecha_fin` | TEXT NOT NULL | Fecha de fin en formato 'AAAA-MM-DD' |
| `motivo` | TEXT NOT NULL DEFAULT 'Día libre' | Motivo o etiqueta (ej. Festivo, Vacaciones) |
| `fecha_creacion` | DATETIME DEFAULT CURRENT_TIMESTAMP | Momento de registro |

### preferencias_recordatorios (HU19)

| Columna | Tipo | Para qué sirve |
|---|---|---|
| `usuario_id` | INTEGER PRIMARY KEY | Cuenta propietaria |
| `dias_anticipacion` | INTEGER NOT NULL DEFAULT 7 | Antelación configurable entre 0 y 365 días |

Los recordatorios se calculan a partir de las actividades próximas; no se guarda una fila por recordatorio.

## 3. Relaciones

```text
usuarios (1)
   ├──────── (N) todos
   ├──────── (N) asignaturas
   │                ├──────── (N) temas
   │                └──────── (N) horarios_clases
   ├──────── (N) horarios_clases
   ├──────── (N) periodos_libres
   ├──────── (N) tareas_planificadas
   └──────── (1) preferencias_recordatorios
```

Los To-Dos, asignaturas, temas, horarios, períodos libres, actividades y preferencias están asociados a una cuenta. Las referencias de usuario y las de tema/asignatura usan `ON DELETE CASCADE`; `tareas_planificadas.asignatura_id` se valida en la aplicación, pero no declara una clave foránea. En las conexiones se activa `PRAGMA foreign_keys = ON`.

## 4. Acceso a los datos

La función `get_db()` abre una conexión por contexto de petición Flask y utiliza `sqlite3.Row` para leer columnas por nombre. `close_db()` cierra esa conexión cuando acaba la petición.

Los valores de las consultas SQL se envían como parámetros `?`, evitando concatenar directamente los datos del formulario. Las operaciones sobre registros privados filtran mediante `usuario_id` extraído de la sesión.

## 5. Datos de desarrollo y pruebas

Las pruebas de `test_app.py` cambian `DATABASE` a una base temporal antes de ejecutar cada caso. Sin embargo, importar `app.py` llama a `initialize_database()` sobre la ruta predeterminada `todos.db`; por ello, iniciar las pruebas puede crear esa base o aplicar migraciones antes de que se configure la base temporal. No conviene ejecutar las pruebas con datos importantes en esa base ni subir copias con datos reales al repositorio.

## 6. Datos que no se persisten en SQLite

El plan semanal es una vista previa: sesiones, parámetros y bloqueos puntuales no se guardan en estas tablas. `static/plan.js` conserva el plan y los bloqueos en `localStorage` del navegador. Tampoco existe una tabla de progreso de estudio. El caché diario de ajedrez reside en memoria del servidor y no se guarda en la base de datos.

El esquema descrito corresponde a `initialize_database()` en el código actual y puede cambiar si se incorporan sesiones persistentes o un historial de estudio.

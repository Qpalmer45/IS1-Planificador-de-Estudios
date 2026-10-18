# Tecnologías y arquitectura — ADR 001

Fecha: 18/10/2026. Estado: implementadas en esta rama; pendiente de revisión del equipo.
Historias: HU20 (#20), HU21 (#22), HU28 (#29).

## Decisión y motivo

| Parte              | Tecnología utilizada                | Para qué y por qué                                                                                               |
| ------------------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Interfaz           | React + TypeScript                  | Formularios, sesión y lista de tareas; componentes reutilizables y tipos compartidos conceptualmente con la API. |
| Desarrollo y build | Vite                                | Servidor de desarrollo con proxy de `/api` y generación de archivos estáticos.                                   |
| Estilo             | CSS adaptable                       | Interfaz de escritorio y móvil sin framework adicional.                                                          |
| Servidor           | Node.js 24 + Express 5 + TypeScript | API HTTP y validación de las operaciones. Un mismo lenguaje en cliente y servidor.                               |
| Persistencia       | PostgreSQL 17 + `pg`                | Usuarios, sesiones y tareas relacionados; restricciones e índices. Consultas SQL parametrizadas.                 |
| Validación         | Zod                                 | Validar en el servidor correos, contraseñas, títulos y estados.                                                  |
| Contraseñas        | `node:crypto` / scrypt              | Hash con sal aleatoria; no se guardan contraseñas en claro.                                                      |
| Sesión             | Token aleatorio + cookie HttpOnly   | Token opaco de 256 bits; solo su SHA-256 se guarda en PostgreSQL. Expira a los siete días.                       |
| Seguridad HTTP     | Helmet + express-rate-limit         | Cabeceras de seguridad y límite en registro/login.                                                               |
| Pruebas            | Vitest, Supertest y Playwright      | API, aislamiento entre cuentas y recorrido en navegador.                                                         |
| Entorno de BD      | Docker Compose                      | PostgreSQL local con volumen persistente. También se admite PostgreSQL instalado directamente.                   |
| Automatización     | GitHub Actions                      | Compilación y pruebas con PostgreSQL real al subir cambios/abrir PR.                                             |

Las versiones resueltas están en `package-lock.json`. Usar `npm ci` para reproducirlas.
PGlite es un motor PostgreSQL embebido usado únicamente por las pruebas si no se proporciona `TEST_DATABASE_URL`; no es la base de datos de la aplicación.

## Arquitectura y responsabilidades

- `client/main.tsx`: pantallas de acceso y tareas; no almacena credenciales ni tokens en localStorage.
- `client/api.ts`: cliente HTTP, errores y tipos de respuestas.
- `server/app.ts`: endpoints, validaciones, autenticación y autorización por propietario.
- `server/security.ts`: hash de contraseñas y tokens.
- `server/db.ts`: conexión y carga del esquema.
- `server/schema.sql`: definición inicial de las tablas.
- `server/index.ts`: arranque con configuración de entorno y cierre de conexión.
- `tests/`: pruebas de API y navegador.

En desarrollo React sirve en 5173 y reenvía `/api` a Express en 3001. En producción Express sirve `dist/client` y la API bajo el mismo origen. HTTPS debe terminar en el proxy del alojamiento.

## Modelo de datos

| Tabla    | Campos principales                                    | Relación                          |
| -------- | ----------------------------------------------------- | --------------------------------- |
| users    | id, name, email único, password_hash, created_at      | Propietario de sesiones y tareas  |
| sessions | token_hash, user_id, expires_at                       | Varias sesiones por usuario       |
| tasks    | id, user_id, title, completed, created_at, updated_at | Cada tarea pertenece a un usuario |

La eliminación de usuarios propaga a sesiones/tareas mediante claves foráneas, aunque este sprint no incorpora una función para borrar cuentas. El título de tarea tiene entre 1 y 200 caracteres. La contraseña de registro tiene entre 8 y 128 caracteres; el correo se normaliza a minúsculas.

## API

Todas las escrituras usan JSON y `X-Requested-With: study-planner`. Los navegadores deben enviar un Origin coincidente con APP_ORIGIN. No se habilita CORS entre orígenes.

| Método y ruta           | Entrada               | Resultado                                                     |
| ----------------------- | --------------------- | ------------------------------------------------------------- |
| POST /api/auth/register | name, email, password | 201 y usuario; 400 inválido; 409 correo ya usado              |
| POST /api/auth/login    | email, password       | 200 y usuario, cookie de sesión; 401 credenciales incorrectas |
| GET /api/auth/me        | Cookie                | 200 usuario o 401                                             |
| POST /api/auth/logout   | Cookie si existe      | 204, revocación en BD y eliminación de cookie                 |
| GET /api/tasks          | Cookie                | 200 y lista propia                                            |
| POST /api/tasks         | title                 | 201 y tarea propia                                            |
| PATCH /api/tasks/:id    | title y/o completed   | 200 y tarea actualizada                                       |
| DELETE /api/tasks/:id   | Sin cuerpo            | 204                                                           |

Tareas requieren sesión; devuelven 401 sin ella, 400 si los datos son inválidos y 404 si una tarea no existe o no pertenece al usuario. Los filtros Todas/Pendientes/Completadas se aplican en el cliente. Una tarea completada se puede desmarcar.

## Límites y decisiones pendientes

- El alcance es registro, acceso y To-Dos. No se incluyen recuperación de contraseña, verificación de correo ni la planificación académica de HU04.
- La sesión dura siete días sin renovación automática; volver a entrar crea una sesión nueva y revoca la anterior del navegador.
- El limitador es en memoria, adecuado para una instancia. Para varias instancias hará falta un almacén compartido y configuración explícita del proxy.
- `CREATE TABLE IF NOT EXISTS` sirve para este esquema inicial. Las futuras modificaciones de columnas necesitan migraciones versionadas.
- El despliegue público, HTTPS, copias de seguridad y gestión de secretos quedan para el sprint de despliegue. No se ha publicado la aplicación.
- No hay roles de administración ni datos personales compartidos entre usuarios.

## Fuentes técnicas

- https://expressjs.com/en/advanced/best-practice-security/
- https://vite.dev/guide/

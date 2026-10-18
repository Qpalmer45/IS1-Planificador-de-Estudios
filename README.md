# IS1 · Planificador de Estudios

Aplicación web para Ingeniería del Software I, UCM, curso 2026–2027. Su objetivo es organizar asignaturas, disponibilidad, exámenes y tareas para generar un plan de estudio personalizado.

## Estado de esta versión

Primera implementación: **registro (#20), inicio/cierre de sesión (#22) y lista personal de To-Dos (#29)**. Permite crear, editar, eliminar, completar/desmarcar y filtrar tareas; los datos persisten en PostgreSQL. Las demás historias del planificador siguen pendientes.

El código de esta rama está preparado para revisión. Consultar [pruebas y limitaciones](docs/04-pruebas.md) antes de considerar las historias terminadas. No hay despliegue público de esta versión.

## Tecnologías utilizadas

React + TypeScript + Vite; Node.js 24 + Express 5 + TypeScript; PostgreSQL 17. CSS adaptable, Zod, Helmet, scrypt, cookies HttpOnly, Vitest/Supertest, Playwright y GitHub Actions. [Motivos, arquitectura, modelo y API](docs/01-tecnologias-y-arquitectura.md).

## Arranque local, paso a paso

Requisitos: Git, Node.js 24 (mínimo 22.12), npm y Docker Desktop con el motor iniciado. Alternativa: PostgreSQL instalado localmente y una base vacía propia.

1. Clonar el repositorio o actualizar la copia existente:

   ```bash
   git clone https://github.com/Qpalmer45/IS1-Planificador-de-Estudios.git
   cd IS1-Planificador-de-Estudios
   ```

   Para probar esta PR antes de fusionarla:

   ```bash
   git fetch origin
   git switch --track origin/feat/cuentas-y-tareas
   ```

   Si esa rama ya existe en tu ordenador, usa `git switch feat/cuentas-y-tareas`. Guarda o confirma tus cambios locales antes de cambiar de rama. Tras fusionar, el código estará en main.

2. Instalar las dependencias exactas:

   ```bash
   npm ci
   ```

3. Copiar `.env.example` a `.env`. En Git Bash:

   ```bash
   cp .env.example .env
   ```

   También puedes copiar y renombrar el archivo desde el explorador de Windows. No subas `.env` a GitHub.

4. Iniciar PostgreSQL y esperar a que esté listo:

   ```bash
   docker compose up -d --wait
   ```

   Si usas PostgreSQL sin Docker, crea una base y un usuario propios y configura `DATABASE_URL` en `.env`. El esquema inicial se crea al arrancar la API. Si el puerto 5432 ya está ocupado, cambia el puerto publicado de compose y la URL de conexión para que coincidan.

5. Iniciar la aplicación:

   ```bash
   npm run dev
   ```

6. Abrir **http://localhost:5173**. Usar exactamente ese origen, que coincide con `APP_ORIGIN`. Crear una cuenta, iniciar sesión y añadir una tarea. Recargar: la cuenta y las tareas siguen guardadas. Pulsar Ctrl+C en la terminal para detener cliente/API.

7. Para detener la BD conservando datos:

   ```bash
   docker compose stop
   ```

El volumen `study_data` mantiene los datos entre reinicios. Las credenciales del ejemplo son solo para desarrollo local.

## Comprobaciones

```bash
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

- `build`: comprueba TypeScript y genera el cliente en `dist/client`.
- `test`: pruebas API, por defecto con PGlite aislado; no necesitan Docker.
- `test:e2e`: levanta una API y un cliente de prueba en 3001/5173. Detén antes `npm run dev`. Los usuarios de prueba no se guardan en la BD de desarrollo.
- Para ejecutar pruebas sobre PostgreSQL real, establecer `TEST_DATABASE_URL` a una **base exclusivamente de pruebas**. La suite vacía la tabla users y sus dependencias. Nunca apuntarla a datos de desarrollo/producción que quieras conservar.
- En CI se usa PostgreSQL 17 real y se ejecutan API y navegador. Los resultados se ven en la pestaña Actions.

## Producción (preparación, no desplegado)

Ejecutar `npm run build`; en `.env` configurar DATABASE_URL, `NODE_ENV=production` y `APP_ORIGIN=https://tu-dominio`. Ejecutar `npm start` detrás de un proxy HTTPS. Express sirve el cliente compilado y la API en el mismo origen. `tsx` debe estar instalado para ejecutar el servidor TypeScript (no usar `npm ci --omit=dev` con esta configuración). Credenciales, HTTPS, backups y despliegue deben configurarse antes de una publicación real.

## Documentación

1. [Tecnologías, arquitectura y API](docs/01-tecnologias-y-arquitectura.md)
2. [Sprint actual: objetivo, tareas y plantillas de Review/retrospectiva](docs/02-sprint-actual.md)
3. [Definition of Done propuesta y uso del tablero](docs/03-definition-of-done.md)
4. [Pruebas y guion de demo](docs/04-pruebas.md)
5. [Qué falta, dónde escribirlo y cómo hacerlo paso a paso](docs/05-guia-documentacion-y-pendientes.md)
6. [Inventario de historias del Product Backlog](docs/06-backlog.md)

## Scrum

Sprints de **una semana**. GitHub Issues para historias y tareas; GitHub Projects para su seguimiento.

`Product Backlog → Sprint Backlog → To Do → In Progress → In Review → Completed`

Los issues son la fuente de estado vivo. El backlog inicial tenía 20 historias y se amplió posteriormente; el inventario documenta los números reales. No se deben considerar Done las funcionalidades solo porque su issue existe.

## Equipo

- Joaquín Palmer Pifarré
- Antonio Bucciarelli Imbrondone
- Yong Sheng Zhou Zhou
- Pablo Pérez Roldán
- Andrés Fernández Cordero

Asignación de Product Owner, Scrum Master y Developers: pendiente de documentar por el equipo.

## Estructura

- `client/`: interfaz y cliente API.
- `server/`: API, autenticación, acceso SQL y esquema inicial.
- `tests/`: pruebas API y navegador.
- `docs/`: documentación técnica y Scrum.
- `.github/`: CI y plantilla de PR.
- `compose.yaml`: PostgreSQL para desarrollo local.

Licencia MIT; consultar [LICENSE](LICENSE).

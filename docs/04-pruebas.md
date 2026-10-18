# Pruebas y guion de demostración

## Resultados ejecutados en esta sesión

Fecha: 18/10/2026. Entorno: Node.js 24.19.0, Linux.

| Comprobación                           | Resultado                               | Alcance                                                                                           |
| -------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run build`                        | Correcto                                | TypeScript y compilación del cliente                                                              |
| `npm test`                             | 9/9 pruebas correctas                   | API con esquema SQL real ejecutado en PGlite aislado                                              |
| `npm run test:e2e` con Chromium local  | 1/1 recorrido completo correcto         | Navegador Chromium 153, API de pruebas con PGlite, escritorio y viewport móvil 390×844            |
| Inspección visual                      | Correcta                                | Capturas de tareas de escritorio y acceso móvil; ajuste de espacio entre palabras en título móvil |
| PostgreSQL 17 externo / Docker Compose | Pendiente de verificación por CI/equipo | No había Docker/PostgreSQL instalados en este entorno                                             |
| Instalación en Windows de un compañero | Pendiente                               | Seguir README y registrar resultado                                                               |

La descarga estándar de Chromium desde Playwright falló en este entorno. Se ejecutó el recorrido con un binario Chromium alternativo local usando `CHROMIUM_PATH`; el proyecto admite ese override. No se incluye ese binario ni su instalación temporal en el repositorio. CI configura la instalación estándar con `npx playwright install --with-deps chromium`.

Las capturas y trazas se generan en `test-results/`, excluido de Git; CI las adjunta como artefacto. Que el flujo de CI esté escrito no prueba que ya haya pasado: consultar Actions en la PR.

## Cobertura de API

1. Registro con correo normalizado, hash de contraseña, correo repetido y datos inválidos.
2. Inicio de sesión, restauración en otra instancia de la API usando la misma BD y revocación al salir.
3. Credenciales erróneas y cuenta inexistente producen el mismo error de acceso.
4. Rotación de sesión y rechazo tras caducidad.
5. Protección CSRF por cabecera/origen y límite de intentos.
6. Cookie Secure en producción y almacenamiento del hash del token.
7. Crear, listar, editar, completar, desmarcar y eliminar tareas; persistencia entre sesiones.
8. Cuenta B no lista ni modifica/elimina tareas de A aunque conozca el identificador; rutas protegidas sin sesión.
9. Validación de título, tipos, identificadores y JSON incorrecto.

## Recorrido de navegador

Registro con contraseñas que no coinciden → corrección → cuenta creada → login → tarea → edición → completar → filtro pendientes → filtro completadas → desmarcar → recargar → revisar vista móvil → eliminar con confirmación → logout → recargar sin acceso autenticado.

## Demo manual para la Sprint Review

| Paso | Acción                                     | Resultado esperado                    |
| ---- | ------------------------------------------ | ------------------------------------- |
| 1    | Arrancar según README                      | Pantalla de acceso                    |
| 2    | Crear cuenta A con correo nuevo            | Confirmación y formulario de acceso   |
| 3    | Registrar de nuevo el mismo correo         | Error claro, sin cuenta duplicada     |
| 4    | Entrar con clave incorrecta                | No entra; mensaje de error            |
| 5    | Entrar con la clave correcta               | Espacio personal                      |
| 6    | Añadir, editar y completar una tarea       | Se reflejan cambios y contador        |
| 7    | Filtrar pendientes/completadas y desmarcar | Cada vista muestra el estado correcto |
| 8    | Recargar y volver a iniciar sesión         | Datos persistentes                    |
| 9    | Crear y entrar con cuenta B                | No ve las tareas de A                 |
| 10   | Volver a A y eliminar una tarea            | Confirmación y desaparición           |
| 11   | Cerrar sesión y recargar                   | Pantalla de acceso                    |

Usad datos ficticios para la demo. No escribáis contraseñas en issues, capturas ni documentos.

## Registrar una ejecución del equipo

- Fecha y persona:
- Sistema y versión de Node:
- Base usada (PostgreSQL de pruebas / PGlite):
- Comandos o pasos realizados:
- Resultado real:
- Fallos y enlace a issue, si existen:
- Enlace a ejecución de Actions o evidencia:

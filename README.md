# IS1 - Planificador de Estudios

## Descripción

Aplicación web desarrollada para la asignatura **Ingeniería del Software I**.

El objetivo del proyecto es crear un planificador de estudios capaz de generar automáticamente un horario de estudio personalizado a partir de la información proporcionada por el usuario, como sus asignaturas, disponibilidad, horario de clases, exámenes y tareas.

## Objetivos

- Facilitar la organización del estudio.
- Generar automáticamente planes de estudio personalizados.
- Tener en cuenta clases, disponibilidad, exámenes y entregas.
- Priorizar el estudio según fechas e importancia.
- Permitir modificar la planificación cuando sea necesario.

## Funcionalidades principales

- Gestión de asignaturas (dificultad, prioridad, horas semanales objetivo y temario).
- Registro de exámenes, tareas y entregas con fecha límite.
- Introducción del horario semanal de clases y días no lectivos.
- Generación automática del plan de estudio semanal.
- Panel de recordatorios con antelación configurable por usuario.
- Lista de To-Dos rápidos.
- Reto diario de ajedrez con cinco puzzles externos y reserva local.

## Tecnologías

Pila tecnológica utilizada para la aplicación web:

- **Lenguaje:** Python 3
- **Backend:** Flask
- **Frontend:** HTML5, CSS3 y JavaScript moderno
- **Base de datos:** SQLite (módulo estándar `sqlite3` de Python)
- **Pruebas del backend:** `unittest`
- **Pruebas del frontend:** Jest y jsdom (Node.js 20 o posterior)
- **Control de versiones:** Git & GitHub

## Metodología

El proyecto se desarrolla utilizando **Scrum** con Sprints de **dos semanas**, organizando el trabajo mediante **GitHub Issues** y **GitHub Projects**.

Flujo de trabajo:

`Product Backlog → Sprint Backlog → To Do → In Progress → In Review → Completed`

## Product Backlog

El Product Backlog está compuesto por las Historias de Usuario documentadas en `docs/Historias-de-usuario.md` y vinculadas a las Issues de GitHub.

## Equipo

- Joaquín Palmer Pifarré
- Antonio Bucciarelli Imbrondone
- Yong Sheng Zhou Zhou
- Pablo Pérez Roldán
- Andrés Fernández Cordero

## Cómo poner en marcha la aplicación

### Primera vez (Windows)

1. Instala **Python 3.10 o superior** y **Git**.
2. Abre una terminal en la carpeta donde quieras guardar el proyecto y descárgalo:

   ```powershell
   git clone https://github.com/Qpalmer45/IS1-Planificador-de-Estudios.git
   cd IS1-Planificador-de-Estudios
   ```

3. Crea un entorno virtual e instala las dependencias:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

4. Arranca el servidor:

   ```powershell
   .\.venv\Scripts\python.exe app.py
   ```

5. Abre **http://127.0.0.1:5000** en el navegador. Para detener el servidor, pulsa **Ctrl + C** en la terminal.

### Para abrirla otro día

Abre la carpeta `IS1-Planificador-de-Estudios` en VS Code, abre la terminal y ejecuta:

```powershell
.\.venv\Scripts\python.exe app.py
```

### Pruebas

Las pruebas del backend usan `unittest` y no requieren instalar Node.js:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py" -v
```

Para las pruebas del frontend sí necesitas **Node.js 20 o posterior**. Desde la raíz del repositorio:

```powershell
npm.cmd install --no-package-lock
npm.cmd run test:frontend
```

También puedes lanzar ambas suites con `npm.cmd run test:all` una vez instaladas las dependencias del frontend.

## Estructura del proyecto

```text
IS1-Planificador-de-Estudios/
├── app.py                # Servidor web Flask, rutas, autenticación y APIs REST
├── planificador.py       # Motor de generación automática del plan de estudio semanal
├── requirements.txt      # Dependencias de Python (Flask)
├── package.json          # Dependencias y comandos Jest del frontend
├── todos.db              # Base de datos SQLite local (se genera automáticamente)
├── static/
│   ├── app.js            # Lógica cliente principal: dashboard, asignaturas y To-Dos
│   ├── horario.js        # Cuadrícula semanal de clases y días libres
│   ├── plan.js           # Interfaz y persistencia local del plan de estudio
│   ├── tareas.js         # Gestión de tareas, entregas y exámenes
│   ├── daily-chess.js    # Reto diario de ajedrez
│   ├── avatar-flags.js   # Selector visual de avatar y banderas
│   ├── theme.js          # Gestión de tema claro/oscuro
│   └── style.css         # Estilos visuales y diseño responsivo
├── templates/
│   ├── index.html        # Panel principal (Dashboard) y módulos de la aplicación
│   ├── login.html        # Pantalla de inicio de sesión (HU21)
│   └── registro.html     # Pantalla de creación de cuenta (HU20)
├── tests/
│   ├── test_*.py         # Pruebas unitarias del backend con unittest
│   ├── *.test.js         # Pruebas del frontend con Jest y jsdom
│   └── README.md         # Instrucciones y alcance de las pruebas
└── docs/                 # Historias de usuario, registros de cambios, sprints y documentación técnica
```

## Documentación técnica y de usuario

La documentación detallada se encuentra en [docs/tecnica/](docs/tecnica/README.md) e incluye requisitos y alcance, arquitectura, base de datos, API de Flask y manual de instalación y uso.

Para la verificación funcional y pruebas paso a paso de la aplicación, consulta la [Guía de Revisión Técnica Formal (RTF)](docs/guia-revision-rtf.md).

## Estado del proyecto

- **Sprint 1 (Finalizado):**
  - Definición del Product Backlog inicial (Historias de Usuario en GitHub Issues), análisis INVEST y configuración del tablero Kanban en GitHub Projects.
- **Sprint 2 (Finalizado):**
  - **HU20 - Registro:** Creación de cuentas con hash seguro de contraseñas.
  - **HU21 - Inicio de sesión:** Autenticación con sesiones seguras y control de acceso.
  - **HU27 - Lista de To-Dos:** Notas rápidas independientes con CRUD completo y filtros.
  - **Dashboard:** Panel de inicio con barra de navegación, métricas y pestañas.
- **Sprint 3 (Finalizado):**
  - **HU01 y HU23 - Gestión de asignaturas:** Creación, edición, borrado y apartado individual por materia.
  - **Pruebas unitarias:** Implementación de las suites iniciales de backend (`unittest`) y frontend (`Jest` + `jsdom`).
- **Sprint 4 (Finalizado):**
  - **HU04 - Tareas y entregas:** Gestión de actividades con fecha límite, tiempo estimado y validación de fechas.
  - **HU05 - Horario de clases:** Cuadrícula semanal sin solapamientos.
  - **HU12 - Dificultad y prioridad:** Configuración de dificultad y prioridad por asignatura y tarea.
  - **HU19 - Recordatorios:** Visualización de próximos eventos y entregas en el panel principal.
  - **HU26 - Temario por asignatura:** Gestión de temas pendientes dentro de cada materia.
  - **HU07 - Calendario semanal:** implementada posteriormente como vista previa de siete días; las sesiones generadas no se guardan en la base de datos.

## Estado actual y límites

- Los parámetros, bloqueos y la vista previa del plan se conservan en `localStorage` del navegador; no se sincronizan entre dispositivos.
- Todavía no se pueden completar sesiones, editar una sesión generada individualmente ni replanificar sesiones no realizadas.
- Chess Puzzle API es la fuente principal del reto diario. Si falla o no devuelve cinco ejercicios válidos, Flask utiliza cinco puzzles locales de reserva. La prueba automatizada simula esta caída; no valida el proveedor en vivo.
- `app.py` está configurado para desarrollo local (`debug=True` y clave de sesión en el código); no desplegar públicamente sin cambiar esa configuración.

## Contexto académico

Proyecto realizado para la asignatura **Ingeniería del Software I** de la **Universidad Complutense de Madrid**.

Curso **2026-2027**.
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

- Gestión de asignaturas.
- Configuración de disponibilidad semanal.
- Registro de exámenes.
- Registro de tareas y entregas.
- Introducción del horario de clases.
- Generación automática del plan de estudio.
- Calendario semanal.
- Priorización automática.
- Modificación de sesiones.
- Seguimiento del progreso.

## Tecnologías

Pila tecnológica aprobada y utilizada para la aplicación web:

- **Lenguaje:** Python 3
- **Backend:** Flask
- **Frontend:** HTML5, CSS3 y JavaScript moderno
- **Base de datos:** SQLite (módulo estándar `sqlite3` de Python)
- **Pruebas del backend:** `unittest`
- **Pruebas del frontend:** Jest y jsdom (Node.js 20 o posterior)
- **Control de versiones:** Git & GitHub

## Metodología

El proyecto se desarrolla utilizando **Scrum**.

Los Sprints tienen una duración de **dos semanas**.

El trabajo se organiza mediante **GitHub Issues** y **GitHub Projects**.

Flujo de trabajo:

`Product Backlog → Sprint Backlog → To Do → In Progress → In Review → Completed`

## Product Backlog

El Product Backlog está compuesto por las Historias de Usuario documentadas en `docs/Historias-de-usuario.md` y vinculadas a las Issues de GitHub.

Cada Historia de Usuario dispone de:

- Descripción.
- Valor.
- Estimación.
- Criterios de aceptación.

## Equipo

- Joaquín Palmer Pifarré
- Antonio Bucciarelli Imbrondone
- Yong Sheng Zhou Zhou
- Pablo Pérez Roldán
- Andrés Fernández Cordero

## Cómo poner en marcha la aplicación

Estos son los pasos para arrancar StudyPlan en tu ordenador. La primera vez hay que preparar el entorno; después basta con abrir el proyecto y ejecutar el servidor.

### Primera vez (Windows)

1. Instala **Python 3.10 o superior** y **Git**. Para editar el proyecto puedes usar VS Code.
2. Abre una terminal en la carpeta donde quieras guardar el proyecto y descárgalo:

   ```powershell
   git clone https://github.com/Qpalmer45/IS1-Planificador-de-Estudios.git
   cd IS1-Planificador-de-Estudios
   ```

   Si ya tienes la carpeta descargada, no hace falta clonarla otra vez.

3. Crea un entorno virtual e instala las dependencias:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

4. Arranca el servidor:

   ```powershell
   .\.venv\Scripts\python.exe app.py
   ```

5. Abre **http://127.0.0.1:5000** en el navegador. Mantén la terminal abierta mientras uses la aplicación. Para detenerla, pulsa **Ctrl + C**.

### Para abrirla otro día

Abre la carpeta `IS1-Planificador-de-Estudios` en VS Code, entra en **Terminal → New Terminal** y ejecuta:

```powershell
.\.venv\Scripts\python.exe app.py
```

Si quieres descargar antes los cambios que haya en GitHub, ejecuta `git pull origin main` **con el servidor detenido**, y luego vuelve a arrancarlo. Si has modificado archivos localmente, revisa esos cambios antes del pull para evitar conflictos.

Si el navegador sigue mostrando estilos antiguos después de actualizar, prueba **Ctrl + F5**.

### Pruebas

Las pruebas del backend usan `unittest` y no requieren instalar Node.js:

```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -p test_app.py -v
```

Para las pruebas del frontend sí necesitas **Node.js 20 o posterior**. Desde la raíz del repositorio:

```powershell
npm.cmd install --no-package-lock
npm.cmd run test:frontend
```

También puedes lanzar ambas suites con `npm.cmd run test:all` una vez instaladas las dependencias del frontend.

### Si algo falla

- **`py` no se reconoce:** comprueba que Python está instalado y disponible desde la terminal.
- **`No module named flask`:** vuelve a ejecutar la instalación de `requirements.txt` con el Python de `.venv`.
- **No encuentra `app.py`:** asegúrate de que la terminal está abierta en la raíz del repositorio.
- **El puerto 5000 está ocupado:** comprueba que no haya otra instancia del servidor ejecutándose.

## Estructura del proyecto

```text
IS1-Planificador-de-Estudios/
├── app.py                # Servidor web Flask, rutas, lógica de autenticación y APIs
├── requirements.txt      # Dependencias del proyecto
├── package.json          # Dependencias y comandos Jest del frontend
├── todos.db              # Base de datos SQLite (se genera automáticamente)
├── static/
│   ├── app.js            # Lógica cliente: pestañas, llamadas fetch y gestión de To-Dos
│   └── style.css         # Estilos visuales modernos, sistema de diseño responsivo
├── templates/
│   ├── index.html        # Pantalla de inicio (Dashboard) y pestañas de la aplicación
│   ├── login.html        # Pantalla de inicio de sesión (HU21)
│   └── registro.html     # Pantalla de creación de cuenta (HU20)
├── tests/
│   ├── test_app.py       # Pruebas unitarias del backend con unittest
│   ├── app.test.js       # Pruebas del frontend con Jest y jsdom
│   └── README.md         # Instrucciones, cobertura y alcance de las pruebas
├── docs/                 # Historias de usuario, backlog y documentación
```


## Documentación técnica y de usuario

Hemos reunido la documentación del estado actual de la aplicación en [docs/tecnica/](docs/tecnica/README.md). Incluye requisitos y alcance, arquitectura, base de datos, API de Flask y un manual para instalar y utilizar la web. Los documentos distinguen entre las funcionalidades implementadas y las que siguen en el Product Backlog.

## Estado del proyecto

- **Sprint 2 (Completado):**
  - **HU20 - Registro:** Creación de cuentas con hash seguro de contraseñas.
  - **HU21 - Inicio de sesión:** Autenticación con sesiones seguras y control de acceso.
  - **HU27 - Lista de To-Dos:** Notas rápidas independientes con CRUD completo, filtros y aislamiento por usuario.
  - **Dashboard:** Pantalla de inicio con barra de navegación, métricas y pestañas hacia futuros módulos.


## Contexto académico

Proyecto realizado para la asignatura **Ingeniería del Software I** de la **Universidad Complutense de Madrid**.

Curso **2026-2027**.

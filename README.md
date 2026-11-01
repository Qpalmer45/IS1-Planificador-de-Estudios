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

## Instalación y ejecución

### 1. Requisitos
- Python 3.10 o superior instalado.

### 2. Instalación de dependencias
```bash
pip install -r requirements.txt
```

### 3. Ejecución del servidor
```bash
python app.py
```
Acceder a la aplicación web en [http://127.0.0.1:5000](http://127.0.0.1:5000).

### 4. Instalación de dependencias del frontend

Desde la raíz del proyecto:

```powershell
npm.cmd install --no-package-lock
```

### 5. Ejecución de pruebas automatizadas

Pruebas del backend:

```bash
python -m unittest discover -s tests -p test_app.py -v
```

Pruebas del frontend con Jest:

```powershell
npm.cmd run test:frontend
```

Para ejecutar ambas suites:

```powershell
npm.cmd run test:all
```

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

## Estado del proyecto

- **Sprint 2 (Completado):**
  - **HU20 - Registro:** Creación de cuentas con hash seguro de contraseñas.
  - **HU21 - Inicio de sesión:** Autenticación con sesiones seguras y control de acceso.
  - **HU27 - Lista de To-Dos:** Notas rápidas independientes con CRUD completo, filtros y aislamiento por usuario.
  - **Dashboard:** Pantalla de inicio con barra de navegación, métricas y pestañas hacia futuros módulos.


## Contexto académico

Proyecto realizado para la asignatura **Ingeniería del Software I** de la **Universidad Complutense de Madrid**.

Curso **2026-2027**.

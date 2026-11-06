# Manual de instalación y uso

## 1. Antes de empezar

Este manual sirve para ejecutar la versión actual del Planificador de Estudios en un ordenador. La aplicación se desarrolla como proyecto de IS1 y, por ahora, la usamos en local. No hace falta instalar SQLite por separado.

Necesitamos:
- Python 3.10 o una versión posterior.
- Git si vamos a clonar el repositorio.
- Un navegador.
- Node.js 20 o posterior y npm **solo si queremos ejecutar las pruebas de JavaScript**.

## 2. Descargar el proyecto

En Git Bash o en el terminal podemos ejecutar:

```bash
git clone https://github.com/Qpalmer45/IS1-Planificador-de-Estudios.git
cd IS1-Planificador-de-Estudios
```

Si ya tenemos una copia del repositorio, entramos en esa carpeta y actualizamos `main` mediante `git pull`, siempre comprobando antes que no haya cambios locales sin guardar.

## 3. Instalar lo necesario para el servidor

Es recomendable crear un entorno virtual para no mezclar las dependencias con otras asignaturas.

En Windows PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

En Linux o macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Si no usamos entorno virtual, también podemos ejecutar `pip install -r requirements.txt` y `python app.py` siempre que Python esté instalado y accesible en el terminal.

Por defecto la aplicación se puede abrir en **http://127.0.0.1:5000**. Mientras usemos la web tenemos que dejar abierto el proceso del servidor. Para detenerlo, pulsamos **Ctrl+C** en el terminal.

## 4. Primer uso de la aplicación

1. Entramos en la dirección local. Si no hemos iniciado sesión, la aplicación nos lleva a la pantalla de acceso.
2. Pulsamos **Regístrate aquí**, escribimos nombre, correo y contraseña, y confirmamos la contraseña.
3. Tras crear la cuenta entramos al panel principal.
4. Desde **To-Dos** podemos escribir tareas rápidas, marcarlas como completadas, editarlas y borrarlas.
5. Desde **Asignaturas** podemos añadir una materia, cambiarle el nombre, abrir su apartado básico o eliminarla.
6. Para salir utilizamos la opción de cerrar sesión. Después podemos entrar de nuevo con el correo y contraseña.

El nombre es opcional a nivel de API, aunque el formulario lo presenta como campo de registro. Las tareas y asignaturas se guardan en SQLite y se muestran asociadas a la cuenta que las creó.

## 5. Qué partes están pendientes

Las secciones de **Horarios** y **Planificador** aparecen en la interfaz, pero todavía no permiten generar automáticamente un horario de estudio. Tampoco tenemos completado el registro de exámenes y entregas, ni estadísticas de estudio reales. Estas funciones se incorporarán en otros sprints.

La lista rápida de To-Dos no es lo mismo que una entrega de una asignatura con fecha límite: esa parte forma parte del backlog futuro.

## 6. Ejecutar pruebas

Pruebas del backend:

```bash
python -m unittest discover -s tests -p test_app.py -v
```

Para el frontend necesitamos tener Node y npm. En Windows:

```powershell
npm.cmd install --no-package-lock
npm.cmd run test:frontend
```

Para lanzar las dos suites, después de instalar dependencias:

```powershell
npm.cmd run test:all
```

En Linux/macOS el comando puede usarse como `npm` en lugar de `npm.cmd`. El resultado de los tests sale en el terminal; **que los comandos estén documentados no significa que las pruebas se hayan ejecutado correctamente**.

Hay información más detallada en [tests/README.md](../../tests/README.md).

## 7. Problemas habituales

**No reconoce Python:** comprobar instalación y probar `py --version` en Windows o `python3 --version` en Linux/macOS.

**Falta Flask:** instalar dependencias con el Python que realmente estamos usando para ejecutar `app.py`.

**Puerto ocupado:** puede haber otro servidor iniciado en el 5000; detenerlo antes de volver a arrancar.

**Aparece «not a git repository»:** el terminal no está dentro de la carpeta clonada. Primero usar `cd IS1-Planificador-de-Estudios`.

**No aparece una asignatura o To-Do:** comprobar que hemos iniciado sesión con la misma cuenta; los datos se separan por usuario.

**La base de datos no contiene nuestros datos:** revisar desde qué copia del proyecto se está ejecutando el programa, porque `todos.db` se ubica junto a `app.py`.

## 8. Aviso para el equipo

`app.py` arranca con `debug=True` y tiene una clave de sesión escrita en el propio código. Está planteado para desarrollo, **no para publicar la aplicación tal cual en Internet**. Antes de un despliegue hay que gestionar el secreto fuera del repositorio, desactivar debug, revisar la seguridad de las peticiones y preparar copias de seguridad.

Cuando cambiemos la interfaz o añadamos funciones, actualizaremos este manual con los pasos que realmente se pueden seguir.

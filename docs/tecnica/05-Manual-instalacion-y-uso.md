# Manual de instalación y uso

> Instrucciones y funcionalidades contrastadas el 23 de noviembre de 2026.

## 1. Antes de empezar

Este manual sirve para ejecutar la versión actual del Planificador de Estudios en un ordenador. La aplicación se desarrolla como proyecto de IS1 y, por ahora, la usamos en local. No hace falta instalar SQLite por separado.

Necesitamos:
- Python 3.10 o una versión posterior.
- Git si vamos a clonar el repositorio.
- Un navegador.
- Node.js 20 o posterior y npm **solo si queremos ejecutar las pruebas de JavaScript**.
- Conexión a Internet para cargar puzzles y escudos externos; el ajedrez dispone de puzzles locales de reserva.

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
4. Desde **To-Dos** podemos crear, editar, completar, filtrar y borrar tareas rápidas.
5. Desde **Asignaturas** podemos añadir materias, ajustar dificultad, prioridad y objetivo semanal, gestionar temas y abrir el apartado individual.
6. Desde **Tareas** podemos registrar tareas, entregas y exámenes con plazo y estimación.
7. En **Horario** podemos registrar clases y períodos libres; se rechazan clases que se solapan.
8. En **Plan de estudio** elegimos la semana, la franja diaria, duración y descanso; podemos añadir bloqueos puntuales y generar una vista previa semanal.
9. El **Dashboard** muestra recordatorios configurables. En **Ajedrez** hay cinco ejercicios diarios; si falla Chess Puzzle API se utilizan puzzles locales de reserva. Los escudos requieren el proveedor de datos de ESPN.
10. Para salir utilizamos la opción de cerrar sesión. Después podemos entrar de nuevo con el correo y contraseña.

El nombre es opcional a nivel de API, aunque el formulario lo presenta como campo de registro. Los datos de cuenta, asignaturas, horarios y actividades se guardan en SQLite y se asocian a la cuenta. Las preferencias y bloqueos del plan, y la vista previa generada, se guardan en `localStorage` del navegador: no se sincronizan entre dispositivos ni se guardan como sesiones en la base de datos.

## 5. Límites conocidos

El planificador genera una **vista previa**, no un historial persistente. No permite marcar sesiones como realizadas, editar una sesión individual ni replanificar automáticamente las que no se han realizado. Tampoco se importan horarios a partir de imágenes ni se calculan estadísticas a partir de sesiones completadas.

Hay un problema conocido de reparto: si se mezclan asignaturas con actividades sin objetivo semanal, las horas extra pueden acabar asignadas a las asignaturas y dejar una actividad sin tiempo. Hasta corregirlo, comprueba los resultados de la semana generada y configura objetivos semanales explícitos cuando corresponda.

Los puzzles de reserva permiten usar el tablero cuando falla el proveedor externo, pero no demuestran que la integración externa esté disponible en todo momento. Las operaciones de escudos tampoco están disponibles si ESPN falla y no hay caché.

## 6. Ejecutar pruebas

Pruebas del backend:

```bash
python -m unittest discover -s tests -p "test_*.py" -v
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

En Linux/macOS el comando puede usarse como `npm` en lugar de `npm.cmd`. El 23 de noviembre de 2026 se ejecutó `npm.cmd run test:all`: pasaron las 151 pruebas de Jest (8 suites) y las 171 pruebas de Python. Python mostró una advertencia no fatal de conexión SQLite abierta durante la ejecución; no hubo fallos. Estos resultados no certifican la integración en vivo con servicios externos ni la revisión visual en todos los navegadores.

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

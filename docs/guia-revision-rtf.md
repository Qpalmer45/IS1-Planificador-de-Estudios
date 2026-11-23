# Guía de Revisión Técnica Formal (RTF) — IS1 Planificador de Estudios

## 1. Propósito del documento

Esta guía tiene como objetivo facilitar la verificación funcional y técnica de la aplicación **IS1 - Planificador de Estudios** durante la Revisión Técnica Formal (RTF). Describe cómo poner en marcha el entorno local, las credenciales de prueba recomendadas, el recorrido de validación por las funcionalidades implementadas y los resultados esperados en cada paso.

---

## 2. Requisitos previos y arranque de la aplicación

### Requisitos del sistema
- **Python 3.10 o superior**
- **Git**
- **Navegador web moderno** (Chrome, Edge o Firefox)
- *(Opcional, solo para ejecutar las pruebas unitarias del frontend)*: **Node.js 20 o superior**

### Pasos para arrancar el servidor (Windows / PowerShell)

1. Abrir una terminal en la carpeta raíz del repositorio (`IS1-Planificador-de-Estudios`).
2. Crear el entorno virtual e instalar las dependencias (si no se ha hecho previamente):

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

3. Iniciar la aplicación web:

   ```powershell
   .\.venv\Scripts\python.exe app.py
   ```

4. Abrir en el navegador la dirección: **http://127.0.0.1:5000**

*(Para detener el servidor al finalizar la revisión, pulsar `Ctrl + C` en la terminal).*

---

## 3. Usuario de prueba

Al iniciar la aplicación por primera vez, se genera automáticamente la base de datos local `todos.db`. Para realizar el recorrido de pruebas con datos limpios, crear una cuenta desde la opción **Registrarse** (`/registro`) con los siguientes datos:

- **Nombre de usuario:** `revisor_is1`
- **Correo electrónico:** `revisor.is1@ucm.es`
- **Contraseña:** `Planificador2026!`

---

## 4. Recorrido recomendado y resultados esperados

A continuación se detalla el flujo de comprobación ordenado por módulos funcionales:

| Paso | Funcionalidad (HU) | Acción a realizar | Resultado esperado |
| :--- | :--- | :--- | :--- |
| **1** | **Registro e Inicio de Sesión** (`HU20`, `HU21`) | Registrar el usuario de prueba indicado en la sección 3 e iniciar sesión. | Creación exitosa de la cuenta con contraseña cifrada, inicio de sesión activo y acceso al panel principal (Dashboard). |
| **2** | **Gestión de Asignaturas y Temario** (`HU01`, `HU12`, `HU23`, `HU26`) | Crear dos asignaturas (ej. *Ingeniería del Software I* con dificultad **Alta** y prioridad **Alta**, y *Bases de Datos* con dificultad **Media**). Acceder al apartado individual de una asignatura y añadir 2 temas al temario. | Las asignaturas se guardan en SQLite y aparecen en el listado. Cada materia dispone de su vista individual donde se persisten los temas añadidos. |
| **3** | **Tareas y Entregas** (`HU04`) | Dentro de una asignatura, crear una tarea con fecha límite futura y tiempo estimado (ej. `2` horas). A continuación, intentar crear una tarea con fecha anterior al día actual. | La tarea con fecha válida se registra y muestra correctamente. El sistema rechaza la fecha pasada mostrando un aviso de validación. |
| **4** | **Horario de Clases** (`HU05`) | Acceder a la sección de horario y registrar una clase (ej. *Lunes de 10:00 a 12:00*). Intentar añadir otra clase en el mismo día de *11:00 a 13:00*. | La primera franja se dibuja en la cuadrícula semanal. El sistema impide guardar la segunda franja por solapamiento horario. |
| **5** | **Panel de Recordatorios** (`HU19`) | Regresar al **Dashboard** principal tras registrar tareas y fechas próximas. | El panel muestra de forma visible los recordatorios de próximas entregas y eventos ordenados por cercanía. |
| **6** | **Lista de To-Dos Rápidos** (`HU27`) | Añadir una nota rápida en la lista de To-Dos, marcarla como completada, probar los filtros de estado y eliminarla. | Todas las operaciones CRUD y de filtrado responden al instante y los cambios se mantienen al recargar la página (`F5`). |
| **7** | **Plan de estudio** (`HU06`, `HU07`) | Elegir una semana y una franja diaria; generar el plan. Añadir un bloqueo puntual y volver a generarlo. | Se muestra una vista previa de siete días con sesiones ordenadas por hora; el bloqueo aparece en naranja y los descansos entre sesiones en verde. La vista se conserva en el mismo navegador, no como sesiones en SQLite. |
| **8** | **Reto diario de ajedrez** (`HU44`) | Abrir **Ajedrez**, comprobar que hay cinco ejercicios y usar una pista, una respuesta incorrecta y una correcta. | Se dibuja el tablero, una respuesta incorrecta no aumenta el progreso y una correcta avanza el ejercicio. El cliente no recibe la solución. El fallback por caída de la API se comprueba mediante `tests/test_chess_api.py`, no provocando una caída real del proveedor. |
| **9** | **Cierre de Sesión y Seguridad** (`HU21`) | Pulsar en **Cerrar sesión** e intentar acceder manualmente a la ruta principal (`http://127.0.0.1:5000/`). | La sesión se destruye correctamente y cualquier intento de acceso sin autenticar redirige a la pantalla de inicio de sesión. |

---

## 5. Ejecución de pruebas automatizadas

Para verificar la integridad del código mediante las baterías de pruebas unitarias del repositorio:

### Pruebas del Backend (`unittest`)
```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py" -v
```
**Resultado esperado:** Ejecución de todos los módulos `test_*.py`, incluidos planificación, recordatorios, escudos y ajedrez, con estado final `OK`.

### Pruebas del Frontend (`Jest` + `jsdom`)
```powershell
npm.cmd install --no-package-lock
npm.cmd run test:frontend
```
**Resultado esperado:** Ocho suites Jest superadas (`PASS`). Las respuestas del frontend están simuladas; esto no comprueba proveedores externos en vivo.

---

## 6. Documentación adicional del repositorio

- `README.md`: Visión general del proyecto, pila tecnológica y estado por Sprints.
- `docs/Historias-de-usuario.md`: Definición y criterios de aceptación del Product Backlog.
- `docs/tecnica/README.md`: Documentación técnica detallada (arquitectura, modelo de datos SQLite y endpoints REST).
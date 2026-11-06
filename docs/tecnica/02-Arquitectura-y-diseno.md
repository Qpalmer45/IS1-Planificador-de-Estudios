# Arquitectura y diseño técnico

## 1. Idea general

Elegimos una aplicación web sencilla, sin separar el servidor en varios servicios. El navegador muestra HTML y CSS; JavaScript recoge las acciones del usuario y llama a Flask; Flask comprueba la sesión y trabaja con SQLite.

```text
Navegador
  ├── HTML (templates/)
  ├── CSS y JavaScript (static/)
  └── fetch / JSON
          |
          v
     Flask (app.py)
       ├── Rutas de páginas
       ├── Registro y login
       ├── API de To-Dos
       └── API de asignaturas
          |
          v
     SQLite (todos.db)
```

No usamos React, Spring, Java ni un servidor de base de datos separado. La aplicación funciona con Python, Flask, JavaScript, HTML, CSS y SQLite. Para pruebas tenemos unittest y Jest/jsdom.

## 2. Dónde está cada cosa

| Archivo/carpeta | Responsabilidad |
|---|---|
| `app.py` | Crear Flask, conectar con SQLite, gestionar sesión, definir endpoints y validar entradas |
| `templates/index.html` | Dashboard y secciones de To-Dos, asignaturas, horarios y planificador |
| `templates/login.html` | Formulario y lógica de acceso |
| `templates/registro.html` | Formulario y lógica de registro |
| `static/app.js` | Interacciones del dashboard, peticiones a la API y actualización del contenido |
| `static/style.css` | Diseño de las páginas |
| `requirements.txt` | Dependencia Flask |
| `package.json` | Comandos y dependencias de pruebas de JavaScript |
| `tests/` | Pruebas de backend y frontend y explicación de ejecución |
| `docs/` | Requisitos, decisiones y documentación del proyecto |

## 3. Qué pasa al usar una funcionalidad

### Ejemplo: crear una asignatura

1. El usuario escribe el nombre en la sección de asignaturas.
2. JavaScript envía `POST /api/asignaturas` con `{"nombre":"Probabilidad"}`.
3. Flask comprueba que existe una sesión iniciada y que el nombre es válido.
4. Inserta la asignatura en SQLite asociada al `usuario_id` de esa sesión.
5. Devuelve un JSON con el identificador y el nombre.
6. JavaScript refresca la lista.

El navegador no se conecta directamente a SQLite. La base de datos se consulta siempre desde Python.

### Ejemplo: iniciar sesión

El formulario llama a `POST /api/login`. El servidor busca la cuenta por correo, compara la contraseña enviada con el hash guardado usando Werkzeug y almacena en la sesión el ID, el nombre y el correo del usuario. Después la página principal puede mostrar información de esa cuenta.

### Ejemplo: acceso a recursos privados

Las APIs de To-Dos y asignaturas usan `login_required`. Para acceder a una tarea o asignatura concreta, las consultas incorporan tanto el identificador del recurso como el identificador de la sesión. Si el recurso no está disponible para esa cuenta, la API responde 404 en las operaciones que lo contemplan.

## 4. Decisiones que hemos tomado

**Flask** nos deja hacer el servidor sin una estructura excesivamente grande para el tamaño del proyecto. **SQLite** es suficiente para la versión local y evita tener que instalar y mantener otro servidor. **JavaScript con fetch** comunica la interfaz con la API mediante HTTP y JSON. **GitHub** nos permite mantener código, historial, issues y documentación.

Estas decisiones se revisarán si los requisitos cambian. Ahora mismo nos sirven para avanzar con una única rama `main`, como hemos acordado.

## 5. Decisiones y mejoras pendientes

El archivo `app.py` reúne por ahora muchas responsabilidades. Si sigue creciendo, puede tener sentido dividir rutas, acceso a datos y lógica de negocio, especialmente cuando llegue la generación de horarios.

Para un despliegue real habría que sacar la clave de sesión del código, desactivar `debug=True`, revisar la protección de peticiones que cambian datos y configurar copias de seguridad. La configuración actual es de desarrollo local, no una recomendación de despliegue público.

## 6. Siguiente ampliación prevista

En el Sprint 4 proponemos empezar por disponibilidad y horario de clases, calculando las franjas libres. Después el generador podrá decidir qué asignatura estudiar en cada intervalo. No documentamos todavía esas tablas ni APIs como si estuvieran implementadas.

Para los detalles de las tablas actuales ver [Modelo de datos](03-Base-de-datos.md). Para el contrato HTTP ver [API](04-API.md).

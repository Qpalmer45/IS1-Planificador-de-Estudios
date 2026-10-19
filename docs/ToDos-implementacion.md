# Sprint 1 — Autenticación y Lista de To-Dos Rápidos

Documento de implementación para las historias del Sprint 1:
- [HU20 - Registro (Issue #20)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/20)
- [HU21 - Inicio de sesión (Issue #22)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/22)
- [HU27 - Lista de To-Dos (Issue #29)](https://github.com/Qpalmer45/IS1-Planificador-de-Estudios/issues/29)

---

## 1. Pila Tecnológica Elegida
- **Backend:** Python 3 + Flask 3 + Werkzeug (hashing de contraseñas con PBKDF2/scrypt).
- **Frontend:** HTML5 semántico, CSS3 moderno (diseño responsivo y variables CSS), JavaScript ES6+ (Fetch API).
- **Base de Datos:** SQLite 3 (a través del módulo estándar `sqlite3` de Python).
- **Pruebas:** `unittest` estándar de Python (7 tests automatizados).

---

## 2. Aclaración del Modelo: Desconexión de To-Dos (HU27) vs. Planificador (HU04/HU06)
> **Importante para Scrum y diseño del sistema:**  
> La **Lista de To-Dos Rápidos (HU27)** es un panel secundario de notas personales o recordatorios inmediatos sin horarios ni asignación a asignaturas.  
> Se diferencia explícitamente de la **HU04 (Gestión de tareas y entregas)**, la cual sí incluye fechas límite, tiempo estimado y alimenta el algoritmo de planificación automática (HU06).

---

## 3. Funcionalidades Implementadas

### A. Registro de Usuario (HU20)
- Creación de cuenta con nombre de estudiante, correo electrónico válido y contraseña (mínimo 6 caracteres).
- Comprobación y confirmación de contraseña en frontend y backend.
- Prevención de duplicados con mensaje descriptivo si el correo ya existe.
- Almacenamiento seguro de contraseñas mediante hash irreversible (`generate_password_hash`).

### B. Inicio de Sesión y Logout (HU21)
- Autenticación segura mediante cookies de sesión firmadas (`session_cookie_httponly = True`, `samesite = Lax`).
- Manejo de credenciales incorrectas con feedback visual amigable.
- Cierre de sesión (`/api/logout`) y redirección a la pantalla de login.
- Control de acceso: las rutas privadas y las APIs (`/api/todos`) están protegidas y exigen sesión activa.

### C. Pantalla de Inicio / Dashboard
- Barra de navegación superior con logotipo, pestañas interactivas, avatar de usuario y botón de cerrar sesión.
- Dashboard con saludo personalizado al estudiante, tarjetas de métricas en tiempo real (pendientes y completadas).
- Accesos directos a los módulos actuales y avance visual de los futuros módulos del Product Backlog (Asignaturas, Horarios, Planificación).

### D. Lista de To-Dos Rápidos (HU27)
- Creación de notas de hasta 200 caracteres con contador en tiempo real.
- Marcado y desmarcado de notas como completadas con tachado y diferenciación visual.
- Edición inline del título de cualquier nota (soporta `Enter` para guardar y `Escape` para cancelar).
- Eliminación de notas con confirmación de usuario.
- Filtros dinámicos por estado: **Todas**, **Pendientes** y **Completadas**.
- Aislamiento estricto por usuario: ningún estudiante puede ver ni modificar los To-Dos de otro usuario.

---

## 4. API REST implementada

| Método | Ruta | Autenticación | Descripción |
|---|---|:---:|---|
| GET | `/` | Sí | Dashboard y panel principal de la aplicación |
| GET | `/login` | No | Pantalla de inicio de sesión |
| GET | `/registro` | No | Pantalla de registro de estudiantes |
| POST | `/api/registro` | No | Registrar nuevo usuario (`nombre`, `email`, `password`) |
| POST | `/api/login` | No | Iniciar sesión (`email`, `password`) |
| POST | `/api/logout` | Sí | Cerrar sesión activa |
| GET | `/api/usuario_actual` | No | Consultar estado de sesión del usuario |
| GET | `/api/todos` | Sí | Obtener las notas rápidas del usuario autenticado |
| POST | `/api/todos` | Sí | Crear una nota rápida (`titulo`) |
| PATCH | `/api/todos/<id>` | Sí | Editar `titulo` y/o `completada` de una nota |
| DELETE | `/api/todos/<id>` | Sí | Eliminar una nota rápida |

---

## 5. Ejecución Local y Pruebas

### Pasos para iniciar el servidor:
1. Instalar dependencias:
   ```powershell
   pip install -r requirements.txt
   ```
2. Ejecutar la aplicación:
   ```powershell
   python app.py
   ```
3. Abrir en el navegador: [http://127.0.0.1:5000](http://127.0.0.1:5000)

### Ejecución de pruebas unitarias:
```powershell
python -m unittest discover -s tests -p "test_*.py"
```

# Pruebas provisionales del backend (IS1)

Estas pruebas comprueban la lógica del backend Python/Flask, **no la interfaz de usuario**.

## Ejecutar

Desde la raíz del repositorio:

```bash
pip install -r requirements.txt
python -m unittest discover -s tests -v
```

Se utiliza la biblioteca estándar `unittest` y el cliente de pruebas de Flask.
Cada prueba trabaja con una base de datos SQLite temporal e independiente: **no modifica `todos.db`**.

## Cobertura provisional

- Creación e inicialización de las tablas.
- Conversión de tareas a diccionario.
- Registro: normalización, validación, hash y duplicados.
- Inicio/cierre de sesión y estado de autenticación.
- Tareas: creación, validaciones, listado, aislamiento al listar, modificación y borrado.

## Casos pendientes conocidos

Se incluyen **4 pruebas marcadas con `@unittest.expectedFailure`** porque el código actual todavía no cumple esas reglas:

1. Impedir editar una tarea que pertenece a otro usuario.
2. Impedir borrar una tarea que pertenece a otro usuario.
3. Responder 404 al intentar actualizar una tarea inexistente.
4. Rechazar valores de `completada` que no sean booleanos.

Un resultado `expected failure` (fallo esperado) **no significa que la funcionalidad esté corregida**. Cuando se arregle el backend, hay que retirar el decorador para convertirlas en pruebas ordinarias. Algunas validaciones adicionales de tipos de entrada quedan por diseñar y acordar.

## Alcance

Este primer conjunto cubre únicamente las funcionalidades que ya existen en `app.py`. No inventa funciones del planificador, asignaturas o exámenes aún no implementadas.

**Estado:** archivos añadidos provisionalmente; ejecución en un entorno con dependencias instaladas pendiente de verificar.

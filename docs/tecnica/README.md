# Documentación técnica y de usuario

En esta carpeta dejamos los documentos que explican cómo está planteado el proyecto, qué partes funcionan actualmente y cómo ponerlo en marcha.

1. [Requisitos y alcance](01-Requisitos-y-alcance.md): qué queremos conseguir y estado de los requisitos.
2. [Arquitectura y diseño](02-Arquitectura-y-diseno.md): tecnologías, archivos y recorrido de una petición.
3. [Base de datos](03-Base-de-datos.md): tablas SQLite y relaciones actuales.
4. [API](04-API.md): rutas Flask, JSON, respuestas y errores.
5. [Manual de instalación y uso](05-Manual-instalacion-y-uso.md): pasos para ejecutar la web y probarla.

Se han preparado revisando el código de la rama `main` y los documentos existentes del backlog. La distinción más importante es entre **funcionalidades que ya están programadas** y **funcionalidades previstas**. Las pantallas o historias pendientes no se presentan como acabadas.

Cuando implementemos HU02/HU05 en otro sprint habrá que actualizar requisitos, arquitectura, diseño de datos, API y manual. No queremos tener documentación que deje de corresponderse con lo que hace la web.

Otros documentos útiles:
- [Historias de usuario](../Historias-de-usuario.md)
- [Análisis INVEST](../Analisis-INVEST-Historias-de-Usuario.md)
- [Pruebas](../../tests/README.md)
- [README principal](../../README.md)

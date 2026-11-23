# Documentación técnica y de usuario

> Actualizada el 23 de noviembre de 2026 y contrastada con las rutas, el esquema y los módulos actuales.

En esta carpeta dejamos los documentos que explican cómo está planteado el proyecto, qué partes funcionan actualmente y cómo ponerlo en marcha.

1. [Requisitos y alcance](01-Requisitos-y-alcance.md): qué queremos conseguir y estado de los requisitos.
2. [Arquitectura y diseño](02-Arquitectura-y-diseno.md): tecnologías, archivos y recorrido de una petición.
3. [Base de datos](03-Base-de-datos.md): tablas SQLite y relaciones actuales.
4. [API](04-API.md): rutas Flask, JSON, respuestas y errores.
5. [Manual de instalación y uso](05-Manual-instalacion-y-uso.md): pasos para ejecutar la web y probarla.

La documentación distingue entre **funcionalidades implementadas**, **implementaciones parciales** y **trabajo pendiente**. La existencia de una pantalla o de una issue cerrada no sustituye la verificación de sus criterios de aceptación.

HU02 y HU05 ya cuentan con gestión de períodos libres y horarios de clase. El plan semanal se genera como vista previa y no persiste sesiones en SQLite; ese límite se refleja en los requisitos, el modelo de datos, la API y el manual.

Otros documentos útiles:
- [Historias de usuario](../Historias-de-usuario.md)
- [Análisis INVEST](../Analisis-INVEST-Historias-de-Usuario.md)
- [Pruebas](../../tests/README.md)
- [README principal](../../README.md)

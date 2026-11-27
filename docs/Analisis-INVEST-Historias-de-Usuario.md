# Evaluación INVEST de las historias de usuario

**Proyecto:** IS1 – Planificador de Estudios (UCM)  
**Fecha de revisión:** 24 de noviembre de 2026  
**Fuente:** Product Backlog refinado (`HU01`–`HU48`), issues del repositorio y criterios ágiles de la asignatura.  
**Alcance:** Calidad de redacción, independencia, tamaño, estimabilidad y verificabilidad de las historias del backlog tras su refinamiento y consolidación.

## 1. Criterios y significado

- **I – Independiente:** Historia desarrollable y desplegable de forma incremental sin bloqueos circulares. Las extensiones sobre entidades base (por ejemplo, filtros sobre listas ya creadas) se admiten como incrementos verticales siempre que no dependan mutuamente entre sí.
- **N – Negociable:** Describe el objetivo funcional para el usuario sin imponer detalles rígidos de interfaz o implementación interna.
- **V – Valiosa:** Aporta un beneficio claro y observable al usuario final.
- **E – Estimable:** Tiene alcance acotado suficiente para estimar el esfuerzo en equipo, señalando incertidumbres técnicas cuando existen (como OCR o integración SMTP).
- **S – Small (pequeña):** Puede completarse dentro de un sprint; las historias demasiado amplias o duplicadas se dividen o absorben.
- **T – Testable:** Dispone de criterios de aceptación concretos y observables (casos válidos, inválidos, límites, estados vacíos y aislamiento entre usuarios).

**Convención:** `✅` criterio cumplido tras el refinamiento; `△` cumplimiento condicionado a una dependencia secuencial o a subdivisión previa antes de comprometer en sprint; `—` historia absorbida documentalmente en otra historia contenedora.

## 2. Revisión individual del Product Backlog (`HU01`–`HU48`)

| HU / Issue | I | N | V | E | S | T | Estado y observación clave |
|---|---|---|---|---|---|---|---|
| [HU01 Asignaturas](../issues/1) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Entidad raíz autocontenida; criterios CRUD y aislamiento por usuario verificados. |
| [HU02 Disponibilidad semanal](../issues/2) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Refinada para configurar franjas horarias por día de la semana con validación de solapamientos y aislamiento. |
| [HU03 Registro de exámenes](../issues/3) | — | — | — | — | — | — | **Absorbida en HU04.** Consolidada para evitar duplicidad de entidades y reglas de importancia manual. |
| [HU04 Tareas, entregas y exámenes](../issues/4) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Delimitada frente a To-Dos rápidos (`HU27`); incluye validación de fechas (`#48`) y vinculación opcional/obligatoria según tipo. |
| [HU05 Horario de clases](../issues/5) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Registro autónomo de clases semanales y días no lectivos con control de solapamientos. |
| [HU06 Generación automática](../issues/6) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Motor semanal de 7 días con reglas deterministas de reparto, bloqueos puntuales y control de déficit. |
| [HU07 Calendario semanal](../issues/7) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Vista semanal cronológica que absorbe `HU09` e incluye estado vacío y resumen en *Inicio*. |
| [HU08 Priorización automática](../issues/8) | — | — | — | — | — | — | **Absorbida en HU06.** Regla interna de ordenación consolidada dentro del motor de planificación. |
| [HU09 Horas de las sesiones](../issues/9) | — | — | — | — | — | — | **Absorbida en HU07.** Integrada como criterio de aceptación (`CA02`) de las tarjetas del calendario semanal. |
| [HU10 Edición manual de sesiones](../issues/10) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | **Propuesta.** Requiere incorporar persistencia individual de sesiones en SQLite; criterios de conflicto y aislamiento definidos. |
| [HU11 Descansos entre sesiones](../issues/11) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Separada como configuración de pausa (`0` o entero positivo) consumida por el motor `HU06`. |
| [HU12 Dificultad y prioridad](../issues/12) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Acotada a niveles de dificultad y prioridad en asignaturas (`HU01`), sin conflicto con actividades de `HU04`. |
| [HU13 Horas deseadas por asignatura](../issues/13) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Objetivo semanal en minutos (`0`–`10080`, con `0` como reparto automático) validado por usuario. |
| [HU14 Sesiones completadas](../issues/14) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | **Propuesta.** Introduce tabla persistente de sesiones en SQLite con estados `pendiente`, `completada` y `no_realizada`. |
| [HU15 Replanificación pendiente](../issues/15) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | **Propuesta.** Depende secuencialmente de `HU14`; acotada a sesiones vencidas no realizadas y control de déficit. |
| [HU16 Perfil de aprendizaje](../issues/16) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Propuesta.** Refinada a duración preferida de sesión y franja de concentración, separada del descanso (`HU11`) y del avatar. |
| [HU17 Importación por imagen](../issues/17) | ✅ | ✅ | ✅ | △ | ✅ | ✅ | **Propuesta.** Incertidumbre técnica acotada mediante flujo asistido de revisión manual previa al guardado en `HU05`. |
| [HU18 Estadísticas de estudio](../issues/18) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | **Propuesta.** Consolida `HU22`, `HU24` y `HU25` en un único panel semanal apoyado en los estados de `HU14`. |
| [HU19 Recordatorios](../issues/19) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Avisos internos en *Inicio* para actividades próximas (`HU04`) con margen configurable (`0`–`365` días). |
| [HU20 Registro de usuario](../issues/20) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Alta de cuentas con validación de correo único, hash seguro de contraseña y aislamiento de datos. |
| [HU21 Inicio de sesión](../issues/22) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Autenticación, cierre de sesión y protección de rutas y APIs privadas por cuenta. |
| [HU22 Horas semanales](../issues/23) | — | — | — | — | — | — | **Absorbida en HU18.** Indicador semanal de tiempo completado integrado en el panel de estadísticas. |
| [HU23 Apartado por asignatura](../issues/24) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Vista individual filtrada por materia que agrupa parámetros, temario y actividades propias. |
| [HU24 Seguimiento de sesiones](../issues/25) | — | — | — | — | — | — | **Absorbida en HU18.** Recuento de sesiones `completadas` frente a `no_realizada` integrado en `HU18`. |
| [HU25 Asignaturas estudiadas](../issues/26) | — | — | — | — | — | — | **Absorbida en HU18.** Indicador semanal de materias distintas estudiadas integrado en `HU18`. |
| [HU26 Temario por asignatura](../issues/27) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** CRUD de temas por asignatura propia con cambio reversible entre `pendiente` y `estudiado`. |
| [HU27 Lista de To-Dos](../issues/29) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Notas rápidas sin fecha límite, diferenciadas de `HU04` y verificadas con validaciones de API (`#34`, `#35`). |
| [HU28 Filtrar To-Dos por estado](../issues/36) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Extensión incremental sobre `HU27` para filtrar todas, pendientes o completadas sin alterar SQLite. |
| [HU29 Buscar To-Dos por título](../issues/37) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Extensión incremental sobre `HU27` independiente de `HU28`; búsqueda parcial insensible a mayúsculas. |
| [HU30 Navegación por teclado](../issues/38) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Mejora transversal de accesibilidad acotada al orden de tabulación, foco visible y gestión en modales. |
| [HU31 Lectores de pantalla](../issues/39) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Etiquetas asociadas, jerarquía semántica y anuncios de estado en vistas principales. |
| [HU32 Modo de alto contraste](../issues/40) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Selector persistente con ratios WCAG AA y coexistencia explícita con `HU40`. |
| [HU33 Texto ampliado](../issues/41) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Adaptación responsiva comprobable al 200 % de zoom sin solapamientos ni recortes. |
| [HU34 Movimiento reducido](../issues/42) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Soporte CSS para `prefers-reduced-motion: reduce` sin afectar funcionalidad. |
| [HU35 Errores accesibles](../issues/43) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Mensajes claros vinculados a campos (`aria-describedby`) conservando datos válidos introducidos. |
| [HU36 Exportación a ICS](../issues/44) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Exportación unidireccional `.ics` del plan vigente con zona horaria consistente y aislamiento por cuenta. |
| [HU37 Exportación de datos](../issues/45) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Descarga JSON estructurada de los registros académicos propios excluyendo credenciales. |
| [HU38 Deshacer borrado To-Do](../issues/46) | △ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Extensión sobre `HU27` con ventana temporal de restauración (`≥ 10 s`) y control de propiedad. |
| [HU39 Aviso de cambios sin guardar](../issues/47) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Preparada.** Diálogo de confirmación ante salida con cambios pendientes en formularios de `HU01`, `HU04` y `HU05`. |
| [HU40 Modo claro y oscuro](../issues/50) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Selector de tema en navegación con persistencia en `localStorage` y contraste verificado. |
| [HU41 Ancho del panel principal](../issues/51) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **En revisión.** Rejilla fluida integrada en `main`; pendiente completar verificación responsiva en todas las resoluciones. |
| [HU42 Horario semanal automático](../issues/52) | — | — | — | — | — | — | **Absorbida en HU06, HU07 y HU11.** Cerrada como duplicada de historias ya implementadas. |
| [HU43 Recuperación de contraseña](../issues/53) | △ | ✅ | ✅ | △ | ✅ | ✅ | **Preparada.** Depende de `HU20`/`HU21` y de definir proveedor SMTP; tokens de un solo uso con caducidad de 30 min. |
| [HU44 Retos diarios de ajedrez](../issues/54) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Acotada a 5 retos diarios de mate en 1 jugada con respaldo local y validación en servidor. |
| [HU45 Reto diario de Sudoku](#hu45--resolver-reto-diario-de-sudoku) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Separada de `HU44` como historia independiente; generación determinista y validación de reglas en servidor. |
| [HU46 Partida rápida de 2048](#hu46--jugar-partida-de-2048-en-descansos) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Separada de `HU44` como minijuego independiente ejecutado en cliente con persistencia por usuario. |
| [HU47 Reto de memoria Simon](#hu47--jugar-reto-de-memoria-secuencial-simon) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **Terminada.** Separada de `HU44` como minijuego independiente de secuencias con récord local por usuario. |
| [HU48 Ranking privado con amigos](../issues/55) | △ | ✅ | ✅ | △ | △ | ✅ | **Propuesta.** Agrupa 3 capacidades (amistades, cronómetro real y ranking); debe dividirse en 3 HU atómicas antes de entrar en sprint. |

## 3. Conclusiones del refinamiento INVEST

1. **Eliminación de duplicidades mediante consolidación:** Siete historias (`HU03`, `HU08`, `HU09`, `HU22`, `HU24`, `HU25` y `HU42`) se han absorbido formalmente en sus historias contenedoras (`HU04`, `HU06`, `HU07` y `HU18`), evitando estimaciones dobles y criterios contradictorios.
2. **Desacoplamiento entre configuración y motor:** Las reglas de planificación (`HU02`, `HU05`, `HU11`, `HU12`, `HU13` y `HU16`) se especifican y prueban como configuración persistente por usuario, mientras que el cálculo de horarios y resolución de conflictos se concentra en `HU06`.
3. **Control de tamaño (`Small`) en ampliaciones recientes:** Los tres minijuegos incorporados en *Juegos mentales* (`Sudoku diario`, `2048` y `Simon`) se separaron de `HU44` en historias independientes (`HU45`–`HU47`). Del mismo modo, `HU48` (`#55`) queda marcada para subdividirse en tres historias atómicas antes de planificarse.
4. **Criterios verificables (`Testable`) homogéneos:** Todas las historias vigentes incluyen escenarios de éxito, validación de entradas inválidas o límites, comportamiento ante estados vacíos y aislamiento estricto de datos por cuenta autenticada.

# 4. Plan de resolución para los criterios condicionados (`△`)

En un backlog evolutivo estructurado por incrementos verticales (*vertical slicing*), la presencia puntual de criterios marcados como condicionados (`△`) responde a dependencias funcionales naturales entre entregas o a incertidumbres técnicas acotadas, y no a defectos estructurales del producto. Para llevar el 100 % de las historias pendientes al cumplimiento pleno de **INVEST** antes de comprometerlas en futuros sprints, se establecen tres estrategias de resolución:

### 4.1. Desacoplamiento mediante contratos de datos (`HU10`, `HU14`, `HU15`, `HU18`, `HU28`, `HU29`, `HU38`, `HU43`)
Las extensiones funcionales sobre entidades ya existentes —como filtrar (`HU28`), buscar (`HU29`) o deshacer el borrado (`HU38`) sobre la lista de To-Dos (`HU27`), así como gestionar el ciclo de vida de las sesiones persistidas (`HU10`, `HU14`, `HU15`, `HU18`) o restablecer contraseñas (`HU43`)— mantienen una dependencia secuencial respecto a su entidad base, pero **carecen de bloqueos mutuos o dependencias circulares** entre sí.
- **Acción correctiva:** Cada historia se desarrolla y verifica de forma autónoma frente a un contrato de datos explícito en SQLite mediante datos de prueba aislados (*fixtures* y *mocks*), permitiendo que distintos miembros del equipo trabajen en paralelo sobre ellas una vez disponible la entidad base.

### 4.2. Reducción de incertidumbre técnica mediante *Spikes* (`HU17`, `HU43`)
Las historias `HU17` (importación del horario mediante imagen) y `HU43` (recuperación segura de contraseña) presentan el criterio **Estimable (`E`)** condicionado únicamente por la elección previa de componentes externos (librería de reconocimiento óptico OCR en `HU17` y proveedor de envío de correo SMTP en `HU43`).
- **Acción correctiva:** Antes de incorporar cada historia a un sprint, se ejecuta una tarea técnica exploratoria acotada en tiempo (*Spike* de 4 horas) para validar la librería OCR sobre capturas reales de horarios académicos y definir la configuración SMTP mediante variables de entorno, consolidando así una estimación definitiva.

### 4.3. Subdivisión de historias compuestas en entregas atómicas (`HU48` / Issue #55)
La propuesta `HU48` (*Ranking privado de horas reales de estudio con amigos*) agrupa tres capacidades funcionales de distinta naturaleza que exceden el tamaño recomendable para un único sprint (`Small`) y dificultan su estimación conjunta (`Estimable`).
- **Acción correctiva:** Antes de su planificación, se descompone en tres historias independientes con valor propio para el usuario:
  1. **Gestión de amistades entre usuarios:** Envío, aceptación y rechazo de solicitudes de amistad entre cuentas registradas (1,5 días).
  2. **Registro cronometrado de sesiones reales de estudio:** Cronómetro con control de pausas que persiste el tiempo efectivo estudiado en SQLite, aportando valor individual al estudiante con independencia de la red social (2 días).
  3. **Ranking privado entre amigos:** Clasificación semanal, mensual y acumulada calculada en servidor exclusivamente entre amistades aceptadas con consentimiento activo de privacidad (1,5 días).


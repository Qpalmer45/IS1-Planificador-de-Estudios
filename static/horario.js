"use strict";

/**
 * Módulo Frontend para Horarios de Clases y Días Libres (HU02, HU05).
 * Maneja la cuadrícula semanal interactiva, modales de gestión de clases
 * y el registro de períodos libres/festivos.
 */

(function () {
  // Constantes de configuración de la cuadrícula
  const HORA_INICIO_GRID = 8; // 08:00
  const HORA_FIN_GRID = 22; // 22:00
  const DIAS_LABORABLES = ["lunes", "martes", "miercoles", "jueves", "viernes"];
  const DIAS_TODOS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  const NOMBRES_DIAS = {
    lunes: "Lunes",
    martes: "Martes",
    miercoles: "Miércoles",
    jueves: "Jueves",
    viernes: "Viernes",
    sabado: "Sábado",
    domingo: "Domingo"
  };

  // Paleta de colores distintivos y armoniosos para asignaturas
  const PALETA_COLORES = [
    { bg: "#eff6ff", border: "#3b82f6", text: "#1d4ed8" }, // Azul
    { bg: "#f0fdf4", border: "#22c55e", text: "#15803d" }, // Verde
    { bg: "#faf5ff", border: "#a855f7", text: "#7e22ce" }, // Morado
    { bg: "#fff7ed", border: "#f97316", text: "#c2410c" }, // Naranja
    { bg: "#fdf2f8", border: "#ec4899", text: "#be185d" }, // Rosa
    { bg: "#f0fdfa", border: "#14b8a6", text: "#0f766e" }, // Turquesa
    { bg: "#fefce8", border: "#eab308", text: "#a16207" }, // Ámbar
    { bg: "#f5f3ff", border: "#6366f1", text: "#4338ca" }, // Índigo
    { bg: "#ecfeff", border: "#06b6d4", text: "#0e7490" }, // Cian
    { bg: "#fef2f2", border: "#ef4444", text: "#b91c1c" }  // Rojo suave
  ];

  function obtenerColorParaAsignatura(nombre) {
    if (!nombre) return PALETA_COLORES[0];
    let hash = 0;
    for (let i = 0; i < nombre.length; i++) {
      hash = (hash << 5) - hash + nombre.charCodeAt(i);
      hash |= 0;
    }
    const indice = Math.abs(hash) % PALETA_COLORES.length;
    return PALETA_COLORES[indice];
  }

  // Estado del módulo
  let horarios = [];
  let periodosLibres = [];
  let listaAsignaturas = [];
  let vistaSemanaCompleta = false; // Por defecto: Lunes a Viernes
  let claseEnEdicion = null;

  // Elementos DOM
  const gridContainer = document.getElementById("schedule-grid");
  const gridWrapper = document.getElementById("schedule-grid-wrapper");
  const btnViewWeekdays = document.getElementById("btn-view-weekdays");
  const btnViewAllDays = document.getElementById("btn-view-all-days");
  const btnAddClass = document.getElementById("btn-add-schedule-class");
  const classCounterEl = document.getElementById("schedule-class-counter");
  const navHorariosCountEl = document.getElementById("nav-horarios-count");
  const scheduleFeedbackEl = document.getElementById("schedule-feedback");

  // Modal de clases
  const classModal = document.getElementById("class-modal");
  const classModalTitle = document.getElementById("class-modal-title");
  const classModalClose = document.getElementById("class-modal-close");
  const classModalFeedback = document.getElementById("class-modal-feedback");
  const classForm = document.getElementById("class-form");
  const classEditId = document.getElementById("class-edit-id");
  const classSubjectSelect = document.getElementById("class-subject-select");
  const groupNewSubject = document.getElementById("group-new-subject");
  const classNewSubjectName = document.getElementById("class-new-subject-name");
  const classDaySelect = document.getElementById("class-day-select");
  const classRoomInput = document.getElementById("class-room-input");
  const classStartInput = document.getElementById("class-start-input");
  const classEndInput = document.getElementById("class-end-input");
  const btnDeleteClass = document.getElementById("btn-delete-class");
  const btnCancelClass = document.getElementById("btn-cancel-class");

  // Días libres
  const freeDaysForm = document.getElementById("free-days-form");
  const freeStartDateInput = document.getElementById("free-start-date");
  const freeEndDateInput = document.getElementById("free-end-date");
  const freeReasonInput = document.getElementById("free-reason");
  const freeDaysList = document.getElementById("free-days-list");
  const freeDaysEmpty = document.getElementById("free-days-empty");
  const freeDaysFeedback = document.getElementById("free-days-feedback");

  // Helper de llamada a la API
  async function fetchApi(path, options = {}) {
    const res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });

    if (res.status === 401) {
      window.location.href = "/login";
      return null;
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || "Ocurrió un error al procesar la solicitud.");
    }

    return res.status === 204 ? null : data;
  }

  // Notificaciones de feedback
  function mostrarFeedback(el, msg, tipo = "error") {
    if (!el) return;
    el.textContent = msg;
    el.className = `feedback-alert ${tipo}`;
  }

  function limpiarFeedback(el) {
    if (!el) return;
    el.textContent = "";
    el.className = "feedback-alert";
  }

  // =========================================================================
  // CARGA DE DATOS
  // =========================================================================

  async function cargarAsignaturas() {
    try {
      const data = await fetchApi("/api/asignaturas");
      if (Array.isArray(data)) {
        listaAsignaturas = data;
        actualizarSelectAsignaturas();
      }
    } catch (err) {
      console.warn("No se pudieron cargar las asignaturas:", err);
    }
  }

  function actualizarSelectAsignaturas(asignaturaSeleccionadaId = null) {
    if (!classSubjectSelect) return;

    // Mantener la opción por defecto y la opción de crear nueva
    classSubjectSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = !asignaturaSeleccionadaId;
    defaultOption.textContent = "-- Elige una asignatura --";
    classSubjectSelect.appendChild(defaultOption);

    listaAsignaturas.forEach(asig => {
      const opt = document.createElement("option");
      opt.value = asig.id;
      opt.textContent = asig.nombre;
      if (asignaturaSeleccionadaId && asig.id === Number(asignaturaSeleccionadaId)) {
        opt.selected = true;
      }
      classSubjectSelect.appendChild(opt);
    });

    const newOption = document.createElement("option");
    newOption.value = "__nueva__";
    newOption.textContent = "+ Escribir nueva asignatura...";
    classSubjectSelect.appendChild(newOption);
  }

  async function cargarHorarios() {
    try {
      limpiarFeedback(scheduleFeedbackEl);
      const data = await fetchApi("/api/horarios");
      if (Array.isArray(data)) {
        horarios = data;
        renderizarCuadricula();
        actualizarContadorClases();
      }
    } catch (err) {
      mostrarFeedback(scheduleFeedbackEl, err.message);
    }
  }

  function actualizarContadorClases() {
    const total = horarios.length;
    if (classCounterEl) {
      classCounterEl.textContent = `${total} clase${total === 1 ? "" : "s"} semanal${total === 1 ? "" : "es"}`;
    }
    if (navHorariosCountEl) {
      navHorariosCountEl.textContent = total;
      navHorariosCountEl.style.display = total > 0 ? "inline-block" : "none";
    }
  }

  async function cargarPeriodosLibres() {
    try {
      limpiarFeedback(freeDaysFeedback);
      const data = await fetchApi("/api/periodos-libres");
      if (Array.isArray(data)) {
        periodosLibres = data;
        renderizarPeriodosLibres();
      }
    } catch (err) {
      mostrarFeedback(freeDaysFeedback, err.message);
    }
  }

  // =========================================================================
  // RENDERIZADO DE LA CUADRÍCULA SEMANAL
  // =========================================================================

  function horaStringToMinutos(horaStr) {
    const [h, m] = horaStr.split(":").map(Number);
    return h * 60 + m;
  }

  function renderizarCuadricula() {
    if (!gridContainer) return;
    gridContainer.innerHTML = "";

    const dias = vistaSemanaCompleta ? DIAS_TODOS : DIAS_LABORABLES;
    const numDias = dias.length;
    const totalHoras = HORA_FIN_GRID - HORA_INICIO_GRID;
    const alturaFilaPx = 60; // 60px por hora

    // Configurar columnas de la cuadrícula: 1 columna de horas (70px) + numDias columnas de día
    gridContainer.style.gridTemplateColumns = `70px repeat(${numDias}, minmax(130px, 1fr))`;

    // 1. Columna de Horas a la izquierda
    const timeCol = document.createElement("div");
    timeCol.className = "grid-time-column";

    const timeHeader = document.createElement("div");
    timeHeader.className = "grid-header-cell time-header";
    timeHeader.textContent = "Hora";
    timeCol.appendChild(timeHeader);

    for (let h = HORA_INICIO_GRID; h < HORA_FIN_GRID; h++) {
      const horaStr = `${String(h).padStart(2, "0")}:00`;
      const timeCell = document.createElement("div");
      timeCell.className = "grid-time-cell";
      timeCell.textContent = horaStr;
      timeCol.appendChild(timeCell);
    }
    gridContainer.appendChild(timeCol);

    // 2. Columnas independientes por cada día de la semana
    dias.forEach(dia => {
      const dayCol = document.createElement("div");
      dayCol.className = "grid-day-column";
      dayCol.dataset.dia = dia;

      // Encabezado con el nombre del día
      const dayHeader = document.createElement("div");
      dayHeader.className = "grid-header-cell day-header";
      dayHeader.textContent = NOMBRES_DIAS[dia];
      dayCol.appendChild(dayHeader);

      // Contenedor posicionado con las franjas horarias y clases de este día
      const daySlots = document.createElement("div");
      daySlots.className = "grid-day-slots";
      daySlots.style.height = `${totalHoras * alturaFilaPx}px`;

      // Celdas horarias vacías clickeables
      for (let h = HORA_INICIO_GRID; h < HORA_FIN_GRID; h++) {
        const horaStr = `${String(h).padStart(2, "0")}:00`;
        const cell = document.createElement("div");
        cell.className = "grid-slot-cell";
        cell.dataset.dia = dia;
        cell.dataset.hora = horaStr;
        cell.setAttribute("role", "button");
        cell.setAttribute("tabindex", "0");
        cell.setAttribute("aria-label", `Añadir clase el ${NOMBRES_DIAS[dia]} a las ${horaStr}`);

        cell.addEventListener("click", () => {
          abrirModalClase({
            dia: dia,
            horaInicio: horaStr,
            horaFin: `${String(h + 1).padStart(2, "0")}:00`
          });
        });

        cell.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrirModalClase({
              dia: dia,
              horaInicio: horaStr,
              horaFin: `${String(h + 1).padStart(2, "0")}:00`
            });
          }
        });

        daySlots.appendChild(cell);
      }

      // 3. Renderizar las clases pertenecientes exclusivamente a este día
      const clasesDelDia = horarios.filter(c => c.dia_semana === dia);
      clasesDelDia.forEach(clase => {
        const minInicio = horaStringToMinutos(clase.hora_inicio);
        const minFin = horaStringToMinutos(clase.hora_fin);
        const minBase = HORA_INICIO_GRID * 60;

        const offsetMin = minInicio - minBase;
        const duracionMin = minFin - minInicio;

        if (offsetMin < 0 || duracionMin <= 0) return;

        // Posición top y altura exactas dentro del contenedor del día
        const topPx = (offsetMin / 60) * alturaFilaPx + 2;
        const heightPx = Math.max((duracionMin / 60) * alturaFilaPx - 4, 24);

        const colores = obtenerColorParaAsignatura(clase.asignatura_nombre);

        const block = document.createElement("div");
        block.className = "schedule-class-block";
        block.setAttribute("role", "button");
        block.setAttribute("tabindex", "0");
        block.setAttribute(
          "aria-label",
          `Clase de ${clase.asignatura_nombre}, de ${clase.hora_inicio} a ${clase.hora_fin}${clase.aula ? ', aula ' + clase.aula : ''}. Haz clic para editar o eliminar.`
        );

        block.style.top = `${topPx}px`;
        block.style.height = `${heightPx}px`;
        block.style.backgroundColor = colores.bg;
        block.style.borderLeftColor = colores.border;
        block.style.color = colores.text;

        const title = document.createElement("strong");
        title.className = "class-block-title";
        title.textContent = clase.asignatura_nombre;

        const timeText = document.createElement("span");
        timeText.className = "class-block-time";
        timeText.textContent = `${clase.hora_inicio} - ${clase.hora_fin}`;

        block.appendChild(title);
        block.appendChild(timeText);

        if (clase.aula) {
          const room = document.createElement("span");
          room.className = "class-block-room";
          room.textContent = `📍 ${clase.aula}`;
          block.appendChild(room);
        }

        block.addEventListener("click", (e) => {
          e.stopPropagation();
          abrirModalClase({ claseData: clase });
        });

        block.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            abrirModalClase({ claseData: clase });
          }
        });

        daySlots.appendChild(block);
      });

      dayCol.appendChild(daySlots);
      gridContainer.appendChild(dayCol);
    });
  }

  // =========================================================================
  // GESTIÓN DEL MODAL DE CLASES
  // =========================================================================

  function abrirModalClase({ claseData = null, dia = "lunes", horaInicio = "09:00", horaFin = "10:00" } = {}) {
    if (!classModal) return;

    limpiarFeedback(classModalFeedback);
    classForm.reset();
    claseEnEdicion = claseData;

    if (claseData) {
      // Modo Edición
      classModalTitle.textContent = "Editar Clase del Horario";
      classEditId.value = claseData.id;
      actualizarSelectAsignaturas(claseData.asignatura_id);
      classSubjectSelect.value = String(claseData.asignatura_id);
      classDaySelect.value = claseData.dia_semana;
      classStartInput.value = claseData.hora_inicio;
      classEndInput.value = claseData.hora_fin;
      classRoomInput.value = claseData.aula || "";

      groupNewSubject.style.display = "none";
      classNewSubjectName.required = false;
      btnDeleteClass.style.display = "inline-flex";
    } else {
      // Modo Creación
      classModalTitle.textContent = "Añadir Clase al Horario";
      classEditId.value = "";
      actualizarSelectAsignaturas();
      classDaySelect.value = dia;
      classStartInput.value = horaInicio;
      classEndInput.value = horaFin;
      classRoomInput.value = "";

      // Si no hay asignaturas previas, seleccionar automáticamente la opción de crear nueva
      if (listaAsignaturas.length === 0) {
        classSubjectSelect.value = "__nueva__";
        groupNewSubject.style.display = "block";
        classNewSubjectName.required = true;
      } else {
        groupNewSubject.style.display = "none";
        classNewSubjectName.required = false;
      }

      btnDeleteClass.style.display = "none";
    }

    classModal.hidden = false;
    classModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("subject-modal-open");

    // Foco en el primer campo de selección
    setTimeout(() => {
      if (groupNewSubject.style.display !== "none") {
        classNewSubjectName.focus();
      } else {
        classSubjectSelect.focus();
      }
    }, 50);
  }

  function cerrarModalClase() {
    if (!classModal) return;
    classModal.hidden = true;
    classModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("subject-modal-open");
    claseEnEdicion = null;
    limpiarFeedback(classModalFeedback);
  }

  // Alternar campo de nueva asignatura al cambiar el select
  if (classSubjectSelect) {
    classSubjectSelect.addEventListener("change", () => {
      if (classSubjectSelect.value === "__nueva__") {
        groupNewSubject.style.display = "block";
        classNewSubjectName.required = true;
        classNewSubjectName.focus();
      } else {
        groupNewSubject.style.display = "none";
        classNewSubjectName.required = false;
      }
    });
  }

  // Envío del formulario de clase
  if (classForm) {
    classForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      limpiarFeedback(classModalFeedback);

      const diaSemana = classDaySelect.value;
      const horaInicio = classStartInput.value;
      const horaFin = classEndInput.value;
      const aula = classRoomInput.value.trim();

      if (!horaInicio || !horaFin) {
        mostrarFeedback(classModalFeedback, "Por favor, introduce las horas de inicio y fin.");
        return;
      }

      if (horaInicio >= horaFin) {
        mostrarFeedback(classModalFeedback, "La hora de inicio debe ser anterior a la hora de fin.");
        return;
      }

      const payload = {
        dia_semana: diaSemana,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        aula: aula
      };

      const esNuevaAsig = classSubjectSelect.value === "__nueva__";
      if (esNuevaAsig) {
        const nombreNueva = classNewSubjectName.value.trim();
        if (!nombreNueva) {
          mostrarFeedback(classModalFeedback, "Escribe el nombre de la nueva asignatura.");
          classNewSubjectName.focus();
          return;
        }
        payload.asignatura_nombre = nombreNueva;
      } else {
        const asigId = classSubjectSelect.value;
        if (!asigId) {
          mostrarFeedback(classModalFeedback, "Debes seleccionar una asignatura.");
          classSubjectSelect.focus();
          return;
        }
        payload.asignatura_id = parseInt(asigId, 10);
      }

      try {
        const idEdit = classEditId.value;
        if (idEdit) {
          await fetchApi(`/api/horarios/${idEdit}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
          });
        } else {
          await fetchApi("/api/horarios", {
            method: "POST",
            body: JSON.stringify(payload)
          });
        }

        cerrarModalClase();
        await cargarHorarios();

        // Si se creó una nueva asignatura, actualizar la lista y notificar a app.js
        if (esNuevaAsig) {
          await cargarAsignaturas();
          if (typeof window.loadAsignaturas === "function") {
            window.loadAsignaturas();
          }
        }
      } catch (err) {
        mostrarFeedback(classModalFeedback, err.message);
      }
    });
  }

  // Eliminar clase
  if (btnDeleteClass) {
    btnDeleteClass.addEventListener("click", async () => {
      const id = classEditId.value;
      if (!id) return;

      const confirmar = window.confirm("¿Seguro que deseas eliminar esta clase de tu horario?");
      if (!confirmar) return;

      try {
        await fetchApi(`/api/horarios/${id}`, { method: "DELETE" });
        cerrarModalClase();
        await cargarHorarios();
      } catch (err) {
        mostrarFeedback(classModalFeedback, err.message);
      }
    });
  }

  if (classModalClose) classModalClose.addEventListener("click", cerrarModalClase);
  if (btnCancelClass) btnCancelClass.addEventListener("click", cerrarModalClase);

  // Cerrar al pulsar Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && classModal && !classModal.hidden) {
      cerrarModalClase();
    }
  });

  // Cerrar al hacer clic en el backdrop
  if (classModal) {
    classModal.addEventListener("click", (e) => {
      if (e.target === classModal) {
        cerrarModalClase();
      }
    });
  }

  // Botón superior "Añadir clase"
  if (btnAddClass) {
    btnAddClass.addEventListener("click", () => {
      abrirModalClase();
    });
  }

  // Toggles de vista L-V vs L-D
  if (btnViewWeekdays) {
    btnViewWeekdays.addEventListener("click", () => {
      vistaSemanaCompleta = false;
      btnViewWeekdays.classList.add("active");
      btnViewWeekdays.setAttribute("aria-pressed", "true");
      btnViewAllDays.classList.remove("active");
      btnViewAllDays.setAttribute("aria-pressed", "false");
      renderizarCuadricula();
    });
  }

  if (btnViewAllDays) {
    btnViewAllDays.addEventListener("click", () => {
      vistaSemanaCompleta = true;
      btnViewAllDays.classList.add("active");
      btnViewAllDays.setAttribute("aria-pressed", "true");
      btnViewWeekdays.classList.remove("active");
      btnViewWeekdays.setAttribute("aria-pressed", "false");
      renderizarCuadricula();
    });
  }

  // =========================================================================
  // GESTIÓN DE DÍAS Y PERÍODOS LIBRES (FESTIVOS / VACACIONES)
  // =========================================================================

  function renderizarPeriodosLibres() {
    if (!freeDaysList) return;
    freeDaysList.replaceChildren();

    if (periodosLibres.length === 0) {
      if (freeDaysEmpty) freeDaysEmpty.hidden = false;
      return;
    }

    if (freeDaysEmpty) freeDaysEmpty.hidden = true;

    // Ordenar por fecha_inicio
    periodosLibres.sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio));

    periodosLibres.forEach(item => {
      const li = document.createElement("li");
      li.className = "free-day-item";

      const infoDiv = document.createElement("div");
      infoDiv.className = "free-day-info";

      const badge = document.createElement("span");
      badge.className = "free-day-badge";
      badge.textContent = "Día Libre";

      const reason = document.createElement("strong");
      reason.className = "free-day-reason";
      reason.textContent = item.motivo || "Día no lectivo";

      const dates = document.createElement("span");
      dates.className = "free-day-dates";

      // Formatear fechas
      const [y1, m1, d1] = item.fecha_inicio.split("-");
      if (item.fecha_inicio === item.fecha_fin) {
        dates.textContent = `📅 ${d1}/${m1}/${y1}`;
      } else {
        const [y2, m2, d2] = item.fecha_fin.split("-");
        dates.textContent = `📅 ${d1}/${m1}/${y1} al ${d2}/${m2}/${y2}`;
      }

      infoDiv.appendChild(badge);
      infoDiv.appendChild(reason);
      infoDiv.appendChild(dates);

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "free-day-actions";

      const btnDelete = document.createElement("button");
      btnDelete.type = "button";
      btnDelete.className = "secondary-btn btn-sm btn-delete-free";
      btnDelete.textContent = "Eliminar";
      btnDelete.setAttribute("aria-label", `Eliminar período libre: ${item.motivo}`);
      btnDelete.addEventListener("click", async () => {
        const confirmar = window.confirm(`¿Eliminar el período libre «${item.motivo}»?`);
        if (!confirmar) return;

        try {
          await fetchApi(`/api/periodos-libres/${item.id}`, { method: "DELETE" });
          await cargarPeriodosLibres();
        } catch (err) {
          mostrarFeedback(freeDaysFeedback, err.message);
        }
      });

      actionsDiv.appendChild(btnDelete);
      li.appendChild(infoDiv);
      li.appendChild(actionsDiv);
      freeDaysList.appendChild(li);
    });
  }

  if (freeDaysForm) {
    freeDaysForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      limpiarFeedback(freeDaysFeedback);

      const fechaInicio = freeStartDateInput.value;
      const fechaFin = freeEndDateInput.value || fechaInicio;
      const motivo = freeReasonInput.value.trim() || "Día libre";

      if (!fechaInicio) {
        mostrarFeedback(freeDaysFeedback, "Indica al menos la fecha de inicio.");
        return;
      }

      if (fechaInicio > fechaFin) {
        mostrarFeedback(freeDaysFeedback, "La fecha de inicio no puede ser posterior a la fecha de fin.");
        return;
      }

      try {
        await fetchApi("/api/periodos-libres", {
          method: "POST",
          body: JSON.stringify({
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            motivo: motivo
          })
        });

        freeDaysForm.reset();
        await cargarPeriodosLibres();
      } catch (err) {
        mostrarFeedback(freeDaysFeedback, err.message);
      }
    });
  }

  // =========================================================================
  // INICIALIZACIÓN
  // =========================================================================

  document.addEventListener("DOMContentLoaded", () => {
    cargarAsignaturas();
    cargarHorarios();
    cargarPeriodosLibres();

    // Cuando el usuario cambie a la pestaña de horarios, refrescar datos
    const tabBtnHorarios = document.getElementById("tab-nav-horarios");
    if (tabBtnHorarios) {
      tabBtnHorarios.addEventListener("click", () => {
        cargarAsignaturas();
        cargarHorarios();
        cargarPeriodosLibres();
      });
    }

    // Exponer función de recarga en el objeto global para sincronización cruzada
    window.recargarHorarios = () => {
      cargarAsignaturas();
      cargarHorarios();
      cargarPeriodosLibres();
    };
  });
})();

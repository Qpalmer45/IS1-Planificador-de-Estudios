"use strict";

/**
 * Lógica de cliente para StudyPlan (Planificador de Estudios).
 * Manejo de pestañas de navegación, dashboard, asignaturas y To-Dos rápidos (HU27).
 */

// Estado global: lista (Array) de notas recibidas de la API y filtro activo (String).
let todos = [];
let currentFilter = "all";
let asignaturas = [];
let selectedAsignaturaId = null;
let subjectModalTrigger = null;
let temas = [];
let currentTopicFilter = "all";
let topicsSubjectId = null;

// Referencias (Element o null) a los controles de notas, mensajes y cierre de sesión.
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const charCounter = document.querySelector("#char-counter");
const todoList = document.querySelector("#todo-list");
const counterText = document.querySelector("#counter");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyDesc = document.querySelector("#empty-desc");
const feedbackEl = document.querySelector("#feedback");
const btnLogout = document.querySelector("#btn-logout");

// Referencias (Element o null) a los contadores de notas en filtros, navegación y dashboard.
const countAllEl = document.querySelector("#count-all");
const countPendingEl = document.querySelector("#count-pending");
const countDoneEl = document.querySelector("#count-done");
const navTodosCountEl = document.querySelector("#nav-todos-count");
const dashPendingCountEl = document.querySelector("#dashboard-pending-count");
const dashDoneCountEl = document.querySelector("#dashboard-done-count");
const navAsignaturasCountEl = document.querySelector("#nav-asignaturas-count");
const dashAsignaturasCountEl = document.querySelector("#dashboard-subject-count");

// Referencias al formulario, lista y pestañas individuales de las asignaturas.
const subjectForm = document.querySelector("#subject-form");
const subjectNameInput = document.querySelector("#subject-name");
const subjectFeedbackEl = document.querySelector("#subject-feedback");
const subjectListEl = document.querySelector("#subject-list");
const subjectEmptyStateEl = document.querySelector("#subject-empty-state");
const subjectDetailEl = document.querySelector("#subject-detail");
const subjectModalEl = document.querySelector("#subject-modal");
const subjectDialogEl = document.querySelector(".subject-dialog");
const subjectDialogTitleEl = document.querySelector("#subject-dialog-title");
const subjectDialogCloseButton = document.querySelector("#subject-dialog-close");

// =============================================================================
// 1. API Helper y Manejo de Errores
// =============================================================================

/**
 * Envía una petición HTTP a la API en formato JSON y procesa la respuesta.
 * Si la sesión ha caducado redirige al login; si hay otro error lo comunica
 * lanzando una excepción. Devuelve una promesa con los datos JSON o null.
 */
async function api(path, options = {}) {
  // Mantiene el formato JSON común de todas las llamadas y permite que cada
  // operación agregue su método, cuerpo u otros encabezados.
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    // Si la sesión expiró o no está autenticado, redirigir a login
    window.location.href = "/login";
    return null;
  }

  if (!response.ok) {
    // Intenta recuperar el mensaje enviado por Flask; si la respuesta no trae
    // JSON válido, usa un mensaje genérico y deja que el llamador lo muestre.
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo completar la operación.");
  }

  // Una respuesta 204 no contiene cuerpo; el resto de respuestas exitosas se
  // decodifica como JSON para entregarla directamente al código de la vista.
  return response.status === 204 ? null : response.json();
}

/** Muestra un mensaje de error en el elemento de feedback, si existe. */
function showFeedback(message) {
  if (!feedbackEl) return;
  // textContent muestra el mensaje como texto y la clase activa el estilo de error.
  feedbackEl.textContent = message;
  feedbackEl.className = "feedback-alert error";
}

/** Limpia el mensaje de feedback y restablece su estilo normal. */
function clearFeedback() {
  if (!feedbackEl) return;
  // Quita el texto y restaura la clase sin la variante que hace visible la alerta.
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback-alert";
}

/** Muestra un error específico del módulo de asignaturas. */
function showSubjectFeedback(message) {
  if (!subjectFeedbackEl) return;
  // Se mantiene un feedback propio para no mezclar errores de To-Dos y materias.
  subjectFeedbackEl.textContent = message;
  subjectFeedbackEl.className = "feedback-alert error";
}

/** Limpia los errores anteriores antes de realizar otra operación. */
function clearSubjectFeedback() {
  if (!subjectFeedbackEl) return;
  // Oculta visualmente el mensaje anterior antes de iniciar una nueva operación.
  subjectFeedbackEl.textContent = "";
  subjectFeedbackEl.className = "feedback-alert";
}

// =============================================================================
// 2. Navegación por Pestañas (Tabs)
// =============================================================================

/**
 * Activa la pestaña cuyo identificador se recibe, actualiza los botones
 * y refleja la selección en el hash de la URL sin recargar la página.
 */
function switchTab(tabId) {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const targetContent = Array.from(tabContents).find(
    content => content.id === `tab-${tabId}`
  );

  // Valida el destino antes de modificar la vista para conservar la pestaña actual
  // cuando el identificador solicitado no existe.
  if (!targetContent) return;

  // Activa la sección solicitada y desactiva las demás.
  tabContents.forEach(content => {
    content.classList.toggle("active", content === targetContent);
  });

  // Sincroniza el estado visual de los botones con la sección que quedó activa.
  tabButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Conserva la pestaña en el hash para permitir enlaces directos sin recargar.
  history.replaceState(null, "", `#${tabId}`);

  if ((tabId === "horarios" || tabId === "horario") && typeof window.recargarHorarios === "function") {
    window.recargarHorarios();
  }
}

/** Conecta los botones de navegación y restaura la pestaña indicada por la URL. */
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  // Cada botón indica el ID de la sección que debe mostrarse en data-tab.
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });

  // Accesos rápidos desde tarjetas y acciones del dashboard a la pestaña To-Dos.
  const gotoTodosBtn = document.querySelector("#btn-goto-todos");
  if (gotoTodosBtn) gotoTodosBtn.addEventListener("click", () => switchTab("todos"));

  const moduleTodosBtn = document.querySelector("#btn-module-todos");
  if (moduleTodosBtn) moduleTodosBtn.addEventListener("click", () => switchTab("todos"));

  const metricPendingCard = document.querySelector("#card-metric-pending");
  if (metricPendingCard) metricPendingCard.addEventListener("click", () => switchTab("todos"));

  const metricDoneCard = document.querySelector("#card-metric-done");
  if (metricDoneCard) metricDoneCard.addEventListener("click", () => switchTab("todos"));

  // Enlaces reutilizables a otras secciones, incluidas las que se implementen después.
  document.querySelectorAll("[data-open-tab]").forEach(el => {
    el.addEventListener("click", () => {
      const target = el.dataset.openTab;
      if (target) switchTab(target);
    });
  });

  // Restaura una pestaña válida indicada en la URL; si el hash no corresponde
  // a una sección, se conserva la pestaña inicial marcada en el HTML.
  const hash = window.location.hash.replace("#", "");
  if (hash && document.querySelector(`#tab-${hash}`)) {
    switchTab(hash);
  }
}

// =============================================================================
// 3. Renderizado y Gestión de To-Dos (HU27)
// =============================================================================

/** Calcula y actualiza los contadores de notas pendientes, completadas y totales. */
function updateCounters() {
  const total = todos.length;
  const pending = todos.filter(t => !t.completada).length;
  const done = todos.filter(t => t.completada).length;

  // Actualiza las cantidades de los filtros y los indicadores de tareas.
  if (countAllEl) countAllEl.textContent = total;
  if (countPendingEl) countPendingEl.textContent = pending;
  if (countDoneEl) countDoneEl.textContent = done;

  // Resume cuántas notas siguen pendientes usando el singular cuando corresponde.
  if (counterText) {
    counterText.textContent = `${pending} pendiente${pending === 1 ? "" : "s"}`;
  }

  // Oculta el distintivo de navegación cuando no hay tareas pendientes.
  if (navTodosCountEl) {
    navTodosCountEl.textContent = pending;
    navTodosCountEl.style.display = pending > 0 ? "inline-block" : "none";
  }

  // Mantiene las métricas del dashboard sincronizadas con la lista cargada.
  if (dashPendingCountEl) dashPendingCountEl.textContent = pending;
  if (dashDoneCountEl) dashDoneCountEl.textContent = done;
  if (navAsignaturasCountEl) {
    navAsignaturasCountEl.textContent = asignaturas.length;
    navAsignaturasCountEl.style.display = asignaturas.length > 0 ? "inline-block" : "none";
  }
  if (dashAsignaturasCountEl) dashAsignaturasCountEl.textContent = asignaturas.length;
}

/**
 * Dibuja en el DOM las notas que coinciden con el filtro activo, junto con
 * sus controles para completarlas, editarlas o eliminarlas.
 */
function renderTodos() {
  if (!todoList) return;
  // Reconstruye la lista desde el estado actual para evitar conservar controles
  // o filas que ya no correspondan a los datos del servidor.
  todoList.replaceChildren();

  updateCounters();

  // Aplica el filtro seleccionado en la barra antes de crear elementos del DOM.
  const visible = todos.filter(t => {
    if (currentFilter === "pending") return !t.completada;
    if (currentFilter === "done") return t.completada;
    return true; // 'all'
  });

  if (visible.length === 0) {
    // El texto cambia según el filtro para explicar por qué no hay filas visibles.
    if (emptyState) {
      emptyState.hidden = false;
      if (currentFilter === "pending") {
        emptyTitle.textContent = "¡Todo al día! No tienes notas pendientes";
        emptyDesc.textContent = "Puedes relajarte o añadir un nuevo pendiente rápido.";
      } else if (currentFilter === "done") {
        emptyTitle.textContent = "No hay notas completadas aún";
        emptyDesc.textContent = "Marca una nota como realizada para verla aquí.";
      } else {
        emptyTitle.textContent = "No hay ninguna nota rápida todavía";
        emptyDesc.textContent = "Escribe arriba tu primera nota o recordatorio.";
      }
    }
    return;
  }

  if (emptyState) emptyState.hidden = true;

  visible.forEach(todo => {
    // Cada tarea genera su propia fila y conserva el ID para identificarla en la API.
    const item = document.createElement("li");
    item.className = `todo-item${todo.completada ? " done" : ""}`;
    item.dataset.id = todo.id;

    // El checkbox refleja el estado actual; al cambiarlo, persiste el nuevo valor
    // y recarga la lista para usar la respuesta actualizada del backend.
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completada;
    checkbox.setAttribute("aria-label", `Marcar como completada: ${todo.titulo}`);
    checkbox.addEventListener("change", async () => {
      try {
        clearFeedback();
        await api(`/api/todos/${todo.id}`, {
          method: "PATCH",
          body: JSON.stringify({ completada: checkbox.checked })
        });
        await loadTodos();
      } catch (err) {
        showFeedback(err.message);
        checkbox.checked = todo.completada;
      }
    });

    // Agrupa el texto de la tarea separado del checkbox y de sus acciones.
    const content = document.createElement("div");
    content.className = "todo-content";

    const titleRow = document.createElement("div");
    titleRow.className = "todo-title-row";

    const titleSpan = document.createElement("span");
    titleSpan.className = "todo-title";
    titleSpan.textContent = todo.titulo;

    const prio = todo.prioridad || "media";
    const prioBadge = document.createElement("span");
    prioBadge.className = `priority-badge priority-${prio}`;
    prioBadge.textContent = prio.charAt(0).toUpperCase() + prio.slice(1);

    titleRow.append(titleSpan, prioBadge);
    content.appendChild(titleRow);

    // Añade los controles de edición y borrado para esta tarea concreta.
    const actions = document.createElement("div");
    actions.className = "todo-actions";

    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.className = "action-btn edit";
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", () => startEditing(todo, item));

    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.className = "action-btn delete";
    btnDelete.textContent = "Eliminar";
    btnDelete.addEventListener("click", async () => {
      // Solicita confirmación antes de realizar una operación destructiva.
      if (!window.confirm("¿Seguro que deseas eliminar esta nota rápida?")) return;
      try {
        clearFeedback();
        await api(`/api/todos/${todo.id}`, { method: "DELETE" });
        await loadTodos();
      } catch (err) {
        showFeedback(err.message);
      }
    });

    actions.append(btnEdit, btnDelete);
    item.append(checkbox, content, actions);
    todoList.appendChild(item);
  });
}

/**
 * Sustituye una nota por un formulario de edición temporal.
 * Guarda los cambios en la API o restaura la lista si se cancela.
 */
function startEditing(todo, itemElement) {
  // Sustituye temporalmente la fila por un formulario sin modificar todavía el servidor.
  const editWrap = document.createElement("div");
  editWrap.className = "edit-form-wrap";

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.maxLength = 200;
  editInput.value = todo.titulo;
  editInput.className = "edit-input";

  const editPriority = document.createElement("select");
  editPriority.className = "edit-select priority-select";
  editPriority.setAttribute("aria-label", "Prioridad de la tarea");
  [
    { value: "baja", label: "Prioridad Baja" },
    { value: "media", label: "Prioridad Media" },
    { value: "alta", label: "Prioridad Alta" },
  ].forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    if ((todo.prioridad || "media") === opt.value) option.selected = true;
    editPriority.appendChild(option);
  });

  const saveEdit = async () => {
    const newTitle = editInput.value.trim();
    // Evita enviar una modificación sin título después de quitar espacios.
    if (!newTitle) {
      showFeedback("La nota no puede estar vacía.");
      return;
    }
    const currentPrio = todo.prioridad || "media";
    const newPrio = editPriority.value;
    const patchBody = { titulo: newTitle };
    if (newPrio !== currentPrio) {
      patchBody.prioridad = newPrio;
    }
    try {
      clearFeedback();
      await api(`/api/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify(patchBody)
      });
      await loadTodos();
    } catch (err) {
      showFeedback(err.message);
    }
  };

  // Cancelar vuelve a dibujar el estado guardado y descarta el texto temporal.
  const cancelEdit = () => renderTodos();

  const btnSave = document.createElement("button");
  btnSave.type = "button";
  btnSave.className = "action-btn save";
  btnSave.textContent = "Guardar";
  btnSave.addEventListener("click", saveEdit);

  const btnCancel = document.createElement("button");
  btnCancel.type = "button";
  btnCancel.className = "action-btn cancel";
  btnCancel.textContent = "Cancelar";
  btnCancel.addEventListener("click", cancelEdit);

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  });

  // Reemplaza la fila en el DOM y enfoca el campo para que se pueda escribir de inmediato.
  editWrap.append(editInput, editPriority, btnSave, btnCancel);
  itemElement.replaceChildren(editWrap);
  editInput.focus();
}

/** Solicita las notas del usuario a la API y actualiza el estado y la vista. */
async function loadTodos() {
  try {
    // El servidor decide qué tareas pertenecen a la sesión actual.
    const data = await api("/api/todos");
    if (data) {
      // Actualiza el estado local y repinta lista, filtros y contadores.
      todos = data;
      renderTodos();
    }
  } catch (err) {
    showFeedback(err.message);
  }
}

// =============================================================================
// 4. Gestión de asignaturas y apartados individuales (HU01 y HU23)
// =============================================================================

/** Dibuja la lista y las acciones disponibles para cada asignatura. */
function renderSubjects() {
  if (!subjectListEl) return;
  // Regenera el listado desde `asignaturas`; los nombres se insertan como texto,
  // no como HTML, para que se muestren literalmente.
  subjectListEl.replaceChildren();

  // El estado vacío solo aparece cuando la respuesta del servidor no contiene materias.
  if (subjectEmptyStateEl) {
    subjectEmptyStateEl.hidden = asignaturas.length > 0;
  }

  asignaturas.forEach(asignatura => {
    // Construye una fila por asignatura y conecta cada acción con su ID estable.
    const item = document.createElement("li");
    item.className = "subject-list-item";

    const info = document.createElement("div");
    info.className = "subject-info";

    const name = document.createElement("span");
    name.className = "subject-list-name";
    name.textContent = asignatura.nombre;

    const diff = asignatura.dificultad || "media";
    const diffBadge = document.createElement("span");
    diffBadge.className = `difficulty-badge difficulty-${diff}`;
    diffBadge.textContent = `Dificultad: ${diff.charAt(0).toUpperCase() + diff.slice(1)}`;

    const priority = asignatura.prioridad || "media";
    const priorityBadge = document.createElement("span");
    priorityBadge.className = `priority-badge priority-${priority}`;
    priorityBadge.textContent = `Prioridad: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`;

    info.append(name, diffBadge, priorityBadge);

    const actions = document.createElement("div");
    actions.className = "subject-list-actions";

    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "secondary-btn";
    openButton.textContent = "Abrir";
    // Conserva el botón como origen del foco para devolverlo al cerrar la ventana.
    openButton.addEventListener("click", () => openAsignatura(asignatura.id, openButton));

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-btn edit";
    editButton.textContent = "Editar";
    editButton.setAttribute("aria-label", `Editar ${asignatura.nombre}`);
    editButton.addEventListener("click", () => editAsignatura(asignatura, item));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-btn delete";
    deleteButton.textContent = "Eliminar";
    deleteButton.setAttribute("aria-label", `Eliminar ${asignatura.nombre}`);
    deleteButton.addEventListener("click", () => deleteAsignatura(asignatura));

    actions.append(openButton, editButton, deleteButton);
    item.append(info, actions);
    subjectListEl.appendChild(item);
  });

  updateCounters();
}

/** Muestra el contenido inicial en el panel superpuesto de la asignatura. */
function renderSubjectDetail(asignatura) {
  if (!subjectDetailEl) return;
  // Reconstruye el detalle para que no queden controles ni temas de la materia
  // abierta anteriormente y reinicia el filtro al estado "Todos".
  subjectDetailEl.replaceChildren();
  temas = [];
  currentTopicFilter = "all";
  topicsSubjectId = asignatura.id;
  // El nombre se presenta en la cabecera externa del diálogo, no dentro del contenido.
  if (subjectDialogTitleEl) {
    subjectDialogTitleEl.textContent = asignatura.nombre;
  }

  const subjectMeta = document.createElement("div");
  subjectMeta.className = "subject-dialog-meta";
  const diffVal = asignatura.dificultad || "media";
  const diffBadge = document.createElement("span");
  diffBadge.className = `difficulty-badge difficulty-${diffVal}`;
  diffBadge.textContent = `Dificultad: ${diffVal.charAt(0).toUpperCase() + diffVal.slice(1)}`;
  const priorityVal = asignatura.prioridad || "media";
  const priorityBadge = document.createElement("span");
  priorityBadge.className = `priority-badge priority-${priorityVal}`;
  priorityBadge.textContent = `Prioridad: ${priorityVal.charAt(0).toUpperCase() + priorityVal.slice(1)}`;
  subjectMeta.append(diffBadge, priorityBadge);
  subjectDetailEl.appendChild(subjectMeta);

  // El formulario, los filtros, el estado vacío y la lista se crean aquí
  // porque el contenido depende del detalle que devuelva la API.
  const topicManager = document.createElement("section");
  topicManager.className = "topic-manager";

  const form = document.createElement("form");
  form.id = "topic-form";
  form.className = "topic-create-form";

  // La línea de creación mantiene el botón + junto al campo del nuevo tema.
  // Los apuntes se escriben directamente bajo el bloque una vez creado.
  const titleInput = document.createElement("input");
  titleInput.id = "topic-title";
  titleInput.type = "text";
  titleInput.maxLength = 200;
  titleInput.placeholder = "Escribe el nombre de un tema...";
  titleInput.setAttribute("aria-label", "Título del tema");

  const createButton = document.createElement("button");
  createButton.id = "topic-add-button";
  createButton.type = "submit";
  createButton.className = "topic-add-button";
  createButton.textContent = "+";
  createButton.setAttribute("aria-label", "Añadir tema");
  createButton.title = "Añadir tema";
  form.append(createButton, titleInput);

  // Separa los mensajes de guardado de temas de los errores del módulo general
  // de asignaturas y los anuncia a tecnologías de asistencia.
  const feedback = document.createElement("div");
  feedback.id = "topic-feedback";
  feedback.className = "feedback-alert";
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");

  // El filtro cambia solo la presentación local; no genera otra petición API.
  const filters = document.createElement("div");
  filters.className = "topic-filters";
  filters.setAttribute("role", "group");
  filters.setAttribute("aria-label", "Filtrar temas");
  filters.append(
    createTopicFilterButton("all", "Todos"),
    createTopicFilterButton("pending", "Pendientes"),
    createTopicFilterButton("studied", "Estudiados"),
  );

  const emptyState = document.createElement("p");
  emptyState.id = "topic-empty-state";
  emptyState.className = "topic-empty-state";
  emptyState.textContent = "Aún no hay temas en esta asignatura.";

  const list = document.createElement("div");
  list.id = "topic-list";
  list.className = "topic-list";
  list.setAttribute("role", "list");
  list.setAttribute("aria-label", "Temas de la asignatura");

  // Inserta todos los controles antes de conectar eventos, de forma que sus
  // manejadores puedan consultar el resto del detalle mediante el DOM.
  topicManager.append(form, feedback, filters, emptyState, list);
  subjectDetailEl.appendChild(topicManager);
  setupTopicEvents(form, titleInput);
}

/** Crea un filtro accesible y repinta los temas con el criterio seleccionado. */
function createTopicFilterButton(filter, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "topic-filter-btn";
  button.dataset.topicFilter = filter;
  button.textContent = label;
  button.setAttribute("aria-pressed", String(filter === currentTopicFilter));
  button.addEventListener("click", () => {
    // Sincroniza el estado accesible de los botones y actualiza la lista
    // a partir de los datos ya cargados, sin modificar la API.
    currentTopicFilter = filter;
    subjectDetailEl.querySelectorAll(".topic-filter-btn").forEach(item => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    renderTopics();
  });
  return button;
}

/** Presenta un error de validación o API dentro del apartado actual. */
function showTopicFeedback(message) {
  const feedback = subjectDetailEl?.querySelector("#topic-feedback");
  if (!feedback) return;
  feedback.textContent = message;
  feedback.className = "feedback-alert error";
}

/** Limpia el error de temas antes de comenzar otra operación. */
function clearTopicFeedback() {
  const feedback = subjectDetailEl?.querySelector("#topic-feedback");
  if (!feedback) return;
  feedback.textContent = "";
  feedback.className = "feedback-alert";
}

/** Dibuja los temas del apartado aplicando el filtro activo. */
function renderTopics() {
  const list = subjectDetailEl?.querySelector("#topic-list");
  const emptyState = subjectDetailEl?.querySelector("#topic-empty-state");
  if (!list || !emptyState) return;

  // El filtro se aplica a la copia local. Los apuntes se crean como nodos y
  // se asignan con textContent para no interpretar el contenido como HTML.
  const filteredTopics = temas.filter(tema => {
    if (currentTopicFilter === "pending") return !tema.estudiado;
    if (currentTopicFilter === "studied") return tema.estudiado;
    return true;
  });
  list.replaceChildren();
  emptyState.hidden = filteredTopics.length > 0;
  if (filteredTopics.length === 0) {
    emptyState.textContent = temas.length === 0
      ? "Aún no hay temas en esta asignatura."
      : "No hay temas en este filtro.";
  }

  // Cada tema se dibuja como un bloque desplegable; <details> aporta su
  // comportamiento nativo de abrir/cerrar y el indicador de flecha.
  filteredTopics.forEach(tema => {
    const item = document.createElement("details");
    item.className = "topic-item";
    item.dataset.id = String(tema.id);
    item.setAttribute("role", "listitem");
    item.open = true;

    const heading = document.createElement("summary");
    heading.className = "topic-heading";
    const title = document.createElement("h4");
    title.className = "topic-title";
    title.textContent = tema.titulo;
    heading.appendChild(title);

    const statusLabel = document.createElement("label");
    statusLabel.className = "topic-studied-label";
    const status = document.createElement("input");
    status.type = "checkbox";
    status.className = "topic-studied-toggle";
    status.checked = Boolean(tema.estudiado);
    status.setAttribute("aria-label", `Marcar ${tema.titulo} como estudiado`);
    status.addEventListener("change", () => updateTopicStatus(tema, status));
    status.addEventListener("click", event => event.stopPropagation());
    statusLabel.append(status, document.createTextNode("Estudiado"));
    heading.appendChild(statusLabel);

    // Los apuntes se pueden editar directamente en el bloque. El evento
    // change los guarda al confirmar la edición y abandonar el área de texto.
    const body = document.createElement("div");
    body.className = "topic-body";
    const content = document.createElement("textarea");
    content.className = "topic-content";
    content.rows = Math.max(1, tema.contenido.split("\n").length);
    content.value = tema.contenido;
    content.placeholder = "Escribe aquí...";
    content.setAttribute("aria-label", `Apuntes de ${tema.titulo}`);
    content.addEventListener("input", () => {
      // Ajusta las filas al contenido actual para no dejar altura sobrante
      // cuando se eliminan saltos de línea de los apuntes.
      content.rows = Math.max(1, content.value.split("\n").length);
      content.style.height = "auto";
      content.style.height = `${Math.max(34, content.scrollHeight)}px`;
    });
    content.addEventListener("change", () => saveTopicContent(tema, content));
    content.addEventListener("keydown", event => {
      const cursor = content.selectionStart;
      const lineStart = content.value.lastIndexOf("\n", cursor - 1) + 1;
      const lineEnd = content.value.indexOf("\n", cursor);
      const currentLine = content.value.slice(
        lineStart,
        lineEnd === -1 ? content.value.length : lineEnd,
      );
      if (
        event.key === "Backspace"
        && content.selectionStart === content.selectionEnd
        && currentLine === ""
      ) {
        event.preventDefault();
        if (content.value === "") {
          // Solo se sale del tema si no queda ninguna línea ni apunte.
          item.open = false;
          subjectDetailEl.querySelector("#topic-title")?.focus();
        } else if (lineStart > 0) {
          // En una línea vacía interior, elimina el salto anterior y conserva
          // el tema abierto para que se pueda seguir escribiendo.
          content.value = `${content.value.slice(0, lineStart - 1)}${content.value.slice(lineStart)}`;
          content.setSelectionRange(lineStart - 1, lineStart - 1);
          content.dispatchEvent(new window.Event("input", { bubbles: true }));
          // La edición del valor por código no dispara el evento change;
          // guarda aquí la eliminación para que no reaparezca al recargar.
          saveTopicContent(tema, content);
        }
      }
    });

    const actions = document.createElement("div");
    actions.className = "topic-actions";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-btn topic-edit";
    editButton.textContent = "Editar";
    editButton.setAttribute("aria-label", `Editar ${tema.titulo}`);
    editButton.addEventListener("click", () => startEditingTopic(tema, item));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-btn delete topic-delete";
    deleteButton.textContent = "Eliminar";
    deleteButton.setAttribute("aria-label", `Eliminar ${tema.titulo}`);
    deleteButton.addEventListener("click", () => deleteTema(tema));
    actions.append(editButton, deleteButton);

    // Las acciones quedan junto al encabezado para que no se confundan con
    // los controles de escritura del contenido.
    body.append(actions, content);
    item.append(heading, body);
    list.appendChild(item);
  });
}

/** Carga los temas y descarta respuestas que ya no correspondan al diálogo. */
async function loadAsignaturaTopics(asignaturaId) {
  try {
    const data = await api(`/api/asignaturas/${asignaturaId}/temas`);
    // Una petición puede terminar después de cerrar o cambiar de asignatura.
    // En ese caso no se deben mezclar datos de dos apartados.
    if (
      !data ||
      selectedAsignaturaId !== asignaturaId ||
      topicsSubjectId !== asignaturaId ||
      !subjectModalEl ||
      subjectModalEl.hidden
    ) return;
    if (!Array.isArray(data)) {
      throw new Error("La respuesta de temas no tiene el formato esperado.");
    }
    // Actualiza el estado local solo después de comprobar el formato recibido.
    temas = data;
    renderTopics();
  } catch (err) {
    if (selectedAsignaturaId === asignaturaId && topicsSubjectId === asignaturaId) {
      showTopicFeedback(err.message);
    }
  }
}

/** Conecta el formulario para crear temas y guardar sus apuntes. */
function setupTopicEvents(form, titleInput) {
  form.addEventListener("submit", async event => {
    event.preventDefault();
    // Evita enviar títulos vacíos y conserva intacto el contenido si la
    // validación falla para que el usuario no pierda lo que escribió.
    const titulo = titleInput.value.trim();
    if (!titulo) {
      showTopicFeedback("Escribe el título del tema.");
      return;
    }

    // Captura la asignatura activa antes de esperar la respuesta de red.
    const asignaturaId = topicsSubjectId;
    try {
      clearTopicFeedback();
      const created = await api(`/api/asignaturas/${asignaturaId}/temas`, {
        method: "POST",
        body: JSON.stringify({ titulo, contenido: "" }),
      });
      if (!created) return;
      // No limpiar ni enfocar controles de un diálogo que ya cambió de contexto.
      if (selectedAsignaturaId !== asignaturaId || subjectModalEl.hidden) return;
      // Solo se vacía el formulario cuando la API confirmó la creación.
      titleInput.value = "";
      await loadAsignaturaTopics(asignaturaId);
      const newTopic = temas.find(tema => tema.id === created.id);
      const content = newTopic && subjectDetailEl.querySelector(
        `.topic-item[data-id="${newTopic.id}"] .topic-content`,
      );
      if (content) content.focus();
      else titleInput.focus();
    } catch (err) {
      if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
        showTopicFeedback(err.message);
      }
    }
  });
}

/** Guarda automáticamente los apuntes cuando se confirma su edición. */
async function saveTopicContent(tema, content) {
  const asignaturaId = topicsSubjectId;
  const contenido = content.value;
  if (contenido === tema.contenido) return;

  try {
    clearTopicFeedback();
    const updated = await api(`/api/temas/${tema.id}`, {
      method: "PATCH",
      body: JSON.stringify({ contenido }),
    });
    if (!updated) return;
    // Actualiza el estado local sin volver a dibujar ni quitar el foco del editor.
    if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
      tema.contenido = updated.contenido;
    }
  } catch (err) {
    // Conserva en pantalla el texto escrito y comunica el error para que se
    // pueda reintentar, en lugar de reemplazarlo por la versión anterior.
    if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
      showTopicFeedback(err.message);
    }
  }
}

/** Guarda el cambio del estado estudiado y revierte la casilla si falla. */
async function updateTopicStatus(tema, checkbox) {
  // El cambio visual es inmediato; se conserva el valor anterior del tema para
  // restaurarlo si el servidor rechaza la actualización.
  const asignaturaId = topicsSubjectId;
  const estudiado = checkbox.checked;
  try {
    clearTopicFeedback();
    await api(`/api/temas/${tema.id}`, {
      method: "PATCH",
      body: JSON.stringify({ estudiado }),
    });
    if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
      await loadAsignaturaTopics(asignaturaId);
    }
  } catch (err) {
    checkbox.checked = Boolean(tema.estudiado);
    if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
      showTopicFeedback(err.message);
    }
  }
}

/** Sustituye temporalmente el título por un formulario de edición del nombre. */
function startEditingTopic(tema, item) {
  // La edición del nombre es independiente de los apuntes, que siguen siendo
  // editables directamente en el área de contenido.
  const form = document.createElement("form");
  form.className = "topic-edit-form";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.className = "topic-edit-title";
  titleInput.maxLength = 200;
  titleInput.value = tema.titulo;
  titleInput.setAttribute("aria-label", `Título de ${tema.titulo}`);

  const weeklyInput = document.createElement("input");
  weeklyInput.type = "number";
  weeklyInput.min = "0";
  weeklyInput.max = "10080";
  weeklyInput.step = "1";
  weeklyInput.required = true;
  weeklyInput.value = String(asignatura.minutos_semanales ?? 0);
  weeklyInput.setAttribute("aria-label", `Minutos semanales para ${asignatura.nombre}`);

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "action-btn save";
  saveButton.textContent = "Guardar";
  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "action-btn cancel topic-edit-cancel";
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", renderTopics);

  form.addEventListener("submit", async event => {
    event.preventDefault();
    // Impide guardar un título vacío después de quitar los espacios exteriores.
    const titulo = titleInput.value.trim();
    if (!titulo) {
      showTopicFeedback("Escribe el título del tema.");
      return;
    }

    const asignaturaId = topicsSubjectId;
    try {
      clearTopicFeedback();
      await api(`/api/temas/${tema.id}`, {
        method: "PATCH",
        body: JSON.stringify({ titulo }),
      });
      // Tras guardar, recarga la versión persistida para mantener estado y
      // orden sincronizados con el backend.
      if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
        await loadAsignaturaTopics(asignaturaId);
      }
    } catch (err) {
      if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
        showTopicFeedback(err.message);
      }
    }
  });

  // Reemplaza la fila mientras se edita y enfoca el nombre inmediatamente.
  form.append(titleInput, saveButton, cancelButton);
  item.replaceChildren(form);
  titleInput.focus();
}

/** Elimina un tema solo tras confirmación y mantiene el listado sincronizado. */
async function deleteTema(tema) {
  // La confirmación reduce borrados accidentales desde la lista de temas.
  if (!window.confirm(`¿Seguro que deseas eliminar el tema "${tema.titulo}"?`)) return;
  const asignaturaId = topicsSubjectId;
  try {
    clearTopicFeedback();
    await api(`/api/temas/${tema.id}`, { method: "DELETE" });
    // Recarga solo si el usuario sigue dentro de la misma asignatura.
    if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
      await loadAsignaturaTopics(asignaturaId);
    }
  } catch (err) {
    if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
      showTopicFeedback(err.message);
    }
  }
}

/** Solicita el apartado individual y evita mostrar una respuesta obsoleta. */
async function loadAsignaturaDetail(asignaturaId) {
  if (!subjectDetailEl || !subjectModalEl) return;
  // Indica que se está consultando el detalle mientras responde el backend.
  subjectDetailEl.replaceChildren();
  const loading = document.createElement("p");
  loading.textContent = "Cargando asignatura...";
  subjectDetailEl.appendChild(loading);

  try {
    // El servidor valida que la asignatura pertenece al usuario de la sesión.
    const asignatura = await api(`/api/asignaturas/${asignaturaId}`);
    // Ignora respuestas tardías si ya se cerró la ventana o se abrió otra materia.
    if (asignatura && selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
      renderSubjectDetail(asignatura);
      await loadAsignaturaTopics(asignaturaId);
    }
  } catch (err) {
    if (selectedAsignaturaId === asignaturaId && !subjectModalEl.hidden) {
      showSubjectFeedback(err.message);
      subjectDetailEl.replaceChildren();
      const error = document.createElement("p");
      error.className = "subject-detail-error";
      error.textContent = err.message;
      subjectDetailEl.appendChild(error);
    }
  }
}

/** Abre el panel centrado y carga solo los datos de la asignatura solicitada. */
function openAsignatura(asignaturaId, trigger) {
  if (!subjectModalEl) return;
  // Guarda la selección y el elemento de origen para coordinar carga y retorno de foco.
  selectedAsignaturaId = asignaturaId;
  subjectModalTrigger = trigger;
  // Expone el diálogo a tecnologías de asistencia y bloquea el scroll del fondo.
  subjectModalEl.hidden = false;
  subjectModalEl.setAttribute("aria-hidden", "false");
  document.body.classList.add("subject-modal-open");
  if (subjectDialogCloseButton) subjectDialogCloseButton.focus();
  loadAsignaturaDetail(asignaturaId);
}

/** Cierra el panel, restablece el desplazamiento y devuelve el foco al botón Abrir. */
function closeAsignaturaModal() {
  if (!subjectModalEl || subjectModalEl.hidden) return;
  // Restablece el estado visual y de desplazamiento de la página principal.
  subjectModalEl.hidden = true;
  subjectModalEl.setAttribute("aria-hidden", "true");
  document.body.classList.remove("subject-modal-open");
  selectedAsignaturaId = null;

  // Devuelve el foco al botón que abrió el diálogo si todavía sigue en el documento.
  if (subjectModalTrigger && subjectModalTrigger.isConnected) {
    subjectModalTrigger.focus();
  }
  subjectModalTrigger = null;
}

/** Carga las asignaturas de la cuenta actual y conserva la selección válida. */
async function loadAsignaturas(selectedId = selectedAsignaturaId) {
  try {
    // Obtiene el listado del usuario autenticado para que la interfaz no mantenga
    // una copia obsoleta después de crear, editar o borrar materias.
    const data = await api("/api/asignaturas");
    if (!data) return;
    // Comprueba el formato antes de usar métodos de arreglo en la respuesta.
    if (!Array.isArray(data)) {
      throw new Error("La respuesta de asignaturas no tiene el formato esperado.");
    }

    // Conserva la selección solo si el ID sigue presente en la lista recibida.
    asignaturas = data;
    const selectionExists = asignaturas.some(item => item.id === selectedId);
    selectedAsignaturaId = selectionExists ? selectedId : null;
    renderSubjects();

    if (selectedAsignaturaId !== null) {
      await loadAsignaturaDetail(selectedAsignaturaId);
    }
  } catch (err) {
    showSubjectFeedback(err.message);
  }
}
window.loadAsignaturas = loadAsignaturas;

/** Sustituye una fila por un formulario y guarda el nombre actualizado. */
function editAsignatura(asignatura, item) {
  // Sustituye la fila seleccionada por un formulario en línea para evitar
  // cuadros nativos y mantener la edición dentro del flujo de la página.
  const form = document.createElement("form");
  form.className = "subject-edit-form";

  const input = document.createElement("input");
  input.type = "text";
  input.value = asignatura.nombre;
  input.setAttribute("aria-label", `Nuevo nombre para ${asignatura.nombre}`);

  const diffSelect = document.createElement("select");
  diffSelect.className = "edit-select difficulty-select";
  diffSelect.setAttribute("aria-label", `Dificultad para ${asignatura.nombre}`);
  [
    { value: "baja", label: "Dificultad Baja" },
    { value: "media", label: "Dificultad Media" },
    { value: "alta", label: "Dificultad Alta" },
  ].forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    if ((asignatura.dificultad || "media") === opt.value) option.selected = true;
    diffSelect.appendChild(option);
  });

  const prioritySelect = document.createElement("select");
  prioritySelect.className = "edit-select priority-select";
  prioritySelect.setAttribute("aria-label", `Prioridad para ${asignatura.nombre}`);
  [
    { value: "baja", label: "Prioridad Baja" },
    { value: "media", label: "Prioridad Media" },
    { value: "alta", label: "Prioridad Alta" },
  ].forEach(opt => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    if ((asignatura.prioridad || "media") === opt.value) option.selected = true;
    prioritySelect.appendChild(option);
  });

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "action-btn save";
  saveButton.textContent = "Guardar";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.className = "action-btn cancel";
  cancelButton.textContent = "Cancelar";
  cancelButton.addEventListener("click", renderSubjects);

  form.addEventListener("submit", async event => {
    event.preventDefault();
    try {
      // Persiste el nombre y los atributos HU12; después recarga la lista guardada.
      clearSubjectFeedback();
      const currentDiff = asignatura.dificultad || "media";
      const newDiff = diffSelect.value;
      const currentPriority = asignatura.prioridad || "media";
      const newPriority = prioritySelect.value;
      const patchBody = { nombre: input.value, minutos_semanales: Number(weeklyInput.value) };
      if (newDiff !== currentDiff) {
        patchBody.dificultad = newDiff;
      }
      if (newPriority !== currentPriority) {
        patchBody.prioridad = newPriority;
      }
      await api(`/api/asignaturas/${asignatura.id}`, {
        method: "PATCH",
        body: JSON.stringify(patchBody)
      });
      await loadAsignaturas(null);
    } catch (err) {
      showSubjectFeedback(err.message);
    }
  });

  form.append(input, diffSelect, prioritySelect, weeklyInput, saveButton, cancelButton);
  item.replaceChildren(form);
  input.focus();
}

/** Elimina una asignatura únicamente después de pedir confirmación. */
async function deleteAsignatura(asignatura) {
  // La confirmación previene borrados accidentales desde la fila de la materia.
  if (!window.confirm(`¿Seguro que deseas eliminar "${asignatura.nombre}"?`)) return;

  try {
    clearSubjectFeedback();
    await api(`/api/asignaturas/${asignatura.id}`, { method: "DELETE" });
    const wasSelected = selectedAsignaturaId === asignatura.id;
    // Cierra el diálogo antes de recargar si se eliminó la asignatura que mostraba.
    if (wasSelected) closeAsignaturaModal();
    // Mantiene abierta otra asignatura seleccionada cuando se elimina una distinta.
    await loadAsignaturas(wasSelected ? null : selectedAsignaturaId);
  } catch (err) {
    showSubjectFeedback(err.message);
  }
}

// =============================================================================
// 5. Inicialización de Formularios y Eventos
// =============================================================================

/** Conecta el formulario de notas, el contador de caracteres, los filtros y el logout. */
function setupTodoEvents() {
  if (todoForm) {
    todoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      // Quita espacios y evita enviar entradas vacías desde el formulario.
      const titulo = todoInput.value.trim();
      if (!titulo) return;

      const prioritySelect = document.querySelector("#todo-priority");
      const payload = { titulo };
      if (prioritySelect && prioritySelect.value) {
        payload.prioridad = prioritySelect.value;
      }

      try {
        clearFeedback();
        await api("/api/todos", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        // Limpia el formulario y actualiza la lista solo tras guardar correctamente.
        todoInput.value = "";
        if (prioritySelect) prioritySelect.value = "media";
        if (charCounter) charCounter.textContent = "0/200";
        await loadTodos();
        todoInput.focus();
      } catch (err) {
        showFeedback(err.message);
      }
    });
  }

  // Contador dinámico de caracteres al escribir
  if (todoInput && charCounter) {
    todoInput.addEventListener("input", () => {
      charCounter.textContent = `${todoInput.value.length}/200`;
    });
  }

  // Filtros de tareas (Todas / Pendientes / Completadas)
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      // Guarda el filtro y mantiene sincronizados el estilo activo y aria-pressed.
      currentFilter = btn.dataset.filter || "all";
      document.querySelectorAll(".filter-btn").forEach(b => {
        const isActive = b === btn;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-pressed", String(isActive));
      });
      renderTodos();
    });
  });

  // Cerrar sesión
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        // Invalida la sesión en el servidor antes de navegar a la pantalla de acceso.
        await api("/api/logout", { method: "POST" });
        window.location.href = "/login";
      } catch (err) {
        // También abandona la vista si falla la petición de logout.
        window.location.href = "/login";
      }
    });
  }
}

/** Conecta el formulario y los controles accesibles del panel de asignaturas. */
function setupSubjectEvents() {
  // El botón visible y el fondo exterior permiten cerrar el diálogo con el ratón.
  if (subjectDialogCloseButton) {
    subjectDialogCloseButton.addEventListener("click", closeAsignaturaModal);
  }

  if (subjectModalEl) {
    subjectModalEl.addEventListener("click", event => {
      // Solo un clic en la capa oscura cierra el diálogo; clics en su contenido no.
      if (event.target === subjectModalEl) closeAsignaturaModal();
    });

    document.addEventListener("keydown", event => {
      if (subjectModalEl.hidden) return;

      // Escape cierra el diálogo y Tab queda contenido en él para facilitar navegación accesible.
      if (event.key === "Escape") {
        closeAsignaturaModal();
        return;
      }

      if (event.key === "Tab" && subjectDialogEl) {
        const focusable = subjectDialogEl.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) {
          event.preventDefault();
          subjectDialogEl.focus();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        // Al alcanzar un extremo, mueve el foco al extremo contrario sin salir del diálogo.
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  if (!subjectForm || !subjectNameInput) return;

  subjectForm.addEventListener("submit", async event => {
    event.preventDefault();
    // Valida el nombre antes de solicitar la creación para evitar asignaturas vacías.
    const nombre = subjectNameInput.value.trim();
    if (!nombre) {
      showSubjectFeedback("Escribe el nombre de la asignatura.");
      return;
    }

    const diffInput = document.querySelector("#subject-difficulty");
    const priorityInput = document.querySelector("#subject-priority");
    const weeklyInput = document.getElementById("subject-weekly-minutes");
    const payload = { nombre, minutos_semanales: weeklyInput ? Number(weeklyInput.value) : 0 };
    if (diffInput && diffInput.value) {
      payload.dificultad = diffInput.value;
    }
    if (priorityInput && priorityInput.value) {
      payload.prioridad = priorityInput.value;
    }

    try {
      clearSubjectFeedback();
      await api("/api/asignaturas", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      // Reinicia el formulario, actualiza el listado y devuelve el cursor al campo.
      subjectNameInput.value = "";
      if (diffInput) diffInput.value = "media";
      if (priorityInput) priorityInput.value = "media";
      if (weeklyInput) weeklyInput.value = "0";
      await loadAsignaturas(null);
      subjectNameInput.focus();
    } catch (err) {
      showSubjectFeedback(err.message);
    }
  });
}

// Inicializa navegación, eventos y carga inicial cuando el documento HTML ya está disponible.
document.addEventListener("DOMContentLoaded", () => {
  // Instala primero los manejadores y después carga los datos de cada módulo.
  setupTabs();
  setupTodoEvents();
  setupSubjectEvents();
  loadTodos();
  loadAsignaturas();
  cargarRecordatorios();
});

// ==============================================================================
// HU19: CARGA Y RENDERIZADO DE RECORDATORIOS EN EL DASHBOARD
// ==============================================================================
async function cargarRecordatorios() {
    const contenedor = document.getElementById('lista-recordatorios');
    const badgeTotal = document.getElementById('badge-total-recordatorios');

    if (!contenedor) return;

    try {
        const respuesta = await fetch('/api/recordatorios');
        if (!respuesta.ok) throw new Error(`HTTP Error: ${respuesta.status}`);

        const datos = await respuesta.json();
        const listaRecordatorios = datos.recordatorios || [];

        if (badgeTotal) {
            badgeTotal.textContent = datos.total || 0;
        }

        // Caso 1: Sin entregas ni exámenes próximos
        if (listaRecordatorios.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 1.25rem; background: #f0fdf4; border-radius: 12px; color: #166534; border: 1px solid #bbf7d0;">
                    <span style="font-size: 1.2rem; display: block; margin-bottom: 4px;">✅</span>
                    <p style="margin: 0; font-weight: 600; font-size: 0.95rem;">¡Todo al día!</p>
                    <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #15803d;">No tienes entregas ni exámenes en los próximos 7 días.</p>
                </div>
            `;
            return;
        }

        // Caso 2: Listado de recordatorios activos
        contenedor.innerHTML = listaRecordatorios.map(item => {
            let badgeBg = '#eff6ff';
            let badgeColor = '#1d4ed8';
            let borderLeftColor = '#3b82f6';

            if (item.urgencia === 'alta') {
                badgeBg = '#fef2f2';
                badgeColor = '#dc2626';
                borderLeftColor = '#ef4444';
            } else if (item.urgencia === 'media') {
                badgeBg = '#fffbeb';
                badgeColor = '#d97706';
                borderLeftColor = '#f59e0b';
            }

            const tiempoTexto = item.dias_restantes === 0 ? '¡Hoy!' : `${item.dias_restantes} d`;

            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; margin-bottom: 8px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; border-left: 5px solid ${borderLeftColor};">
                    <div>
                        <span style="background: ${badgeBg}; color: ${badgeColor}; font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; text-transform: uppercase;">${item.tipo}</span>
                        <h4 style="margin: 4px 0 2px 0; font-size: 0.95rem; font-weight: 600; color: #0f172a;">${escaparHTML(item.titulo)}</h4>
                        <small style="color: #64748b; font-size: 0.825rem;">${item.mensaje} — Fecha: ${item.fecha}</small>
                    </div>
                    <div>
                        <span style="background: #f1f5f9; color: #334155; font-size: 0.85rem; font-weight: 700; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1;">${tiempoTexto}</span>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error en HU19:', error);
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 1rem; background: #fef2f2; border-radius: 10px; color: #991b1b; font-size: 0.875rem;">
                ⚠️ No se pudieron cargar los recordatorios.
            </div>
        `;
    }
}
// Función auxiliar para sanitizar el texto
function escaparHTML(cadena) {
    if (!cadena) return '';
    return cadena.replace(/[&<>'"]/g, 
        caracter => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[caracter] || caracter)
    );
}

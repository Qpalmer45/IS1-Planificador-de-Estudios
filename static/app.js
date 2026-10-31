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

  // Busca la sección destino y apaga el resto; `found` evita dejar una URL
  // apuntando a una pestaña que no exista en el documento.
  let found = false;
  tabContents.forEach(content => {
    if (content.id === `tab-${tabId}`) {
      content.classList.add("active");
      found = true;
    } else {
      content.classList.remove("active");
    }
  });

  if (!found) return;

  // Sincroniza el estado visual de los botones con la sección que quedó activa.
  tabButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Conserva la pestaña en el hash para permitir enlaces directos sin recargar.
  history.replaceState(null, "", `#${tabId}`);
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

    const titleSpan = document.createElement("span");
    titleSpan.className = "todo-title";
    titleSpan.textContent = todo.titulo;
    content.appendChild(titleSpan);

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

  const saveEdit = async () => {
    const newTitle = editInput.value.trim();
    // Evita enviar una modificación sin título después de quitar espacios.
    if (!newTitle) {
      showFeedback("La nota no puede estar vacía.");
      return;
    }
    try {
      clearFeedback();
      await api(`/api/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify({ titulo: newTitle })
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
  editWrap.append(editInput, btnSave, btnCancel);
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

    const name = document.createElement("span");
    name.className = "subject-list-name";
    name.textContent = asignatura.nombre;

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
    item.append(name, actions);
    subjectListEl.appendChild(item);
  });

  updateCounters();
}

/** Muestra el contenido inicial en el panel superpuesto de la asignatura. */
function renderSubjectDetail(asignatura) {
  if (!subjectDetailEl) return;
  // Limpia la información anterior para que el panel muestre solo esta asignatura.
  subjectDetailEl.replaceChildren();
  // El nombre se presenta en la cabecera externa del diálogo, no dentro del contenido.
  if (subjectDialogTitleEl) {
    subjectDialogTitleEl.textContent = asignatura.nombre;
  }

  // Reserva un espacio claro para las futuras herramientas de temario y exámenes.
  const description = document.createElement("p");
  description.className = "subject-detail-description";
  description.textContent = "Este es el espacio individual de esta asignatura.";

  const placeholder = document.createElement("div");
  placeholder.className = "subject-detail-placeholder";
  placeholder.textContent =
    "Aquí podrás organizar el temario, los exámenes y otra información propia de esta materia.";

  subjectDetailEl.append(description, placeholder);
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
      // Persiste el nombre; después recarga la lista para mostrar la versión guardada.
      clearSubjectFeedback();
      await api(`/api/asignaturas/${asignatura.id}`, {
        method: "PATCH",
        body: JSON.stringify({ nombre: input.value })
      });
      await loadAsignaturas(null);
    } catch (err) {
      showSubjectFeedback(err.message);
    }
  });

  form.append(input, saveButton, cancelButton);
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
    // Si se borró la materia abierta, limpia la selección; si no, conserva el diálogo.
    await loadAsignaturas(
      selectedAsignaturaId === asignatura.id ? null : selectedAsignaturaId
    );
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

      try {
        clearFeedback();
        await api("/api/todos", {
          method: "POST",
          body: JSON.stringify({ titulo })
        });
        // Limpia el formulario y actualiza la lista solo tras guardar correctamente.
        todoInput.value = "";
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
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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

    try {
      clearSubjectFeedback();
      await api("/api/asignaturas", {
        method: "POST",
        body: JSON.stringify({ nombre })
      });
      // Reinicia el formulario, actualiza el listado y devuelve el cursor al campo.
      subjectNameInput.value = "";
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
});

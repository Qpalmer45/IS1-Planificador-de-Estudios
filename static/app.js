"use strict";

/**
 * Lógica de cliente para StudyPlan (Planificador de Estudios).
 * Manejo de pestañas de navegación, dashboard del estudiante y gestión de To-Dos rápidos (HU27).
 */

// Estado global: lista (Array) de notas recibidas de la API y filtro activo (String).
let todos = [];
let currentFilter = "all";

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

// =============================================================================
// 1. API Helper y Manejo de Errores
// =============================================================================

/**
 * Envía una petición HTTP a la API en formato JSON y procesa la respuesta.
 * Si la sesión ha caducado redirige al login; si hay otro error lo comunica
 * lanzando una excepción. Devuelve una promesa con los datos JSON o null.
 */
async function api(path, options = {}) {
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
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo completar la operación.");
  }

  return response.status === 204 ? null : response.json();
}

/** Muestra un mensaje de error en el elemento de feedback, si existe. */
function showFeedback(message) {
  if (!feedbackEl) return;
  feedbackEl.textContent = message;
  feedbackEl.className = "feedback-alert error";
}

/** Limpia el mensaje de feedback y restablece su estilo normal. */
function clearFeedback() {
  if (!feedbackEl) return;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback-alert";
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

  tabButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  // Actualizar hash en la URL sin recargar
  history.replaceState(null, "", `#${tabId}`);
}

/** Conecta los botones de navegación y restaura la pestaña indicada por la URL. */
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabId = btn.dataset.tab;
      if (tabId) switchTab(tabId);
    });
  });

  // Botones de acción directa en el Dashboard
  const gotoTodosBtn = document.querySelector("#btn-goto-todos");
  if (gotoTodosBtn) gotoTodosBtn.addEventListener("click", () => switchTab("todos"));

  const moduleTodosBtn = document.querySelector("#btn-module-todos");
  if (moduleTodosBtn) moduleTodosBtn.addEventListener("click", () => switchTab("todos"));

  const metricPendingCard = document.querySelector("#card-metric-pending");
  if (metricPendingCard) metricPendingCard.addEventListener("click", () => switchTab("todos"));

  const metricDoneCard = document.querySelector("#card-metric-done");
  if (metricDoneCard) metricDoneCard.addEventListener("click", () => switchTab("todos"));

  // Botones de enlace para tabs futuras
  document.querySelectorAll("[data-open-tab]").forEach(el => {
    el.addEventListener("click", () => {
      const target = el.dataset.openTab;
      if (target) switchTab(target);
    });
  });

  // Cargar pestaña inicial basada en el hash de la URL si existe
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

  // Actualizar filtros
  if (countAllEl) countAllEl.textContent = total;
  if (countPendingEl) countPendingEl.textContent = pending;
  if (countDoneEl) countDoneEl.textContent = done;

  // Contador de estado en toolbar
  if (counterText) {
    counterText.textContent = `${pending} pendiente${pending === 1 ? "" : "s"}`;
  }

  // Contador en la barra de navegación
  if (navTodosCountEl) {
    navTodosCountEl.textContent = pending;
    navTodosCountEl.style.display = pending > 0 ? "inline-block" : "none";
  }

  // Contadores del Dashboard
  if (dashPendingCountEl) dashPendingCountEl.textContent = pending;
  if (dashDoneCountEl) dashDoneCountEl.textContent = done;
}

/**
 * Dibuja en el DOM las notas que coinciden con el filtro activo, junto con
 * sus controles para completarlas, editarlas o eliminarlas.
 */
function renderTodos() {
  if (!todoList) return;
  todoList.replaceChildren();

  updateCounters();

  const visible = todos.filter(t => {
    if (currentFilter === "pending") return !t.completada;
    if (currentFilter === "done") return t.completada;
    return true; // 'all'
  });

  if (visible.length === 0) {
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
    const item = document.createElement("li");
    item.className = `todo-item${todo.completada ? " done" : ""}`;
    item.dataset.id = todo.id;

    // Checkbox para marcar/desmarcar
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

    // Contenedor de contenido
    const content = document.createElement("div");
    content.className = "todo-content";

    const titleSpan = document.createElement("span");
    titleSpan.className = "todo-title";
    titleSpan.textContent = todo.titulo;
    content.appendChild(titleSpan);

    // Acciones: Editar y Eliminar
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
  const editWrap = document.createElement("div");
  editWrap.className = "edit-form-wrap";

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.maxLength = 200;
  editInput.value = todo.titulo;
  editInput.className = "edit-input";

  const saveEdit = async () => {
    const newTitle = editInput.value.trim();
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

  editWrap.append(editInput, btnSave, btnCancel);
  itemElement.replaceChildren(editWrap);
  editInput.focus();
}

/** Solicita las notas del usuario a la API y actualiza el estado y la vista. */
async function loadTodos() {
  try {
    const data = await api("/api/todos");
    if (data) {
      todos = data;
      renderTodos();
    }
  } catch (err) {
    showFeedback(err.message);
  }
}

// =============================================================================
// 4. Inicialización de Formularios y Eventos
// =============================================================================

/** Conecta el formulario de notas, el contador de caracteres, los filtros y el logout. */
function setupTodoEvents() {
  if (todoForm) {
    todoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titulo = todoInput.value.trim();
      if (!titulo) return;

      try {
        clearFeedback();
        await api("/api/todos", {
          method: "POST",
          body: JSON.stringify({ titulo })
        });
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
        await api("/api/logout", { method: "POST" });
        window.location.href = "/login";
      } catch (err) {
        window.location.href = "/login";
      }
    });
  }
}

// Inicializa navegación, eventos y carga inicial cuando el documento HTML ya está disponible.
document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupTodoEvents();
  loadTodos();
});

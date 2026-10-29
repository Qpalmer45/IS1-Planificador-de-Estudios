"use strict";

// HTMLFormElement | null: referencia al formulario que permite añadir tareas.
const form = document.querySelector("#todo-form");
// HTMLInputElement | null: campo donde se escribe el título de una nueva tarea.
const input = document.querySelector("#todo-input");
// HTMLUListElement | null: lista donde se dibujan las tareas recibidas del servidor.
const list = document.querySelector("#todo-list");
// HTMLSpanElement | null: elemento que muestra cuántas tareas siguen pendientes.
const counter = document.querySelector("#counter");
// HTMLParagraphElement | null: mensaje mostrado cuando el filtro no devuelve tareas.
const empty = document.querySelector("#empty-state");
// HTMLParagraphElement | null: zona de texto para errores y otros mensajes de estado.
const feedback = document.querySelector("#feedback");
// Array de tareas: empieza vacío y se reemplaza con los datos cargados desde la API.
let todos = [];
// string: filtro actualmente seleccionado; puede ser "all", "pending" o "done".
let currentFilter = "all";

async function api(path, options = {}) {
  // Centraliza las peticiones JSON y convierte las respuestas fallidas en errores legibles.
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!response.ok) {
    // Usa un objeto vacío si la respuesta de error no contiene JSON válido.
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo completar la operación.");
  }
  return response.status === 204 ? null : response.json();
}

function showError(error) {
  // Muestra en pantalla el mensaje de error de la última operación.
  feedback.textContent = error.message || "Ha ocurrido un error.";
}

function makeButton(label, className, onClick) {
  // Crea un botón de interfaz y conecta la acción que debe ejecutar al pulsarlo.
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = className;
  button.addEventListener("click", onClick);
  return button;
}

function render() {
  // Dibuja las tareas visibles, actualiza el contador y conecta sus controles.
  list.replaceChildren();
  const pending = todos.filter(todo => !todo.completada).length;
  counter.textContent = pending + " pendiente" + (pending === 1 ? "" : "s");
  // Selecciona todas las tareas o solo las pendientes/completadas según el filtro activo.
  const visible = todos.filter(todo =>
    currentFilter === "all" ||
    (currentFilter === "pending" && !todo.completada) ||
    (currentFilter === "done" && todo.completada)
  );
  empty.hidden = visible.length !== 0;

  for (const todo of visible) {
    const item = document.createElement("li");
    item.className = "todo" + (todo.completada ? " done" : "");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-check";
    checkbox.checked = todo.completada;
    checkbox.setAttribute("aria-label", "Completar " + todo.titulo);
    // Guarda el cambio de estado y restaura el valor anterior si falla la petición.
    checkbox.addEventListener("change", async () => {
      try {
        feedback.textContent = "";
        await api("/api/todos/" + todo.id, {
          method: "PATCH", body: JSON.stringify({ completada: checkbox.checked })
        });
        await loadTodos();
      } catch (error) { showError(error); checkbox.checked = todo.completada; }
    });
    const title = document.createElement("span");
    title.className = "todo-title";
    title.textContent = todo.titulo;
    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      // Abre el modo de edición para esta tarea.
      makeButton("Editar", "edit", () => editTodo(todo, item)),
      // Pide confirmación, elimina la tarea y vuelve a cargar la lista.
      makeButton("Eliminar", "delete", async () => {
        if (!window.confirm("¿Eliminar esta tarea?")) return;
        try {
          feedback.textContent = "";
          await api("/api/todos/" + todo.id, { method: "DELETE" });
          await loadTodos();
        } catch (error) { showError(error); }
      })
    );
    item.append(checkbox, title, actions);
    list.append(item);
  }
}

function editTodo(todo, item) {
  // Sustituye la tarea por un campo editable con acciones para guardar o cancelar.
  const editor = document.createElement("input");
  editor.type = "text";
  editor.maxLength = 200;
  editor.value = todo.titulo;
  editor.className = "edit-input";
  // Valida y envía el nuevo título al servidor antes de actualizar la lista.
  const save = async () => {
    const titulo = editor.value.trim();
    if (!titulo) { feedback.textContent = "La tarea no puede estar vacía."; return; }
    try {
      feedback.textContent = "";
      await api("/api/todos/" + todo.id, {
        method: "PATCH", body: JSON.stringify({ titulo })
      });
      await loadTodos();
    } catch (error) { showError(error); }
  };
  // Descarta los cambios pendientes y vuelve a dibujar la tarea original.
  const cancel = () => render();
  const buttons = document.createElement("div");
  buttons.className = "actions";
  buttons.append(makeButton("Guardar", "", save), makeButton("Cancelar", "", cancel));
  // Permite guardar con Enter o cancelar con Escape desde el campo de texto.
  editor.addEventListener("keydown", event => {
    if (event.key === "Enter") save();
    if (event.key === "Escape") cancel();
  });
  item.replaceChildren(editor, buttons);
  editor.focus();
}

async function loadTodos() {
  // Obtiene las tareas del servidor y actualiza la vista con los datos recibidos.
  todos = await api("/api/todos");
  render();
}

form.addEventListener("submit", async event => {
  // Valida y crea la tarea del formulario, después limpia el campo y recarga la lista.
  event.preventDefault();
  const titulo = input.value.trim();
  if (!titulo) return;
  try {
    feedback.textContent = "";
    await api("/api/todos", { method: "POST", body: JSON.stringify({ titulo }) });
    input.value = "";
    await loadTodos();
    input.focus();
  } catch (error) { showError(error); }
});

document.querySelectorAll("[data-filter]").forEach(button => {
  // Asocia cada opción de filtro con la selección y actualización de su estado visual.
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    // Marca el filtro elegido como activo para tecnologías de asistencia y estilos.
    document.querySelectorAll("[data-filter]").forEach(other => {
      const active = other === button;
      other.classList.toggle("active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    render();
  });
});

// Carga la lista al abrir la página y muestra cualquier error de inicio.
loadTodos().catch(showError);

"use strict";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const counter = document.querySelector("#counter");
const empty = document.querySelector("#empty-state");
const feedback = document.querySelector("#feedback");
let todos = [];
let currentFilter = "all";

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "No se pudo completar la operación.");
  }
  return response.status === 204 ? null : response.json();
}

function showError(error) {
  feedback.textContent = error.message || "Ha ocurrido un error.";
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = className;
  button.addEventListener("click", onClick);
  return button;
}

function render() {
  list.replaceChildren();
  const pending = todos.filter(todo => !todo.completada).length;
  counter.textContent = pending + " pendiente" + (pending === 1 ? "" : "s");
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
      makeButton("Editar", "edit", () => editTodo(todo, item)),
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
  const editor = document.createElement("input");
  editor.type = "text";
  editor.maxLength = 200;
  editor.value = todo.titulo;
  editor.className = "edit-input";
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
  const cancel = () => render();
  const buttons = document.createElement("div");
  buttons.className = "actions";
  buttons.append(makeButton("Guardar", "", save), makeButton("Cancelar", "", cancel));
  editor.addEventListener("keydown", event => {
    if (event.key === "Enter") save();
    if (event.key === "Escape") cancel();
  });
  item.replaceChildren(editor, buttons);
  editor.focus();
}

async function loadTodos() {
  todos = await api("/api/todos");
  render();
}

form.addEventListener("submit", async event => {
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
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(other => {
      const active = other === button;
      other.classList.toggle("active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    render();
  });
});

loadTodos().catch(showError);

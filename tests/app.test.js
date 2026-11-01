/**
 * Pruebas unitarias del frontend StudyPlan.
 *
 * Ejecución desde la raíz del proyecto:
 *     npm install
 *     npm run test:frontend
 *
 * Cada prueba crea un documento DOM aislado y simula fetch, de modo que no
 * requiere un servidor Flask, una sesión real ni acceso a todos.db.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { JSDOM, VirtualConsole } from "jsdom";

const appScript = readFileSync(
  fileURLToPath(new URL("../static/app.js", import.meta.url)),
  "utf8",
);

// Este documento reproduce los elementos que app.js consulta en la plantilla.
const htmlFixture = `
  <!doctype html>
  <html lang="es">
    <body>
      <nav>
        <button class="tab-btn active" data-tab="inicio">Inicio</button>
        <button class="tab-btn" data-tab="todos">To-Dos</button>
        <button class="tab-btn" data-tab="asignaturas">Asignaturas</button>
        <button id="btn-goto-todos" type="button">Ir a To-Dos</button>
        <button id="btn-module-todos" type="button">Módulo To-Dos</button>
        <button id="nav-todos-count">0</button>
        <button id="nav-asignaturas-count">0</button>
      </nav>
      <section id="tab-inicio" class="tab-content active">
        <button id="card-metric-pending" type="button">Pendientes</button>
        <button id="card-metric-done" type="button">Completadas</button>
        <span id="dashboard-pending-count">0</span>
        <span id="dashboard-done-count">0</span>
        <span id="dashboard-subject-count">0</span>
        <button data-open-tab="asignaturas" type="button">Gestionar asignaturas</button>
      </section>
      <section id="tab-todos" class="tab-content">
        <form id="todo-form">
          <input id="todo-input" maxlength="200">
          <span id="char-counter">0/200</span>
        </form>
        <button class="filter-btn active" data-filter="all" aria-pressed="true">
          Todas <span id="count-all">0</span>
        </button>
        <button class="filter-btn" data-filter="pending" aria-pressed="false">
          Pendientes <span id="count-pending">0</span>
        </button>
        <button class="filter-btn" data-filter="done" aria-pressed="false">
          Completadas <span id="count-done">0</span>
        </button>
        <span id="counter"></span>
        <div id="feedback" class="feedback-alert" role="status"></div>
        <ul id="todo-list"></ul>
        <div id="empty-state" hidden>
          <h4 id="empty-title"></h4>
          <p id="empty-desc"></p>
        </div>
      </section>
      <section id="tab-asignaturas" class="tab-content">
        <form id="subject-form">
          <input id="subject-name" maxlength="100">
        </form>
        <div id="subject-feedback" class="feedback-alert" role="status"></div>
        <div id="subject-empty-state" hidden>Sin asignaturas</div>
        <ul id="subject-list"></ul>
      </section>
      <div id="subject-modal" aria-hidden="true" hidden>
        <div class="subject-dialog" role="dialog" aria-modal="true" tabindex="-1">
          <h2 id="subject-dialog-title">Apartado de asignatura</h2>
          <button id="subject-dialog-close" type="button">Cerrar</button>
          <button id="dialog-last-action" type="button">Acción</button>
          <div id="subject-detail"></div>
        </div>
      </div>
      <button id="btn-logout" type="button">Salir</button>
    </body>
  </html>
`;

const contexts = [];

/**
 * Crea una instancia independiente de la aplicación y retiene la inicialización
 * DOMContentLoaded para que cada prueba decida cuándo arrancar la interfaz.
 */
function createContext(hash = "#inicio", html = htmlFixture) {
  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: `http://localhost/${hash}`,
    virtualConsole: new VirtualConsole(),
  });
  const { window } = dom;
  const fetchMock = jest.fn();
  const confirmMock = jest.fn(() => true);
  const initializationCallbacks = [];
  const nativeDocumentAddEventListener =
    window.document.addEventListener.bind(window.document);

  window.fetch = fetchMock;
  window.confirm = confirmMock;

  // Permite probar el arranque explícitamente sin registrar los eventos dos veces.
  window.document.addEventListener = (type, listener, options) => {
    if (type === "DOMContentLoaded") {
      initializationCallbacks.push(listener);
      return;
    }
    nativeDocumentAddEventListener(type, listener, options);
  };
  const script = window.document.createElement("script");
  script.textContent = appScript;
  window.document.body.appendChild(script);
  window.document.addEventListener = nativeDocumentAddEventListener;

  const context = {
    dom,
    window,
    document: window.document,
    fetchMock,
    confirmMock,
    initializationCallbacks,
  };
  contexts.push(context);
  return context;
}

/** Crea una respuesta con la interfaz mínima que consume el helper api(). */
function response(data, { status = 200, ok = status >= 200 && status < 300 } = {}) {
  return {
    status,
    ok,
    json: jest.fn().mockResolvedValue(data),
  };
}

/** Instala una respuesta JSON para una llamada de fetch. */
function queueResponse(context, data, options) {
  context.fetchMock.mockResolvedValueOnce(response(data, options));
}

/** Instala un error HTTP serializado como lo devuelve la API Flask. */
function queueApiError(context, message, status = 400) {
  queueResponse(context, { error: message }, { status, ok: false });
}

/** Conecta los eventos que normalmente se preparan en DOMContentLoaded. */
function setupInterface(context) {
  context.window.setupTabs();
  context.window.setupTodoEvents();
  context.window.setupSubjectEvents();
}

/** Deja completar las promesas disparadas por eventos del DOM. */
function settlePromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/** Devuelve una fila de To-Do usando el identificador de su elemento DOM. */
function todoItem(context, id) {
  return context.document.querySelector(`#todo-list [data-id="${id}"]`);
}

/** Devuelve una fila de asignatura por su posición en el listado. */
function subjectItem(context, index = 0) {
  return context.document.querySelectorAll("#subject-list li")[index] ?? null;
}

beforeEach(() => {
  contexts.length = 0;
});

afterEach(() => {
  contexts.forEach(({ dom }) => dom.window.close());
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// api centraliza las peticiones HTTP, encabezados, JSON, errores y respuestas
// vacías para que las vistas manejen un contrato uniforme.
// Casos: GET/POST con encabezados, éxito JSON/204, errores con o sin JSON y 401.
// ---------------------------------------------------------------------------
describe("api y gestión de respuestas HTTP", () => {
  it("añade Content-Type JSON por defecto y devuelve el JSON recibido", async () => {
    const context = createContext();
    const payload = [{ id: 1, titulo: "Repasar" }];
    queueResponse(context, payload);

    await expect(context.window.api("/api/todos")).resolves.toEqual(payload);

    expect(context.fetchMock).toHaveBeenCalledWith("/api/todos", {
      headers: { "Content-Type": "application/json" },
    });
  });

  it("conserva método, cuerpo y encabezados adicionales de la petición", async () => {
    const context = createContext();
    queueResponse(context, { id: 8 });

    await context.window.api("/api/asignaturas", {
      method: "POST",
      body: JSON.stringify({ nombre: "Física" }),
      headers: { "X-Test": "frontend" },
    });

    expect(context.fetchMock).toHaveBeenCalledWith("/api/asignaturas", {
      method: "POST",
      body: JSON.stringify({ nombre: "Física" }),
      headers: {
        "Content-Type": "application/json",
        "X-Test": "frontend",
      },
    });
  });

  it("permite sobrescribir un encabezado por defecto sin duplicarlo", async () => {
    const context = createContext();
    queueResponse(context, { ok: true });

    await context.window.api("/api/test", {
      headers: { "Content-Type": "application/vnd.studyplan+json" },
    });

    expect(context.fetchMock.mock.calls[0][1].headers).toEqual({
      "Content-Type": "application/vnd.studyplan+json",
    });
  });

  it("devuelve null cuando la API responde 204 sin cuerpo", async () => {
    const context = createContext();
    const jsonMock = jest.fn();
    context.fetchMock.mockResolvedValueOnce({
      status: 204,
      ok: true,
      json: jsonMock,
    });

    await expect(
      context.window.api("/api/asignaturas/1", { method: "DELETE" }),
    ).resolves.toBeNull();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it("usa el mensaje genérico si el cuerpo JSON del error no incluye error", async () => {
    const context = createContext();
    queueResponse(context, { detalle: "Sin mensaje estándar" }, { status: 500, ok: false });

    await expect(context.window.api("/api/test")).rejects.toThrow(
      "No se pudo completar la operación.",
    );
  });

  it("lanza el mensaje de error enviado por la API en respuestas no exitosas", async () => {
    const context = createContext();
    queueApiError(context, "El nombre ya existe.", 409);

    await expect(context.window.api("/api/asignaturas")).rejects.toThrow(
      "El nombre ya existe.",
    );
  });

  it("usa un mensaje genérico si el error HTTP no contiene JSON válido", async () => {
    const context = createContext();
    context.fetchMock.mockResolvedValueOnce({
      status: 500,
      ok: false,
      json: jest.fn().mockRejectedValue(new SyntaxError("JSON inválido")),
    });

    await expect(context.window.api("/api/test")).rejects.toThrow(
      "No se pudo completar la operación.",
    );
  });

  it("devuelve null ante una sesión caducada para detener el procesamiento de la vista", async () => {
    const context = createContext();
    queueResponse(context, { error: "Sesión caducada" }, { status: 401, ok: false });

    await expect(context.window.api("/api/todos")).resolves.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// showFeedback y showSubjectFeedback notifican errores en el módulo adecuado;
// clearFeedback y clearSubjectFeedback limpian el texto y su estilo de error.
// Casos: mensajes separados, texto literal y limpieza idempotente.
// ---------------------------------------------------------------------------
describe("mensajes de feedback", () => {
  it("muestra y limpia un error de To-Dos sin interpretar el texto como HTML", () => {
    const context = createContext();
    const message = "<img src=x onerror=alert(1)>";

    context.window.showFeedback(message);

    expect(context.document.querySelector("#feedback").textContent).toBe(message);
    expect(context.document.querySelector("#feedback").querySelector("img")).toBeNull();
    expect(context.document.querySelector("#feedback").className).toBe(
      "feedback-alert error",
    );

    context.window.clearFeedback();
    context.window.clearFeedback();
    expect(context.document.querySelector("#feedback").textContent).toBe("");
    expect(context.document.querySelector("#feedback").className).toBe("feedback-alert");
  });

  it("muestra y limpia el error de asignaturas sin afectar al feedback de To-Dos", () => {
    const context = createContext();

    context.window.showFeedback("Error de tarea");
    context.window.showSubjectFeedback("Error de asignatura");
    context.window.clearSubjectFeedback();

    expect(context.document.querySelector("#feedback").textContent).toBe("Error de tarea");
    expect(context.document.querySelector("#subject-feedback").textContent).toBe("");
    expect(context.document.querySelector("#subject-feedback").className).toBe(
      "feedback-alert",
    );
  });
});

// ---------------------------------------------------------------------------
// switchTab y setupTabs mantienen sincronizadas las secciones, los botones,
// los accesos rápidos y el hash de navegación.
// Casos: cambio válido, hash inicial, destino inexistente, botones y enlaces.
// ---------------------------------------------------------------------------
describe("navegación por pestañas", () => {
  it("activa la sección y el botón correspondientes y actualiza el hash", () => {
    const context = createContext();

    context.window.switchTab("todos");

    expect(context.document.querySelector("#tab-todos").classList.contains("active"))
      .toBe(true);
    expect(context.document.querySelector("#tab-inicio").classList.contains("active"))
      .toBe(false);
    expect(context.document.querySelector('[data-tab="todos"]').classList.contains("active"))
      .toBe(true);
    expect(context.window.location.hash).toBe("#todos");
  });

  it("no cambia la selección ni el hash si el destino no existe", () => {
    const context = createContext();

    context.window.switchTab("desconocida");

    expect(context.document.querySelector("#tab-inicio").classList.contains("active"))
      .toBe(true);
    expect(context.document.querySelector('[data-tab="inicio"]').classList.contains("active"))
      .toBe(true);
    expect(context.window.location.hash).toBe("#inicio");
  });

  it("restaura una pestaña válida indicada por el hash al preparar la navegación", () => {
    const context = createContext("#asignaturas");

    context.window.setupTabs();

    expect(context.document.querySelector("#tab-asignaturas").classList.contains("active"))
      .toBe(true);
    expect(context.document.querySelector('[data-tab="asignaturas"]').classList.contains("active"))
      .toBe(true);
  });

  it("ignora un hash que no corresponde a una sección existente", () => {
    const context = createContext("#no-existe");

    context.window.setupTabs();

    expect(context.document.querySelector("#tab-inicio").classList.contains("active"))
      .toBe(true);
    expect(context.window.location.hash).toBe("#no-existe");
  });

  it("conecta botones de pestaña, accesos rápidos y enlaces data-open-tab", () => {
    const context = createContext();
    setupInterface(context);

    context.document.querySelector("#btn-goto-todos").click();
    expect(context.document.querySelector("#tab-todos").classList.contains("active"))
      .toBe(true);

    context.document.querySelector('[data-open-tab="asignaturas"]').click();
    expect(context.document.querySelector("#tab-asignaturas").classList.contains("active"))
      .toBe(true);

    context.document.querySelector('[data-tab="inicio"]').click();
    expect(context.document.querySelector("#tab-inicio").classList.contains("active"))
      .toBe(true);
  });

  it("conecta todos los accesos rápidos del dashboard con la pestaña To-Dos", () => {
    const context = createContext();
    context.window.setupTabs();

    for (const selector of [
      "#btn-goto-todos",
      "#btn-module-todos",
      "#card-metric-pending",
      "#card-metric-done",
    ]) {
      context.document.querySelector(selector).click();
      expect(context.document.querySelector("#tab-todos").classList.contains("active"))
        .toBe(true);
    }
  });

  it("ignora un botón de navegación sin data-tab y un enlace sin data-open-tab", () => {
    const context = createContext();
    const tabButton = context.document.querySelector('[data-tab="todos"]');
    const openLink = context.document.querySelector('[data-open-tab="asignaturas"]');
    tabButton.removeAttribute("data-tab");
    openLink.removeAttribute("data-open-tab");
    context.window.setupTabs();

    tabButton.click();
    openLink.click();

    expect(context.document.querySelector("#tab-inicio").classList.contains("active"))
      .toBe(true);
    expect(context.window.location.hash).toBe("#inicio");
  });
});

// ---------------------------------------------------------------------------
// updateCounters y renderTodos representan el estado de To-Dos en la lista,
// sus filtros, el dashboard y los estados vacíos.
// Casos: contadores, filtros, texto seguro, estado vacío y checkbox.
// ---------------------------------------------------------------------------
describe("renderizado, filtros y contadores de To-Dos", () => {
  it("renderiza cada tarea con ID, título literal, estado y acciones accesibles", async () => {
    const context = createContext();
    queueResponse(context, [
      { id: 11, titulo: "<script>texto</script>", completada: false },
      { id: 12, titulo: "Finalizada", completada: true },
    ]);

    await context.window.loadTodos();

    expect(context.document.querySelectorAll("#todo-list li")).toHaveLength(2);
    expect(todoItem(context, 11).querySelector(".todo-title").textContent)
      .toBe("<script>texto</script>");
    expect(todoItem(context, 11).querySelector("script")).toBeNull();
    expect(todoItem(context, 11).querySelector(".todo-checkbox").checked).toBe(false);
    expect(todoItem(context, 11).querySelector(".todo-checkbox").getAttribute("aria-label"))
      .toBe("Marcar como completada: <script>texto</script>");
    expect(todoItem(context, 12).classList.contains("done")).toBe(true);
    expect(todoItem(context, 12).querySelector(".todo-checkbox").checked).toBe(true);
    expect(todoItem(context, 11).querySelector(".action-btn.edit").textContent).toBe("Editar");
    expect(todoItem(context, 11).querySelector(".action-btn.delete").textContent)
      .toBe("Eliminar");
  });

  it("actualiza totales, pendientes, completadas y distintivos del dashboard", async () => {
    const context = createContext();
    queueResponse(context, [
      { id: 1, titulo: "Pendiente A", completada: false },
      { id: 2, titulo: "Pendiente B", completada: false },
      { id: 3, titulo: "Hecha", completada: true },
    ]);
    queueResponse(context, [{ id: 30, nombre: "Álgebra" }]);

    await context.window.loadTodos();
    await context.window.loadAsignaturas();

    expect(context.document.querySelector("#count-all").textContent).toBe("3");
    expect(context.document.querySelector("#count-pending").textContent).toBe("2");
    expect(context.document.querySelector("#count-done").textContent).toBe("1");
    expect(context.document.querySelector("#counter").textContent).toBe("2 pendientes");
    expect(context.document.querySelector("#nav-todos-count").textContent).toBe("2");
    expect(context.document.querySelector("#dashboard-pending-count").textContent).toBe("2");
    expect(context.document.querySelector("#dashboard-done-count").textContent).toBe("1");
    expect(context.document.querySelector("#nav-asignaturas-count").textContent).toBe("1");
    expect(context.document.querySelector("#dashboard-subject-count").textContent).toBe("1");
  });

  it("usa el singular cuando solo queda una tarea pendiente", async () => {
    const context = createContext();
    queueResponse(context, [{ id: 1, titulo: "Una", completada: false }]);

    await context.window.loadTodos();

    expect(context.document.querySelector("#counter").textContent).toBe("1 pendiente");
  });

  it("oculta el distintivo de tareas cuando no hay pendientes", async () => {
    const context = createContext();
    queueResponse(context, [{ id: 1, titulo: "Hecha", completada: true }]);

    await context.window.loadTodos();

    expect(context.document.querySelector("#nav-todos-count").style.display).toBe("none");
    expect(context.document.querySelector("#counter").textContent).toBe("0 pendientes");
  });

  it("filtra las tareas pendientes y sincroniza aria-pressed y el estado vacío", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [
      { id: 1, titulo: "Pendiente", completada: false },
      { id: 2, titulo: "Hecha", completada: true },
    ]);
    await context.window.loadTodos();

    const pendingButton = context.document.querySelector('[data-filter="pending"]');
    pendingButton.click();

    expect(context.document.querySelectorAll("#todo-list li")).toHaveLength(1);
    expect(todoItem(context, 1)).not.toBeNull();
    expect(todoItem(context, 2)).toBeNull();
    expect(pendingButton.getAttribute("aria-pressed")).toBe("true");
    expect(pendingButton.classList.contains("active")).toBe(true);
    expect(context.document.querySelector("#empty-state").hidden).toBe(true);
  });

  it("filtra las tareas completadas y muestra el estado vacío si no hay resultados", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 1, titulo: "Pendiente", completada: false }]);
    await context.window.loadTodos();

    context.document.querySelector('[data-filter="done"]').click();

    expect(context.document.querySelectorAll("#todo-list li")).toHaveLength(0);
    expect(context.document.querySelector("#empty-state").hidden).toBe(false);
    expect(context.document.querySelector("#empty-title").textContent)
      .toBe("No hay notas completadas aún");
  });

  it("vuelve a mostrar todas las tareas al activar el filtro Todas", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [
      { id: 1, titulo: "Pendiente", completada: false },
      { id: 2, titulo: "Completada", completada: true },
    ]);
    await context.window.loadTodos();
    context.document.querySelector('[data-filter="done"]').click();

    context.document.querySelector('[data-filter="all"]').click();

    expect(context.document.querySelectorAll("#todo-list li")).toHaveLength(2);
    expect(context.document.querySelector('[data-filter="all"]').getAttribute("aria-pressed"))
      .toBe("true");
    expect(context.document.querySelector('[data-filter="done"]').getAttribute("aria-pressed"))
      .toBe("false");
  });

  it("usa el filtro Todas cuando un botón de filtro no tiene data-filter", async () => {
    const context = createContext();
    const pendingButton = context.document.querySelector('[data-filter="pending"]');
    pendingButton.removeAttribute("data-filter");
    context.window.setupTodoEvents();
    queueResponse(context, [
      { id: 3, titulo: "Pendiente", completada: false },
      { id: 4, titulo: "Completada", completada: true },
    ]);
    await context.window.loadTodos();

    pendingButton.click();

    expect(context.document.querySelectorAll("#todo-list li")).toHaveLength(2);
    expect(pendingButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("presenta un mensaje de estado vacío específico para cada filtro", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, []);
    await context.window.loadTodos();

    expect(context.document.querySelector("#empty-state").hidden).toBe(false);
    expect(context.document.querySelector("#empty-title").textContent)
      .toBe("No hay ninguna nota rápida todavía");

    context.document.querySelector('[data-filter="pending"]').click();
    expect(context.document.querySelector("#empty-title").textContent)
      .toBe("¡Todo al día! No tienes notas pendientes");

    context.document.querySelector('[data-filter="done"]').click();
    expect(context.document.querySelector("#empty-title").textContent)
      .toBe("No hay notas completadas aún");
  });

  it("muestra un error de carga de tareas sin borrar silenciosamente los datos visibles", async () => {
    const context = createContext();
    queueResponse(context, [{ id: 1, titulo: "Conservada", completada: false }]);
    await context.window.loadTodos();
    queueApiError(context, "No se pudieron cargar las tareas.", 500);

    await context.window.loadTodos();

    expect(todoItem(context, 1)).not.toBeNull();
    expect(context.document.querySelector("#feedback").textContent)
      .toBe("No se pudieron cargar las tareas.");
  });
});

// ---------------------------------------------------------------------------
// Los eventos de To-Dos crean, completan, editan y eliminan mediante la API,
// reflejando errores y respetando confirmaciones y teclado.
// Casos: validación, persistencia, recarga, cancelación, fallos y atajos.
// ---------------------------------------------------------------------------
describe("eventos y operaciones de To-Dos", () => {
  it("crea una tarea con el título recortado y limpia el formulario tras el éxito", async () => {
    const context = createContext();
    setupInterface(context);
    context.document.querySelector("#todo-input").value = "  Preparar examen  ";
    queueResponse(context, { id: 4, titulo: "Preparar examen", completada: false });
    queueResponse(context, [{ id: 4, titulo: "Preparar examen", completada: false }]);

    context.document.querySelector("#todo-form").dispatchEvent(
      new context.window.Event("submit", { bubbles: true, cancelable: true }),
    );
    await settlePromises();

    expect(context.fetchMock.mock.calls[0][0]).toBe("/api/todos");
    expect(context.fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(context.fetchMock.mock.calls[0][1].body)).toEqual({
      titulo: "Preparar examen",
    });
    expect(context.document.querySelector("#todo-input").value).toBe("");
    expect(context.document.querySelector("#char-counter").textContent).toBe("0/200");
    expect(todoItem(context, 4)).not.toBeNull();
  });

  it("no envía una tarea vacía y actualiza el contador de caracteres al escribir", async () => {
    const context = createContext();
    setupInterface(context);
    const input = context.document.querySelector("#todo-input");

    input.value = "   ";
    context.document.querySelector("#todo-form").dispatchEvent(
      new context.window.Event("submit", { bubbles: true, cancelable: true }),
    );
    input.value = "Repasar";
    input.dispatchEvent(new context.window.Event("input", { bubbles: true }));

    expect(context.fetchMock).not.toHaveBeenCalled();
    expect(context.document.querySelector("#char-counter").textContent).toBe("7/200");
  });

  it("mantiene el texto y comunica el error si falla la creación de una tarea", async () => {
    const context = createContext();
    setupInterface(context);
    context.document.querySelector("#todo-input").value = "Tarea pendiente";
    queueApiError(context, "No se pudo guardar.", 500);

    context.document.querySelector("#todo-form").dispatchEvent(
      new context.window.Event("submit", { bubbles: true, cancelable: true }),
    );
    await settlePromises();

    expect(context.document.querySelector("#todo-input").value).toBe("Tarea pendiente");
    expect(context.document.querySelector("#feedback").textContent).toBe("No se pudo guardar.");
  });

  it("solicita al backend cerrar la sesión mediante POST", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, { mensaje: "Sesión cerrada" });

    context.document.querySelector("#btn-logout").click();
    await settlePromises();

    expect(context.fetchMock).toHaveBeenCalledWith("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("marca una tarea y solicita de nuevo el listado para sincronizar la vista", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 5, titulo: "Pendiente", completada: false }]);
    await context.window.loadTodos();
    queueResponse(context, { id: 5, titulo: "Pendiente", completada: true });
    queueResponse(context, [{ id: 5, titulo: "Pendiente", completada: true }]);

    const checkbox = todoItem(context, 5).querySelector(".todo-checkbox");
    checkbox.checked = true;
    checkbox.dispatchEvent(new context.window.Event("change", { bubbles: true }));
    await settlePromises();

    expect(context.fetchMock.mock.calls[1][0]).toBe("/api/todos/5");
    expect(context.fetchMock.mock.calls[1][1].method).toBe("PATCH");
    expect(JSON.parse(context.fetchMock.mock.calls[1][1].body)).toEqual({
      completada: true,
    });
    expect(todoItem(context, 5).classList.contains("done")).toBe(true);
  });

  it("revierte el checkbox y muestra el error si no se puede actualizar el estado", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 6, titulo: "Pendiente", completada: false }]);
    await context.window.loadTodos();
    queueApiError(context, "No se pudo actualizar.", 500);

    const checkbox = todoItem(context, 6).querySelector(".todo-checkbox");
    checkbox.checked = true;
    checkbox.dispatchEvent(new context.window.Event("change", { bubbles: true }));
    await settlePromises();

    expect(checkbox.checked).toBe(false);
    expect(context.document.querySelector("#feedback").textContent).toBe(
      "No se pudo actualizar.",
    );
  });

  it("abre el editor con el texto actual y cancela sin llamar a la API", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 7, titulo: "Título original", completada: false }]);
    await context.window.loadTodos();

    todoItem(context, 7).querySelector(".action-btn.edit").click();

    const input = context.document.querySelector(".edit-input");
    expect(input.value).toBe("Título original");
    expect(input.maxLength).toBe(200);
    input.value = "Cambio descartado";
    context.document.querySelector(".action-btn.cancel").click();

    expect(todoItem(context, 7).querySelector(".todo-title").textContent)
      .toBe("Título original");
    expect(context.fetchMock).toHaveBeenCalledTimes(1);
  });

  it("guarda un título editado recortando espacios y vuelve a cargar la lista", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 8, titulo: "Antes", completada: false }]);
    await context.window.loadTodos();
    queueResponse(context, { id: 8, titulo: "Después", completada: false });
    queueResponse(context, [{ id: 8, titulo: "Después", completada: false }]);

    todoItem(context, 8).querySelector(".action-btn.edit").click();
    context.document.querySelector(".edit-input").value = "  Después  ";
    context.document.querySelector(".action-btn.save").click();
    await settlePromises();

    expect(context.fetchMock.mock.calls[1][1].method).toBe("PATCH");
    expect(JSON.parse(context.fetchMock.mock.calls[1][1].body)).toEqual({
      titulo: "Después",
    });
    expect(todoItem(context, 8).querySelector(".todo-title").textContent).toBe("Después");
  });

  it("no envía una edición de título vacía", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 9, titulo: "Original", completada: false }]);
    await context.window.loadTodos();
    todoItem(context, 9).querySelector(".action-btn.edit").click();
    context.document.querySelector(".edit-input").value = "   ";

    context.document.querySelector(".action-btn.save").click();
    await settlePromises();

    expect(context.fetchMock).toHaveBeenCalledTimes(1);
    expect(context.document.querySelector("#feedback").textContent)
      .toBe("La nota no puede estar vacía.");
  });

  it("mantiene el editor abierto y muestra el error cuando falla la edición", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 14, titulo: "Original", completada: false }]);
    await context.window.loadTodos();
    queueApiError(context, "No se pudo editar.", 500);
    todoItem(context, 14).querySelector(".action-btn.edit").click();
    context.document.querySelector(".edit-input").value = "Nuevo título";

    context.document.querySelector(".action-btn.save").click();
    await settlePromises();

    expect(context.document.querySelector(".edit-input")).not.toBeNull();
    expect(context.document.querySelector("#feedback").textContent).toBe("No se pudo editar.");
  });

  it("guarda con Enter y cancela con Escape en el editor de tareas", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 10, titulo: "Original", completada: false }]);
    await context.window.loadTodos();
    todoItem(context, 10).querySelector(".action-btn.edit").click();

    const input = context.document.querySelector(".edit-input");
    input.value = "Editada";
    queueResponse(context, { id: 10, titulo: "Editada", completada: false });
    queueResponse(context, [{ id: 10, titulo: "Editada", completada: false }]);
    input.dispatchEvent(new context.window.KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    }));
    await settlePromises();

    expect(todoItem(context, 10).querySelector(".todo-title").textContent).toBe("Editada");
    expect(context.fetchMock.mock.calls[1][1].method).toBe("PATCH");

    todoItem(context, 10).querySelector(".action-btn.edit").click();
    context.document.querySelector(".edit-input").value = "Descartada";
    context.document.querySelector(".edit-input").dispatchEvent(
      new context.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(todoItem(context, 10).querySelector(".todo-title").textContent).toBe("Editada");
  });

  it("no elimina una tarea si se cancela la confirmación", async () => {
    const context = createContext();
    setupInterface(context);
    context.confirmMock.mockReturnValue(false);
    queueResponse(context, [{ id: 11, titulo: "Conservar", completada: false }]);
    await context.window.loadTodos();

    todoItem(context, 11).querySelector(".action-btn.delete").click();
    await settlePromises();

    expect(context.confirmMock).toHaveBeenCalledWith(
      "¿Seguro que deseas eliminar esta nota rápida?",
    );
    expect(context.fetchMock).toHaveBeenCalledTimes(1);
    expect(todoItem(context, 11)).not.toBeNull();
  });

  it("elimina una tarea tras confirmar y actualiza el listado", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 12, titulo: "Borrar", completada: false }]);
    await context.window.loadTodos();
    queueResponse(context, null);
    queueResponse(context, []);

    todoItem(context, 12).querySelector(".action-btn.delete").click();
    await settlePromises();

    expect(context.fetchMock.mock.calls[1][0]).toBe("/api/todos/12");
    expect(context.fetchMock.mock.calls[1][1].method).toBe("DELETE");
    expect(context.document.querySelectorAll("#todo-list li")).toHaveLength(0);
  });

  it("muestra errores al fallar el borrado de una tarea", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 13, titulo: "No borrar", completada: false }]);
    await context.window.loadTodos();
    queueApiError(context, "No se pudo eliminar.", 500);

    todoItem(context, 13).querySelector(".action-btn.delete").click();
    await settlePromises();

    expect(todoItem(context, 13)).not.toBeNull();
    expect(context.document.querySelector("#feedback").textContent).toBe(
      "No se pudo eliminar.",
    );
  });

  it("absorbe el fallo al cerrar sesión y mantiene el flujo de salida", async () => {
    const context = createContext();
    setupInterface(context);
    context.fetchMock.mockRejectedValueOnce(new Error("Conexión perdida"));

    expect(() => context.document.querySelector("#btn-logout").click()).not.toThrow();
    await settlePromises();

    expect(context.fetchMock).toHaveBeenCalledWith("/api/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  });
});

// ---------------------------------------------------------------------------
// renderSubjects, loadAsignaturas y renderSubjectDetail muestran el listado,
// contadores y un apartado individual sin mezclar contenidos ni HTML no seguro.
// Casos: vacío, datos múltiples, respuesta inválida, error y carga obsoleta.
// ---------------------------------------------------------------------------
describe("listado y apartado individual de asignaturas", () => {
  it("muestra el estado vacío y oculta el contador cuando no hay asignaturas", async () => {
    const context = createContext();
    queueResponse(context, []);

    await context.window.loadAsignaturas();

    expect(context.document.querySelectorAll("#subject-list li")).toHaveLength(0);
    expect(context.document.querySelector("#subject-empty-state").hidden).toBe(false);
    expect(context.document.querySelector("#nav-asignaturas-count").style.display)
      .toBe("none");
    expect(context.document.querySelector("#dashboard-subject-count").textContent).toBe("0");
  });

  it("renderiza varias asignaturas como texto seguro con acciones identificables", async () => {
    const context = createContext();
    queueResponse(context, [
      { id: 21, nombre: "Matemáticas" },
      { id: 22, nombre: "<img src=x>" },
    ]);

    await context.window.loadAsignaturas();

    expect(context.document.querySelectorAll("#subject-list li")).toHaveLength(2);
    expect(subjectItem(context, 0).querySelector(".subject-list-name").textContent)
      .toBe("Matemáticas");
    expect(subjectItem(context, 1).querySelector("img")).toBeNull();
    expect(subjectItem(context, 1).querySelector(".subject-list-name").textContent)
      .toBe("<img src=x>");
    expect(subjectItem(context, 0).querySelectorAll("button")).toHaveLength(3);
    expect(subjectItem(context, 0).querySelector(".secondary-btn").textContent).toBe("Abrir");
    expect(subjectItem(context, 0).querySelector(".action-btn.edit").getAttribute("aria-label"))
      .toBe("Editar Matemáticas");
    expect(subjectItem(context, 0).querySelector(".action-btn.delete").getAttribute("aria-label"))
      .toBe("Eliminar Matemáticas");
    expect(context.document.querySelector("#subject-empty-state").hidden).toBe(true);
  });

  it("muestra error si la respuesta del listado no es un arreglo", async () => {
    const context = createContext();
    queueResponse(context, { asignaturas: [] });

    await context.window.loadAsignaturas();

    expect(context.document.querySelector("#subject-feedback").textContent)
      .toBe("La respuesta de asignaturas no tiene el formato esperado.");
  });

  it("muestra errores HTTP al cargar asignaturas sin reemplazar el estado existente", async () => {
    const context = createContext();
    queueResponse(context, [{ id: 23, nombre: "Conservada" }]);
    await context.window.loadAsignaturas();
    queueApiError(context, "Fallo al listar.", 500);

    await context.window.loadAsignaturas();

    expect(subjectItem(context).querySelector(".subject-list-name").textContent)
      .toBe("Conservada");
    expect(context.document.querySelector("#subject-feedback").textContent)
      .toBe("Fallo al listar.");
  });

  it("no reemplaza el listado si la petición de asignaturas devuelve null", async () => {
    const context = createContext();
    queueResponse(context, [{ id: 230, nombre: "Conservada" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { error: "No autenticado" }, { status: 401, ok: false });

    await context.window.loadAsignaturas();

    expect(subjectItem(context).querySelector(".subject-list-name").textContent)
      .toBe("Conservada");
    expect(context.document.querySelector("#subject-feedback").textContent).toBe("");
  });

  it("abre el diálogo, carga la asignatura correcta y devuelve el foco al cerrarlo", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 24, nombre: "Historia" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { id: 24, nombre: "Historia" });

    const trigger = subjectItem(context).querySelector(".secondary-btn");
    trigger.click();
    await settlePromises();

    const modal = context.document.querySelector("#subject-modal");
    expect(modal.hidden).toBe(false);
    expect(modal.getAttribute("aria-hidden")).toBe("false");
    expect(context.document.body.classList.contains("subject-modal-open")).toBe(true);
    expect(context.document.querySelector("#subject-dialog-title").textContent)
      .toBe("Historia");
    expect(context.document.querySelector(".subject-detail-description").textContent)
      .toBe("Este es el espacio individual de esta asignatura.");
    expect(context.document.querySelector(".subject-detail-placeholder").textContent)
      .toContain("temario, los exámenes");
    expect(context.document.activeElement.id).toBe("subject-dialog-close");

    context.document.querySelector("#subject-dialog-close").click();
    expect(modal.hidden).toBe(true);
    expect(modal.getAttribute("aria-hidden")).toBe("true");
    expect(context.document.body.classList.contains("subject-modal-open")).toBe(false);
    expect(context.document.activeElement).toBe(trigger);
  });

  it("presenta el estado de carga mientras la API aún no devuelve el detalle", async () => {
    const context = createContext();
    const pendingResponse = {};
    context.fetchMock.mockResolvedValueOnce(response([{ id: 25, nombre: "Química" }]));
    await context.window.loadAsignaturas();
    context.fetchMock.mockReturnValueOnce(new Promise(resolve => {
      pendingResponse.resolve = resolve;
    }));

    context.window.openAsignatura(25, context.document.createElement("button"));

    expect(context.document.querySelector("#subject-detail").textContent)
      .toBe("Cargando asignatura...");
    pendingResponse.resolve(response({ id: 25, nombre: "Química" }));
    await settlePromises();
    expect(context.document.querySelector("#subject-dialog-title").textContent).toBe("Química");
  });

  it("muestra el error de carga dentro del diálogo y en el feedback", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 26, nombre: "Física" }]);
    await context.window.loadAsignaturas();
    queueApiError(context, "No se pudo abrir la asignatura.", 404);

    subjectItem(context).querySelector(".secondary-btn").click();
    await settlePromises();

    expect(context.document.querySelector(".subject-detail-error").textContent)
      .toBe("No se pudo abrir la asignatura.");
    expect(context.document.querySelector("#subject-feedback").textContent)
      .toBe("No se pudo abrir la asignatura.");
  });

  it("descarta una respuesta tardía si el usuario ya cerró el diálogo", async () => {
    const context = createContext();
    const pendingResponse = {};
    context.fetchMock.mockReturnValueOnce(new Promise(resolve => {
      pendingResponse.resolve = resolve;
    }));

    context.window.openAsignatura(27, context.document.createElement("button"));
    context.window.closeAsignaturaModal();
    pendingResponse.resolve(response({ id: 27, nombre: "Respuesta tardía" }));
    await settlePromises();

    expect(context.document.querySelector("#subject-modal").hidden).toBe(true);
    expect(context.document.querySelector("#subject-dialog-title").textContent)
      .toBe("Apartado de asignatura");
  });

  it("no muestra el error de una petición tardía fallida después de cerrar el diálogo", async () => {
    const context = createContext();
    const pendingResponse = {};
    context.fetchMock.mockReturnValueOnce(new Promise((resolve, reject) => {
      pendingResponse.reject = reject;
    }));

    context.window.openAsignatura(271, context.document.createElement("button"));
    context.window.closeAsignaturaModal();
    pendingResponse.reject(new Error("Respuesta tardía fallida"));
    await settlePromises();

    expect(context.document.querySelector("#subject-modal").hidden).toBe(true);
    expect(context.document.querySelector("#subject-feedback").textContent).toBe("");
    expect(context.document.querySelector("#subject-detail").textContent).toBe(
      "Cargando asignatura...",
    );
  });

  it("descarta la respuesta de otra asignatura si se abre una distinta mientras carga", async () => {
    const context = createContext();
    const pending = new Map();
    context.fetchMock.mockImplementation(url => new Promise(resolve => {
      pending.set(url, resolve);
    }));

    context.window.openAsignatura(28, context.document.createElement("button"));
    context.window.openAsignatura(29, context.document.createElement("button"));
    pending.get("/api/asignaturas/28")(response({ id: 28, nombre: "Antigua" }));
    await settlePromises();
    expect(context.document.querySelector("#subject-dialog-title").textContent)
      .toBe("Apartado de asignatura");

    pending.get("/api/asignaturas/29")(response({ id: 29, nombre: "Actual" }));
    await settlePromises();
    expect(context.document.querySelector("#subject-dialog-title").textContent).toBe("Actual");
  });

  it("mantiene la selección válida al recargar la lista y actualiza su detalle abierto", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 30, nombre: "Biología" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { id: 30, nombre: "Biología" });
    subjectItem(context).querySelector(".secondary-btn").click();
    await settlePromises();
    queueResponse(context, [{ id: 30, nombre: "Biología avanzada" }]);
    queueResponse(context, { id: 30, nombre: "Biología avanzada" });

    await context.window.loadAsignaturas(30);

    expect(context.fetchMock.mock.calls[1][0]).toBe("/api/asignaturas/30");
    expect(context.document.querySelector("#subject-dialog-title").textContent)
      .toBe("Biología avanzada");
  });

  it("limpia la selección si la asignatura abierta ya no aparece al recargar", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 301, nombre: "Abierta" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { id: 301, nombre: "Abierta" });
    subjectItem(context).querySelector(".secondary-btn").click();
    await settlePromises();
    queueResponse(context, []);

    await context.window.loadAsignaturas(301);

    expect(context.document.querySelector("#subject-modal").hidden).toBe(false);
    expect(context.document.querySelector("#subject-list").children).toHaveLength(0);
    expect(context.fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/asignaturas",
      "/api/asignaturas/301",
      "/api/asignaturas",
    ]);
  });
});

// ---------------------------------------------------------------------------
// setupSubjectEvents y operaciones de asignaturas conectan alta, edición,
// eliminación y los controles accesibles del diálogo.
// Casos: validación, persistencia, confirmación, errores, Escape, fondo y Tab.
// ---------------------------------------------------------------------------
describe("eventos y operaciones de asignaturas", () => {
  it("rechaza un nombre vacío o compuesto solo por espacios sin enviar la petición", async () => {
    const context = createContext();
    setupInterface(context);
    const input = context.document.querySelector("#subject-name");

    for (const value of ["", "   "]) {
      input.value = value;
      context.document.querySelector("#subject-form").dispatchEvent(
        new context.window.Event("submit", { bubbles: true, cancelable: true }),
      );
    }
    await settlePromises();

    expect(context.fetchMock).not.toHaveBeenCalled();
    expect(context.document.querySelector("#subject-feedback").textContent)
      .toBe("Escribe el nombre de la asignatura.");
  });

  it("crea una asignatura con el nombre recortado, recarga el listado y limpia el campo", async () => {
    const context = createContext();
    setupInterface(context);
    context.document.querySelector("#subject-name").value = "  Geología  ";
    queueResponse(context, { id: 31, nombre: "Geología" });
    queueResponse(context, [{ id: 31, nombre: "Geología" }]);

    context.document.querySelector("#subject-form").dispatchEvent(
      new context.window.Event("submit", { bubbles: true, cancelable: true }),
    );
    await settlePromises();

    expect(context.fetchMock.mock.calls[0][0]).toBe("/api/asignaturas");
    expect(context.fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(JSON.parse(context.fetchMock.mock.calls[0][1].body)).toEqual({
      nombre: "Geología",
    });
    expect(context.document.querySelector("#subject-name").value).toBe("");
    expect(subjectItem(context).querySelector(".subject-list-name").textContent)
      .toBe("Geología");
    expect(context.document.activeElement.id).toBe("subject-name");
  });

  it("conserva el nombre y muestra el error si no se puede crear la asignatura", async () => {
    const context = createContext();
    setupInterface(context);
    context.document.querySelector("#subject-name").value = "Asignatura nueva";
    queueApiError(context, "Nombre duplicado.", 409);

    context.document.querySelector("#subject-form").dispatchEvent(
      new context.window.Event("submit", { bubbles: true, cancelable: true }),
    );
    await settlePromises();

    expect(context.document.querySelector("#subject-name").value).toBe("Asignatura nueva");
    expect(context.document.querySelector("#subject-feedback").textContent)
      .toBe("Nombre duplicado.");
  });

  it("abre un formulario de edición con foco y permite cancelar sin guardar", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 32, nombre: "Latín" }]);
    await context.window.loadAsignaturas();

    subjectItem(context).querySelector(".action-btn.edit").click();

    const input = subjectItem(context).querySelector("input");
    expect(input.value).toBe("Latín");
    expect(input.getAttribute("aria-label")).toBe("Nuevo nombre para Latín");
    expect(context.document.activeElement).toBe(input);
    subjectItem(context).querySelector(".action-btn.cancel").click();
    expect(subjectItem(context).querySelector(".subject-list-name").textContent).toBe("Latín");
    expect(context.fetchMock).toHaveBeenCalledTimes(1);
  });

  it("edita una asignatura y actualiza el listado tras guardar", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 33, nombre: "Cálculo" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { id: 33, nombre: "Análisis" });
    queueResponse(context, [{ id: 33, nombre: "Análisis" }]);

    subjectItem(context).querySelector(".action-btn.edit").click();
    const form = subjectItem(context).querySelector("form");
    form.querySelector("input").value = "Análisis";
    form.dispatchEvent(new context.window.Event("submit", {
      bubbles: true,
      cancelable: true,
    }));
    await settlePromises();

    expect(context.fetchMock.mock.calls[1][0]).toBe("/api/asignaturas/33");
    expect(context.fetchMock.mock.calls[1][1].method).toBe("PATCH");
    expect(JSON.parse(context.fetchMock.mock.calls[1][1].body)).toEqual({
      nombre: "Análisis",
    });
    expect(subjectItem(context).querySelector(".subject-list-name").textContent)
      .toBe("Análisis");
  });

  it("muestra el error devuelto por la API si falla la edición", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 34, nombre: "Química" }]);
    await context.window.loadAsignaturas();
    queueApiError(context, "El nombre no es válido.", 400);

    subjectItem(context).querySelector(".action-btn.edit").click();
    const form = subjectItem(context).querySelector("form");
    form.querySelector("input").value = "";
    form.dispatchEvent(new context.window.Event("submit", {
      bubbles: true,
      cancelable: true,
    }));
    await settlePromises();

    expect(context.fetchMock.mock.calls[1][1].method).toBe("PATCH");
    expect(context.document.querySelector("#subject-feedback").textContent)
      .toBe("El nombre no es válido.");
  });

  it("envía el nombre de edición introducido y refleja la respuesta normalizada por la API", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 341, nombre: "Química" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { id: 341, nombre: "Química orgánica" });
    queueResponse(context, [{ id: 341, nombre: "Química orgánica" }]);

    subjectItem(context).querySelector(".action-btn.edit").click();
    const form = subjectItem(context).querySelector("form");
    form.querySelector("input").value = "  Química orgánica  ";
    form.dispatchEvent(new context.window.Event("submit", {
      bubbles: true,
      cancelable: true,
    }));
    await settlePromises();

    expect(JSON.parse(context.fetchMock.mock.calls[1][1].body)).toEqual({
      nombre: "  Química orgánica  ",
    });
    expect(subjectItem(context).querySelector(".subject-list-name").textContent)
      .toBe("Química orgánica");
  });

  it("no elimina una asignatura si se cancela la confirmación", async () => {
    const context = createContext();
    setupInterface(context);
    context.confirmMock.mockReturnValue(false);
    queueResponse(context, [{ id: 35, nombre: "Conservar" }]);
    await context.window.loadAsignaturas();

    subjectItem(context).querySelector(".action-btn.delete").click();
    await settlePromises();

    expect(context.confirmMock).toHaveBeenCalledWith('¿Seguro que deseas eliminar "Conservar"?');
    expect(context.fetchMock).toHaveBeenCalledTimes(1);
    expect(subjectItem(context)).not.toBeNull();
  });

  it("elimina una asignatura tras confirmar y refresca el listado", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 36, nombre: "Eliminar" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, null);
    queueResponse(context, []);

    subjectItem(context).querySelector(".action-btn.delete").click();
    await settlePromises();

    expect(context.fetchMock.mock.calls[1][0]).toBe("/api/asignaturas/36");
    expect(context.fetchMock.mock.calls[1][1].method).toBe("DELETE");
    expect(context.document.querySelectorAll("#subject-list li")).toHaveLength(0);
    expect(context.document.querySelector("#subject-empty-state").hidden).toBe(false);
  });

  it("limpia la selección y cierra el diálogo si se elimina la asignatura abierta", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 361, nombre: "Abierta" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { id: 361, nombre: "Abierta" });
    subjectItem(context).querySelector(".secondary-btn").click();
    await settlePromises();
    queueResponse(context, null);
    queueResponse(context, []);

    subjectItem(context).querySelector(".action-btn.delete").click();
    await settlePromises();

    expect(context.fetchMock.mock.calls[2][0]).toBe("/api/asignaturas/361");
    expect(context.fetchMock.mock.calls[2][1].method).toBe("DELETE");
    expect(context.document.querySelector("#subject-modal").hidden).toBe(true);
    expect(context.document.querySelector("#subject-list").children).toHaveLength(0);
  });

  it("muestra el error del servidor si falla la eliminación de una asignatura", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 37, nombre: "No borrar" }]);
    await context.window.loadAsignaturas();
    queueApiError(context, "No se pudo borrar.", 500);

    subjectItem(context).querySelector(".action-btn.delete").click();
    await settlePromises();

    expect(subjectItem(context)).not.toBeNull();
    expect(context.document.querySelector("#subject-feedback").textContent)
      .toBe("No se pudo borrar.");
  });

  it("cierra el diálogo con Escape y con un clic en la capa exterior", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 38, nombre: "Arte" }]);
    await context.window.loadAsignaturas();

    for (const closeMethod of ["escape", "backdrop"]) {
      queueResponse(context, { id: 38, nombre: "Arte" });
      subjectItem(context).querySelector(".secondary-btn").click();
      await settlePromises();
      const modal = context.document.querySelector("#subject-modal");

      if (closeMethod === "escape") {
        context.document.dispatchEvent(new context.window.KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
        }));
      } else {
        modal.dispatchEvent(new context.window.MouseEvent("click", {
          bubbles: true,
        }));
      }

      expect(modal.hidden).toBe(true);
    }
  });

  it("no cierra el diálogo cuando se hace clic en su contenido", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 39, nombre: "Música" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { id: 39, nombre: "Música" });
    subjectItem(context).querySelector(".secondary-btn").click();
    await settlePromises();

    context.document.querySelector(".subject-dialog").dispatchEvent(
      new context.window.MouseEvent("click", { bubbles: true }),
    );

    expect(context.document.querySelector("#subject-modal").hidden).toBe(false);
  });

  it("mantiene el foco dentro del diálogo al tabular desde el último control", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 40, nombre: "Diseño" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { id: 40, nombre: "Diseño" });
    subjectItem(context).querySelector(".secondary-btn").click();
    await settlePromises();

    const lastButton = context.document.querySelector("#dialog-last-action");
    lastButton.focus();
    const tabEvent = new context.window.KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    context.document.dispatchEvent(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(true);
    expect(context.document.activeElement.id).toBe("subject-dialog-close");
  });

  it("mantiene el foco dentro del diálogo al retroceder desde el primer control", async () => {
    const context = createContext();
    setupInterface(context);
    queueResponse(context, [{ id: 41, nombre: "Economía" }]);
    await context.window.loadAsignaturas();
    queueResponse(context, { id: 41, nombre: "Economía" });
    subjectItem(context).querySelector(".secondary-btn").click();
    await settlePromises();

    const firstButton = context.document.querySelector("#subject-dialog-close");
    firstButton.focus();
    const tabEvent = new context.window.KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    context.document.dispatchEvent(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(true);
    expect(context.document.activeElement.id).toBe("dialog-last-action");
  });

  it("no intenta devolver el foco a un botón de apertura que ya fue retirado", async () => {
    const context = createContext();
    context.window.setupSubjectEvents();
    const trigger = context.document.createElement("button");
    context.document.body.appendChild(trigger);
    queueResponse(context, { id: 42, nombre: "Filosofía" });
    context.window.openAsignatura(42, trigger);
    trigger.remove();

    expect(() => context.window.closeAsignaturaModal()).not.toThrow();
    expect(context.document.querySelector("#subject-modal").hidden).toBe(true);
  });

  it("no modifica nada si se intenta cerrar el diálogo cuando ya está cerrado", () => {
    const context = createContext();
    context.window.setupSubjectEvents();
    const modal = context.document.querySelector("#subject-modal");
    const initialAttributes = [...modal.attributes].map(
      attribute => [attribute.name, attribute.value],
    );

    expect(() => context.window.closeAsignaturaModal()).not.toThrow();
    expect([...modal.attributes].map(attribute => [attribute.name, attribute.value]))
      .toEqual(initialAttributes);
  });

  it("mantiene el foco en el diálogo cuando no contiene elementos enfocables", async () => {
    const context = createContext();
    context.window.setupSubjectEvents();
    const dialog = context.document.querySelector(".subject-dialog");
    dialog.querySelectorAll("button, input, [tabindex]").forEach(element => element.remove());
    dialog.focus();
    queueResponse(context, { id: 43, nombre: "Filosofía" });
    context.window.openAsignatura(43, context.document.createElement("button"));
    const tabEvent = new context.window.KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });

    context.document.dispatchEvent(tabEvent);

    expect(tabEvent.defaultPrevented).toBe(true);
    expect(context.document.activeElement).toBe(dialog);
    expect(context.fetchMock).toHaveBeenCalledWith("/api/asignaturas/43", {
      headers: { "Content-Type": "application/json" },
    });
    await settlePromises();
  });
});

// ---------------------------------------------------------------------------
// Las funciones del frontend deben tolerar que se usen en documentos parciales
// donde algunos controles opcionales no estén presentes.
// Casos: feedback, listas, diálogo, formularios y operaciones con nodos ausentes.
// ---------------------------------------------------------------------------
describe("defensas frente a elementos DOM ausentes", () => {
  it("ignora feedback, renderizados y apertura si sus elementos no existen", async () => {
    const context = createContext("#inicio", "<!doctype html><html><body></body></html>");

    expect(() => context.window.showFeedback("error")).not.toThrow();
    expect(() => context.window.clearFeedback()).not.toThrow();
    expect(() => context.window.showSubjectFeedback("error")).not.toThrow();
    expect(() => context.window.clearSubjectFeedback()).not.toThrow();
    expect(() => context.window.updateCounters()).not.toThrow();
    expect(() => context.window.renderTodos()).not.toThrow();
    expect(() => context.window.renderSubjects()).not.toThrow();
    expect(() => context.window.renderSubjectDetail({ nombre: "Sin panel" })).not.toThrow();
    expect(() => context.window.openAsignatura(44, null)).not.toThrow();
    expect(() => context.window.closeAsignaturaModal()).not.toThrow();

    await context.window.loadAsignaturaDetail(44);

    expect(context.fetchMock).not.toHaveBeenCalled();
  });

  it("permite preparar los eventos si faltan formularios, pestañas y diálogo", () => {
    const context = createContext("#inicio", "<!doctype html><html><body></body></html>");

    expect(() => context.window.setupTabs()).not.toThrow();
    expect(() => context.window.setupTodoEvents()).not.toThrow();
    expect(() => context.window.setupSubjectEvents()).not.toThrow();
    expect(context.fetchMock).not.toHaveBeenCalled();
  });

  it("no actualiza tareas desde la API si la sesión ha caducado", async () => {
    const context = createContext();
    queueResponse(context, [{ id: 45, titulo: "Guardada", completada: false }]);
    await context.window.loadTodos();
    queueResponse(context, { error: "Sesión caducada" }, { status: 401, ok: false });

    await context.window.loadTodos();

    expect(todoItem(context, 45)).not.toBeNull();
    expect(context.fetchMock).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// DOMContentLoaded instala la navegación, formularios y controles, además de
// pedir los datos iniciales de ambos módulos una sola vez.
// Casos: inicialización completa, cargas iniciales y eventos disponibles.
// ---------------------------------------------------------------------------
describe("inicialización de la aplicación", () => {
  it("registra una inicialización y carga To-Dos y asignaturas al arrancar", async () => {
    const context = createContext();
    context.fetchMock.mockImplementation(url => {
      if (url === "/api/todos") return Promise.resolve(response([]));
      if (url === "/api/asignaturas") return Promise.resolve(response([]));
      throw new Error(`Petición inesperada: ${url}`);
    });

    expect(context.initializationCallbacks).toHaveLength(1);
    context.initializationCallbacks[0].call(
      context.document,
      new context.window.Event("DOMContentLoaded"),
    );
    await settlePromises();

    expect(context.fetchMock.mock.calls.map(([url]) => url)).toEqual([
      "/api/todos",
      "/api/asignaturas",
    ]);
    expect(context.document.querySelector("#empty-state").hidden).toBe(false);
    expect(context.document.querySelector("#subject-empty-state").hidden).toBe(false);
  });
});

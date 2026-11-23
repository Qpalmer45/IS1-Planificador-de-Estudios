/** Pruebas del selector de tema: comportamiento, persistencia y accesibilidad. */
import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const source = fs.readFileSync(path.join(process.cwd(), "static", "theme.js"), "utf8");
const stylesheet = fs.readFileSync(path.join(process.cwd(), "static", "style.css"), "utf8");
let dom, listeners, prefersDark;

function startTheme({ stored = null, dark = false, storageThrows = false } = {}) {
  prefersDark = dark;
  listeners = {};
  dom = new JSDOM(`<!doctype html><html><body>
    <button data-theme-toggle aria-pressed="false">🌙 <span data-theme-label>Modo oscuro</span></button>
    <button data-theme-toggle aria-pressed="false">🌙 <span data-theme-label>Modo oscuro</span></button>
  </body></html>`, { url: "http://localhost/" });
  const { window } = dom;
  window.matchMedia = () => ({
    matches: prefersDark,
    addEventListener: (name, callback) => { listeners[name] = callback; }
  });
  if (stored !== null) window.localStorage.setItem("studyplan-theme", stored);
  if (storageThrows) {
    Object.defineProperty(window, "localStorage", {
      get() { throw new Error("Storage unavailable"); }
    });
  }
  vm.runInContext(source, vm.createContext(window));
  window.document.dispatchEvent(new window.Event("DOMContentLoaded"));
  return window;
}

afterEach(() => { dom?.window.close(); });

test("usa el tema claro si el sistema es claro y no hay preferencia", () => {
  const w = startTheme();
  expect(w.document.documentElement.dataset.theme).toBe("light");
  expect(w.document.querySelector("[data-theme-toggle]").getAttribute("aria-pressed")).toBe("false");
});

test("respeta el tema oscuro del sistema cuando no hay preferencia", () => {
  const w = startTheme({ dark: true });
  expect(w.document.documentElement.dataset.theme).toBe("dark");
  expect(w.document.querySelector("[data-theme-label]").textContent).toBe("Modo claro");
});

test("la preferencia guardada prevalece sobre la del sistema", () => {
  const w = startTheme({ stored: "light", dark: true });
  expect(w.document.documentElement.dataset.theme).toBe("light");
});

test("al pulsar alterna el tema, actualiza todos los botones y lo guarda", () => {
  const w = startTheme();
  const buttons = [...w.document.querySelectorAll("[data-theme-toggle]")];
  buttons[0].click();
  expect(w.document.documentElement.dataset.theme).toBe("dark");
  expect(w.localStorage.getItem("studyplan-theme")).toBe("dark");
  for (const button of buttons) {
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Activar modo claro");
  }
  buttons[1].click();
  expect(w.document.documentElement.dataset.theme).toBe("light");
  expect(w.localStorage.getItem("studyplan-theme")).toBe("light");
});

test("sigue el cambio del sistema mientras el usuario no haya elegido tema", () => {
  const w = startTheme();
  listeners.change({ matches: true });
  expect(w.document.documentElement.dataset.theme).toBe("dark");
  listeners.change({ matches: false });
  expect(w.document.documentElement.dataset.theme).toBe("light");
});

test("un cambio del sistema no anula la preferencia guardada", () => {
  const w = startTheme({ stored: "dark" });
  listeners.change({ matches: false });
  expect(w.document.documentElement.dataset.theme).toBe("dark");
});

test("no falla cuando el almacenamiento local está bloqueado", () => {
  const w = startTheme({ storageThrows: true });
  w.document.querySelector("[data-theme-toggle]").click();
  expect(w.document.documentElement.dataset.theme).toBe("dark");
});

test("ignora un valor de tema guardado que no sea válido", () => {
  const w = startTheme({ stored: "incorrecto", dark: true });
  expect(w.document.documentElement.dataset.theme).toBe("dark");
});

test("mantiene contraste legible en asignaturas y horario con el tema oscuro", () => {
  dom = new JSDOM(`<!doctype html><html data-theme="dark"><head>
    <style>${stylesheet}</style>
  </head><body>
    <section class="subject-dialog">
      <header class="subject-dialog-header"><h2>Asignatura</h2><button class="subject-dialog-close">Cerrar</button></header>
      <div class="subject-detail">
        <p>Detalles de la asignatura</p>
        <button class="topic-filter-btn">Todos</button>
        <button class="topic-filter-btn" aria-pressed="true">Pendientes</button>
      </div>
    </section>
    <div class="schedule-view-toggles">
      <button class="filter-btn active">Lunes a Viernes</button>
      <button class="filter-btn">Semana Completa</button>
    </div>
    <button class="btn-logout">Salir</button>
    <button class="tab-btn active"><span class="badge-count">1</span></button>
    <span class="tab-badge muted">Próximamente</span>
    <div class="user-avatar">P</div>
    <section class="subject-dialog schedule-modal-dialog">
      <header class="subject-dialog-header"><h2>Añadir Clase</h2><button class="subject-dialog-close">Cerrar</button></header>
      <div class="schedule-modal-content">
        <div class="modal-form-group"><label>Asignatura</label><select><option>Materia</option></select></div>
        <small class="field-hint">Campo opcional</small>
      </div>
    </section>
  </body></html>`);
  const { window } = dom;
  const color = (selector, property) => window.getComputedStyle(window.document.querySelector(selector))[property];
  const luminance = (value) => {
    const [red, green, blue] = value.match(/\d+/g).slice(0, 3).map(Number).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const expectReadable = (foreground, background) => {
    const levels = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    expect((levels[0] + 0.05) / (levels[1] + 0.05)).toBeGreaterThanOrEqual(4.5);
  };

  expectReadable(color(".subject-dialog-header h2", "color"), color(".subject-dialog-header", "backgroundColor"));
  expectReadable(color(".subject-dialog-close", "color"), color(".subject-dialog-close", "backgroundColor"));
  expectReadable(color(".subject-detail p", "color"), color(".subject-detail", "backgroundColor"));
  expectReadable(color(".topic-filter-btn", "color"), color(".topic-filter-btn", "backgroundColor"));
  expectReadable(color(".topic-filter-btn[aria-pressed='true']", "color"), color(".topic-filter-btn[aria-pressed='true']", "backgroundColor"));
  expectReadable(color(".filter-btn.active", "color"), color(".filter-btn.active", "backgroundColor"));
  expectReadable(color(".filter-btn:not(.active)", "color"), color(".filter-btn:not(.active)", "backgroundColor"));
  expectReadable(color(".btn-logout", "color"), color(".btn-logout", "backgroundColor"));
  expectReadable(color(".tab-btn.active .badge-count", "color"), color(".tab-btn.active .badge-count", "backgroundColor"));
  expectReadable(color(".tab-badge.muted", "color"), color(".tab-badge.muted", "backgroundColor"));
  expectReadable(color(".user-avatar", "color"), color(".user-avatar", "backgroundColor"));
  expectReadable(color(".schedule-modal-content label", "color"), color(".schedule-modal-content", "backgroundColor"));
  expectReadable(color(".schedule-modal-content select", "color"), color(".schedule-modal-content select", "backgroundColor"));
});

/** Pruebas del selector de tema: comportamiento, persistencia y accesibilidad. */
import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const source = fs.readFileSync(path.join(process.cwd(), "static", "theme.js"), "utf8");
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

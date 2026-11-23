/** Pruebas del calendario automático con DOM simulado. */
import { jest, test, expect, afterEach } from "@jest/globals";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("static/plan.js", "utf8");
let dom;

test("el módulo del planificador tiene sintaxis JavaScript válida", () => {
  expect(() => new vm.Script(source, { filename: "static/plan.js" })).not.toThrow();
});

function setup(response) {
  dom = new JSDOM(`<!doctype html><form id="plan-form">
    <input id="plan-fecha"><input id="plan-desde" value="16:00">
    <input id="plan-hasta" value="21:00"><input id="plan-duracion" value="60">
    <input id="plan-descanso" value="15"><button type="submit">Generar</button>
    </form><div id="plan-block-calendar"></div><form id="plan-block-form"><select id="plan-block-date"></select><input id="plan-block-start" value="17:00"><input id="plan-block-end" value="19:00"><input id="plan-block-reason"></form><div id="plan-block-feedback"></div><div id="plan-feedback"></div><div id="plan-summary"></div>
    <div id="plan-week"></div><span id="user-email-display">test@example.com</span>`, { url: "http://localhost/" });
  const w = dom.window;
  w.fetch = jest.fn().mockResolvedValue(response);
  vm.runInContext(source, vm.createContext(w));
  return w;
}
afterEach(() => dom?.window.close());

test("pinta siete días y las sesiones sin insertar HTML del servidor", async () => {
  const days = Array.from({ length: 7 }, (_, i) => ({
    dia: "lunes", fecha: "2026-11-" + (23 + i), libre: false,
    sesiones: i === 0 ? [{ inicio: "16:00", fin: "17:00",
      asignatura: "<script>alert(1)</script>", actividad: null }] : []
  }));
  const w = setup({ ok: true, json: async () => ({ dias: days, total_sesiones: 1 }) });
  w.document.getElementById("plan-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setImmediate(resolve));
  expect(w.document.querySelectorAll(".plan-day")).toHaveLength(7);
  expect(w.document.querySelectorAll(".plan-session")).toHaveLength(1);
  expect(w.document.querySelector("script")).toBeNull();
  expect(w.document.querySelector(".plan-session strong").textContent).toContain("<script>");
  expect(w.fetch).toHaveBeenCalledTimes(1);
  expect(w.document.querySelector("button").disabled).toBe(false);
});

test("muestra un error de API sin dejar el botón bloqueado", async () => {
  const w = setup({ ok: false, json: async () => ({ error: "Franja inválida" }) });
  w.document.getElementById("plan-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setImmediate(resolve));
  expect(w.document.getElementById("plan-feedback").textContent).toBe("Franja inválida");
  expect(w.document.querySelector("button").disabled).toBe(false);
});

test("conserva y recupera el horario y parámetros tras refrescar", async () => {
  const days = Array.from({ length: 7 }, (_, i) => ({
    dia: "lunes", fecha: "2026-11-" + (23 + i), libre: false,
    sesiones: i === 0 ? [{ inicio: "16:00", fin: "17:00", asignatura: "Álgebra" }] : []
  }));
  const w = setup({ ok: true, json: async () => ({ dias: days, total_sesiones: 1 }) });
  w.document.getElementById("plan-duracion").value = "45";
  w.document.getElementById("plan-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setImmediate(resolve));
  expect(w.localStorage.getItem("studyplan:plan-semanal:v1:test@example.com")).not.toBeNull();
  w.document.getElementById("plan-week").replaceChildren();
  w.document.getElementById("plan-duracion").value = "60";
  vm.runInContext(source, vm.createContext(w)); // Simula la carga de nuevo del script.
  expect(w.document.querySelectorAll(".plan-day")).toHaveLength(7);
  expect(w.document.querySelector(".plan-session strong").textContent).toBe("Álgebra");
  expect(w.document.getElementById("plan-duracion").value).toBe("45");
  expect(w.fetch).toHaveBeenCalledTimes(1); // Restaurar no necesita petición.
});

test("el resumen suma la duración real de sesiones de diferente longitud", async () => {
  const days = Array.from({ length: 7 }, (_, i) => ({
    dia: "lunes", fecha: "2026-11-" + (23 + i), libre: false,
    sesiones: i === 0 ? [
      { inicio: "16:00", fin: "16:45", asignatura: "Álgebra" },
      { inicio: "17:00", fin: "17:30", asignatura: "Cálculo" }
    ] : []
  }));
  const w = setup({ ok: true, json: async () => ({ dias: days, total_sesiones: 2 }) });
  w.document.getElementById("plan-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setImmediate(resolve));
  expect(w.document.getElementById("plan-summary").textContent).toContain("1,25 horas planificadas");
});

test("no restaura un horario guardado con menos de siete días", () => {
  const w = setup({ ok: true, json: async () => ({}) });
  w.localStorage.setItem("studyplan:plan-semanal:v1:test@example.com",
    JSON.stringify({ parametros: { "plan-duracion": "30" }, plan: { dias: [{ dia: "lunes", sesiones: [] }], total_sesiones: 0 } }));
  vm.runInContext(source, vm.createContext(w));
  expect(w.document.querySelectorAll(".plan-day")).toHaveLength(0);
  expect(w.document.getElementById("plan-duracion").value).toBe("60");
});

test("un error al regenerar no borra el horario anterior", async () => {
  const w = setup({ ok: false, json: async () => ({ error: "Sin conexión" }) });
  const oldPlan = {
    total_sesiones: 1,
    dias: Array.from({ length: 7 }, (_, i) => ({
      dia: "lunes", fecha: "2026-11-" + (23 + i), libre: false,
      sesiones: i === 0 ? [{ inicio: "16:00", fin: "17:00", asignatura: "Probabilidad" }] : []
    }))
  };
  w.localStorage.setItem("studyplan:plan-semanal:v1:test@example.com",
    JSON.stringify({ parametros: {}, plan: oldPlan }));
  vm.runInContext(source, vm.createContext(w));
  w.document.getElementById("plan-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setImmediate(resolve));
  expect(w.document.querySelector(".plan-session strong").textContent).toBe("Probabilidad");
  expect(w.document.getElementById("plan-feedback").textContent).toBe("Sin conexión");
});

test("un compromiso se envía y aparece en orden cronológico junto a las sesiones", async () => {
  const days = Array.from({ length: 7 }, (_, i) => ({
    dia: "lunes", fecha: "2026-11-" + (23 + i), libre: false,
    sesiones: i === 0 ? [
      { inicio: "16:00", fin: "17:00", asignatura: "Álgebra" },
      { inicio: "18:00", fin: "19:00", asignatura: "Cálculo" },
    ] : [],
    bloqueos: i === 0 ? [{ fecha: "2026-11-23", inicio: "17:00", fin: "18:00", motivo: "Partido de fútbol" }] : []
  }));
  const w = setup({ ok: true, json: async () => ({ dias: days, total_sesiones: 2 }) });
  w.document.getElementById("plan-fecha").value = "2026-11-23";
  w.document.getElementById("plan-fecha").dispatchEvent(new w.Event("change"));
  w.document.getElementById("plan-block-date").value = "2026-11-23";
  w.document.getElementById("plan-block-reason").value = "Partido de fútbol";
  w.document.getElementById("plan-block-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  expect(w.document.querySelector(".plan-block-item").textContent).toContain("Partido de fútbol");
  w.document.getElementById("plan-form").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setImmediate(resolve));
  const [url, options] = w.fetch.mock.calls[0];
  expect(url).toBe("/api/plan/semana");
  expect(options.method).toBe("POST");
  expect(JSON.parse(options.body).bloqueos[0].motivo).toBe("Partido de fútbol");
  const occupied = w.document.querySelector(".plan-block-result");
  expect(occupied.classList.contains("plan-session")).toBe(true);
  expect(occupied.querySelector(".plan-session-time").textContent).toBe("17:00–18:00");
  expect(occupied.querySelector("strong").textContent).toBe("Partido de fútbol");
  expect(occupied.textContent).not.toContain("Ocupado");
  expect(Array.from(w.document.querySelectorAll(".plan-day .plan-session-time"))
    .map(time => time.textContent))
    .toEqual(["16:00–17:00", "17:00–18:00", "18:00–19:00"]);
});

test("la cuadrícula muestra siete días y permite seleccionar una franja", () => {
  const w = setup({ ok: true, json: async () => ({ dias: [], total_sesiones: 0 }) });
  w.document.getElementById("plan-fecha").value = "2026-11-23";
  w.document.getElementById("plan-fecha").dispatchEvent(new w.Event("change"));
  expect(w.document.querySelectorAll(".plan-mini-day")).toHaveLength(7);
  expect(w.document.querySelectorAll(".plan-mini-slot")).toHaveLength(105);
  const cell = w.document.querySelector('.plan-mini-slot[data-date="2026-11-25"][data-hour="18:00"]');
  cell.click();
  expect(w.document.getElementById("plan-block-date").value).toBe("2026-11-25");
  expect(w.document.getElementById("plan-block-start").value).toBe("18:00");
  expect(w.document.getElementById("plan-block-end").value).toBe("19:00");
  expect(w.document.querySelector(".plan-mini-slot.selected").dataset.date).toBe("2026-11-25");
});

test("al cambiar la fecha de inicio se actualizan los siete días", () => {
  const w = setup({ ok: true, json: async () => ({}) });
  w.document.getElementById("plan-fecha").value = "2026-12-01";
  w.document.getElementById("plan-fecha").dispatchEvent(new w.Event("change"));
  expect(w.document.querySelectorAll(".plan-mini-day")).toHaveLength(7);
  expect(w.document.querySelector('.plan-mini-day[data-date="2026-12-01"]')).not.toBeNull();
  expect(w.document.querySelector('.plan-mini-day[data-date="2026-12-07"]')).not.toBeNull();
});

test("impide horas invertidas y motivos vacíos", () => {
  const w = setup({ ok: true, json: async () => ({}) });
  w.document.getElementById("plan-fecha").value = "2026-11-23";
  w.document.getElementById("plan-fecha").dispatchEvent(new w.Event("change"));
  w.document.getElementById("plan-block-start").value = "19:00";
  w.document.getElementById("plan-block-end").value = "17:00";
  w.document.getElementById("plan-block-reason").value = "Fútbol";
  w.document.getElementById("plan-block-form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  expect(w.document.querySelectorAll(".plan-block-item")).toHaveLength(0);
  expect(w.document.getElementById("plan-block-feedback").textContent).toContain("Comprueba");
  w.document.getElementById("plan-block-end").value = "20:00";
  w.document.getElementById("plan-block-reason").value = " ";
  w.document.getElementById("plan-block-form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  expect(w.document.querySelectorAll(".plan-block-item")).toHaveLength(0);
});

test("permite quitar un bloqueo y deja libre la franja", () => {
  const w = setup({ ok: true, json: async () => ({}) });
  w.document.getElementById("plan-fecha").value = "2026-11-23";
  w.document.getElementById("plan-fecha").dispatchEvent(new w.Event("change"));
  w.document.getElementById("plan-block-reason").value = "Entrenamiento";
  w.document.getElementById("plan-block-form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  expect(w.document.querySelectorAll(".plan-mini-slot.occupied").length).toBeGreaterThan(0);
  w.document.querySelector(".plan-block-item button").click();
  expect(w.document.querySelectorAll(".plan-mini-slot.occupied")).toHaveLength(0);
  expect(w.document.querySelectorAll(".plan-block-item")).toHaveLength(0);
});

test("el motivo se muestra como texto y no como HTML", () => {
  const w = setup({ ok: true, json: async () => ({}) });
  w.document.getElementById("plan-fecha").value = "2026-11-23";
  w.document.getElementById("plan-fecha").dispatchEvent(new w.Event("change"));
  w.document.getElementById("plan-block-reason").value = "<img src=x onerror=alert(1)>";
  w.document.getElementById("plan-block-form").dispatchEvent(new w.Event("submit", { cancelable: true }));
  expect(w.document.querySelector(".plan-block-item img")).toBeNull();
  expect(w.document.querySelector(".plan-block-item").textContent).toContain("<img");
});

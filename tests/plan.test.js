/** Pruebas del calendario automático con DOM simulado. */
import { jest, test, expect, afterEach } from "@jest/globals";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("static/plan.js", "utf8");
let dom;

function setup(response) {
  dom = new JSDOM(`<!doctype html><form id="plan-form">
    <input id="plan-fecha"><input id="plan-desde" value="16:00">
    <input id="plan-hasta" value="21:00"><input id="plan-duracion" value="60">
    <input id="plan-descanso" value="15"><button type="submit">Generar</button>
    </form><div id="plan-feedback"></div><div id="plan-summary"></div>
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
  expect(w.localStorage.length).toBe(1);
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

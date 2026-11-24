/** Pruebas del módulo de preferencias de estudio (HU16). */
import { jest, test, expect, afterEach } from "@jest/globals";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("static/plan.js", "utf8");
let dom;

function setup(fetchHandler) {
  dom = new JSDOM(`<!doctype html>
    <form id="plan-form">
      <input id="plan-fecha" value="2026-11-23">
      <input id="plan-desde" value="16:00">
      <input id="plan-hasta" value="21:00">
      <input id="plan-duracion" value="60">
      <input id="plan-descanso" value="15">
      <button type="submit">Generar</button>
    </form>
    <div id="plan-block-calendar"></div>
    <form id="plan-block-form">
      <select id="plan-block-date"></select>
      <input id="plan-block-start" value="17:00">
      <input id="plan-block-end" value="19:00">
      <input id="plan-block-reason">
    </form>
    <div id="plan-block-feedback"></div>
    <div id="plan-feedback"></div>
    <div id="plan-summary"></div>
    <div id="plan-week"></div>
    <p id="home-study-plan-summary"></p>
    <div id="home-study-plan-content"></div>
    <span id="user-email-display">test@example.com</span>

    <!-- Tarjeta de preferencias de aprendizaje HU16 -->
    <form id="preferencias-estudio-form">
      <input id="pref-duracion-sesion" type="number" value="60">
      <select id="pref-franja-concentracion">
        <option value="sin_preferencia">Sin preferencia</option>
        <option value="manana">Mañana (08:00 – 14:00)</option>
        <option value="tarde">Tarde (14:00 – 20:00)</option>
        <option value="noche">Noche (20:00 – 23:59)</option>
      </select>
      <button type="submit">Guardar preferencias</button>
      <p id="pref-estudio-estado" role="status" aria-live="polite"></p>
    </form>`, { url: "http://localhost/" });
  const w = dom.window;
  w.fetch = jest.fn().mockImplementation((url, opts) => {
    if (typeof fetchHandler === "function") {
      return fetchHandler(url, opts);
    }
    return Promise.resolve(fetchHandler || {
      ok: true,
      json: async () => ({ duracion_sesion_preferida: 60, franja_concentracion: "sin_preferencia" })
    });
  });
  vm.runInContext(source, vm.createContext(w));
  return w;
}

afterEach(() => dom?.window.close());

test("carga inicial de preferencias desde GET /api/preferencias-estudio y precarga en generador", async () => {
  const handler = (url, opts) => {
    if (url === "/api/preferencias-estudio") {
      return Promise.resolve({
        ok: true,
        json: async () => ({ duracion_sesion_preferida: 45, franja_concentracion: "tarde" })
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  };
  const w = setup(handler);
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));

  expect(w.document.getElementById("pref-duracion-sesion").value).toBe("45");
  expect(w.document.getElementById("pref-franja-concentracion").value).toBe("tarde");
  // Precarga duracion_sesion_preferida como valor inicial en el generador
  expect(w.document.getElementById("plan-duracion").value).toBe("45");
});

test("guardado mediante PUT /api/preferencias-estudio con éxito y actualiza generador", async () => {
  let putPayload = null;
  const handler = (url, opts) => {
    if (url === "/api/preferencias-estudio") {
      if (opts?.method === "PUT") {
        putPayload = JSON.parse(opts.body);
        return Promise.resolve({
          ok: true,
          json: async () => putPayload
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ duracion_sesion_preferida: 60, franja_concentracion: "sin_preferencia" })
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  };
  const w = setup(handler);
  await new Promise(resolve => setImmediate(resolve));

  w.document.getElementById("pref-duracion-sesion").value = "90";
  w.document.getElementById("pref-franja-concentracion").value = "noche";

  w.document.getElementById("preferencias-estudio-form").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true })
  );
  await new Promise(resolve => setImmediate(resolve));
  await new Promise(resolve => setImmediate(resolve));

  expect(putPayload).toEqual({
    duracion_sesion_preferida: 90,
    franja_concentracion: "noche"
  });
  expect(w.document.getElementById("pref-estudio-estado").textContent).toContain("correctamente");
  // Actualiza el campo de duración del generador
  expect(w.document.getElementById("plan-duracion").value).toBe("90");
});

test("validación de rango inválido en cliente muestra mensaje de error", async () => {
  let putCalled = false;
  const handler = (url, opts) => {
    if (opts?.method === "PUT") {
      putCalled = true;
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ duracion_sesion_preferida: 60, franja_concentracion: "sin_preferencia" })
    });
  };
  const w = setup(handler);
  await new Promise(resolve => setImmediate(resolve));

  // Valor inferior a 15 minutos
  w.document.getElementById("pref-duracion-sesion").value = "10";
  w.document.getElementById("preferencias-estudio-form").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true })
  );
  await new Promise(resolve => setImmediate(resolve));

  expect(putCalled).toBe(false);
  expect(w.document.getElementById("pref-estudio-estado").textContent).toContain("15 y 240");
});

test("envío de franja_concentracion al generar el plan semanal", async () => {
  let planPayload = null;
  const handler = (url, opts) => {
    if (url === "/api/plan/semana") {
      planPayload = JSON.parse(opts.body);
      const days = Array.from({ length: 7 }, (_, i) => ({
        dia: "lunes", fecha: "2026-11-" + (23 + i), libre: false,
        sesiones: []
      }));
      return Promise.resolve({
        ok: true,
        json: async () => ({ dias: days, total_sesiones: 0 })
      });
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ duracion_sesion_preferida: 60, franja_concentracion: "tarde" })
    });
  };
  const w = setup(handler);
  await new Promise(resolve => setImmediate(resolve));

  // Generar horario semanal
  w.document.getElementById("plan-form").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true })
  );
  await new Promise(resolve => setImmediate(resolve));

  expect(planPayload).not.toBeNull();
  expect(planPayload.franja_concentracion).toBe("tarde");
});

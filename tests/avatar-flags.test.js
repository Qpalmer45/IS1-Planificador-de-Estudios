/** Pruebas de selección de banderas de perfil (Jest + jsdom). */
import { jest, test, expect, afterEach } from "@jest/globals";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("static/avatar-flags.js", "utf8");
let dom;
function setup(email = "test@example.com") {
  dom = new JSDOM(`<!doctype html>
    <button id="user-avatar">T</button>
    <span id="user-email-display">${email}</span>
    <dialog id="avatar-flag-dialog">
    <button id="avatar-show-flags">Banderas</button><button id="avatar-show-clubs">Escudos</button>
    <div id="avatar-club-controls" hidden><select id="avatar-club-league">
    <option value="esp.1">LaLiga</option><option value="esp.2">Segunda</option><option value="eng.1">Premier</option>
    <option value="ger.1">Bundesliga</option><option value="ita.1">Serie A</option><option value="fra.1">Ligue 1</option>
    </select><p id="avatar-club-status"></p></div><label id="avatar-search-label">Buscar país</label>
    <button id="avatar-flag-close">Cerrar</button>
    <input id="avatar-flag-search"><div id="avatar-flag-list"></div>
    <button id="avatar-flag-reset">Inicial</button></dialog>`, { url: "http://localhost/" });
  const w = dom.window;
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
  w.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ equipos: [
    { id: "1", nombre: "Real Madrid", escudo: "https://example.com/real.png" },
    { id: "2", nombre: "FC Barcelona", escudo: "https://example.com/barca.png" }
  ] }) }));
  vm.runInContext(source, vm.createContext(w));
  return w;
}
afterEach(() => dom?.window.close());

test("el selector tiene sintaxis válida", () => {
  expect(() => new vm.Script(source)).not.toThrow();
});
test("el avatar abre un catálogo de 249 países y territorios", () => {
  const w = setup();
  w.document.getElementById("user-avatar").click();
  expect(w.document.querySelectorAll(".avatar-flag-option")).toHaveLength(249);
  expect(w.document.getElementById("avatar-flag-dialog").open).toBe(true);
});
test("buscar España sin tilde y elegir su bandera", () => {
  const w = setup();
  w.document.getElementById("user-avatar").click();
  const input = w.document.getElementById("avatar-flag-search");
  input.value = "espana";
  input.dispatchEvent(new w.Event("input"));
  const option = w.document.querySelector('[data-code="ES"]');
  expect(option).not.toBeNull();
  option.click();
  expect(w.document.querySelector("#user-avatar img").getAttribute("src")).toBe("https://flagcdn.com/w80/es.png");
  expect(w.localStorage.getItem("studyplan:avatar-flag:v1:test@example.com")).toBe("ES");
});
test("restablecer inicial borra la preferencia", () => {
  const w = setup();
  w.document.getElementById("user-avatar").click();
  w.document.querySelector('[data-code="JP"]').click();
  w.document.getElementById("user-avatar").click();
  w.document.getElementById("avatar-flag-reset").click();
  expect(w.document.getElementById("user-avatar").textContent).toBe("T");
  expect(w.localStorage.getItem("studyplan:avatar-flag:v1:test@example.com")).toBeNull();
});
test("las banderas se guardan por usuario", () => {
  const w = setup("a@example.com");
  w.document.getElementById("user-avatar").click();
  w.document.querySelector('[data-code="DE"]').click();
  expect(w.localStorage.getItem("studyplan:avatar-flag:v1:a@example.com")).toBe("DE");
  expect(w.localStorage.getItem("studyplan:avatar-flag:v1:b@example.com")).toBeNull();
});
test("no se ejecuta HTML procedente de los nombres", () => {
  const w = setup();
  w.document.getElementById("user-avatar").click();
  expect(w.document.querySelector(".avatar-flag-list script")).toBeNull();
});

test("las banderas usan imágenes en vez de depender del soporte emoji", () => {
  const w = setup();
  w.document.getElementById("user-avatar").click();
  const option = w.document.querySelector('[data-code="ES"]');
  expect(option.querySelector("img").getAttribute("src")).toBe("https://flagcdn.com/w40/es.png");
  option.click();
  expect(w.document.querySelector("#user-avatar img").alt).toContain("España");
});

test("muestra las seis competiciones y permite elegir un escudo", async () => {
  const w = setup();
  w.document.getElementById("user-avatar").click();
  expect(w.document.querySelectorAll("#avatar-club-league option")).toHaveLength(6);
  w.document.getElementById("avatar-show-clubs").click();
  await new Promise(resolve => setImmediate(resolve));
  expect(w.fetch).toHaveBeenCalledWith("/api/perfil/escudos?liga=esp.1", expect.any(Object));
  expect(w.document.querySelectorAll(".avatar-flag-option")).toHaveLength(2);
  w.document.querySelector(".avatar-flag-option").click();
  expect(w.document.querySelector("#user-avatar img").getAttribute("src")).toContain("example.com/");
  expect(JSON.parse(w.localStorage.getItem("studyplan:avatar-club:v1:test@example.com")).nombre).toBeTruthy();
});
test("filtra equipos y permite volver a banderas", async () => {
  const w = setup();
  w.document.getElementById("user-avatar").click();
  w.document.getElementById("avatar-show-clubs").click();
  await new Promise(resolve => setImmediate(resolve));
  const search = w.document.getElementById("avatar-flag-search");
  search.value = "madrid";
  search.dispatchEvent(new w.Event("input"));
  expect(w.document.querySelectorAll(".avatar-flag-option")).toHaveLength(1);
  w.document.getElementById("avatar-show-flags").click();
  expect(w.document.querySelectorAll(".avatar-flag-option")).toHaveLength(249);
});

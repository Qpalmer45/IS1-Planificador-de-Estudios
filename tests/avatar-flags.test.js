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
    <dialog id="avatar-flag-dialog"><button id="avatar-flag-close">Cerrar</button>
    <input id="avatar-flag-search"><div id="avatar-flag-list"></div>
    <button id="avatar-flag-reset">Inicial</button></dialog>`, { url: "http://localhost/" });
  const w = dom.window;
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; };
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

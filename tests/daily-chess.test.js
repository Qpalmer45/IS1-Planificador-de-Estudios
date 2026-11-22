import { test, expect } from "@jest/globals";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import vm from "node:vm";
const source = fs.readFileSync("static/daily-chess.js", "utf8");
function setup() {
  const dom = new JSDOM(`<!doctype html><span id="user-email-display">test@example.com</span>
    <div id="daily-chess-board"></div><span id="daily-chess-date"></span>
    <p id="daily-chess-prompt"></p><p id="daily-chess-status"></p>
    <p id="daily-chess-progress"></p><button id="daily-chess-hint"></button>
    <button id="daily-chess-reset"></button>`, { url:"http://localhost/" });
  vm.runInContext(source, vm.createContext(dom.window));
  return dom.window;
}
test("el código del reto es válido", () => expect(() => new vm.Script(source)).not.toThrow());
test("el tablero tiene 64 casillas y orientación correcta", () => {
  const w=setup(), cells=w.document.querySelectorAll(".daily-chess-square");
  expect(cells).toHaveLength(64);
  expect(cells[0].getAttribute("aria-label")).toContain("a8");
  expect(cells[63].getAttribute("aria-label")).toContain("h1");
  expect(cells[56].classList.contains("dark")).toBe(true);
  expect(cells[63].classList.contains("light")).toBe(true);
  w.close();
});
test("la pista aparece sin revelar la jugada completa", () => {
  const w=setup();
  w.document.getElementById("daily-chess-hint").click();
  expect(w.document.getElementById("daily-chess-status").textContent).toContain("Pista:");
  w.close();
});
test("resolver el reto persiste el resultado diario", () => {
  const w=setup();
  const board=w.document.getElementById("daily-chess-board");
  const queen=Array.from(board.children).find(x=>x.textContent==="♕");
  expect(queen).toBeDefined();
  queen.click();
  const target=board.querySelector(".daily-chess-square.target");
  expect(target).not.toBeNull();
  target.click();
  expect(w.document.getElementById("daily-chess-progress").textContent).toContain("completado");
  expect(Object.keys(w.localStorage).some(k=>k.startsWith("studyplan:chess-daily:v1:"))).toBe(true);
  w.close();
});
test("una casilla equivocada no completa el reto", () => {
  const w=setup();
  const queen=Array.from(w.document.querySelectorAll(".daily-chess-square")).find(x=>x.textContent==="♕");
  queen.click();
  w.document.querySelector(".daily-chess-square").click();
  expect(w.document.getElementById("daily-chess-progress").textContent).not.toContain("completado");
  w.close();
});

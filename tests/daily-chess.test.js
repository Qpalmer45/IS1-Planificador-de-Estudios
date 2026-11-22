import { test, expect } from "@jest/globals";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import vm from "node:vm";
const source=fs.readFileSync("static/daily-chess.js","utf8");
function setup(){
  const dom=new JSDOM(`<!doctype html><span id="user-email-display">test@example.com</span>
    <div id="daily-chess-board"></div><span id="daily-chess-date"></span>
    <p id="daily-chess-prompt"></p><p id="daily-chess-status"></p>
    <p id="daily-chess-progress"></p><button id="daily-chess-hint"></button>
    <button id="daily-chess-reset"></button>`,{url:"http://localhost/"});
  vm.runInContext(source,vm.createContext(dom.window));
  return dom.window;
}
function solve(w){
  const board=w.document.getElementById("daily-chess-board");
  const queen=Array.from(board.children).find(x=>x.textContent==="♕");
  expect(queen).toBeDefined();queen.click();
  const target=board.querySelector(".daily-chess-square.target");
  expect(target).not.toBeNull();target.click();
}
test("sintaxis JavaScript válida",()=>expect(()=>new vm.Script(source)).not.toThrow());
test("tablero de 64 casillas",()=>{const w=setup(),c=w.document.querySelectorAll(".daily-chess-square");expect(c).toHaveLength(64);expect(c[0].getAttribute("aria-label")).toContain("a8");expect(c[63].getAttribute("aria-label")).toContain("h1");w.close();});
test("pista sin revelar solución",()=>{const w=setup();w.document.getElementById("daily-chess-hint").click();expect(w.document.getElementById("daily-chess-status").textContent).toContain("Pista:");w.close();});
test("cinco ejercicios diarios en secuencia y progreso persistido",()=>{const w=setup();for(let i=1;i<=5;i++){solve(w);expect(w.document.getElementById("daily-chess-progress").textContent).toContain(i+"/5");}expect(w.document.getElementById("daily-chess-progress").textContent).toContain("terminado");expect(Object.keys(w.localStorage).some(k=>k.startsWith("studyplan:chess-daily:v2:"))).toBe(true);w.close();});
test("error no cuenta como completado",()=>{const w=setup(),q=Array.from(w.document.querySelectorAll(".daily-chess-square")).find(x=>x.textContent==="♕");q.click();w.document.querySelector(".daily-chess-square").click();expect(w.document.getElementById("daily-chess-progress").textContent).toContain("0/5");w.close();});
test("reintentar reinicia selección y tablero antes de resolver",()=>{const w=setup();const q=Array.from(w.document.querySelectorAll(".daily-chess-square")).find(x=>x.textContent==="♕");q.click();expect(w.document.querySelector(".selected")).not.toBeNull();w.document.getElementById("daily-chess-reset").click();expect(w.document.querySelector(".selected")).toBeNull();expect(w.document.getElementById("daily-chess-progress").textContent).toContain("0/5");w.close();});
test("reintentar después de completar permite jugar de nuevo",()=>{const w=setup();for(let i=0;i<5;i++)solve(w);w.document.getElementById("daily-chess-reset").click();expect(w.document.getElementById("daily-chess-progress").textContent).toContain("4/5");solve(w);expect(w.document.getElementById("daily-chess-progress").textContent).toContain("5/5");w.close();});

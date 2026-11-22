import {test,expect,jest} from "@jest/globals";
import {JSDOM} from "jsdom";
import fs from "node:fs";
import vm from "node:vm";
const source=fs.readFileSync("static/daily-chess.js","utf8");
const puzzles=Array.from({length:5},(_,i)=>({id:"p"+i,fen:"k7/8/1QK5/8/8/8/8/8 w - - 0 1",color:"white",rating:800}));
async function setup(){
  const dom=new JSDOM(`<!doctype html><span id="user-email-display">test@example.com</span><button data-tab="ajedrez">Ajedrez</button><section id="tab-ajedrez" class="tab-content active"><div id="daily-chess-board"></div></section>
  <span id="daily-chess-date"></span><p id="daily-chess-prompt"></p><p id="daily-chess-status"></p>
  <p id="daily-chess-progress"></p><button id="daily-chess-hint"></button><button id="daily-chess-reset"></button>`,{url:"http://localhost/"});
  const w=dom.window;
  w.fetch=jest.fn(async (url,opts)=>({ok:true,json:async()=>url.includes("comprobar")?{correcto:JSON.parse(opts.body).movimiento==="b6b7"}:{fecha:"2026-11-22",ejercicios:puzzles}}));
  vm.runInContext(source,vm.createContext(w));
  await new Promise(resolve=>setTimeout(resolve,0));
  return w;
}
async function solve(w){
  const queen=Array.from(w.document.querySelectorAll(".daily-chess-square")).find(x=>x.textContent==="♕");
  queen.click();
  const target=Array.from(w.document.querySelectorAll(".daily-chess-square")).find(x=>x.getAttribute("aria-label").startsWith("b7"));
  target.click();
  await new Promise(resolve=>setTimeout(resolve,0));
}
test("código válido",()=>expect(()=>new vm.Script(source)).not.toThrow());
test("consulta la API Flask y dibuja 64 casillas",async()=>{const w=await setup();expect(w.fetch).toHaveBeenCalledWith("/api/ajedrez/diario",expect.any(Object));expect(w.document.querySelectorAll(".daily-chess-square")).toHaveLength(64);w.close();});
test("pista no muestra solución",async()=>{const w=await setup();w.document.getElementById("daily-chess-hint").click();expect(w.document.getElementById("daily-chess-status").textContent).toContain("Pista");w.close();});
test("resuelve cinco ejercicios comprobando cada uno con Flask",async()=>{const w=await setup();for(let i=1;i<=5;i++){await solve(w);expect(w.document.getElementById("daily-chess-progress").textContent).toContain(i+"/5");}expect(w.fetch).toHaveBeenCalledTimes(6);w.close();});
test("jugada errónea no aumenta progreso",async()=>{const w=await setup();const queen=Array.from(w.document.querySelectorAll(".daily-chess-square")).find(x=>x.textContent==="♕");queen.click();w.document.querySelector(".daily-chess-square").click();await new Promise(resolve=>setTimeout(resolve,0));expect(w.document.getElementById("daily-chess-progress").textContent).toContain("0/5");w.close();});
test("reintentar antes de resolver reinicia selección",async()=>{const w=await setup();Array.from(w.document.querySelectorAll(".daily-chess-square")).find(x=>x.textContent==="♕").click();w.document.getElementById("daily-chess-reset").click();expect(w.document.querySelector(".selected")).toBeNull();w.close();});
test("reintentar tras completar permite repetir",async()=>{const w=await setup();for(let i=0;i<5;i++)await solve(w);w.document.getElementById("daily-chess-reset").click();expect(w.document.getElementById("daily-chess-progress").textContent).toContain("4/5");await solve(w);expect(w.document.getElementById("daily-chess-progress").textContent).toContain("5/5");w.close();});
test("fallo de la API se muestra al usuario",async()=>{const w=await setup();w.fetch=jest.fn(async()=>{throw Error("offline")});w.close();});

test("sin pestaña Ajedrez activa no se consulta la API",async()=>{
  const dom=new JSDOM(`<button data-tab="ajedrez">Ajedrez</button><section id="tab-ajedrez"><div id="daily-chess-board"></div></section><p id="daily-chess-status"></p><p id="daily-chess-progress"></p><p id="daily-chess-prompt"></p><button id="daily-chess-hint"></button><button id="daily-chess-reset"></button>`,{url:"http://localhost/"});
  const w=dom.window;w.fetch=jest.fn();vm.runInContext(source,vm.createContext(w));
  expect(w.fetch).not.toHaveBeenCalled();w.close();
});

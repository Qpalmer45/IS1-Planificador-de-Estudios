import {test,expect,jest} from "@jest/globals";
import {JSDOM} from "jsdom";
import fs from "node:fs";
import vm from "node:vm";
const source=fs.readFileSync("static/mini-games.js","utf8");
const sudoku=Array.from({length:9},()=>Array(9).fill(0));
async function setup(){
 const dom=new JSDOM(`<span id="user-email-display">tester</span><section id="tab-ajedrez" class="active"></section>
 <div id="sudoku-board"></div><p id="sudoku-status"></p><button id="sudoku-check"></button><button id="sudoku-reset"></button>
 <div id="game2048-board"></div><p id="game2048-score"></p><button id="game2048-new"></button>
 <button data-move="left"></button><button data-move="right"></button>
 <div id="simon-board"><button data-simon="0"></button><button data-simon="1"></button><button data-simon="2"></button><button data-simon="3"></button></div>
 <p id="simon-status"></p><button id="simon-start"></button>`,{url:"http://localhost/"});
 const w=dom.window;
 w.fetch=jest.fn(async(url)=>({ok:true,json:async()=>({fecha:"2026-11-23",tablero:sudoku})}));
 vm.runInContext(source,vm.createContext(w));
 await new Promise(resolve=>setTimeout(resolve,0));
 return w;
}
test("JavaScript válido",()=>expect(()=>new vm.Script(source)).not.toThrow());
test("Sudoku muestra 81 entradas y consulta API",async()=>{
 const w=await setup();expect(w.document.querySelectorAll(".sudoku-cell")).toHaveLength(81);
 expect(w.fetch).toHaveBeenCalledWith("/api/juegos/sudoku/diario",expect.any(Object));w.close();
});
test("2048 tiene 16 celdas y reinicio",async()=>{
 const w=await setup();expect(w.document.querySelectorAll(".game2048-cell")).toHaveLength(16);
 w.document.getElementById("game2048-new").click();
 expect(w.document.querySelectorAll(".game2048-cell")).toHaveLength(16);w.close();
});
test("2048 responde a botones de movimiento",async()=>{
 const w=await setup();w.document.querySelector('[data-move="left"]').click();
 expect(w.document.getElementById("game2048-score").textContent).toContain("Puntuación:");w.close();
});
test("Simon tiene cuatro colores y empieza",async()=>{
 const w=await setup();expect(w.document.querySelectorAll("[data-simon]")).toHaveLength(4);
 w.document.getElementById("simon-start").click();
 expect(w.document.getElementById("simon-status").textContent).toContain("Ronda 1");w.close();
});

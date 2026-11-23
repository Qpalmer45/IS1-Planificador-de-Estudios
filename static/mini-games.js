"use strict";
/* Juegos mentales. API REST Flask para Sudoku, Web Crypto y localStorage para 2048/Simon. */
(() => {
  const $ = id => document.getElementById(id);
  if (!$("sudoku-board")) return;
  const email = $("user-email-display")?.textContent?.trim() || "guest";
  const store = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (_) { return null; } };
  const randomInt = n => {
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1); window.crypto.getRandomValues(values);
      return values[0] % n;
    }
    return Math.floor(Math.random() * n);
  };

  // Sudoku diario: nunca exponer la solución en el GET; comprobar en el servidor.
  let sudokuInitial = null, sudokuValues = null, sudokuKey = "";
  const sudokuCells = [];
  for (let i = 0; i < 81; i++) {
    const input = document.createElement("input");
    input.type = "text"; input.inputMode = "numeric"; input.maxLength = 1;
    input.setAttribute("aria-label", "Fila " + (Math.floor(i / 9) + 1) + ", columna " + (i % 9 + 1));
    input.className = "sudoku-cell";
    if (i % 9 === 2 || i % 9 === 5) input.classList.add("block-right");
    if (Math.floor(i / 9) === 2 || Math.floor(i / 9) === 5) input.classList.add("block-bottom");
    input.addEventListener("input", () => {
      if (!sudokuInitial) return;
      const value = /^[1-9]$/.test(input.value) ? Number(input.value) : 0;
      input.value = value ? String(value) : "";
      sudokuValues[Math.floor(i / 9)][i % 9] = value;
      store(sudokuKey, sudokuValues);
      $("sudoku-status").textContent = "Progreso guardado automáticamente.";
    });
    sudokuCells.push(input); $("sudoku-board").append(input);
  }
  function renderSudoku() {
    sudokuCells.forEach((cell, i) => {
      const r = Math.floor(i / 9), c = i % 9, fixed = sudokuInitial[r][c] !== 0;
      cell.value = sudokuValues[r][c] || "";
      cell.readOnly = fixed;
      cell.classList.toggle("fixed", fixed);
    });
  }
  async function loadSudoku() {
    try {
      const response = await fetch("/api/juegos/sudoku/diario", {credentials:"same-origin"});
      if (!response.ok) throw Error("Error HTTP");
      const data = await response.json();
      if (!Array.isArray(data.tablero) || data.tablero.length !== 9 || data.tablero.some(row => !Array.isArray(row) || row.length !== 9)) throw Error("Tablero inválido");
      sudokuInitial = data.tablero;
      sudokuKey = "studyplan:sudoku:v1:" + email + ":" + data.fecha;
      const saved = read(sudokuKey);
      sudokuValues = saved && saved.length === 9 && saved.every(row => Array.isArray(row) && row.length === 9)
        ? saved.map((row,r) => row.map((n,c) => sudokuInitial[r][c] || (Number.isInteger(n) && n >= 0 && n <= 9 ? n : 0)))
        : sudokuInitial.map(row => row.slice());
      renderSudoku(); $("sudoku-status").textContent = "Sudoku del " + data.fecha + ".";
    } catch (_) { $("sudoku-status").textContent = "No se ha podido cargar el Sudoku. Recarga la página."; }
  }
  $("sudoku-check").addEventListener("click", async () => {
    if (!sudokuValues) return;
    try {
      const response = await fetch("/api/juegos/sudoku/comprobar", {
        method:"POST", credentials:"same-origin", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({tablero:sudokuValues})
      });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || "No se pudo comprobar");
      $("sudoku-status").textContent = data.completo ? "¡Sudoku completado!" :
        "Todavía no es correcto. Casillas vacías: " + data.restantes + ".";
    } catch (error) { $("sudoku-status").textContent = error.message; }
  });
  $("sudoku-reset").addEventListener("click", () => {
    if (!sudokuInitial) return;
    sudokuValues = sudokuInitial.map(row => row.slice()); store(sudokuKey, sudokuValues);
    renderSudoku(); $("sudoku-status").textContent = "Sudoku reiniciado.";
  });
  void loadSudoku();

  // 2048: reglas deterministas en cliente, números aleatorios mediante Web Crypto.
  const key2048 = "studyplan:2048:v1:" + email;
  let game = read(key2048);
  if (!game || !Array.isArray(game.board) || game.board.length !== 16 || !game.board.every(n => Number.isInteger(n) && n >= 0)) game = {board:Array(16).fill(0),score:0};
  function spawn() {
    const empty = game.board.map((n,i) => n ? -1 : i).filter(i => i >= 0);
    if (empty.length) game.board[empty[randomInt(empty.length)]] = randomInt(10) === 0 ? 4 : 2;
  }
  function render2048() {
    $("game2048-board").replaceChildren();
    game.board.forEach(n => {
      const cell = document.createElement("div"); cell.className = "game2048-cell";
      cell.dataset.value = String(n); cell.textContent = n || "";
      $("game2048-board").append(cell);
    });
    $("game2048-score").textContent = "Puntuación: " + game.score +
      (game.board.includes(2048) ? " · ¡Has llegado a 2048!" : "");
    store(key2048, game);
  }
  function slide(line) {
    const values = line.filter(Boolean), merged = [];
    for (let i=0;i<values.length;i++) {
      if (i+1 < values.length && values[i] === values[i+1]) {
        merged.push(values[i]*2); game.score += values[i]*2; i++;
      } else merged.push(values[i]);
    }
    while (merged.length < 4) merged.push(0);
    return merged;
  }
  function move(direction) {
    const before = game.board.join(",");
    for (let k=0;k<4;k++) {
      const indexes = [];
      for (let j=0;j<4;j++) indexes.push(
        direction === "left" ? k*4+j : direction === "right" ? k*4+3-j :
        direction === "up" ? j*4+k : (3-j)*4+k
      );
      const result = slide(indexes.map(i=>game.board[i]));
      indexes.forEach((i,j)=>{game.board[i]=result[j];});
    }
    if (before !== game.board.join(",")) spawn();
    render2048();
    if (!game.board.includes(0) && !game.board.some((n,i) =>
      (i%4<3 && game.board[i+1]===n) || (i<12 && game.board[i+4]===n)
    )) $("game2048-score").textContent += " · Fin de partida";
  }
  if (!game.board.some(Boolean)) { spawn(); spawn(); }
  render2048();
  document.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", () => move(button.dataset.move)));
  document.addEventListener("keydown", event => {
    if (!$("tab-ajedrez")?.classList.contains("active")) return;
    if (["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName)) return;
    const directions = {ArrowUp:"up",ArrowDown:"down",ArrowLeft:"left",ArrowRight:"right"};
    if (directions[event.key]) {event.preventDefault();move(directions[event.key]);}
  });
  $("game2048-new").addEventListener("click", () => {
    game={board:Array(16).fill(0),score:0};spawn();spawn();render2048();
  });

  // Simon: secuencia local, aleatoriedad Web Crypto, récord guardado.
  const simonButtons = [...document.querySelectorAll("[data-simon]")];
  let sequence=[], cursor=0, accepting=false, timerIds=[];
  const simonKey="studyplan:simon:record:v1:"+email;
  const record=()=>Number(read(simonKey))||0;
  function clearTimers(){timerIds.forEach(clearTimeout);timerIds=[];simonButtons.forEach(b=>b.classList.remove("lit"));}
  function flash(index,delay) {
    timerIds.push(setTimeout(()=>simonButtons[index].classList.add("lit"),delay));
    timerIds.push(setTimeout(()=>simonButtons[index].classList.remove("lit"),delay+440));
  }
  function nextRound(){
    accepting=false;cursor=0;sequence.push(randomInt(4));
    $("simon-status").textContent="Ronda "+sequence.length+" · Observa la secuencia. Récord: "+record();
    sequence.forEach((value,i)=>flash(value,500+i*690));
    timerIds.push(setTimeout(()=>{accepting=true;$("simon-status").textContent="Ronda "+sequence.length+" · Repite la secuencia.";},500+sequence.length*690));
  }
  $("simon-start").addEventListener("click",()=>{
    clearTimers();sequence=[];cursor=0;accepting=false;nextRound();
  });
  simonButtons.forEach((button,index)=>button.addEventListener("click",()=>{
    if (!accepting) return;
    button.classList.add("lit");timerIds.push(setTimeout(()=>button.classList.remove("lit"),180));
    if (sequence[cursor] !== index) {
      accepting=false;
      $("simon-status").textContent="Fin de partida. Alcanzaste "+(sequence.length-1)+" rondas. Récord: "+record()+".";
      return;
    }
    cursor++;
    if (cursor===sequence.length) {
      accepting=false;store(simonKey,Math.max(record(),sequence.length));
      $("simon-status").textContent="¡Correcto! Preparando siguiente ronda…";
      timerIds.push(setTimeout(nextRound,900));
    }
  }));
})();

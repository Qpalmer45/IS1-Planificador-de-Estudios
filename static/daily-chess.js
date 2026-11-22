"use strict";
/* Ejercicios locales de mate en una jugada: no dependen de APIs externas. */
(() => {
  const board = document.getElementById("daily-chess-board");
  if (!board) return;
  const puzzles = [
    { fen: "k7/8/1QK5/8/8/8/8/8", from: "b6", to: "b7", answer: "Db7#", hint: "La dama necesita apoyo del rey blanco para acercarse al rey negro.", explanation: "Db7# controla a7 y b8; el rey blanco protege la dama en b7." },
    { fen: "7k/8/5KQ1/8/8/8/8/8", from: "g6", to: "g7", answer: "Dg7#", hint: "Busca una casilla junto al rey negro defendida por tu rey.", explanation: "Dg7# cubre h8, g8 y h7; el rey blanco defiende g7." },
    { fen: "8/8/8/8/8/1QK5/8/k7", from: "b3", to: "b2", answer: "Db2#", hint: "El mate está en la segunda fila.", explanation: "Db2# controla a2 y b1; el rey blanco protege b2." },
    { fen: "8/8/8/8/8/5KQ1/8/7k", from: "g3", to: "g2", answer: "Dg2#", hint: "Acerca la dama al rey sin dejarla indefensa.", explanation: "Dg2# cierra g1 y h2; el rey blanco protege g2." }
  ];
  const glyphs = { K:"♔", Q:"♕", R:"♖", B:"♗", N:"♘", P:"♙", k:"♚", q:"♛", r:"♜", b:"♝", n:"♞", p:"♟︎" };
  const email = document.getElementById("user-email-display")?.textContent?.trim() || "guest";
  const now = new Date();
  const day = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,"0") + "-" + String(now.getDate()).padStart(2,"0");
  const epochDay = Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()) / 86400000);
  const puzzle = puzzles[epochDay % puzzles.length];
  const storageKey = "studyplan:chess-daily:v1:" + email + ":" + day;
  const dateEl = document.getElementById("daily-chess-date");
  const prompt = document.getElementById("daily-chess-prompt");
  const status = document.getElementById("daily-chess-status");
  const progress = document.getElementById("daily-chess-progress");
  dateEl.textContent = now.toLocaleDateString("es-ES", { day:"numeric", month:"long" });
  prompt.textContent = "Juegan blancas · Encuentra el jaque mate en una jugada.";
  const cells = {};
  const initial = {};
  const ranks = puzzle.fen.split("/");
  ranks.forEach((rank, row) => {
    let file = 0;
    for (const symbol of rank) {
      if (/^[1-8]$/.test(symbol)) file += Number(symbol);
      else { initial["abcdefgh"[file] + (8-row)] = symbol; file++; }
    }
    if (file !== 8) throw Error("Posición de ajedrez inválida.");
  });
  let pieces = { ...initial };
  let selected = null;
  let solved = false;
  try { solved = localStorage.getItem(storageKey) === "solved"; } catch (_) {}
  function render() {
    for (const [square, button] of Object.entries(cells)) {
      const piece = pieces[square];
      button.textContent = piece ? glyphs[piece] : "";
      button.classList.toggle("selected", square === selected);
      button.classList.toggle("target", square === puzzle.to && selected === puzzle.from);
      button.setAttribute("aria-label", square + (piece ? " " + (piece === piece.toUpperCase() ? "blanca " : "negra ") + piece : " vacía"));
      button.setAttribute("aria-pressed", String(square === selected));
    }
    progress.textContent = solved ? "✓ Reto completado hoy. Mañana tendrás otro." : "Un reto nuevo cada día.";
    if (solved) status.textContent = "¡Correcto! " + puzzle.answer + " — " + puzzle.explanation;
  }
  function click(square) {
    if (solved) return;
    if (selected === null) {
      if (pieces[square] && pieces[square] === pieces[square].toUpperCase()) {
        selected = square;
        status.textContent = "Ahora selecciona la casilla de destino.";
      } else status.textContent = "Selecciona una pieza blanca.";
    } else if (square === selected) selected = null;
    else if (square === puzzle.to && selected === puzzle.from) {
      pieces[square] = pieces[selected];
      delete pieces[selected];
      selected = null;
      solved = true;
      try { localStorage.setItem(storageKey, "solved"); } catch (_) {}
    } else {
      selected = pieces[square] && pieces[square] === pieces[square].toUpperCase() ? square : null;
      status.textContent = "Esa no es la solución. Prueba otra jugada.";
    }
    render();
  }
  for (let row=0; row<8; row++) for (let col=0; col<8; col++) {
    const square = "abcdefgh"[col] + (8-row);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "daily-chess-square " + ((row+col)%2===0 ? "light" : "dark");
    button.addEventListener("click", () => click(square));
    cells[square] = button;
    board.append(button);
  }
  document.getElementById("daily-chess-hint").addEventListener("click", () => {
    if (!solved) status.textContent = "Pista: " + puzzle.hint;
  });
  document.getElementById("daily-chess-reset").addEventListener("click", () => {
    pieces = { ...initial };
    selected = null;
    if (!solved) status.textContent = "Selecciona una pieza y después su destino.";
    render();
  });
  render();
})();

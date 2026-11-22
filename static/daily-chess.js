"use strict";
/* Cinco ejercicios diarios de mate en una jugada, sin APIs externas. */
(() => {
  const board = document.getElementById("daily-chess-board");
  if (!board) return;
  const puzzles = [
    { fen:"k7/8/1QK5/8/8/8/8/8",from:"b6",to:"b7",answer:"Db7#",hint:"La dama necesita el apoyo del rey blanco.",explanation:"Db7# controla a7 y b8; el rey blanco protege b7." },
    { fen:"7k/8/5KQ1/8/8/8/8/8",from:"g6",to:"g7",answer:"Dg7#",hint:"Busca una casilla defendida por el rey blanco.",explanation:"Dg7# cubre g8 y h7; el rey blanco defiende g7." },
    { fen:"8/8/8/8/8/1QK5/8/k7",from:"b3",to:"b2",answer:"Db2#",hint:"El mate está en la segunda fila.",explanation:"Db2# cubre a2 y b1; el rey blanco protege b2." },
    { fen:"8/8/8/8/8/5KQ1/8/7k",from:"g3",to:"g2",answer:"Dg2#",hint:"Acerca la dama sin dejarla indefensa.",explanation:"Dg2# cierra g1 y h2; el rey blanco protege g2." },
    { fen:"k7/2K5/1Q6/8/8/8/8/8",from:"b6",to:"b7",answer:"Db7#",hint:"El rey blanco protege la séptima fila.",explanation:"Db7# cubre a8 y a7; el rey blanco controla b8 y protege b7." }
  ];
  const glyphs={K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙",k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟︎"};
  const email=document.getElementById("user-email-display")?.textContent?.trim()||"guest";
  const now=new Date();
  const day=now.getFullYear()+"-"+String(now.getMonth()+1).padStart(2,"0")+"-"+String(now.getDate()).padStart(2,"0");
  const epochDay=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);
  const storageKey="studyplan:chess-daily:v2:"+email+":"+day;
  const dateEl=document.getElementById("daily-chess-date");
  const prompt=document.getElementById("daily-chess-prompt");
  const status=document.getElementById("daily-chess-status");
  const progress=document.getElementById("daily-chess-progress");
  const cells={};
  const order=puzzles.map((_,i)=>(i+epochDay%puzzles.length)%puzzles.length);
  let completed=[];
  try { const saved=JSON.parse(localStorage.getItem(storageKey)||"[]");if(Array.isArray(saved))completed=saved.filter(i=>Number.isInteger(i)&&i>=0&&i<5); }catch(_){}
  completed=[...new Set(completed)];
  let position=order.findIndex(i=>!completed.includes(i));
  if(position<0)position=order.length-1;
  let pieces={},initial={},selected=null;
  function puzzle(){return puzzles[order[position]];}
  function load(){
    initial={};const ranks=puzzle().fen.split("/");
    ranks.forEach((rank,row)=>{let file=0;for(const symbol of rank){if(/^[1-8]$/.test(symbol))file+=Number(symbol);else{initial["abcdefgh"[file]+(8-row)]=symbol;file++;}}if(file!==8)throw Error("Posición inválida");});
    pieces={...initial};selected=null;
  }
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify(completed));}catch(_){}}
  function render(){
    const solved=completed.includes(order[position]);
    for(const [square,button] of Object.entries(cells)){
      const piece=pieces[square];
      button.textContent=piece?glyphs[piece]:"";
      button.classList.toggle("selected",square===selected);
      button.classList.toggle("target",!solved&&square===puzzle().to&&selected===puzzle().from);
      button.setAttribute("aria-label",square+(piece?" "+(piece===piece.toUpperCase()?"blanca ":"negra ")+piece:" vacía"));
      button.setAttribute("aria-pressed",String(square===selected));
    }
    prompt.textContent="Ejercicio "+(position+1)+" de 5 · Juegan blancas · Mate en una jugada.";
    progress.textContent=completed.length+"/5 ejercicios completados hoy."+(completed.length===5?" ¡Reto diario terminado!":"");
  }
  function advance(){
    const next=order.findIndex(i=>!completed.includes(i));
    if(next!==-1){position=next;load();status.textContent="¡Correcto! Siguiente ejercicio.";render();}
    else{status.textContent="¡Enhorabuena! Has resuelto los cinco ejercicios. Pulsa Reintentar para volver a practicar.";render();}
  }
  function click(square){
    if(completed.includes(order[position]))return;
    if(selected===null){
      if(pieces[square]&&pieces[square]===pieces[square].toUpperCase()){selected=square;status.textContent="Selecciona la casilla de destino.";}
      else status.textContent="Selecciona una pieza blanca.";
    }else if(square===selected)selected=null;
    else if(square===puzzle().to&&selected===puzzle().from){
      pieces[square]=pieces[selected];delete pieces[selected];selected=null;
      completed.push(order[position]);persist();
      const explanation=puzzle().answer+" — "+puzzle().explanation;
      advance();
      status.textContent="¡Correcto! "+explanation+(completed.length<5?" Siguiente ejercicio disponible.":" ¡Has terminado los cinco!");
    }else{selected=pieces[square]&&pieces[square]===pieces[square].toUpperCase()?square:null;status.textContent="Esa no es la solución. Prueba otra jugada.";}
    render();
  }
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const square="abcdefgh"[col]+(8-row),button=document.createElement("button");
    button.type="button";button.className="daily-chess-square "+((row+col)%2===0?"light":"dark");
    button.addEventListener("click",()=>click(square));cells[square]=button;board.append(button);
  }
  document.getElementById("daily-chess-hint").addEventListener("click",()=>{status.textContent="Pista: "+puzzle().hint;});
  document.getElementById("daily-chess-reset").addEventListener("click",()=>{
    // Reinicia el ejercicio actual, incluso si los cinco ya estaban resueltos.
    // El progreso de los ejercicios anteriores se conserva.
    completed=completed.filter(i=>i!==order[position]);persist();
    load();status.textContent="Ejercicio reiniciado. Selecciona una pieza y su destino.";render();
  });
  if(dateEl)dateEl.textContent=now.toLocaleDateString("es-ES",{day:"numeric",month:"long"});
  load();render();
})();

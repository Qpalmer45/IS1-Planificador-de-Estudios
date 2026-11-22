"use strict";
/* HU44: cinco ejercicios obtenidos desde Flask, que consulta Chess Puzzle API. */
(() => {
  const board=document.getElementById("daily-chess-board");
  if(!board)return;
  const glyphs={K:"♔",Q:"♕",R:"♖",B:"♗",N:"♘",P:"♙",k:"♚",q:"♛",r:"♜",b:"♝",n:"♞",p:"♟︎"};
  const status=document.getElementById("daily-chess-status");
  const progress=document.getElementById("daily-chess-progress");
  const prompt=document.getElementById("daily-chess-prompt");
  const email=document.getElementById("user-email-display")?.textContent?.trim()||"guest";
  const cells={};let puzzles=[],completed=[],index=0,initial={},pieces={},selected=null,busy=false,storageKey="";
  const isOwn=p=>p&&p!== "."&&(p===p.toUpperCase())===(puzzles[index].color==="white");
  function parseFen(fen){
    const result={},ranks=fen.split(" ")[0].split("/");
    if(ranks.length!==8)throw Error("FEN inválido");
    ranks.forEach((rank,row)=>{let file=0;for(const symbol of rank){
      if(/^[1-8]$/.test(symbol))file+=Number(symbol);
      else {if(!glyphs[symbol]||file>=8)throw Error("FEN inválido");result["abcdefgh"[file]+(8-row)]=symbol;file++;}
    }if(file!==8)throw Error("FEN inválido");});
    return result;
  }
  function persist(){try{localStorage.setItem(storageKey,JSON.stringify(completed));}catch(_){}}
  function load(){initial=parseFen(puzzles[index].fen);pieces={...initial};selected=null;}
  function render(){
    const done=completed.includes(puzzles[index].id);
    for(const [square,button] of Object.entries(cells)){
      const piece=pieces[square];
      button.textContent=piece?glyphs[piece]:"";
      button.classList.toggle("selected",square===selected);
      button.setAttribute("aria-label",square+(piece?" "+piece:" vacía"));
      button.setAttribute("aria-pressed",String(square===selected));
    }
    prompt.textContent="Ejercicio "+(index+1)+" de 5 · Juegan "+(puzzles[index].color==="white"?"blancas":"negras")+" · Mate en una jugada.";
    progress.textContent=completed.length+"/5 ejercicios completados hoy."+(completed.length===5?" ¡Reto diario terminado!":"");
    document.getElementById("daily-chess-hint").disabled=busy||done;
  }
  async function attempt(from,to){
    if(busy)return;busy=true;
    status.textContent="Comprobando jugada…";
    try{
      const response=await fetch("/api/ajedrez/comprobar",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:puzzles[index].id,movimiento:from+to})});
      if(!response.ok)throw Error("No se pudo verificar la jugada");
      const result=await response.json();
      if(result.correcto){
        pieces[to]=pieces[from];delete pieces[from];
        completed.push(puzzles[index].id);persist();
        const next=puzzles.findIndex(p=>!completed.includes(p.id));
        if(next>=0){index=next;load();status.textContent="¡Correcto! Siguiente ejercicio.";}
        else status.textContent="¡Enhorabuena! Has completado los cinco ejercicios. Puedes pulsar Reintentar.";
      }else status.textContent="Esa no es la solución. Prueba otra jugada.";
    }catch(_){status.textContent="Error de conexión. Reintenta la jugada.";}
    selected=null;busy=false;render();
  }
  function click(square){
    if(!puzzles.length||busy||completed.includes(puzzles[index].id))return;
    if(selected===null){if(isOwn(pieces[square])){selected=square;status.textContent="Selecciona el destino.";}else status.textContent="Selecciona una pieza del color que juega.";}
    else if(square===selected)selected=null;
    else if(isOwn(pieces[square]))selected=square;
    else{const from=selected;selected=null;void attempt(from,square);}
    render();
  }
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){
    const square="abcdefgh"[col]+(8-row),button=document.createElement("button");
    button.type="button";button.className="daily-chess-square "+((row+col)%2===0?"light":"dark");
    button.addEventListener("click",()=>click(square));cells[square]=button;board.append(button);
  }
  document.getElementById("daily-chess-hint").addEventListener("click",()=>{
    if(puzzles.length&&!busy)status.textContent="Pista: busca un jaque que deje al rey sin escapatoria.";
  });
  document.getElementById("daily-chess-reset").addEventListener("click",()=>{
    if(!puzzles.length||busy)return;
    completed=completed.filter(id=>id!==puzzles[index].id);persist();load();
    status.textContent="Ejercicio reiniciado. Selecciona una pieza.";render();
  });
  async function init(){
    status.textContent="Cargando cinco ejercicios desde la API…";
    try{
      const response=await fetch("/api/ajedrez/diario",{credentials:"same-origin"});
      if(!response.ok)throw Error("API no disponible");
      const data=await response.json();
      if(!Array.isArray(data.ejercicios)||data.ejercicios.length!==5)throw Error("Lote incompleto");
      puzzles=data.ejercicios;
      for(const p of puzzles)parseFen(p.fen);
      storageKey="studyplan:chess-daily:api:v1:"+email+":"+data.fecha;
      try{const saved=JSON.parse(localStorage.getItem(storageKey)||"[]");completed=Array.isArray(saved)?[...new Set(saved.filter(id=>puzzles.some(p=>p.id===id)))]:[];}catch(_){completed=[];}
      const next=puzzles.findIndex(p=>!completed.includes(p.id));index=next>=0?next:4;
      load();render();
      status.textContent=completed.length===5?"¡Reto diario completado!":"Selecciona una pieza y después su destino.";
      document.getElementById("daily-chess-date").textContent=data.fecha;
    }catch(_){status.textContent="No se han podido cargar los ejercicios. Recarga la página para volver a intentarlo.";prompt.textContent="Servicio de ajedrez temporalmente no disponible.";}
  }
  // La API se consulta solo al entrar en la pestaña Ajedrez.
  let started=false;
  function activate(){
    if(started||!document.getElementById("tab-ajedrez")?.classList.contains("active"))return;
    started=true;void init();
  }
  document.querySelector('[data-tab="ajedrez"]')?.addEventListener("click",()=>{\n    // app.js puede registrar su listener después del nuestro: esperar al final del evento.\n    setTimeout(activate,0);\n  });
  activate();
})();

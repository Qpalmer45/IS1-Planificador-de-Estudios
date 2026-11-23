"use strict";
(() => {
  const form = document.getElementById("plan-form");
  if (!form) return;
  const feedback = document.getElementById("plan-feedback");
  const week = document.getElementById("plan-week");
  const summary = document.getElementById("plan-summary");
  const dateInput = document.getElementById("plan-fecha");
  // Fecha local: no usar toISOString(), que puede desplazar el día.
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  dateInput.value = localDate.toISOString().slice(0, 10);

  // Persistencia por usuario en este navegador.
  const userEmail = document.getElementById("user-email-display")?.textContent?.trim();
  const storageKey = userEmail ? "studyplan:plan-semanal:v1:" + userEmail : null;
  const fields = ["plan-fecha", "plan-desde", "plan-hasta", "plan-duracion", "plan-descanso"];


  // Compromisos puntuales de la semana, guardados por usuario y fecha en este navegador.
  const blockForm = document.getElementById("plan-block-form");
  const blockCalendar = document.getElementById("plan-block-calendar");
  const blockDate = document.getElementById("plan-block-date");
  let selectedSlot = null;
  const blockFeedback = document.getElementById("plan-block-feedback");
  const blocksKey = userEmail ? "studyplan:bloqueos:v1:" + userEmail : null;
  let blocks = [];
  try {
    const saved = blocksKey ? JSON.parse(localStorage.getItem(blocksKey) || "[]") : [];
    if (Array.isArray(saved)) blocks = saved.filter(b => b && typeof b.fecha === "string" && typeof b.motivo === "string");
  } catch (_) { blocks = []; }

  function weekDates() {
    const base = new Date(dateInput.value + "T12:00:00");
    if (Number.isNaN(base.getTime())) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return { date: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"),
        label: d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }) };
    });
  }

  function persistBlocks() {
    if (!blocksKey) return;
    try { localStorage.setItem(blocksKey, JSON.stringify(blocks)); }
    catch (_) { blockFeedback.textContent = "No se pudieron guardar los bloqueos en este navegador."; }
  }

  function renderBlocks() {
    const days = weekDates();
    const previous = blockDate.value;
    blockDate.replaceChildren();
    blockCalendar.replaceChildren();
    for (const day of days) {
      const option = document.createElement("option");
      option.value = day.date;
      option.textContent = day.label;
      blockDate.append(option);
    }
    if (days.some(d => d.date === previous)) blockDate.value = previous;
    else if (days.length) blockDate.value = days[0].date;

    const grid = document.createElement("div");
    grid.className = "plan-mini-grid";
    const corner = document.createElement("div");
    corner.className = "plan-mini-corner";
    corner.textContent = "Hora";
    grid.append(corner);
    for (const day of days) {
      const header = document.createElement("button");
      header.type = "button";
      header.className = "plan-mini-day";
      header.textContent = day.label;
      header.dataset.date = day.date;
      header.setAttribute("aria-label", "Seleccionar " + day.label);
      header.addEventListener("click", () => {
        blockDate.value = day.date;
        selectedSlot = null;
        renderBlocks();
      });
      if (blockDate.value === day.date) header.classList.add("selected");
      grid.append(header);
    }
    for (let hour = 8; hour < 23; hour++) {
      const time = String(hour).padStart(2, "0") + ":00";
      const next = String(hour + 1).padStart(2, "0") + ":00";
      const timeLabel = document.createElement("div");
      timeLabel.className = "plan-mini-hour";
      timeLabel.textContent = time;
      grid.append(timeLabel);
      for (const day of days) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "plan-mini-slot";
        cell.dataset.date = day.date;
        cell.dataset.hour = time;
        const overlapping = blocks.filter(b => b.fecha === day.date && b.inicio < next && b.fin > time);
        cell.textContent = overlapping.length ? overlapping.map(b => b.motivo).join(", ") : "+";
        cell.title = overlapping.length ? overlapping.map(b => b.inicio + "–" + b.fin + " " + b.motivo).join("; ") : "Bloquear " + day.label + " a las " + time;
        cell.setAttribute("aria-label", cell.title);
        if (overlapping.length) cell.classList.add("occupied");
        if (selectedSlot && selectedSlot.date === day.date && selectedSlot.hour === time) cell.classList.add("selected");
        cell.addEventListener("click", () => {
          blockDate.value = day.date;
          document.getElementById("plan-block-start").value = time;
          document.getElementById("plan-block-end").value = next;
          selectedSlot = { date: day.date, hour: time };
          renderBlocks();
          blockFeedback.textContent = "Seleccionado " + day.label + " de " + time + " a " + next + ". Puedes ampliar las horas y escribir el motivo.";
        });
        grid.append(cell);
      }
    }
    blockCalendar.append(grid);
    const list = document.createElement("div");
    list.className = "plan-mini-block-list";
    for (const day of days) {
      for (const b of blocks.filter(x => x.fecha === day.date).sort((x, y) => x.inicio.localeCompare(y.inicio))) {
        const item = document.createElement("div");
        item.className = "plan-block-item";
        const detail = document.createElement("span");
        detail.textContent = day.label + " · " + b.inicio + "–" + b.fin + " · " + b.motivo;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Quitar";
        remove.setAttribute("aria-label", "Quitar " + b.motivo + " del " + day.label);
        remove.addEventListener("click", () => {
          blocks = blocks.filter(x => x.id !== b.id);
          selectedSlot = null;
          persistBlocks();
          renderBlocks();
          blockFeedback.textContent = "Compromiso eliminado.";
        });
        item.append(detail, remove);
        list.append(item);
      }
    }
    blockCalendar.append(list);
  }

  dateInput.addEventListener("change", () => { selectedSlot = null; renderBlocks(); });
  blockDate.addEventListener("change", () => { selectedSlot = null; renderBlocks(); });
  blockForm.addEventListener("submit", event => {
    event.preventDefault();
    const fecha = blockDate.value;
    const inicio = document.getElementById("plan-block-start").value;
    const fin = document.getElementById("plan-block-end").value;
    const motivo = document.getElementById("plan-block-reason").value.trim();
    if (!weekDates().some(d => d.date === fecha) || !inicio || !fin || inicio >= fin || !motivo) {
      blockFeedback.textContent = "Comprueba el día, las horas y el motivo.";
      return;
    }
    blocks.push({ id: String(Date.now()) + "-" + Math.random(), fecha, inicio, fin, motivo });
    persistBlocks();
    selectedSlot = null;
    renderBlocks();
    blockFeedback.textContent = "Franja bloqueada. Se tendrá en cuenta al generar el horario.";
    document.getElementById("plan-block-reason").value = "";
  });
  renderBlocks();

  function guardarPlan(plan) {
    if (!storageKey) return;
    try {
      const parametros = Object.fromEntries(fields.map(id => [id, document.getElementById(id).value]));
      localStorage.setItem(storageKey, JSON.stringify({ parametros, plan }));
    } catch (_) {
      feedback.textContent = "Horario generado, pero el navegador no permite guardarlo.";
    }
  }

  function restaurarPlan() {
    if (!storageKey) return;
    try {
      const guardado = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!guardado || !guardado.plan || !Array.isArray(guardado.plan.dias) || guardado.plan.dias.length !== 7) return;
      for (const id of fields) {
        if (typeof guardado.parametros?.[id] === "string") document.getElementById(id).value = guardado.parametros[id];
      }
      renderBlocks();
      render(guardado.plan);
      feedback.textContent = "Último horario recuperado. Si cambiaste asignaturas u objetivos, vuelve a generarlo.";
    } catch (_) {
      // Un almacenamiento vacío o dañado no impide generar un horario nuevo.
    }
  }

  function text(tag, value, className) {
    const node = document.createElement(tag);
    node.textContent = value;
    if (className) node.className = className;
    return node;
  }

  function render(plan) {
    week.replaceChildren();
    summary.textContent = plan.total_sesiones
      ? plan.total_sesiones + " sesiones · " + (plan.dias.reduce((total, day) => total + day.sesiones.reduce((minutes, session) => { 
          const [h1, m1] = session.inicio.split(":").map(Number);
          const [h2, m2] = session.fin.split(":").map(Number);
          return minutes + (h2 * 60 + m2) - (h1 * 60 + m1);
        }, 0), 0) / 60).toLocaleString("es-ES", { maximumFractionDigits: 2 }) + " horas planificadas"
      : "No se han encontrado sesiones. Añade asignaturas o amplía la franja horaria.";
    const faltan = Object.values(plan.deficit_minutos_por_asignatura || {}).reduce((a, b) => a + b, 0)
      + Object.values(plan.deficit_minutos_por_actividad || {}).reduce((a, b) => a + b, 0);
    if (faltan) summary.textContent += " · No han cabido " + faltan + " minutos de los objetivos semanales.";
    for (const day of plan.dias) {
      const card = document.createElement("section");
      card.className = "plan-day";
      card.append(text("h3", day.dia + " · " + day.fecha));
      if (day.libre) card.append(text("p", "Día bloqueado en tu horario", "plan-empty"));
      for (const b of (day.bloqueos || [])) {
        const block = document.createElement("div");
        block.className = "plan-session plan-block-result";
        block.append(text("span", b.inicio + "–" + b.fin, "plan-session-time"));
        block.append(text("strong", b.motivo));
        card.append(block);
      }
      if (!day.libre && !day.sesiones.length) card.append(text("p", "Sin sesiones", "plan-empty"));
      for (const session of day.sesiones) {
        const block = document.createElement("div");
        block.className = "plan-session";
        block.append(text("span", session.inicio + "–" + session.fin, "plan-session-time"));
        block.append(text("strong", session.asignatura));
        if (session.actividad) block.append(text("small", session.tipo + ": " + session.actividad));
        card.append(block);
      }
      week.append(card);
    }
  }

  restaurarPlan();

  form.addEventListener("submit", async event => {
    event.preventDefault();
    feedback.textContent = "Generando horario…";
    const params = {
      inicio: dateInput.value,
      desde: document.getElementById("plan-desde").value,
      hasta: document.getElementById("plan-hasta").value,
      duracion: document.getElementById("plan-duracion").value,
      descanso: document.getElementById("plan-descanso").value,
      bloqueos: blocks.filter(b => weekDates().some(d => d.date === b.fecha)).map(({ fecha, inicio, fin, motivo }) => ({ fecha, inicio, fin, motivo }))
    };
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const response = await fetch("/api/plan/semana", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(params) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo generar el plan.");
      render(data);
      feedback.textContent = "Horario generado y conservado en este navegador.";
      guardarPlan(data);
    } catch (error) {
      feedback.textContent = error.message || "No se pudo conectar con el servidor.";
    } finally {
      button.disabled = false;
    }
  });
})();

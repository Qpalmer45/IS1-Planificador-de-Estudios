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
      if (!guardado || !guardado.plan || !Array.isArray(guardado.plan.dias)) return;
      for (const id of fields) {
        if (typeof guardado.parametros?.[id] === "string") document.getElementById(id).value = guardado.parametros[id];
      }
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
      ? plan.total_sesiones + " sesiones · " + plan.total_sesiones * Number(document.getElementById("plan-duracion").value) / 60 + " horas planificadas"
      : "No se han encontrado sesiones. Añade asignaturas o amplía la franja horaria.";
    const faltan = Object.values(plan.deficit_minutos_por_asignatura || {}).reduce((a, b) => a + b, 0)
      + Object.values(plan.deficit_minutos_por_actividad || {}).reduce((a, b) => a + b, 0);
    if (faltan) summary.textContent += " · No han cabido " + faltan + " minutos de los objetivos semanales.";
    for (const day of plan.dias) {
      const card = document.createElement("section");
      card.className = "plan-day";
      card.append(text("h3", day.dia + " · " + day.fecha));
      if (day.libre) card.append(text("p", "Día bloqueado en tu horario", "plan-empty"));
      else if (!day.sesiones.length) card.append(text("p", "Sin sesiones", "plan-empty"));
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
    const params = new URLSearchParams({
      inicio: dateInput.value,
      desde: document.getElementById("plan-desde").value,
      hasta: document.getElementById("plan-hasta").value,
      duracion: document.getElementById("plan-duracion").value,
      descanso: document.getElementById("plan-descanso").value
    });
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const response = await fetch("/api/plan/semana?" + params, { credentials: "same-origin" });
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

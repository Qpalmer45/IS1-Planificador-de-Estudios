// HU04 comparte el cliente JSON y los recordatorios de app.js.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tarea-form");
  const campos = document.getElementById("tarea-campos");
  const encabezado = document.getElementById("tarea-form-heading");
  const guardar = document.getElementById("tarea-guardar");
  const cancelar = document.getElementById("tarea-cancelar");
  const estado = document.getElementById("tarea-estado");
  const reintentar = document.getElementById("tarea-reintentar");
  const lista = document.getElementById("tarea-lista");
  const vacia = document.getElementById("tarea-vacia");
  let actividades = [];
  let editando = null;

  const fecha = form.elements.fecha_limite;
  const formatoLocal = new Intl.DateTimeFormat("sv-SE", {
    timeZone: form.dataset.zona, year: "numeric", month: "2-digit", day: "2-digit",
  });

  function actualizarFecha() {
    const hoy = formatoLocal.format(new Date());
    const conservaFecha = editando && fecha.value === editando.fecha_limite && fecha.value < hoy;
    fecha.min = conservaFecha ? editando.fecha_limite : hoy;
    fecha.setCustomValidity(fecha.validity.rangeUnderflow ? "La fecha debe ser hoy o posterior." : "");
  }

  async function cargarAsignaturas() {
    try {
      const materias = await api("/api/asignaturas");
      const selector = form.elements.asignatura_id;
      const seleccionado = selector.value;
      selector.replaceChildren(new Option("Sin asignatura", ""));
      for (const materia of materias) selector.add(new Option(materia.nombre, String(materia.id)));
      selector.value = seleccionado;
    } catch (error) {
      estado.textContent = "No se pudieron cargar las asignaturas: " + error.message;
    }
  }

  function actualizarCamposExamen() {
    const examen = form.elements.tipo.value === "examen";
    const total = document.getElementById("tarea-tiempo-total");
    const semanal = document.getElementById("tarea-tiempo-semanal");
    total.hidden = examen;
    semanal.hidden = examen;
    form.elements.minutos_estimados.disabled = examen;
    form.elements.minutos_semanales.disabled = examen;
    if (examen) {
      form.elements.minutos_estimados.value = "1";
      form.elements.minutos_semanales.value = "0";
      form.elements.asignatura_id.required = true;
    } else {
      form.elements.minutos_estimados.disabled = false;
      form.elements.minutos_semanales.disabled = false;
      form.elements.asignatura_id.required = false;
    }
  }

  function actualizarEtiqueta() {
    document.getElementById("tarea-etiqueta-fecha").textContent =
      form.elements.tipo.value === "examen" ? "Día del examen" : "Fecha límite";
  }

  function bloquear(ocupado) {
    campos.disabled = ocupado;
    guardar.disabled = ocupado;
    cancelar.disabled = ocupado;
    reintentar.disabled = ocupado;
    lista.querySelectorAll("button").forEach(boton => { boton.disabled = ocupado; });
  }

  function prepararFormulario(actividad) {
    editando = actividad;
    form.reset();
    if (actividad) {
      for (const campo of campos.querySelectorAll("[name]")) {
        campo.value = actividad[campo.name] ?? "";
      }
    }
    actualizarEtiqueta();
    actualizarCamposExamen();
    actualizarFecha();
    encabezado.textContent = actividad ? "Editar actividad" : "Nueva actividad";
    guardar.textContent = actividad ? "Guardar cambios" : "Crear actividad";
    cancelar.hidden = !actividad;
    form.elements.titulo.focus();
  }

  function dibujar() {
    lista.replaceChildren();
    vacia.hidden = actividades.length > 0;
    actividades.sort((a, b) => a.fecha_limite.localeCompare(b.fecha_limite) || a.id - b.id);
    for (const actividad of actividades) {
      const fila = document.createElement("li");
      fila.className = "subject-list-item";
      const detalle = document.createElement("div");
      const titulo = document.createElement("strong");
      titulo.className = "subject-list-name";
      titulo.textContent = actividad.titulo;
      const resumen = document.createElement("small");
      const [anio, mes, dia] = actividad.fecha_limite.split("-");
      const tipo = actividad.tipo.charAt(0).toUpperCase() + actividad.tipo.slice(1);
      resumen.textContent = tipo + " · " + dia + "/" + mes + "/" + anio + " · " + actividad.minutos_estimados + " min · " + (actividad.minutos_semanales || 0) + " min/semana";
      detalle.append(titulo, resumen);

      const acciones = document.createElement("div");
      acciones.className = "subject-actions";
      for (const accion of ["Editar", "Eliminar"]) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "secondary-btn";
        boton.textContent = accion;
        boton.setAttribute("aria-label", accion + " " + actividad.titulo);
        boton.addEventListener("click", () => {
          if (accion === "Eliminar") eliminar(actividad);
          else {
            estado.textContent = "";
            prepararFormulario(actividad);
          }
        });
        acciones.append(boton);
      }
      fila.append(detalle, acciones);
      lista.append(fila);
    }
  }

  async function cargar() {
    bloquear(true);
    try {
      const datos = await api("/api/tareas");
      if (!datos) return;
      actividades = datos;
      dibujar();
      estado.textContent = "";
      reintentar.hidden = true;
    } catch (error) {
      estado.textContent = error.message;
      reintentar.hidden = false;
    } finally {
      bloquear(false);
    }
  }

  async function eliminar(actividad) {
    if (!window.confirm("¿Eliminar «" + actividad.titulo + "»?")) return;
    bloquear(true);
    try {
      await api("/api/tareas/" + actividad.id, { method: "DELETE" });
      actividades = actividades.filter(item => item.id !== actividad.id);
      if (editando?.id === actividad.id) prepararFormulario(null);
      dibujar();
      estado.textContent = "Actividad eliminada.";
      cargarRecordatorios();
    } catch (error) {
      estado.textContent = error.message;
      reintentar.hidden = false;
    } finally {
      bloquear(false);
    }
  }

  form.elements.tipo.addEventListener("change", actualizarCamposExamen);
  cargarAsignaturas();
  document.querySelector('[data-tab="tareas"]')?.addEventListener("click", cargarAsignaturas);
  form.addEventListener("submit", async evento => {
    evento.preventDefault();
    if (guardar.disabled) return;
    actualizarFecha();
    if (!form.reportValidity()) return;
    const datos = Object.fromEntries(new FormData(form));
    if (datos.asignatura_id) datos.asignatura_id = Number(datos.asignatura_id);
    else delete datos.asignatura_id;
    if (form.elements.tipo.value === "examen") {
      datos.minutos_estimados = 1;
      datos.minutos_semanales = 0;
    }
    datos.titulo = datos.titulo.trim();
    datos.minutos_estimados = Number(datos.minutos_estimados);
    datos.minutos_semanales = Number(datos.minutos_semanales);
    const ruta = editando ? "/api/tareas/" + editando.id : "/api/tareas";
    if (editando) {
      for (const campo of Object.keys(datos)) {
        if (datos[campo] === editando[campo]) delete datos[campo];
      }
      if (!Object.keys(datos).length) {
        prepararFormulario(null);
        estado.textContent = "No había cambios que guardar.";
        return;
      }
    }
    bloquear(true);
    try {
      const actividad = await api(ruta, {
        method: editando ? "PATCH" : "POST", body: JSON.stringify(datos),
      });
      if (!actividad) return;
      estado.textContent = editando ? "Cambios guardados." : "Actividad creada.";
      actividades = actividades.filter(item => item.id !== actividad.id);
      actividades.push(actividad);
      dibujar();
      prepararFormulario(null);
      cargarRecordatorios();
    } catch (error) {
      estado.textContent = error.message;
    } finally {
      bloquear(false);
    }
  });

  cancelar.addEventListener("click", () => {
    prepararFormulario(null);
    estado.textContent = "";
  });
  form.elements.tipo.addEventListener("change", actualizarEtiqueta);
  fecha.addEventListener("input", actualizarFecha);
  fecha.addEventListener("change", actualizarFecha);
  fecha.addEventListener("focus", actualizarFecha);
  window.addEventListener("focus", actualizarFecha);
  actualizarFecha();
  reintentar.addEventListener("click", cargar);
  cargar();
});

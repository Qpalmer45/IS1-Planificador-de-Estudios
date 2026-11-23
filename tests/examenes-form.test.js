import {test, expect} from "@jest/globals";
import {JSDOM} from "jsdom";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync("templates/index.html", "utf8");
const css = fs.readFileSync("static/style.css", "utf8");
const tareas = fs.readFileSync("static/tareas.js", "utf8");

test("el módulo de tareas y entregas tiene sintaxis JavaScript válida", () => {
  expect(() => new vm.Script(tareas, {filename: "static/tareas.js"})).not.toThrow();
});

test("carga asignaturas, crea una actividad asignada y permite quitarle la asignatura", async () => {
  const dom = new JSDOM(`<!doctype html><form id="tarea-form" data-zona="Europe/Madrid">
    <h3 id="tarea-form-heading"></h3>
    <fieldset id="tarea-campos">
      <input name="titulo" required>
      <select name="tipo"><option value="tarea">Tarea</option><option value="entrega">Entrega</option><option value="examen">Examen</option></select>
      <select name="asignatura_id"><option value="">Sin asignatura</option></select>
      <input type="date" name="fecha_limite" required>
      <label id="tarea-tiempo-total"><input type="number" name="minutos_estimados" value="60" required></label>
      <label id="tarea-tiempo-semanal"><input type="number" name="minutos_semanales" value="0" required></label>
    </fieldset>
    <p id="tarea-aviso-examen" hidden></p>
    <span id="tarea-etiqueta-fecha"></span>
    <button id="tarea-guardar" type="submit"></button>
    <button id="tarea-cancelar" type="button"></button>
  </form>
  <p id="tarea-estado"></p><button id="tarea-reintentar"></button>
  <ul id="tarea-lista"></ul><p id="tarea-vacia"></p>`, {url: "http://localhost/"});
  const {window} = dom;
  const llamadas = [];
  let actividadActual;
  window.api = async (ruta, opciones = {}) => {
    llamadas.push([ruta, opciones]);
    if (ruta === "/api/asignaturas") return [{id: 9, nombre: "Álgebra"}];
    if (ruta === "/api/tareas" && !opciones.method) return actividadActual ? [actividadActual] : [];
    if (ruta === "/api/tareas" && opciones.method === "POST") {
      actividadActual = {id: 30, ...JSON.parse(opciones.body)};
      return actividadActual;
    }
    if (ruta === "/api/tareas/30" && opciones.method === "PATCH") {
      actividadActual = {...actividadActual, ...JSON.parse(opciones.body)};
      return actividadActual;
    }
    throw new Error("Ruta inesperada: " + ruta);
  };
  window.cargarRecordatorios = () => {};
  vm.runInContext(tareas, vm.createContext(window));

  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const form = window.document.getElementById("tarea-form");
    const selector = form.elements.asignatura_id;
    expect([...selector.options].map(opcion => opcion.value)).toContain("9");

    form.elements.titulo.value = "Práctica";
    selector.value = "9";
    form.elements.fecha_limite.value = form.elements.fecha_limite.min;
    form.dispatchEvent(new window.Event("submit", {bubbles: true, cancelable: true}));
    await new Promise(resolve => setTimeout(resolve, 0));

    const creacion = llamadas.find(([ruta, opciones]) => ruta === "/api/tareas" && opciones.method === "POST");
    expect(JSON.parse(creacion[1].body).asignatura_id).toBe(9);
    expect(window.document.querySelector("#tarea-lista").textContent).toContain("Práctica");

    window.document.querySelector('[aria-label="Editar Práctica"]').click();
    selector.value = "";
    form.dispatchEvent(new window.Event("submit", {bubbles: true, cancelable: true}));
    await new Promise(resolve => setTimeout(resolve, 0));

    const edicion = llamadas.find(([ruta, opciones]) => ruta === "/api/tareas/30" && opciones.method === "PATCH");
    expect(edicion).toBeDefined();
    expect(JSON.parse(edicion[1].body).asignatura_id).toBeNull();
    expect(actividadActual.asignatura_id).toBeNull();
  } finally {
    window.close();
  }
});

test("los exámenes disponen de selector de asignatura y controles de horas identificables", () => {
  const document = new JSDOM(html).window.document;
  expect(document.querySelector('#tarea-form [name="asignatura_id"]')).not.toBeNull();
  expect(document.querySelector("#tarea-tiempo-total")).not.toBeNull();
  expect(document.querySelector("#tarea-tiempo-semanal")).not.toBeNull();
  expect(tareas).toContain("form.elements.minutos_estimados.disabled = examen");
  expect(tareas).toContain("form.elements.minutos_semanales.disabled = examen");
  expect(tareas).toContain("form.elements.asignatura_id.required = true");
});

test("los formularios de asignaturas y tareas son adaptables", () => {
  expect(css).toContain("#subject-form.new-todo-form { display:grid");
  expect(css).toContain("#tarea-form fieldset { display:grid");
  expect(css).toContain("#tarea-form fieldset label[hidden] { display:none !important; }");
  expect(css).toContain("@media(max-width:650px)");
});

test("el aviso de horas aparece solo en exámenes y explica dónde cambiarlas", () => {
  const document = new JSDOM(html).window.document;
  const aviso = document.getElementById("tarea-aviso-examen");
  expect(aviso).not.toBeNull();
  expect(aviso.hidden).toBe(true);
  expect(aviso.textContent).toContain("Mis asignaturas");
  expect(aviso.textContent).toContain("horas semanales");
  expect(tareas).toContain('document.getElementById("tarea-aviso-examen").hidden = !examen');
  expect(css).toContain(".exam-study-notice[hidden]");
});

test("al actualizar asignaturas no se mantiene una selección que ya no existe", () => {
  expect(tareas).toContain('if (selector.value !== seleccionado) selector.value = ""');
  const dom = new JSDOM('<select><option value="">Sin asignatura</option><option value="3">Álgebra</option></select>');
  const selector = dom.window.document.querySelector("select");
  selector.value = "3";
  const seleccionado = selector.value;
  selector.replaceChildren(new dom.window.Option("Sin asignatura", ""));
  selector.value = seleccionado;
  if (selector.value !== seleccionado) selector.value = "";
  expect(selector.value).toBe("");
});

test("el panel de recordatorios permite seleccionar antelación y guardar", () => {
  const document = new JSDOM(html).window.document;
  const form = document.getElementById("recordatorios-config-form");
  const select = document.getElementById("recordatorios-dias");
  expect(form).not.toBeNull();
  expect(select.value).toBe("7");
  expect([...select.options].map(o => o.value)).toEqual(["0", "1", "3", "7", "14", "30", "60"]);
  expect(form.querySelector('button[type="submit"]')).not.toBeNull();
  expect(document.getElementById("recordatorios-config-estado").getAttribute("aria-live")).toBe("polite");
});

import {test, expect} from "@jest/globals";
import {JSDOM} from "jsdom";
import fs from "node:fs";

const html = fs.readFileSync("templates/index.html", "utf8");
const css = fs.readFileSync("static/style.css", "utf8");
const tareas = fs.readFileSync("static/tareas.js", "utf8");

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

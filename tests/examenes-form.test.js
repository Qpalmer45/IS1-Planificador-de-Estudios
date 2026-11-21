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

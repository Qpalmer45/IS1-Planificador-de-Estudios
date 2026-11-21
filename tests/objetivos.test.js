/** Pruebas de los campos de dedicación semanal en formularios. */
import { test, expect } from "@jest/globals";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const template = fs.readFileSync("templates/index.html", "utf8");
const jsSubjects = fs.readFileSync("static/app.js", "utf8");
const jsTasks = fs.readFileSync("static/tareas.js", "utf8");

test("crear asignatura ofrece un objetivo semanal numérico editable", () => {
  const dom = new JSDOM(template);
  const input = dom.window.document.querySelector("#subject-weekly-minutes");
  expect(input).not.toBeNull();
  expect(input.type).toBe("number");
  expect(input.min).toBe("0");
  expect(input.max).toBe("10080");
  expect(input.value).toBe("0");
  expect(jsSubjects).toContain("payload = { nombre, minutos_semanales:");
  expect(jsSubjects).toContain("patchBody = { nombre: input.value, minutos_semanales:");
});

test("crear y editar actividades incluye el objetivo semanal", () => {
  const dom = new JSDOM(template);
  const input = dom.window.document.querySelector('#tarea-form [name="minutos_semanales"]');
  expect(input).not.toBeNull();
  expect(input.type).toBe("number");
  expect(input.value).toBe("0");
  expect(jsTasks).toContain("datos.minutos_semanales = Number(datos.minutos_semanales)");
});

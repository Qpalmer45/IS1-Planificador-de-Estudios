import { test, expect, jest } from "@jest/globals";
import { JSDOM } from "jsdom";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("static/app.js", "utf8");
const begin = source.indexOf("function editAsignatura(");
const end = source.indexOf("\n/**", begin + 10);
const editFunction = source.slice(begin, end === -1 ? undefined : end);

test("editar asignatura muestra los minutos semanales y guarda todos los campos", async () => {
  const dom = new JSDOM("<ul><li id='materia'></li></ul>");
  const { document, Event } = dom.window;
  const api = jest.fn().mockResolvedValue({});
  const loadAsignaturas = jest.fn().mockResolvedValue();
  const context = vm.createContext({
    document, api, loadAsignaturas,
    clearSubjectFeedback: jest.fn(),
    showSubjectFeedback: jest.fn(),
    renderSubjects: jest.fn()
  });
  vm.runInContext(editFunction + "\nthis.editAsignatura = editAsignatura;", context);
  context.editAsignatura({
    id: 8, nombre: "Álgebra", dificultad: "media",
    prioridad: "alta", minutos_semanales: 120
  }, document.getElementById("materia"));
  const form = document.querySelector(".subject-edit-form");
  expect(form).not.toBeNull();
  const minutes = form.querySelector('input[type="number"]');
  expect(minutes.value).toBe("120");
  minutes.value = "180";
  form.querySelector('input[type="text"]').value = "Álgebra II";
  form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  await new Promise(resolve => setImmediate(resolve));
  expect(api).toHaveBeenCalledWith("/api/asignaturas/8", {
    method: "PATCH",
    body: JSON.stringify({ nombre: "Álgebra II", minutos_semanales: 180 })
  });
  expect(loadAsignaturas).toHaveBeenCalledTimes(1);
  dom.window.close();
});

test("cancelar la edición devuelve la lista", () => {
  const dom = new JSDOM("<li id='materia'></li>");
  const { document } = dom.window;
  const renderSubjects = jest.fn();
  const context = vm.createContext({
    document, api: jest.fn(), loadAsignaturas: jest.fn(),
    clearSubjectFeedback: jest.fn(), showSubjectFeedback: jest.fn(), renderSubjects
  });
  vm.runInContext(editFunction + "\nthis.editAsignatura = editAsignatura;", context);
  context.editAsignatura({ id: 1, nombre: "Cálculo", minutos_semanales: 90 },
    document.getElementById("materia"));
  [...document.querySelectorAll("button")].find(b => b.textContent === "Cancelar").click();
  expect(renderSubjects).toHaveBeenCalledTimes(1);
  dom.window.close();
});

import { test, expect } from "@playwright/test";
test("registro, login, tareas, recarga y cierre de sesión", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Joaquín");
  const email = `test-${Date.now()}@example.com`;
  await page.getByLabel("Correo electrónico").fill(email);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Mi-clave-de-prueba");
  await page.getByLabel("Repite la contraseña").fill("No-coincide");
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page.getByRole("alert")).toContainText("no coinciden");
  await page.getByLabel("Repite la contraseña").fill("Mi-clave-de-prueba");
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page.getByRole("status")).toContainText("Cuenta creada");
  await page.getByLabel("Correo electrónico").fill(email);
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("Mi-clave-de-prueba");
  await page.getByRole("button", { name: "Entrar a mi espacio" }).click();
  await expect(
    page.getByRole("heading", { name: "Hola, Joaquín." }),
  ).toBeVisible();
  await page.getByLabel("Nueva tarea").fill("Preparar la review");
  await page.getByRole("button", { name: "Añadir", exact: true }).click();
  await page
    .getByRole("button", { name: "Editar: Preparar la review", exact: true })
    .click();
  await page.getByLabel("Editar título").fill("Preparar la demo");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Completar: Preparar la demo" })
    .click();
  await expect(page.getByRole("checkbox")).toBeChecked();
  await page.getByRole("button", { name: "Pendientes", exact: true }).click();
  await expect(page.getByText("No hay tareas en esta vista.")).toBeVisible();
  await page.getByRole("button", { name: "Completadas", exact: true }).click();
  await expect(
    page.getByText("Preparar la demo", { exact: true }),
  ).toBeVisible();
  await page.getByRole("checkbox").click();
  await expect(page.getByText("No hay tareas en esta vista.")).toBeVisible();
  await page.getByRole("button", { name: "Todas", exact: true }).click();
  await page.reload();
  await expect(
    page.getByText("Preparar la demo", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/tasks-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Añadir", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/tasks-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Eliminar: Preparar la demo", exact: true })
    .click();
  await page.getByRole("button", { name: "Sí, eliminar", exact: true }).click();
  await expect(page.getByText("Aquí empieza tu próximo paso.")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(
    page.getByRole("button", { name: "Entrar a mi espacio" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Entrar a mi espacio" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/login-mobile.png",
    fullPage: true,
  });
});

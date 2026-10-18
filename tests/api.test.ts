import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../server/app.js";
import { testDatabase } from "./database.js";
import { tokenHash } from "../server/security.js";
let database: Awaited<ReturnType<typeof testDatabase>>;
let app: ReturnType<typeof createApp>;
const header = {
  "X-Requested-With": "study-planner",
  Origin: "http://localhost:5173",
};
const alice = {
  name: "Ana",
  email: "ana@example.com",
  password: "Una-frase-2026",
};
beforeAll(async () => {
  database = await testDatabase();
  app = createApp(database.db, { origin: header.Origin, authLimit: 1000 });
}, 30000);
beforeEach(async () => {
  await database.db.query("TRUNCATE users CASCADE");
});
afterAll(async () => {
  await database.close();
});
async function account(email = alice.email) {
  const agent = request.agent(app);
  await agent
    .post("/api/auth/register")
    .set(header)
    .send({ ...alice, email })
    .expect(201);
  await agent
    .post("/api/auth/login")
    .set(header)
    .send({ email, password: alice.password })
    .expect(200);
  return agent;
}
describe("Registro y sesiones", () => {
  it("normaliza el correo, guarda hash y rechaza duplicados y datos inválidos", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .set(header)
      .send({ ...alice, email: " ANA@EXAMPLE.COM " })
      .expect(201);
    expect(response.body.user.email).toBe(alice.email);
    expect(response.body.user.password_hash).toBeUndefined();
    const { rows } = await database.db.query("SELECT password_hash FROM users");
    expect(rows[0].password_hash).not.toContain(alice.password);
    await request(app)
      .post("/api/auth/register")
      .set(header)
      .send(alice)
      .expect(409);
    await request(app)
      .post("/api/auth/register")
      .set(header)
      .send({ ...alice, email: "no", password: "123" })
      .expect(400);
    await request(app)
      .post("/api/auth/register")
      .set(header)
      .send({ ...alice, name: " " })
      .expect(400);
  });
  it("inicia, restaura e invalida la sesión al salir", async () => {
    const agent = await account();
    const response = await agent.get("/api/auth/me").expect(200);
    expect(response.body.user.name).toBe("Ana");
    const login = await agent
      .post("/api/auth/login")
      .set(header)
      .send(alice)
      .expect(200);
    const cookie = login.headers["set-cookie"][0];
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    const raw = cookie.split(";")[0];
    const appRestarted = createApp(database.db, { origin: header.Origin });
    await request(appRestarted)
      .get("/api/auth/me")
      .set("Cookie", raw)
      .expect(200);
    await agent.post("/api/auth/logout").set(header).expect(204);
    await request(appRestarted)
      .get("/api/auth/me")
      .set("Cookie", raw)
      .expect(401);
    await agent.get("/api/tasks").expect(401);
  });
  it("rechaza credenciales incorrectas y desconocidas con el mismo mensaje", async () => {
    await account();
    const a = await request(app)
      .post("/api/auth/login")
      .set(header)
      .send({ ...alice, password: "incorrecta" })
      .expect(401);
    const b = await request(app)
      .post("/api/auth/login")
      .set(header)
      .send({ email: "nadie@example.com", password: alice.password })
      .expect(401);
    expect(a.body).toEqual(b.body);
  });
  it("rechaza sesiones caducadas y rota el token al volver a entrar", async () => {
    const agent = await account();
    const first = await agent.post("/api/auth/login").set(header).send(alice);
    const cookie = first.headers["set-cookie"][0].split(";")[0];
    await agent.post("/api/auth/login").set(header).send(alice).expect(200);
    await request(app).get("/api/auth/me").set("Cookie", cookie).expect(401);
    await database.db.query(
      "UPDATE sessions SET expires_at = NOW() - INTERVAL '1 day'",
    );
    await agent.get("/api/auth/me").expect(401);
  });
  it("requiere protección CSRF y aplica el límite de intentos", async () => {
    await request(app).post("/api/auth/register").send(alice).expect(403);
    await request(app)
      .post("/api/auth/register")
      .set({ ...header, Origin: "https://otro.example" })
      .send(alice)
      .expect(403);
    const limited = createApp(database.db, {
      origin: header.Origin,
      authLimit: 1,
    });
    await request(limited)
      .post("/api/auth/login")
      .set(header)
      .send(alice)
      .expect(401);
    await request(limited)
      .post("/api/auth/login")
      .set(header)
      .send(alice)
      .expect(429);
  });
  it("marca Secure en producción y almacena solo el hash del token", async () => {
    await account();
    const production = createApp(database.db, {
      origin: "https://study.example",
      production: true,
    });
    const result = await request(production)
      .post("/api/auth/login")
      .set({ ...header, Origin: "https://study.example" })
      .send(alice)
      .expect(200);
    const cookie = result.headers["set-cookie"][0];
    expect(cookie).toContain("Secure");
    const token = cookie.split(";")[0].split("=")[1];
    const { rows } = await database.db.query(
      "SELECT * FROM sessions WHERE token_hash=$1",
      [tokenHash(token)],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].token_hash).not.toBe(token);
  });
});
describe("Tareas personales", () => {
  it("crea, lista, edita, completa, desmarca y elimina tareas persistentes", async () => {
    const agent = await account();
    const added = await agent
      .post("/api/tasks")
      .set(header)
      .send({ title: "  Estudiar EA  " })
      .expect(201);
    const id = added.body.task.id;
    expect(added.body.task.title).toBe("Estudiar EA");
    await agent
      .patch(`/api/tasks/${id}`)
      .set(header)
      .send({ title: "Repasar grupos", completed: true })
      .expect(200);
    const listed = await agent.get("/api/tasks").expect(200);
    expect(listed.body.tasks[0].completed).toBe(true);
    await agent
      .patch(`/api/tasks/${id}`)
      .set(header)
      .send({ completed: false })
      .expect(200);
    await agent.post("/api/auth/logout").set(header).expect(204);
    await agent.post("/api/auth/login").set(header).send(alice).expect(200);
    const restored = await agent.get("/api/tasks").expect(200);
    expect(restored.body.tasks[0].title).toBe("Repasar grupos");
    await agent.delete(`/api/tasks/${id}`).set(header).expect(204);
    expect((await agent.get("/api/tasks")).body.tasks).toEqual([]);
  });
  it("aísla los datos de dos cuentas incluso con el id ajeno", async () => {
    const a = await account();
    const b = await account("bea@example.com");
    const added = await a
      .post("/api/tasks")
      .set(header)
      .send({ title: "Solo Ana" });
    const id = added.body.task.id;
    expect((await b.get("/api/tasks")).body.tasks).toEqual([]);
    await b
      .patch(`/api/tasks/${id}`)
      .set(header)
      .send({ title: "Intrusión" })
      .expect(404);
    await b.delete(`/api/tasks/${id}`).set(header).expect(404);
    expect((await a.get("/api/tasks")).body.tasks[0].title).toBe("Solo Ana");
    await request(app).get("/api/tasks").expect(401);
    await request(app)
      .post("/api/tasks")
      .set(header)
      .send({ title: "sin sesión" })
      .expect(401);
    await request(app)
      .patch(`/api/tasks/${id}`)
      .set(header)
      .send({ completed: true })
      .expect(401);
    await request(app).delete(`/api/tasks/${id}`).set(header).expect(401);
  });
  it("valida títulos, estado, JSON e identificadores", async () => {
    const agent = await account();
    for (const title of ["", "  ", "a".repeat(201)])
      await agent.post("/api/tasks").set(header).send({ title }).expect(400);
    const created = await agent
      .post("/api/tasks")
      .set(header)
      .send({ title: "<script>alert(1)</script>" })
      .expect(201);
    await agent
      .patch(`/api/tasks/${created.body.task.id}`)
      .set(header)
      .send({ completed: "sí" })
      .expect(400);
    await agent
      .patch(`/api/tasks/${created.body.task.id}`)
      .set(header)
      .send({})
      .expect(400);
    await agent.delete("/api/tasks/not-a-uuid").set(header).expect(400);
    await agent
      .post("/api/tasks")
      .set(header)
      .set("Content-Type", "application/json")
      .send("{")
      .expect(400);
  });
});

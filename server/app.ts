import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { resolve } from "node:path";
import type { Database } from "./db.js";
import {
  hashPassword,
  verifyPassword,
  tokenHash,
  newToken,
} from "./security.js";

const email = z.string().trim().toLowerCase().max(254).email();
const password = z.string().min(8).max(128);
const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email,
  password,
});
const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
const title = z.string().trim().min(1).max(200);
const taskSchema = z.object({ title });
const editSchema = z
  .object({ title: title.optional(), completed: z.boolean().optional() })
  .refine(
    (value) => value.title !== undefined || value.completed !== undefined,
  );
const cookieName = "study_session";
const sessionMs = 7 * 24 * 60 * 60 * 1000;

export function createApp(
  db: Database,
  options: {
    origin: string;
    production?: boolean;
    staticDir?: string;
    authLimit?: number;
  },
) {
  const app = express();
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: !!options.production,
    path: "/",
  };
  app.disable("x-powered-by");
  app.use(
    helmet({
      strictTransportSecurity: options.production ? undefined : false,
      contentSecurityPolicy: {
        directives: {
          "upgrade-insecure-requests": options.production ? [] : null,
        },
      },
    }),
  );
  app.use(express.json({ limit: "16kb" }));
  app.use(cookieParser());
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  // Browser mutations must originate on this app and carry a custom header.
  // No cross-origin CORS access is enabled. The header prevents form-based CSRF.
  app.use("/api", (req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      (req.get("X-Requested-With") !== "study-planner" ||
        (req.get("Origin") && req.get("Origin") !== options.origin))
    ) {
      res.status(403).json({ error: "Solicitud no permitida." });
      return;
    }
    next();
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: options.authLimit ?? 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.",
    },
  });
  app.use(["/api/auth/register", "/api/auth/login"], authLimiter);
  const auth: RequestHandler = async (req, res, next) => {
    const token = req.cookies[cookieName];
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      res.status(401).json({ error: "Inicia sesión para continuar." });
      return;
    }
    const { rows } = await db.query(
      `SELECT u.id, u.name, u.email FROM users u JOIN sessions s ON s.user_id = u.id
      WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [tokenHash(token)],
    );
    if (!rows[0]) {
      res.clearCookie(cookieName, cookieOptions);
      res
        .status(401)
        .json({ error: "Tu sesión ha caducado. Vuelve a iniciar sesión." });
      return;
    }
    res.locals.user = rows[0];
    next();
  };
  // A dummy hash makes unknown-account login perform the same expensive check.
  const dummyHash = hashPassword(newToken());
  app.post("/api/auth/register", async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          error:
            "Introduce un nombre, un correo válido y una contraseña de entre 8 y 128 caracteres.",
        });
      return;
    }
    const { name, email, password } = parsed.data;
    const result = await db.query(
      `INSERT INTO users (id,name,email,password_hash) VALUES ($1,$2,$3,$4)
      ON CONFLICT (email) DO NOTHING RETURNING id,name,email`,
      [randomUUID(), name, email, await hashPassword(password)],
    );
    if (!result.rows[0]) {
      res
        .status(409)
        .json({
          error:
            "No se ha podido crear la cuenta con ese correo. Prueba a iniciar sesión.",
        });
      return;
    }
    res.status(201).json({ user: result.rows[0] });
  });
  app.post("/api/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Introduce un correo válido y tu contraseña." });
      return;
    }
    const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [
      parsed.data.email,
    ]);
    const user = rows[0];
    const valid = await verifyPassword(
      parsed.data.password,
      user?.password_hash ?? (await dummyHash),
    );
    if (!user || !valid) {
      res.status(401).json({ error: "Correo o contraseña incorrectos." });
      return;
    }
    await db.query("DELETE FROM sessions WHERE expires_at <= NOW()");
    const previous = req.cookies[cookieName];
    if (typeof previous === "string")
      await db.query("DELETE FROM sessions WHERE token_hash = $1", [
        tokenHash(previous),
      ]);
    const token = newToken();
    await db.query(
      "INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,$3)",
      [tokenHash(token), user.id, new Date(Date.now() + sessionMs)],
    );
    res.cookie(cookieName, token, { ...cookieOptions, maxAge: sessionMs });
    res.json({ user: { id: user.id, name: user.name, email: user.email } });
  });
  app.get("/api/auth/me", auth, (_req, res) => {
    res.json({ user: res.locals.user });
  });
  app.post("/api/auth/logout", async (req, res) => {
    const token = req.cookies[cookieName];
    if (typeof token === "string")
      await db.query("DELETE FROM sessions WHERE token_hash = $1", [
        tokenHash(token),
      ]);
    res.clearCookie(cookieName, cookieOptions);
    res.status(204).end();
  });
  app.use("/api/tasks", auth);
  app.get("/api/tasks", async (_req, res) => {
    const { rows } = await db.query(
      "SELECT id,title,completed,created_at,updated_at FROM tasks WHERE user_id = $1 ORDER BY created_at DESC, id",
      [res.locals.user.id],
    );
    res.json({ tasks: rows });
  });
  app.post("/api/tasks", async (req, res) => {
    const parsed = taskSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "La tarea debe tener entre 1 y 200 caracteres." });
      return;
    }
    const { rows } = await db.query(
      `INSERT INTO tasks (id,user_id,title) VALUES ($1,$2,$3)
      RETURNING id,title,completed,created_at,updated_at`,
      [randomUUID(), res.locals.user.id, parsed.data.title],
    );
    res.status(201).json({ task: rows[0] });
  });
  app.param("id", (req, res, next, id) => {
    if (!z.string().uuid().safeParse(id).success) {
      res.status(400).json({ error: "Identificador no válido." });
      return;
    }
    next();
  });
  app.patch("/api/tasks/:id", async (req, res) => {
    const parsed = editSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "Indica un título válido o el estado de la tarea." });
      return;
    }
    const { rows } = await db.query(
      `UPDATE tasks SET title = COALESCE($1,title), completed = COALESCE($2,completed), updated_at = NOW()
      WHERE id = $3 AND user_id = $4 RETURNING id,title,completed,created_at,updated_at`,
      [
        parsed.data.title ?? null,
        parsed.data.completed ?? null,
        req.params.id,
        res.locals.user.id,
      ],
    );
    if (!rows[0]) {
      res.status(404).json({ error: "Tarea no encontrada." });
      return;
    }
    res.json({ task: rows[0] });
  });
  app.delete("/api/tasks/:id", async (req, res) => {
    const { rows } = await db.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
      [req.params.id, res.locals.user.id],
    );
    if (!rows[0]) {
      res.status(404).json({ error: "Tarea no encontrada." });
      return;
    }
    res.status(204).end();
  });
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Ruta no encontrada." });
  });
  if (options.staticDir) {
    app.use(express.static(resolve(options.staticDir)));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(resolve(options.staticDir!, "index.html"));
    });
  }
  const onError: ErrorRequestHandler = (error, _req, res, _next) => {
    if (
      error.type === "entity.parse.failed" ||
      error.type === "entity.too.large"
    ) {
      res
        .status(400)
        .json({ error: "Solicitud no válida o demasiado grande." });
      return;
    }
    console.error(
      "Request failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    res
      .status(500)
      .json({
        error: "No se ha podido completar la operación. Inténtalo de nuevo.",
      });
  };
  app.use(onError);
  return app;
}

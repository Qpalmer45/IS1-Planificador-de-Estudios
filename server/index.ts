import { connectDatabase, migrate } from "./db.js";
import { createApp } from "./app.js";
const production = process.env.NODE_ENV === "production";
const connectionString = process.env.DATABASE_URL;
if (!connectionString)
  throw new Error(
    "Falta DATABASE_URL. Copia .env.example a .env y configura PostgreSQL.",
  );
if (production && !process.env.APP_ORIGIN?.startsWith("https://"))
  throw new Error("En producción APP_ORIGIN debe utilizar HTTPS.");
const db = connectDatabase(connectionString);
await migrate(db);
const port = Number(process.env.PORT ?? 3001);
const server = createApp(db, {
  origin: process.env.APP_ORIGIN ?? "http://localhost:5173",
  production,
  staticDir: production ? "dist/client" : undefined,
}).listen(port, () =>
  console.log(`Servidor listo en http://localhost:${port}`),
);
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () =>
    server.close(() => {
      void db.end().then(() => process.exit(0));
    }),
  );
}

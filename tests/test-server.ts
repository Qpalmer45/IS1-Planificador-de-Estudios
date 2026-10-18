import { createApp } from "../server/app.js";
import { testDatabase } from "./database.js";
const database = await testDatabase();
const server = createApp(database.db, {
  origin: "http://127.0.0.1:5173",
  authLimit: 1000,
}).listen(3001, "127.0.0.1");
process.on("SIGTERM", () =>
  server.close(() => {
    void database.close();
  }),
);

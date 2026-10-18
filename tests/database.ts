import { PGlite } from "@electric-sql/pglite";
import { connectDatabase, migrate, type Database } from "../server/db.js";
export async function testDatabase() {
  // CI sets TEST_DATABASE_URL to exercise real PostgreSQL too.
  if (process.env.TEST_DATABASE_URL) {
    const pool = connectDatabase(process.env.TEST_DATABASE_URL);
    await migrate(pool);
    return { db: pool as Database, close: () => pool.end() };
  }
  const pglite = new PGlite();
  const db: Database = {
    query: async <T extends Record<string, unknown>>(
      sql: string,
      params?: unknown[],
    ) => {
      if (!params && sql.includes("CREATE TABLE")) {
        await pglite.exec(sql);
        return { rows: [] as T[] };
      }
      return pglite.query<T>(sql, params);
    },
  };
  await migrate(db);
  return { db, close: () => pglite.close() };
}

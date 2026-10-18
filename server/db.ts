import pg from "pg";
import { readFile } from "node:fs/promises";

// A small SQL boundary allows integration tests to run the same schema in PGlite.
export interface Database {
  query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<{ rows: T[] }>;
}
export function connectDatabase(connectionString: string) {
  return new pg.Pool({ connectionString });
}
export async function migrate(db: Database) {
  await db.query(
    await readFile(new URL("./schema.sql", import.meta.url), "utf8"),
  );
}

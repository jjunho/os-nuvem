import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "postgres://corealux@localhost:54329/corealux";

const globalForDb = globalThis as unknown as { pool?: pg.Pool };
export const pool = globalForDb.pool ?? new pg.Pool({ connectionString: url, max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export type Db = typeof db;

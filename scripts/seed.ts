import { limparTudo, semear } from "../app/db/seed.server";
import { pool } from "../app/db/client.server";

await limparTudo();
await semear();
await pool.end();
console.log("seeded");

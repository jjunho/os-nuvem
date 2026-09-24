import { limparTudo, semear } from "../app/db/seed.server";
import { pool } from "../app/db/client.server";

try {
  await limparTudo();
  await semear();
  console.log("seeded");
} finally {
  await pool.end();
}

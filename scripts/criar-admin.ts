import { criarPrimeiroAdmin, ErroAcesso } from "../app/modules/acesso/acesso.server";
import { pool } from "../app/db/client.server";

try {
  const argumentos = process.argv.slice(2);
  if (argumentos.length !== 3) throw new ErroAcesso('Uso: pnpm admin:criar "Nome" "email@exemplo.com" "senha"');
  await criarPrimeiroAdmin(argumentos[0], argumentos[1], argumentos[2]);
  console.log("Primeiro Admin criado");
} catch (erro) {
  console.error(erro instanceof ErroAcesso ? erro.message : "Não foi possível criar o Admin. Verifique o banco configurado em DATABASE_URL.");
  process.exitCode = 1;
} finally {
  await pool.end();
}

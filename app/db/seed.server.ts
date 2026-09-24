import { gerarHash } from "../modules/acesso/senha.server";
import { sql } from "drizzle-orm";
import { db } from "./client.server";
import { intermediarios, usuarios } from "./schema";

function exigirAmbienteDeSeed() {
  if (process.env.NODE_ENV === "production" && process.env.TEST_MODE !== "1") {
    throw new Error("Seed não permitido em produção");
  }
}

export async function limparTudo() {
  exigirAmbienteDeSeed();
  await db.execute(sql`truncate tentativas_entrada, notas, proximas_acoes, responsaveis, cadeia_comercial, viagem_contatos, viagens, contatos, intermediarios, usuarios restart identity cascade`);
}

export async function semear() {
  exigirAmbienteDeSeed();
  const senhaHash = await gerarHash("corealux123");
  await db.insert(usuarios).values([
    { nome: "Carlos", email: "carlos@corealux.com", senhaHash, papel: "admin" },
    { nome: "Lia", email: "lia@corealux.com", senhaHash, papel: "propostas" },
    { nome: "Lidiane", email: "lidiane@corealux.com", senhaHash, papel: "propostas" },
    { nome: "Jessica", email: "jessica@corealux.com", senhaHash, papel: "guiamento" },
    { nome: "Hyewon Ku (Helena)", email: "helena@corealux.com", senhaHash, papel: "admin" },
  ]);
  await db.insert(intermediarios).values([
    { nome: "Interep", tipo: "operadora", canalComercial: "operadora" },
    { nome: "Explore Travel", tipo: "agencia", canalComercial: "agencia" },
    { nome: "Luve Viagens", tipo: "agencia", canalComercial: "agencia" },
  ]);
}

import { sql } from "drizzle-orm";
import { db } from "./client.server";
import { intermediarios, usuarios } from "./schema";

export async function limparTudo() {
  await db.execute(sql`truncate notas, proximas_acoes, responsaveis, cadeia_comercial, viagem_contatos, viagens, contatos, intermediarios, usuarios restart identity cascade`);
}

export async function semear() {
  await db.insert(usuarios).values([
    { nome: "Carlos", papel: "admin" },
    { nome: "Lia", papel: "propostas" },
    { nome: "Lidiane", papel: "atendimento" },
    { nome: "Jessica", papel: "guiamento" },
  ]);
  await db.insert(intermediarios).values([
    { nome: "Interep", tipo: "operadora", canalComercial: "operadora" },
    { nome: "Explore Travel", tipo: "agencia", canalComercial: "agencia" },
    { nome: "Luve Viagens", tipo: "agencia", canalComercial: "agencia" },
  ]);
}

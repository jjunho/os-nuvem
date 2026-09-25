import { semearModelosEtapa } from "~/modules/viagens/tarefas-etapa.server";
import { semearTabelas } from "~/modules/tabelas/tabelas.server";
import { semearModelosResposta } from "~/modules/viagens/modelos-resposta.server";
import { semearOpcoes } from "~/modules/opcoes/opcoes.server";
import { gerarHash } from "../modules/acesso/senha.server";
import { sql } from "drizzle-orm";
import { db } from "./client.server";
import { intermediarios, usuarios, profissionais } from "./schema";

function exigirAmbienteDeSeed() {
  if (process.env.NODE_ENV === "production" && process.env.TEST_MODE !== "1") {
    throw new Error("Seed não permitido em produção");
  }
}

export async function limparTudo() {
  exigirAmbienteDeSeed();
  // SSE readers may still be finishing when the next browser fixture truncates.
  // PostgreSQL rolls a deadlocked TRUNCATE back atomically; retry only that case.
  for (let tentativa = 0; ; tentativa++) {
    try {
      await db.execute(
        sql`truncate sequencias_identificador, profissionais, versoes_referencia, tabelas_referencia, modelos_resposta, opcoes_conhecidas, tentativas_entrada, notas, tarefas, responsaveis, cadeia_comercial, viagem_contatos, viagens, contatos, intermediarios, usuarios,profissionais restart identity cascade`,
      );
      return;
    } catch (e) {
      const codigo = (e as { cause?: { code?: string } }).cause?.code;
      if (process.env.TEST_MODE !== "1" || codigo !== "40P01" || tentativa >= 2)
        throw e;
    }
  }
}

export async function semear() {
  exigirAmbienteDeSeed();
  await db
    .insert(profissionais)
    .values([
      {
        nome: "Carlos",
        papel: "guia",
        idiomas: ["pt", "ko", "en", "es", "fr"],
        especialidades: ["história", "cultura", "política"],
      },
      {
        nome: "Lia",
        papel: "guia",
        idiomas: ["pt", "ko", "en", "libras"],
        especialidades: ["arte", "cultura", "história"],
      },
      {
        nome: "Jessica",
        papel: "guia",
        idiomas: [],
        especialidades: ["BTS", "K-beauty"],
      },
    ])
    .onConflictDoNothing();
  await semearTabelas();
  await semearOpcoes();
  await semearModelosResposta();
  await semearModelosEtapa();
  const senhaHash = await gerarHash("corealux123");
  await db.insert(usuarios).values([
    { nome: "Carlos", email: "carlos@corealux.com", senhaHash, papel: "admin" },
    { nome: "Lia", email: "lia@corealux.com", senhaHash, papel: "propostas" },
    {
      nome: "Lidiane",
      email: "lidiane@corealux.com",
      senhaHash,
      papel: "propostas",
    },
    {
      nome: "Jessica",
      email: "jessica@corealux.com",
      senhaHash,
      papel: "guiamento",
    },
    {
      idiomaInterface: "ko",
      nome: "Hyewon Ku (Helena)",
      email: "helena@corealux.com",
      senhaHash,
      papel: "admin",
    },
  ]);
  await db.insert(intermediarios).values([
    { nome: "Interep", tipo: "operadora", canalComercial: "operadora" },
    { nome: "Explore Travel", tipo: "agencia", canalComercial: "agencia" },
    { nome: "Luve Viagens", tipo: "agencia", canalComercial: "agencia" },
  ]);
}

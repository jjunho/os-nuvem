import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  aceites,
  fatosEtapa,
  orcamentos,
  viagens,
  taxasElaboracao,
} from "~/db/schema";
import { registrarFato } from "~/modules/viagens/etapas.server";
import { concluirAutomaticas } from "~/modules/tarefas/tarefas.server";
export async function versoesParaAceite(viagemId: number) {
  return db
    .select({
      id: orcamentos.id,
      versao: orcamentos.versao,
      memoria: orcamentos.memoria,
    })
    .from(orcamentos)
    .where(
      and(eq(orcamentos.viagemId, viagemId), isNotNull(orcamentos.memoria)),
    )
    .orderBy(desc(orcamentos.versao));
}
export async function aceiteDaViagem(viagemId: number) {
  const [aceite] = await db
    .select()
    .from(aceites)
    .where(and(eq(aceites.viagemId, viagemId), isNull(aceites.anuladoEm)));
  return aceite ?? null;
}
export async function aceitarOpcao(
  viagemId: number,
  orcamentoId: number,
  opcaoId: string,
  autorId: number,
  agora: Date,
  aceitoEm: Date,
) {
  if (!Number.isFinite(aceitoEm.getTime()) || aceitoEm > agora)
    throw new Response("Data do aceite inválida", { status: 400 });
  return db.transaction(async (tx) => {
    await tx
      .select()
      .from(viagens)
      .where(eq(viagens.id, viagemId))
      .for("update");
    const [existente] = await tx
      .select()
      .from(aceites)
      .where(and(eq(aceites.viagemId, viagemId), isNull(aceites.anuladoEm)));
    if (existente)
      throw new Response(
        "Já existe um aceite. Corrija o fato anterior antes de registrar outro.",
        { status: 409 },
      );
    const [o] = await tx
      .select()
      .from(orcamentos)
      .where(
        and(eq(orcamentos.id, orcamentoId), eq(orcamentos.viagemId, viagemId)),
      );
    if (!o?.memoria)
      throw new Response("Selecione uma versão enviada", { status: 400 });
    const indice = o.memoria.dados.opcoes.findIndex((o) => o.id === opcaoId);
    if (indice < 0) throw new Response("Opção inválida", { status: 400 });
    const precoOriginal = Math.round(
      o.memoria.calculos[indice].enviado * (1 + o.memoria.condicoes.iva),
    );
    const [taxaPaga] = await tx
      .select()
      .from(taxasElaboracao)
      .where(eq(taxasElaboracao.viagemId, viagemId));
    if (
      o.memoria.dados.taxaElaboracao?.ativa &&
      (!taxaPaga || taxaPaga.pagaEm > aceitoEm)
    )
      throw new Response("Registre o pagamento da taxa antes do aceite", {
        status: 400,
      });
    const descontoElaboracao = Math.min(precoOriginal, taxaPaga?.valor ?? 0);
    const precoAcordado = precoOriginal - descontoElaboracao;
    await registrarFato(
      tx,
      viagemId,
      "aceite",
      autorId,
      agora,
      `${o.memoria.numero} · ${o.memoria.dados.opcoes[indice].nome}`,
    );
    const [fato] = await tx
      .select({ id: fatosEtapa.id })
      .from(fatosEtapa)
      .where(
        and(eq(fatosEtapa.viagemId, viagemId), eq(fatosEtapa.tipo, "aceite")),
      )
      .orderBy(desc(fatosEtapa.id))
      .limit(1);
    const [aceite] = await tx
      .insert(aceites)
      .values({
        viagemId,
        orcamentoId,
        opcaoId,
        precoAcordado,
        descontoElaboracao,
        aceitoEm,
        autorId,
        fatoId: fato.id,
      })
      .returning();
    await tx
      .update(orcamentos)
      .set({ estado: "aceito" })
      .where(eq(orcamentos.id, orcamentoId));
    await tx
      .update(viagens)
      .set({ semRespostaDesde: null })
      .where(eq(viagens.id, viagemId));
    await concluirAutomaticas(tx, viagemId, "followup", autorId, agora);
    return aceite;
  });
}

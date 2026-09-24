import { and, asc, eq, isNull, ne } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  aceites,
  orcamentos,
  fatosEtapa,
  responsaveis,
  tarefas,
  tarefasHistorico,
  usuarios,
  viagens,
} from "~/db/schema";
import { inferirEtapa, type TipoFatoEtapa } from "./etapas";
import { ETAPAS_ABERTAS } from "./regras";
import {
  cancelarAutomaticas,
  concluirAutomaticas,
} from "~/modules/tarefas/tarefas.server";
type Transacao = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Usuario = { id: number; papel: string };
/** Called in the same transaction as the domain fact (quote, sending or acceptance). */
export async function registrarFato(
  tx: Transacao,
  viagemId: number,
  tipo: TipoFatoEtapa,
  autorId: number | null,
  em: Date,
  motivo = "",
  corrigeId?: number,
) {
  const [viagem] = await tx
    .select()
    .from(viagens)
    .where(eq(viagens.id, viagemId))
    .for("update");
  if (!viagem) throw new Response("Viagem não encontrada", { status: 404 });
  if (
    ["perda", "descarte", "cancelamento", "correcao"].includes(tipo) &&
    !motivo.trim()
  )
    throw new Response("Informe o motivo", { status: 400 });
  if (tipo === "cancelamento" && viagem.etapa !== "confirmada")
    throw new Response("Somente uma viagem confirmada pode ser cancelada", {
      status: 400,
    });
  if (tipo !== "correcao" && !ETAPAS_ABERTAS.includes(viagem.etapa))
    throw new Response("Viagem encerrada", { status: 400 });
  const anteriores = await tx
    .select()
    .from(fatosEtapa)
    .where(eq(fatosEtapa.viagemId, viagemId));
  if (
    tipo === "correcao" &&
    (!anteriores.some((f) => f.id === corrigeId && f.tipo !== "correcao") ||
      anteriores.some((f) => f.corrigeId === corrigeId))
  )
    throw new Response("Fato inválido", { status: 400 });
  const [fato] = await tx
    .insert(fatosEtapa)
    .values({
      viagemId,
      tipo,
      autorId,
      em,
      motivo: motivo.trim(),
      corrigeId,
      etapaAnterior: viagem.etapa,
      etapaResultante: viagem.etapa,
    })
    .returning();
  if (tipo === "correcao") {
    const anulados = await tx
      .update(aceites)
      .set({ anuladoEm: em })
      .where(
        and(
          eq(aceites.viagemId, viagemId),
          eq(aceites.fatoId, corrigeId!),
          isNull(aceites.anuladoEm),
        ),
      )
      .returning({ orcamentoId: aceites.orcamentoId });
    if (
      anteriores.some(
        (f) =>
          f.id === corrigeId &&
          ["aceite", "mudancas", "pensando"].includes(f.tipo),
      )
    ) {
      const reabertas = await tx
        .update(tarefas)
        .set({ estado: "aberta", concluidaEm: null })
        .where(
          and(
            eq(tarefas.viagemId, viagemId),
            eq(tarefas.tipo, "followup"),
            eq(tarefas.estado, "concluida"),
            eq(
              tarefas.concluidaEm,
              anteriores.find((f) => f.id === corrigeId)!.em,
            ),
          ),
        )
        .returning({ id: tarefas.id });
      if (reabertas.length)
        await tx
          .insert(tarefasHistorico)
          .values(
            reabertas.map((t) => ({
              tarefaId: t.id,
              tipo: "reaberta",
              autorId,
              criadaEm: em,
              motivo,
            })),
          );
    }
    for (const a of anulados)
      await tx
        .update(orcamentos)
        .set({ estado: "enviado" })
        .where(eq(orcamentos.id, a.orcamentoId));
  }
  const etapa = inferirEtapa([...anteriores, fato]);
  await tx
    .update(fatosEtapa)
    .set({ etapaResultante: etapa })
    .where(eq(fatosEtapa.id, fato.id));
  await tx
    .update(viagens)
    .set({
      etapa,
      motivoEncerramento: ETAPAS_ABERTAS.includes(etapa) ? null : motivo.trim(),
    })
    .where(eq(viagens.id, viagemId));
  if (!ETAPAS_ABERTAS.includes(etapa))
    await cancelarAutomaticas(tx, viagemId, autorId, motivo, em);
  // A correction restores tasks canceled only because this trip was mistakenly closed.
  if (
    tipo === "correcao" &&
    ETAPAS_ABERTAS.includes(etapa) &&
    !ETAPAS_ABERTAS.includes(viagem.etapa)
  ) {
    const reabertas = await tx
      .update(tarefas)
      .set({ estado: "aberta", canceladaEm: null, motivoCancelamento: null })
      .where(
        and(
          eq(tarefas.viagemId, viagemId),
          ne(tarefas.tipo, "manual"),
          eq(tarefas.estado, "cancelada"),
          eq(tarefas.motivoCancelamento, viagem.motivoEncerramento ?? ""),
        ),
      )
      .returning({ id: tarefas.id });
    if (reabertas.length)
      await tx
        .insert(tarefasHistorico)
        .values(
          reabertas.map((t) => ({
            tarefaId: t.id,
            tipo: "reaberta",
            autorId,
            criadaEm: em,
            motivo,
          })),
        );
  }
  return etapa;
}
export async function registrarRespostaCliente(
  viagemId: number,
  usuario: Usuario,
  form: FormData,
  agora: Date,
) {
  const tipo = String(form.get("resposta"));
  if (
    !["mudancas", "pensando", "perda", "cancelamento", "descarte"].includes(
      tipo,
    )
  )
    throw new Response("Registre o aceite da opção na proposta", {
      status: 400,
    });
  return db.transaction(async (tx) => {
    const etapa = await registrarFato(
      tx,
      viagemId,
      tipo as TipoFatoEtapa,
      usuario.id,
      agora,
      String(form.get("motivoResposta") ?? ""),
    );
    await concluirAutomaticas(tx, viagemId, "followup", usuario.id, agora);
    await tx
      .update(viagens)
      .set({ semRespostaDesde: null })
      .where(eq(viagens.id, viagemId));
    return etapa;
  });
}
export async function corrigirFato(
  viagemId: number,
  usuario: Usuario,
  form: FormData,
  agora: Date,
) {
  return db.transaction(async (tx) => {
    await tx
      .select({ id: viagens.id })
      .from(viagens)
      .where(eq(viagens.id, viagemId))
      .for("update");
    const [responsavel] = await tx
      .select()
      .from(responsaveis)
      .where(
        and(eq(responsaveis.viagemId, viagemId), isNull(responsaveis.ate)),
      );
    if (usuario.papel !== "admin" && responsavel?.usuarioId !== usuario.id)
      throw new Response("Acesso restrito", { status: 403 });
    return registrarFato(
      tx,
      viagemId,
      "correcao",
      usuario.id,
      agora,
      String(form.get("motivoCorrecao") ?? ""),
      Number(form.get("fatoId")),
    );
  });
}
export async function historicoEtapas(viagemId: number) {
  return db
    .select({
      id: fatosEtapa.id,
      tipo: fatosEtapa.tipo,
      em: fatosEtapa.em,
      autor: usuarios.nome,
      motivo: fatosEtapa.motivo,
      corrigeId: fatosEtapa.corrigeId,
      etapaAnterior: fatosEtapa.etapaAnterior,
      etapaResultante: fatosEtapa.etapaResultante,
    })
    .from(fatosEtapa)
    .leftJoin(usuarios, eq(usuarios.id, fatosEtapa.autorId))
    .where(eq(fatosEtapa.viagemId, viagemId))
    .orderBy(asc(fatosEtapa.id));
}

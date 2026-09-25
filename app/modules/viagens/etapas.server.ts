import { avisar } from "~/modules/notificacoes/push.server";
import { notificar } from "~/modules/comunicador/leitura";
import { leituraAtual } from "~/modules/comunicador/notificacoes.server";
import { traduzirMensagem } from "~/modules/idiomas/catalogo";
import { rotuloEtapa } from "./rotulos";
import { reconciliarTarefasEtapa } from "./tarefas-etapa.server";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  aceites,
  orcamentos,
  fatosEtapa,
  responsaveis,
  usuarios,
  viagens,
} from "~/db/schema";
import { inferirEtapa, type TipoFatoEtapa } from "./etapas";
import { ETAPAS_ABERTAS } from "./regras";
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
  await reconciliarTarefasEtapa(tx, viagemId, autorId, em, tipo === "correcao");
  if (
    etapa !== viagem.etapa &&
    !["perda", "descarte", "cancelamento", "correcao"].includes(tipo)
  ) {
    const destinatarios = await tx.execute<{
      id: number;
      idioma: "pt" | "ko";
      dnd_inicio: string;
      dnd_fim: string;
      fuso: string;
    }>(
      sql`select u.id,u.idioma_interface as idioma,p.dnd_inicio,p.dnd_fim,p.fuso from responsaveis r join usuarios u on u.id=r.usuario_id and u.ativo left join preferencias_comunicador p on p.usuario_id=u.id where r.viagem_id=${viagemId} and r.ate is null`,
    );
    const conversas = await tx.execute<{ id: number }>(
      sql`select id from conversas where viagem_id=${viagemId}`,
    );
    for (const d of destinatarios.rows) {
      if (
        !notificar({
          tipo: "interna",
          modo: "todas",
          mencionado: true,
          urgente: false,
          lendo: leituraAtual(
            d.id,
            conversas.rows.map((c) => c.id),
          ),
          agora: em,
          dndInicio: d.dnd_inicio,
          dndFim: d.dnd_fim,
          fuso: d.fuso,
        })
      )
        continue;
      await avisar(tx, [d.id], {
        titulo: `${viagem.codigo} · ${traduzirMensagem(d.idioma, "Etapa atualizada")}`,
        texto: `${traduzirMensagem(d.idioma, rotuloEtapa[viagem.etapa])} → ${traduzirMensagem(d.idioma, rotuloEtapa[etapa])}`,
        url: `/viagens/${viagemId}`,
        chave: `viagem:${viagemId}:etapa:${fato.id}`,
        criadaEm: em,
      });
    }
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

import { notificar } from "~/modules/comunicador/leitura";
import { leituraAtual } from "~/modules/comunicador/presenca.server";
import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  fatosEtapa,
  responsaveis,
  tarefas,
  tarefasHistorico,
  usuarios,
  viagens,
} from "~/db/schema";
import { modelosEtapa, tarefasEtapa } from "~/db/etapas-schema";
import { criarTarefaAutomatica } from "~/modules/tarefas/tarefas.server";
import { FATOS_MODELO, inferirTarefasEtapa } from "./tarefas-etapa";
import { avisar } from "~/modules/notificacoes/push.server";
import { publicar } from "~/modules/notificacoes/eventos.server";
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export async function reconciliarTarefasEtapa(
  tx: Tx,
  viagemId: number,
  autorId: number | null,
  agora: Date,
  correcao = false,
) {
  const [viagem] = await tx
    .select()
    .from(viagens)
    .where(eq(viagens.id, viagemId))
    .for("update");
  if (!viagem) return;
  const [responsavel] = await tx
    .select()
    .from(responsaveis)
    .where(and(eq(responsaveis.viagemId, viagemId), isNull(responsaveis.ate)));
  if (!responsavel) return;
  let fatos = await tx
    .select()
    .from(fatosEtapa)
    .where(eq(fatosEtapa.viagemId, viagemId));
  if (viagem.primeiraRespostaEm && !fatos.some((f) => f.tipo === "contato")) {
    const [legado] = await tx
      .insert(fatosEtapa)
      .values({
        viagemId,
        tipo: "contato",
        em: viagem.primeiraRespostaEm,
        autorId: null,
        motivo: "Primeiro contato registrado antes dos modelos de etapa",
        etapaAnterior: "lead",
        etapaResultante: "lead",
      })
      .returning();
    fatos = [...fatos, legado];
  }
  let mudou = false;
  const modelos = await tx.select().from(modelosEtapa);
  const resultado = inferirTarefasEtapa({
    fatos,
    modelos,
    criadaEm: viagem.criadaEm,
    canal: viagem.canalComercial,
    agora,
  });
  const existentes = await tx
    .select({ tarefa: tarefas, origem: tarefasEtapa })
    .from(tarefas)
    .leftJoin(tarefasEtapa, eq(tarefasEtapa.tarefaId, tarefas.id))
    .where(
      and(eq(tarefas.viagemId, viagemId), sql`${tarefas.tipo} <> 'manual'`),
    )
    .orderBy(asc(tarefas.id));
  const reconhecidas = new Set<number>();
  for (const decisao of resultado.tarefas) {
    const chave = `${viagemId}:etapa:${decisao.chave}`;
    let existente = existentes.find((t) => t.tarefa.chaveAutomatica === chave);
    // Adopt the historical series in place: identifiers, conversation and task history survive.
    if (!existente)
      existente = existentes.find(
        (t) =>
          !t.origem &&
          !reconhecidas.has(t.tarefa.id) &&
          ((decisao.modelo.item === "responder" &&
            t.tarefa.tipo === "responder") ||
            (decisao.modelo.item === "followup" &&
              t.tarefa.tipo === "followup" &&
              t.tarefa.prazo &&
              +t.tarefa.prazo === +decisao.prazo)),
      );
    let tarefa = existente?.tarefa;
    if (!tarefa)
      tarefa = await criarTarefaAutomatica(tx, {
        viagemId,
        tipo:
          decisao.modelo.item === "responder"
            ? "responder"
            : decisao.modelo.item === "followup"
              ? "followup"
              : "etapa",
        titulo: decisao.modelo.titulo,
        responsavelId:
          decisao.modelo.destinatario === "usuario"
            ? decisao.modelo.usuarioId!
            : responsavel.usuarioId,
        prazo: decisao.prazo,
        autorId,
        agora,
        chave: `etapa:${decisao.chave}`,
      });
    if (!tarefa) continue;
    if (!existente) mudou = true;
    reconhecidas.add(tarefa.id);
    if (tarefa.chaveAutomatica !== chave)
      await tx
        .update(tarefas)
        .set({ chaveAutomatica: chave })
        .where(eq(tarefas.id, tarefa.id));
    await tx
      .insert(tarefasEtapa)
      .values({
        tarefaId: tarefa.id,
        modeloItemId: decisao.modelo.id,
        entradaChave: decisao.entrada,
        etapa: decisao.etapa,
        destinatario: decisao.modelo.destinatario,
        fatoConclusivoId: decisao.fatoId,
      })
      .onConflictDoUpdate({
        target: tarefasEtapa.tarefaId,
        set: { fatoConclusivoId: decisao.fatoId },
      });
    // A legacy completed contact has no stage fact. Preserve it until an explicit correction.
    if (
      !correcao &&
      !existente?.origem &&
      tarefa.estado === "concluida" &&
      decisao.estado === "aberta"
    )
      continue;
    const fato = fatos.find((f) => f.id === decisao.fatoId);
    const conclusaoMudou =
      decisao.estado === "concluida" &&
      (existente?.origem?.fatoConclusivoId !== decisao.fatoId ||
        tarefa.concluidaEm?.getTime() !== fato?.em.getTime());
    if (tarefa.estado === decisao.estado && !conclusaoMudou) continue;
    mudou = true;
    const motivo =
      decisao.estado === "cancelada"
        ? viagem.motivoEncerramento || decisao.motivo
        : correcao
          ? "Correção de etapa"
          : null;
    await tx
      .update(tarefas)
      .set({
        estado: decisao.estado,
        concluidaEm:
          decisao.estado === "concluida" ? (fato?.em ?? agora) : null,
        canceladaEm: decisao.estado === "cancelada" ? agora : null,
        motivoCancelamento: decisao.estado === "cancelada" ? motivo : null,
      })
      .where(eq(tarefas.id, tarefa.id));
    await tx.insert(tarefasHistorico).values({
      tarefaId: tarefa.id,
      tipo: decisao.estado === "aberta" ? "reaberta" : decisao.estado,
      autorId,
      criadaEm: agora,
      motivo,
    });
  }
  for (const { tarefa, origem } of existentes)
    if (
      origem &&
      !reconhecidas.has(tarefa.id) &&
      tarefa.estado !== "cancelada"
    ) {
      mudou = true;
      await tx
        .update(tarefas)
        .set({
          estado: "cancelada",
          canceladaEm: agora,
          motivoCancelamento: "Correção de etapa",
        })
        .where(eq(tarefas.id, tarefa.id));
      await tx.insert(tarefasHistorico).values({
        tarefaId: tarefa.id,
        tipo: "cancelada",
        autorId,
        criadaEm: agora,
        motivo: "Correção de etapa",
      });
    }
  if (resultado.semResposta && !viagem.semRespostaDesde) {
    const admins = await tx
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(and(eq(usuarios.papel, "admin"), eq(usuarios.ativo, true)));
    const ultimoEnvio = fatos
      .filter((f) => f.tipo === "envio")
      .sort((a, b) => +b.em - +a.em)[0];
    const destinatarios = [
      ...new Set([responsavel.usuarioId, ...admins.map((u) => u.id)]),
    ];
    const elegiveis: number[] = [];
    const conversas = await tx.execute<{ id: number }>(
      sql`select id from conversas where viagem_id=${viagemId}`,
    );
    for (const usuarioId of destinatarios) {
      const prefs = await tx.execute<{
        dnd_inicio: string;
        dnd_fim: string;
        fuso: string;
      }>(
        sql`select dnd_inicio,dnd_fim,fuso from preferencias_comunicador where usuario_id=${usuarioId}`,
      );
      const p = prefs.rows[0];
      if (
        notificar({
          tipo: "interna",
          modo: "todas",
          mencionado: true,
          lendo: leituraAtual(
            usuarioId,
            conversas.rows.map((c) => c.id),
          ),
          urgente: false,
          agora,
          dndInicio: p?.dnd_inicio,
          dndFim: p?.dnd_fim,
          fuso: p?.fuso,
        })
      )
        elegiveis.push(usuarioId);
    }
    await avisar(tx, elegiveis, {
      titulo: "Viagem sem resposta",
      texto: `${viagem.codigo}: três follow-ups sem resposta. As próximas tarefas continuam.`,
      url: `/viagens/${viagemId}`,
      chave: `sem-resposta:${viagemId}:${ultimoEnvio?.id}`,
      criadaEm: agora,
    });
  }
  await tx
    .update(viagens)
    .set({
      primeiraRespostaEm:
        fatos.find(
          (f) =>
            f.tipo === "contato" && !fatos.some((c) => c.corrigeId === f.id),
        )?.em ?? null,
      semRespostaDesde: resultado.semResposta
        ? (viagem.semRespostaDesde ?? agora)
        : null,
    })
    .where(eq(viagens.id, viagemId));
  if (mudou || resultado.semResposta !== !!viagem.semRespostaDesde)
    publicar(0, "pipeline");
}
export async function listarModelosEtapa() {
  return db
    .selectDistinctOn([modelosEtapa.item])
    .from(modelosEtapa)
    .orderBy(
      modelosEtapa.item,
      desc(modelosEtapa.vigenteDesde),
      desc(modelosEtapa.id),
    );
}
export async function salvarModeloEtapa(
  usuario: { id: number; papel: string },
  form: FormData,
  agora: Date,
) {
  if (usuario.papel !== "admin")
    throw new Response("Acesso restrito", { status: 403 });
  const id = Number(form.get("id")),
    titulo = String(form.get("titulo") ?? "").trim(),
    horas = Number(form.get("horas")),
    fato = String(form.get("fato")),
    destinatario = String(form.get("destinatario")),
    usuarioId = Number(form.get("usuarioId"));
  const [modelo] = await db
    .select()
    .from(modelosEtapa)
    .where(eq(modelosEtapa.id, id));
  if (
    !modelo ||
    !titulo ||
    !Number.isInteger(horas) ||
    horas < 1 ||
    horas > 8760 ||
    !FATOS_MODELO.includes(fato as never) ||
    (modelo.ativo && ["invoice", "pagamento", "voucher"].includes(fato)) ||
    !["responsavel", "usuario"].includes(destinatario)
  )
    throw new Response("Modelo inválido", { status: 400 });
  if (destinatario === "usuario") {
    const [ativo] = await db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.id, usuarioId), eq(usuarios.ativo, true)));
    if (!ativo) throw new Response("Usuário inválido", { status: 400 });
  }
  await db.insert(modelosEtapa).values({
    item: modelo.item,
    etapa: modelo.etapa,
    titulo,
    horas,
    fato,
    destinatario,
    usuarioId: destinatario === "usuario" ? usuarioId : null,
    ativo: modelo.ativo,
    vigenteDesde: agora,
  });
}
export async function origensTarefasViagem(viagemId: number) {
  return db
    .select({
      tarefaId: tarefasEtapa.tarefaId,
      etapa: tarefasEtapa.etapa,
      entrada: tarefasEtapa.entradaChave,
      fatoId: tarefasEtapa.fatoConclusivoId,
      motivo: tarefas.motivoCancelamento,
    })
    .from(tarefasEtapa)
    .innerJoin(tarefas, eq(tarefas.id, tarefasEtapa.tarefaId))
    .where(eq(tarefas.viagemId, viagemId));
}

export async function semearModelosEtapa() {
  await db.execute(sql`insert into modelos_etapa(item,etapa,titulo,horas,fato,ativo,vigente_desde)
    select d.* from (values
    ('responder','lead','Responder o primeiro contato',null::integer,'contato',true,'1970-01-01'::timestamptz),
    ('cotacoes','em_orcamento','Pedir cotações',24,'cotacao',true,'1970-01-01'::timestamptz),
    ('proposta','em_orcamento','Enviar proposta',48,'envio',true,'1970-01-01'::timestamptz),
    ('followup','proposta_enviada','Retomar proposta com o cliente',72,'contato',true,'1970-01-01'::timestamptz),
    ('nova-versao','em_negociacao','Enviar nova versão',48,'envio',true,'1970-01-01'::timestamptz),
    ('invoice','confirmada','Enviar invoice',24,'invoice',false,'1970-01-01'::timestamptz),
    ('sinal','confirmada','Receber sinal',72,'pagamento',false,'1970-01-01'::timestamptz),
    ('voucher','confirmada','Enviar voucher',120,'voucher',false,'1970-01-01'::timestamptz)
    ) d(item,etapa,titulo,horas,fato,ativo,vigente_desde)
    where not exists(select 1 from modelos_etapa m where m.item=d.item)`);
}

export async function acaoDaTarefaEtapa(tarefaId: number, viagemId: number) {
  const [origem] = await db
    .select({ fato: modelosEtapa.fato })
    .from(tarefasEtapa)
    .innerJoin(modelosEtapa, eq(modelosEtapa.id, tarefasEtapa.modeloItemId))
    .where(eq(tarefasEtapa.tarefaId, tarefaId));
  if (!origem || origem.fato === "contato")
    return `/viagens/${viagemId}#registrar-contato`;
  if (origem.fato === "aceite") return `/viagens/${viagemId}/aceite`;
  if (["envio", "cotacao"].includes(origem.fato)) {
    const orcamento = await db.execute<{ id: number }>(
      sql`select id from orcamentos where viagem_id=${viagemId} order by id desc limit 1`,
    );
    if (orcamento.rows[0]) return `/orcamentos/${orcamento.rows[0].id}`;
  }
  return `/viagens/${viagemId}`;
}

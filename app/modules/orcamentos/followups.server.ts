import { and, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  enviosProposta,
  fatosEtapa,
  orcamentos,
  responsaveis,
  usuarios,
  viagens,
} from "~/db/schema";
import { ETAPAS_ABERTAS } from "~/modules/viagens/regras";
import { criarTarefaAutomatica } from "~/modules/tarefas/tarefas.server";
import { avisar, entregarPush } from "~/modules/notificacoes/push.server";
const INTERVALO = 3 * 86400000;
/** Idempotent reconciliation: the database key prevents duplicate tasks and pushes across requests. */
export async function atualizarFollowups(agora: Date, viagemId?: number) {
  const envios = await db
    .selectDistinctOn([orcamentos.viagemId], {
      viagemId: orcamentos.viagemId,
      id: enviosProposta.id,
      enviadoEm: enviosProposta.enviadoEm,
    })
    .from(enviosProposta)
    .innerJoin(orcamentos, eq(orcamentos.id, enviosProposta.orcamentoId))
    .innerJoin(viagens, eq(viagens.id, orcamentos.viagemId))
    .where(
      and(
        inArray(viagens.etapa, [...ETAPAS_ABERTAS]),
        viagemId ? eq(viagens.id, viagemId) : undefined,
      ),
    )
    .orderBy(orcamentos.viagemId, desc(enviosProposta.id));
  if (!envios.length) return;
  for (const envio of envios)
    await db.transaction(async (tx) => {
      const [viagem] = await tx
        .select()
        .from(viagens)
        .where(eq(viagens.id, envio.viagemId))
        .for("update");
      if (!ETAPAS_ABERTAS.includes(viagem.etapa)) return;
      const [resposta] = await tx
        .select({ id: fatosEtapa.id })
        .from(fatosEtapa)
        .where(
          and(
            eq(fatosEtapa.viagemId, viagem.id),
            inArray(fatosEtapa.tipo, [
              "pensando",
              "mudancas",
              "aceite",
              "perda",
            ]),
            gte(fatosEtapa.em, envio.enviadoEm),
            sql`not exists (select 1 from fatos_etapa c where c.corrige_id = ${fatosEtapa.id})`,
          ),
        )
        .limit(1);
      if (resposta) return;
      const [responsavel] = await tx
        .select()
        .from(responsaveis)
        .where(
          and(eq(responsaveis.viagemId, viagem.id), isNull(responsaveis.ate)),
        );
      if (!responsavel) return;
      const vencidos = Math.max(
        0,
        Math.floor((agora.getTime() - envio.enviadoEm.getTime()) / INTERVALO),
      );
      for (let numero = 1; numero <= Math.min(vencidos + 1, 1000); numero++)
        await criarTarefaAutomatica(tx, {
          viagemId: viagem.id,
          tipo: "followup",
          titulo: "Retomar proposta com o cliente",
          responsavelId: responsavel.usuarioId,
          prazo: new Date(envio.enviadoEm.getTime() + numero * INTERVALO),
          autorId: null,
          agora,
          chave: `envio:${envio.id}:${numero}`,
        });
      if (vencidos >= 3 && !viagem.semRespostaDesde) {
        await tx
          .update(viagens)
          .set({ semRespostaDesde: agora })
          .where(eq(viagens.id, viagem.id));
        const admins = await tx
          .select({ id: usuarios.id })
          .from(usuarios)
          .where(and(eq(usuarios.papel, "admin"), eq(usuarios.ativo, true)));
        await avisar(tx, [responsavel.usuarioId, ...admins.map((u) => u.id)], {
          titulo: "Viagem sem resposta",
          texto: `${viagem.codigo}: três follow-ups sem resposta. As próximas tarefas continuam.`,
          url: `/viagens/${viagem.id}`,
          chave: `sem-resposta:${envio.id}`,
          criadaEm: agora,
        });
      }
    });
  await entregarPush();
}

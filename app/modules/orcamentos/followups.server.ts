import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "~/db/client.server";
import { viagens } from "~/db/schema";
import { ETAPAS_ABERTAS } from "~/modules/viagens/regras";
import { reconciliarTarefasEtapa } from "~/modules/viagens/tarefas-etapa.server";
import { entregarPush } from "~/modules/notificacoes/push.server";
/** The same inference handles facts and time. No parallel follow-up series. */
export async function atualizarFollowups(agora: Date, viagemId?: number) {
  const abertas = await db
    .select({ id: viagens.id })
    .from(viagens)
    .where(
      and(
        viagemId
          ? inArray(viagens.etapa, [...ETAPAS_ABERTAS])
          : eq(viagens.etapa, "proposta_enviada"),
        viagemId ? eq(viagens.id, viagemId) : undefined,
        // Imported stage labels alone do not establish a proposal cycle. Replaying
        // them on every read both manufactures lead tasks and costs one transaction
        // per trip. Individual reads still reconcile historical data explicitly.
        viagemId
          ? undefined
          : sql`exists (
          select 1 from fatos_etapa envio
          where envio.viagem_id = ${viagens.id} and envio.tipo = 'envio'
          and not exists (
            select 1 from fatos_etapa correcao
            where correcao.viagem_id = envio.viagem_id
              and correcao.tipo = 'correcao' and correcao.corrige_id = envio.id
          )
        )`,
      ),
    );
  for (const viagem of abertas)
    await db.transaction((tx) =>
      reconciliarTarefasEtapa(tx, viagem.id, null, agora),
    );
  await entregarPush();
}

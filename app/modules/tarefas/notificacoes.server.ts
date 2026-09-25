import { sql } from "drizzle-orm";
import { db } from "~/db/client.server";
import { avisar } from "~/modules/notificacoes/push.server";
import { notificar } from "~/modules/comunicador/leitura";
import { leituraAtual } from "~/modules/comunicador/presenca.server";
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export async function avisarTarefa(
  tx: Tx,
  ids: number[],
  dados: Parameters<typeof avisar>[2],
) {
  if (!ids.length) return;
  const tarefaId = Number(dados.url.split("/").pop());
  const preferencias = await tx.execute(
    sql`select u.id,p.dnd_inicio,p.dnd_fim,p.fuso,c.id as conversa_id from usuarios u left join preferencias_comunicador p on p.usuario_id=u.id left join conversas c on c.chave='tarefa:'||${tarefaId}::text where u.id in (${sql.join(
      ids.map((id) => sql`${id}`),
      sql`, `,
    )}) and u.ativo`,
  );
  const destinos = preferencias.rows
    .filter((p) =>
      notificar({
        tipo: "tarefa",
        modo: "mencoes",
        mencionado: true,
        urgente: false,
        lendo: leituraAtual(
          Number(p.id),
          p.conversa_id ? [Number(p.conversa_id)] : [],
        ),
        agora: dados.criadaEm,
        dndInicio: p.dnd_inicio as string,
        dndFim: p.dnd_fim as string,
        fuso: p.fuso as string,
      }),
    )
    .map((p) => Number(p.id));
  await avisar(tx, destinos, dados);
}

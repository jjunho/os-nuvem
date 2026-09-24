import { and, eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { orcamentos } from "~/db/schema";
export async function impactosRemocao(viagemId: number, viajanteIds: number[]) {
  const versoes = await db
    .select({
      id: orcamentos.id,
      versao: orcamentos.versao,
      dados: orcamentos.dados,
    })
    .from(orcamentos)
    .where(
      and(eq(orcamentos.viagemId, viagemId), eq(orcamentos.estado, "rascunho")),
    );
  return Object.fromEntries(
    viajanteIds.map((id) => [
      id,
      versoes.flatMap((v) =>
        v.dados.opcoes.flatMap((o) =>
          o.dias.flatMap((d, i) => {
            if (d.viajanteIds && !d.viajanteIds.includes(id)) return [];
            const linhas = d.linhas
              .filter(
                (l) =>
                  (l.porViajante || l.item || l.regra) &&
                  (!l.viajanteIds || l.viajanteIds.includes(id)),
              )
              .map((l) => l.nome);
            return [
              `${linhas.join(", ") || o.nome} — Dia ${i + v.dados.diaInicial} · ${o.nome} · Versão ${v.versao}`,
            ];
          }),
        ),
      ),
    ]),
  );
}

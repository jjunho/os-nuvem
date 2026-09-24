import { and, asc, desc, eq, isNull, ne, or, sql } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  desejosViagem,
  participantesViagem,
  usuarios,
  viagens,
  viagensRelacionadas,
} from "~/db/schema";
export async function colaboracaoDaViagem(viagemId: number) {
  const [participantes, relacionadas, desejos, conhecidas] = await Promise.all([
    db
      .select({
        id: participantesViagem.id,
        usuarioId: usuarios.id,
        nome: usuarios.nome,
        desde: participantesViagem.desde,
        removidoEm: participantesViagem.removidoEm,
      })
      .from(participantesViagem)
      .innerJoin(usuarios, eq(usuarios.id, participantesViagem.usuarioId))
      .where(eq(participantesViagem.viagemId, viagemId))
      .orderBy(asc(participantesViagem.id)),
    db
      .select({ id: viagens.id, codigo: viagens.codigo })
      .from(viagensRelacionadas)
      .innerJoin(
        viagens,
        sql`${viagens.id} = case when ${viagensRelacionadas.menorId} = ${viagemId} then ${viagensRelacionadas.maiorId} else ${viagensRelacionadas.menorId} end`,
      )
      .where(
        or(
          eq(viagensRelacionadas.menorId, viagemId),
          eq(viagensRelacionadas.maiorId, viagemId),
        ),
      ),
    db
      .select({
        id: desejosViagem.id,
        texto: desejosViagem.texto,
        aprovadoEm: desejosViagem.aprovadoEm,
        aprovadoPor: usuarios.nome,
        descartadoEm: desejosViagem.descartadoEm,
      })
      .from(desejosViagem)
      .leftJoin(usuarios, eq(usuarios.id, desejosViagem.aprovadoPor))
      .where(eq(desejosViagem.viagemId, viagemId))
      .orderBy(asc(desejosViagem.id)),
    db
      .select({ id: viagens.id, codigo: viagens.codigo })
      .from(viagens)
      .where(ne(viagens.id, viagemId))
      .orderBy(desc(viagens.id))
      .limit(1000),
  ]);
  return { participantes, relacionadas, desejos, conhecidas };
}
export async function alterarColaboracao(
  viagemId: number,
  autorId: number,
  form: FormData,
  agora: Date,
) {
  const intent = String(form.get("intent"));
  if (intent === "participante-adicionar") {
    const usuarioId = Number(form.get("participanteId"));
    const [usuario] = await db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.id, usuarioId), eq(usuarios.ativo, true)));
    if (!usuario) throw new Response("Usuário não encontrado", { status: 404 });
    await db
      .insert(participantesViagem)
      .values({ viagemId, usuarioId, adicionadoPor: autorId, desde: agora })
      .onConflictDoNothing();
  } else if (intent === "participante-remover") {
    await db
      .update(participantesViagem)
      .set({ removidoEm: agora, removidoPor: autorId })
      .where(
        and(
          eq(participantesViagem.viagemId, viagemId),
          eq(participantesViagem.id, Number(form.get("participacaoId"))),
          isNull(participantesViagem.removidoEm),
        ),
      );
  } else if (intent === "relacionar" || intent === "desvincular") {
    const valor = String(form.get("relacionada"));
    const [outra] = await db
      .select()
      .from(viagens)
      .where(
        /^\d+$/.test(valor)
          ? eq(viagens.id, Number(valor))
          : eq(viagens.codigo, valor),
      );
    if (!outra || outra.id === viagemId)
      throw new Response("Viagem relacionada inválida", { status: 400 });
    const menorId = Math.min(viagemId, outra.id),
      maiorId = Math.max(viagemId, outra.id);
    if (intent === "relacionar")
      await db
        .insert(viagensRelacionadas)
        .values({ menorId, maiorId })
        .onConflictDoNothing();
    else
      await db
        .delete(viagensRelacionadas)
        .where(
          and(
            eq(viagensRelacionadas.menorId, menorId),
            eq(viagensRelacionadas.maiorId, maiorId),
          ),
        );
  } else if (intent === "desejo-adicionar") {
    const texto = String(form.get("desejo") ?? "").trim();
    if (!texto) throw new Response("Informe o desejo", { status: 400 });
    await db
      .insert(desejosViagem)
      .values({ viagemId, texto, criadoPor: autorId, criadoEm: agora });
  } else if (intent === "desejo-aprovar" || intent === "desejo-descartar") {
    const condicao = and(
      eq(desejosViagem.viagemId, viagemId),
      eq(desejosViagem.id, Number(form.get("desejoId"))),
    );
    if (intent === "desejo-aprovar")
      await db
        .update(desejosViagem)
        .set({ aprovadoPor: autorId, aprovadoEm: agora })
        .where(
          and(
            condicao,
            isNull(desejosViagem.descartadoEm),
            isNull(desejosViagem.aprovadoEm),
          ),
        );
    else
      await db
        .update(desejosViagem)
        .set({ descartadoPor: autorId, descartadoEm: agora })
        .where(and(condicao, isNull(desejosViagem.descartadoEm)));
  } else throw new Response("Operação inválida", { status: 400 });
}

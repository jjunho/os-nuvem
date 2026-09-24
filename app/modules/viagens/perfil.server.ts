import { and, eq, inArray, ne, desc } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  contatos,
  notas,
  usuarios,
  viagemContatos,
  viagens,
} from "~/db/schema";
export async function perfisDaViagem(viagemId: number) {
  const [viagem] = await db
    .select()
    .from(viagens)
    .where(eq(viagens.id, viagemId));
  const pessoas = await db
    .selectDistinct({
      id: contatos.id,
      numero: contatos.numero,
      nome: contatos.nome,
      nascimento: contatos.nascimento,
      preferencias: contatos.preferencias,
      mobilidade: contatos.mobilidade,
      alimentacao: contatos.alimentacao,
    })
    .from(contatos)
    .innerJoin(viagemContatos, eq(viagemContatos.contatoId, contatos.id))
    .where(and(eq(viagemContatos.viagemId, viagemId), ne(contatos.nome, "")));
  if (!pessoas.length) return [];
  const ids = pessoas.map((p) => p.id);
  const [anteriores, retornos] = await Promise.all([
    db
      .selectDistinct({
        contatoId: viagemContatos.contatoId,
        id: viagens.id,
        codigo: viagens.codigo,
      })
      .from(viagemContatos)
      .innerJoin(viagens, eq(viagens.id, viagemContatos.viagemId))
      .where(
        and(inArray(viagemContatos.contatoId, ids), ne(viagens.id, viagemId)),
      ),
    db
      .select({
        id: notas.id,
        contatoId: notas.contatoId,
        texto: notas.texto,
        autor: usuarios.nome,
        criadaEm: notas.criadaEm,
      })
      .from(notas)
      .innerJoin(usuarios, eq(usuarios.id, notas.autorId))
      .where(
        and(inArray(notas.contatoId, ids), eq(notas.tipo, "retorno_roteiro")),
      )
      .orderBy(desc(notas.criadaEm)),
  ]);
  return pessoas.map((p) => {
    const aniversarios: string[] = [];
    if (p.nascimento && viagem.dataInicio && viagem.dataFim) {
      for (
        let ano = Number(viagem.dataInicio.slice(0, 4));
        ano <= Number(viagem.dataFim.slice(0, 4));
        ano++
      ) {
        const data = `${ano}-${p.nascimento.slice(5)}`;
        if (
          data >= viagem.dataInicio &&
          data <= viagem.dataFim &&
          new Date(`${data}T00:00:00Z`).toISOString().slice(0, 10) === data
        )
          aniversarios.push(data);
      }
    }
    return {
      ...p,
      viagens: anteriores.filter((v) => v.contatoId === p.id),
      retornos: retornos.filter((r) => r.contatoId === p.id),
      aniversarios,
    };
  });
}
export async function salvarPerfil(
  viagemId: number,
  autorId: number,
  form: FormData,
  agora: Date,
) {
  const contatoId = Number(form.get("contatoId"));
  const nascimento = String(form.get("nascimento") ?? "") || null;
  if (
    nascimento &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento) ||
      !Number.isFinite(Date.parse(nascimento)) ||
      new Date(`${nascimento}T00:00:00Z`).toISOString().slice(0, 10) !==
        nascimento)
  )
    throw new Response("Nascimento inválido", { status: 400 });
  await db.transaction(async (tx) => {
    const [vinculo] = await tx
      .select()
      .from(viagemContatos)
      .where(
        and(
          eq(viagemContatos.viagemId, viagemId),
          eq(viagemContatos.contatoId, contatoId),
        ),
      )
      .limit(1);
    if (!vinculo) throw new Response("Contato não encontrado", { status: 404 });
    await tx
      .update(contatos)
      .set({
        nascimento,
        preferencias: String(form.get("preferencias") ?? "").trim() || null,
      })
      .where(eq(contatos.id, contatoId));
    const texto = String(form.get("retornoRoteiro") ?? "").trim();
    if (texto)
      await tx
        .insert(notas)
        .values({
          viagemId,
          contatoId,
          tipo: "retorno_roteiro",
          autorId,
          texto,
          criadaEm: agora,
        });
  });
}

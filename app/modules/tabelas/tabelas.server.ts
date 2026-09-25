import { and, desc, eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { tabelasReferencia, usuarios, versoesReferencia } from "~/db/schema";
import { tabelasIniciais } from "./referencias";
import { lerLinha } from "./linha";
export async function semearTabelas() {
  await db.transaction(async (tx) => {
    for (const tabela of tabelasIniciais) {
      await tx
        .insert(tabelasReferencia)
        .values({ codigo: tabela.codigo, titulo: tabela.titulo })
        .onConflictDoNothing();
      await tx
        .insert(versoesReferencia)
        .values({
          tabela: tabela.codigo,
          versao: 1,
          dados: { colunas: tabela.colunas, linhas: tabela.linhas },
        })
        .onConflictDoNothing();
    }
  });
}
export async function listarTabelas() {
  return db.select().from(tabelasReferencia).orderBy(tabelasReferencia.titulo);
}
/** References know only their own versions; consumers pin the returned immutable id. */
export async function lerTabela(codigo: string, versao?: number) {
  const [tabela] = await db
    .select()
    .from(tabelasReferencia)
    .where(eq(tabelasReferencia.codigo, codigo));
  if (!tabela) throw new Response("Tabela não encontrada", { status: 404 });
  const [atual] = await db
    .select()
    .from(versoesReferencia)
    .where(
      and(
        eq(versoesReferencia.tabela, codigo),
        versao === undefined ? undefined : eq(versoesReferencia.versao, versao),
      ),
    )
    .orderBy(desc(versoesReferencia.versao))
    .limit(1);
  if (!atual) throw new Response("Versão não encontrada", { status: 404 });
  return { ...tabela, ...atual };
}
export async function historicoTabela(codigo: string) {
  return db
    .select({
      versao: versoesReferencia.versao,
      autor: usuarios.nome,
      criadaEm: versoesReferencia.criadaEm,
    })
    .from(versoesReferencia)
    .leftJoin(usuarios, eq(usuarios.id, versoesReferencia.autorId))
    .where(eq(versoesReferencia.tabela, codigo))
    .orderBy(desc(versoesReferencia.versao));
}
export async function salvarTabela(
  codigo: string,
  usuario: { id: number; papel: string },
  form: FormData,
  agora: Date,
) {
  if (usuario.papel !== "admin")
    throw new Response("Acesso restrito", { status: 403 });
  return db.transaction(async (tx) => {
    const [tabela] = await tx
      .select()
      .from(tabelasReferencia)
      .where(eq(tabelasReferencia.codigo, codigo))
      .for("update");
    if (!tabela) throw new Response("Tabela não encontrada", { status: 404 });
    const [atual] = await tx
      .select()
      .from(versoesReferencia)
      .where(eq(versoesReferencia.tabela, codigo))
      .orderBy(desc(versoesReferencia.versao))
      .limit(1);
    if (Number(form.get("versao")) !== atual.versao)
      throw new Response("A tabela mudou. Recarregue antes de editar.", {
        status: 409,
      });
    const linhas = atual.dados.linhas.map((l) =>
      lerLinha(form, l.id, l.id, atual.dados, l),
    );
    if (String(form.get("nova.nome") ?? "").trim())
      linhas.push(lerLinha(form, "nova", crypto.randomUUID(), atual.dados));
    const [nova] = await tx
      .insert(versoesReferencia)
      .values({
        tabela: codigo,
        versao: atual.versao + 1,
        dados: { ...atual.dados, linhas },
        autorId: usuario.id,
        criadaEm: agora,
      })
      .returning();
    return nova;
  });
}

import { and, asc, eq, sql, isNull } from "drizzle-orm";
import { db } from "~/db/client.server";
import {
  intermediarios,
  opcoesConhecidas,
  viagens,
  orcamentos,
} from "~/db/schema";
import {
  MEIOS_DE_CONTATO,
  rotuloCategoria,
  rotuloIdioma,
  rotuloMarca,
  rotuloCanal,
  rotuloOrigem,
} from "~/modules/viagens/rotulos";
import {
  traduzir,
  type ChaveTraducao,
  type IdiomaInterface,
} from "~/modules/idiomas/catalogo";
const normalizar = (texto: string) =>
  texto
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();
const iniciais: Record<string, Record<string, ChaveTraducao>> = {
  periodo: {
    completo: "Dia completo",
    meio: "Meio período",
    livre: "Dia livre",
    deslocamento: "Deslocamento",
  },
  origem: rotuloOrigem,
  canalComercial: rotuloCanal,
  categoria: rotuloCategoria,
  idiomaCliente: rotuloIdioma,
  idiomaGuiamento: rotuloIdioma,
  marca: rotuloMarca,
  cidades: { Seul: "Seul", Busan: "Busan", Jeju: "Jeju" },
  meiosContato: Object.fromEntries(MEIOS_DE_CONTATO.map((m) => [m, m])),
};
export async function semearOpcoes() {
  for (const [campo, rotulos] of Object.entries(iniciais)) {
    for (const [valor, nomePt] of Object.entries(rotulos)) {
      await db
        .insert(opcoesConhecidas)
        .values({
          campo,
          valor,
          normalizado: normalizar(nomePt),
          nomePt,
          nomeKo: traduzir("ko", nomePt),
          regular: true,
        })
        .onConflictDoNothing();
    }
  }
}
export async function listarOpcoes(campo: string, idioma: IdiomaInterface) {
  const linhas = await db
    .select()
    .from(opcoesConhecidas)
    .where(eq(opcoesConhecidas.campo, campo))
    .orderBy(asc(opcoesConhecidas.id));
  return linhas.map((o) => ({
    valor: o.valor,
    nome: idioma === "ko" ? o.nomeKo : o.nomePt,
    contexto: o.contexto,
  }));
}
export async function registrarOpcao(
  campo: string,
  valor: string,
  contexto: Record<string, string> = {},
): Promise<string> {
  valor = valor.trim();
  if (!valor) throw new Response("Informe uma opção", { status: 400 });
  const conhecidas = await db
    .select()
    .from(opcoesConhecidas)
    .where(eq(opcoesConhecidas.campo, campo));
  const existente = conhecidas.find(
    (o) =>
      o.valor === valor ||
      normalizar(o.nomePt) === normalizar(valor) ||
      normalizar(o.nomeKo) === normalizar(valor),
  );
  if (existente) {
    const novos = Object.fromEntries(
      Object.entries(contexto).filter(([k, v]) => v && !existente.contexto[k]),
    );
    if (Object.keys(novos).length)
      await db
        .update(opcoesConhecidas)
        .set({ contexto: { ...existente.contexto, ...novos } })
        .where(eq(opcoesConhecidas.id, existente.id));
    return existente.valor;
  }
  const normalizado = normalizar(valor);
  await db
    .insert(opcoesConhecidas)
    .values({
      campo,
      valor,
      normalizado,
      nomePt: valor,
      nomeKo: valor,
      regular: false,
      contexto,
    })
    .onConflictDoNothing();
  const [gravada] = await db
    .select()
    .from(opcoesConhecidas)
    .where(
      and(
        eq(opcoesConhecidas.campo, campo),
        eq(opcoesConhecidas.normalizado, normalizado),
      ),
    );
  return gravada.valor;
}
export async function nomeOpcao(
  campo: string,
  valor: string,
  idioma: IdiomaInterface,
) {
  const [opcao] = await db
    .select()
    .from(opcoesConhecidas)
    .where(
      and(eq(opcoesConhecidas.campo, campo), eq(opcoesConhecidas.valor, valor)),
    );
  return opcao ? (idioma === "ko" ? opcao.nomeKo : opcao.nomePt) : valor;
}

export async function registrarIntermediario(valor: string, canal: string) {
  const todos = await db.select().from(intermediarios);
  const existente = todos.find(
    (o) =>
      String(o.id) === valor ||
      normalizar(o.nome) === normalizar(valor) ||
      normalizar(`${o.nome} (${o.tipo})`) === normalizar(valor),
  );
  if (existente) return existente.id;
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${normalizar(valor)}, 1))`,
    );
    const [reutilizado] = await tx
      .select()
      .from(intermediarios)
      .where(sql`lower(${intermediarios.nome}) = lower(${valor.trim()})`);
    if (reutilizado) return reutilizado.id;
    const [criado] = await tx
      .insert(intermediarios)
      .values({
        nome: valor.trim(),
        tipo: canal === "operadora" ? "operadora" : "agencia",
        canalComercial: canal,
      })
      .returning();
    return criado.id;
  });
}

export async function administrarOpcoes(
  usuario: { papel: string },
  comando: string,
  id: number,
  nome: string,
  destinoId: number,
) {
  if (usuario.papel !== "admin")
    throw new Response("Acesso restrito", { status: 403 });
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`lock table opcoes_conhecidas in share row exclusive mode`,
    );
    const [origem] = await tx
      .select()
      .from(opcoesConhecidas)
      .where(eq(opcoesConhecidas.id, id));
    if (!origem) throw new Response("Opção não encontrada", { status: 404 });
    if (comando === "regularizar") {
      await tx
        .update(opcoesConhecidas)
        .set({ regular: true })
        .where(eq(opcoesConhecidas.id, id));
    } else if (comando === "renomear") {
      if (!nome.trim())
        throw new Response("Informe uma opção", { status: 400 });
      const [duplicada] = await tx
        .select()
        .from(opcoesConhecidas)
        .where(
          and(
            eq(opcoesConhecidas.campo, origem.campo),
            eq(opcoesConhecidas.normalizado, normalizar(nome)),
          ),
        );
      if (duplicada && duplicada.id !== id)
        throw new Response("Opção já existente", { status: 409 });
      await tx
        .update(opcoesConhecidas)
        .set({
          nomePt: nome.trim(),
          nomeKo: nome.trim(),
          normalizado: normalizar(nome),
        })
        .where(eq(opcoesConhecidas.id, id));
    } else if (comando === "mesclar") {
      const [destino] = await tx
        .select()
        .from(opcoesConhecidas)
        .where(eq(opcoesConhecidas.id, destinoId));
      if (!destino || destino.campo !== origem.campo || destino.id === id)
        throw new Response("Destino inválido", { status: 400 });
      const rascunhos = await tx
        .select()
        .from(orcamentos)
        .where(isNull(orcamentos.memoria))
        .for("update");
      const campoJson: Record<string, string> = {
        canalComercial: "canal",
        categoria: "categoria",
        periodo: "periodo",
        moeda: "moeda",
        veiculo: "veiculo",
        cidades: "cidade",
      };
      for (const o of rascunhos) {
        const antes = JSON.stringify(o.dados);
        const dados = JSON.parse(antes, (chave, valor) =>
          chave === campoJson[origem.campo] && valor === origem.valor
            ? destino.valor
            : valor,
        );
        if (antes !== JSON.stringify(dados))
          await tx
            .update(orcamentos)
            .set({ dados, revisao: o.revisao + 1 })
            .where(eq(orcamentos.id, o.id));
      }
      if (["periodo", "moeda", "veiculo"].includes(origem.campo)) {
        await tx.delete(opcoesConhecidas).where(eq(opcoesConhecidas.id, id));
        return;
      }
      if (origem.campo === "cidades" || origem.campo === "meiosContato") {
        const coluna =
          origem.campo === "cidades" ? viagens.cidades : viagens.meiosContato;
        await tx
          .update(viagens)
          .set({
            [origem.campo]: sql`array(select distinct unnest(array_replace(${coluna}, ${origem.valor}, ${destino.valor})))`,
          });
        await tx.delete(opcoesConhecidas).where(eq(opcoesConhecidas.id, id));
        return;
      }
      const campos = {
        hotelNome: viagens.hotelNome,
        nivelRestaurante: viagens.nivelRestaurante,
        ritmo: viagens.ritmo,
        origem: viagens.origem,
        canalComercial: viagens.canalComercial,
        categoria: viagens.categoria,
        marca: viagens.marca,
        idiomaCliente: viagens.idiomaCliente,
        idiomaGuiamento: viagens.idiomaGuiamento,
      };
      if (!(origem.campo in campos))
        throw new Response("Campo inválido", { status: 400 });
      const campo = origem.campo as keyof typeof campos;
      await tx
        .update(viagens)
        .set({ [campo]: destino.valor })
        .where(eq(campos[campo], origem.valor));
      if (campo === "canalComercial")
        await tx
          .update(intermediarios)
          .set({ canalComercial: destino.valor })
          .where(eq(intermediarios.canalComercial, origem.valor));
      await tx.delete(opcoesConhecidas).where(eq(opcoesConhecidas.id, id));
    } else throw new Response("Operação inválida", { status: 400 });
  });
}

export async function opcoesParaAdministrar(usuario: { papel: string }) {
  if (usuario.papel !== "admin")
    throw new Response("Acesso restrito", { status: 403 });
  return db
    .select()
    .from(opcoesConhecidas)
    .orderBy(asc(opcoesConhecidas.campo), asc(opcoesConhecidas.id));
}

export async function listarCatalogo(idioma: IdiomaInterface) {
  const linhas = await db
    .select()
    .from(opcoesConhecidas)
    .orderBy(asc(opcoesConhecidas.id));
  const catalogo: Record<
    string,
    { valor: string; nome: string; contexto: Record<string, string> }[]
  > = {};
  for (const o of linhas)
    (catalogo[o.campo] ??= []).push({
      valor: o.valor,
      nome: idioma === "ko" ? o.nomeKo : o.nomePt,
      contexto: o.contexto,
    });
  return catalogo;
}

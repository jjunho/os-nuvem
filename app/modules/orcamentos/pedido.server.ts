import { and, eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { orcamentos, viagens, viajantes } from "~/db/schema";
import type { DiaOrcamento } from "./calculo";
export type PedidoExtraido = {
  inicio: string;
  fim: string;
  pagantes: number;
  gratuidades: number;
  cidades: string[];
  programa: string;
  dias: number;
};
export function extrairPedido(texto: string): PedidoExtraido {
  const datas = [
    ...texto.matchAll(/\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})\b/g),
  ].map((m) => {
    const p = m[0].split("/");
    return p.length === 3
      ? `${p[2]}-${p[1].padStart(2, "0")}-${p[0].padStart(2, "0")}`
      : m[0];
  });
  const pagantes = Number(
    texto.match(/(\d+)\s*(?:pagantes|pax|pessoas|viajantes|passageiros)/i)?.[1],
  );
  const gratuidades = Number(
    texto.match(/(\d+)\s*(?:gratuidades|gratuitos)/i)?.[1] ?? 0,
  );
  const cidades = [
    "Seul",
    "Busan",
    "Jeju",
    "Gyeongju",
    "Incheon",
    "Gangneung",
    "Wonju",
    "Andong",
    "Jeonju",
    "DMZ",
  ].filter((c) => new RegExp(`\\b${c}\\b`, "i").test(texto));
  const inicio = datas[0],
    fim = datas[1] ?? inicio;
  const dias =
    Math.floor((Date.parse(fim) - Date.parse(inicio)) / 86400000) + 1;
  if (
    !inicio ||
    !Number.isFinite(dias) ||
    dias < 1 ||
    dias > 730 ||
    !Number.isInteger(pagantes) ||
    pagantes < 1 ||
    pagantes + gratuidades > 1000 ||
    !cidades.length
  )
    throw new Response(
      "Não foi possível identificar datas, cidades e viajantes. Revise o texto ou use a edição manual.",
      { status: 400 },
    );
  return {
    inicio,
    fim,
    pagantes,
    gratuidades,
    cidades,
    programa: texto.trim(),
    dias,
  };
}
export async function confirmarPedido(
  id: number,
  revisao: number,
  texto: string,
) {
  const pedido = extrairPedido(texto);
  return db.transaction(async (tx) => {
    const [o] = await tx
      .select()
      .from(orcamentos)
      .where(eq(orcamentos.id, id))
      .for("update");
    if (!o || o.estado !== "rascunho" || o.revisao !== revisao)
      throw new Response("O orçamento mudou. Recarregue antes de confirmar.", {
        status: 409,
      });
    const [viagem] = await tx
      .select()
      .from(viagens)
      .where(eq(viagens.id, o.viagemId))
      .for("update");
    const existentes = await tx
      .select()
      .from(viajantes)
      .where(eq(viajantes.viagemId, viagem.id));
    const novos = [
      ...Array(
        Math.max(
          0,
          pedido.pagantes - existentes.filter((v) => v.pagante).length,
        ),
      ).keys(),
    ].map(() => ({ viagemId: viagem.id, pagante: true }));
    novos.push(
      ...[
        ...Array(
          Math.max(
            0,
            pedido.gratuidades - existentes.filter((v) => !v.pagante).length,
          ),
        ).keys(),
      ].map(() => ({ viagemId: viagem.id, pagante: false })),
    );
    if (novos.length) await tx.insert(viajantes).values(novos);
    await tx
      .update(viagens)
      .set({
        dataInicio: pedido.inicio,
        dataFim: pedido.fim,
        cidades: pedido.cidades,
      })
      .where(eq(viagens.id, viagem.id));
    const dados = structuredClone(o.dados);
    const opcao = dados.opcoes[0];
    const modelo = opcao.dias[0];
    opcao.pagantes = pedido.pagantes;
    opcao.gratuidades = pedido.gratuidades;
    opcao.dias = Array.from({ length: pedido.dias }, (_, i): DiaOrcamento => ({
      id: crypto.randomUUID(),
      data: new Date(Date.parse(pedido.inicio) + i * 86400000)
        .toISOString()
        .slice(0, 10),
      cidade:
        pedido.cidades[
          Math.min(
            pedido.cidades.length - 1,
            Math.floor((i * pedido.cidades.length) / pedido.dias),
          )
        ],
      periodo: "completo",
      manha: i === 0 ? pedido.programa : "",
      almoco: "",
      tarde: "",
      linhas: (modelo?.linhas ?? [])
        .filter((l) => l.regra || l.automatica)
        .map((l) => ({
          ...l,
          id: crypto.randomUUID(),
          valor: null,
          quantidadeManual: false,
          motivoAjuste: undefined,
          autorAjuste: undefined,
          ajustadoEm: undefined,
        })),
    }));
    const [salvo] = await tx
      .update(orcamentos)
      .set({ dados, revisao: o.revisao + 1 })
      .where(eq(orcamentos.id, id))
      .returning();
    return salvo;
  });
}

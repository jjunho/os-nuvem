import type { Cartao } from "~/modules/comunicador/cartao";
/** All task surfaces use the same projection after server authorization. */
export function projetarTarefa(
  d: {
    id: number;
    codigo: string;
    titulo: string;
    estado: string;
    prazo: Date | null;
    responsavel: string;
    preco?: number;
    tipo?: string;
  },
  referencia = d.codigo,
): Cartao & { url: string } {
  return {
    referencia,
    titulo: `${d.codigo} · ${d.titulo}`,
    url: `/tarefas/${d.id}`,
    estado: d.estado,
    prazo: d.prazo?.toISOString(),
    responsavel: d.responsavel,
    tarefaId: d.id,
    manual: d.tipo === "manual",
    ...(d.preco != null ? { preco: d.preco } : {}),
  };
}

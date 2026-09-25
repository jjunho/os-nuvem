import { rotuloEtapa } from "./rotulos";
import { inferirEtapa, type FatoEtapa } from "./etapas";
import { ETAPAS_ABERTAS, prazoPrimeiraResposta } from "./regras";
export type ModeloEtapa = {
  id: number;
  item: string;
  etapa: string;
  titulo: string;
  horas: number | null;
  destinatario: string;
  usuarioId: number | null;
  fato: string;
  ativo: boolean;
  vigenteDesde: Date;
};
export type DecisaoTarefaEtapa = {
  chave: string;
  entrada: string;
  etapa: string;
  modelo: ModeloEtapa;
  prazo: Date;
  estado: "aberta" | "concluida" | "cancelada";
  fatoId: number | null;
  motivo: string | null;
};
/** A deterministic replay. A stage entry owns its template version and only facts in its cycle. */
export function inferirTarefasEtapa(input: {
  fatos: readonly FatoEtapa[];
  modelos: readonly ModeloEtapa[];
  criadaEm: Date;
  canal: string;
  agora: Date;
}) {
  const corrigidos = new Set(
    input.fatos.filter((f) => f.tipo === "correcao").map((f) => f.corrigeId),
  );
  const fatos = [...new Map(input.fatos.map((f) => [f.id, f])).values()]
    .filter((f) => f.tipo !== "correcao" && !corrigidos.has(f.id))
    .sort((a, b) => +a.em - +b.em || a.id - b.id);
  const entradas: {
    chave: string;
    etapa: string;
    em: Date;
    inicio: number;
    fim: number;
  }[] = [
    {
      chave: "inicial",
      etapa: "lead",
      em: input.criadaEm,
      inicio: -1,
      fim: fatos.length,
    },
  ];
  for (let i = 0; i < fatos.length; i++) {
    const etapa = inferirEtapa(fatos.slice(0, i + 1));
    const anterior = entradas[entradas.length - 1];
    if (
      etapa !== anterior.etapa ||
      (fatos[i].tipo === "envio" && etapa === "proposta_enviada")
    ) {
      anterior.fim = i;
      entradas.push({
        chave: `fato:${fatos[i].id}`,
        etapa,
        em: fatos[i].em,
        inicio: i,
        fim: fatos.length,
      });
    }
  }
  const tarefas: DecisaoTarefaEtapa[] = [];
  let semResposta = false;
  for (const entrada of entradas) {
    if (!ETAPAS_ABERTAS.includes(entrada.etapa as never)) continue;
    const versoes = new Map<string, ModeloEtapa>();
    for (const m of [...input.modelos].sort(
      (a, b) => +a.vigenteDesde - +b.vigenteDesde || a.id - b.id,
    ))
      if (m.etapa === entrada.etapa && m.vigenteDesde <= entrada.em)
        versoes.set(m.item, m);
    const ciclo = fatos.slice(entrada.inicio + 1, entrada.fim + 1);
    const resposta = ciclo.find((f) =>
      ["pensando", "mudancas", "aceite", "perda"].includes(f.tipo),
    );
    const saida = entrada.fim < fatos.length ? fatos[entrada.fim] : null;
    for (const m of versoes.values()) {
      if (!m.ativo) continue;
      const recorrente = m.item === "followup";
      const intervalo = Math.max(1, m.horas ?? 72) * 3600000;
      const ate = resposta?.em ?? saida?.em ?? input.agora;
      const quantidade = recorrente
        ? Math.max(3, Math.floor((+ate - +entrada.em) / intervalo))
        : 1;
      if (
        recorrente &&
        !resposta &&
        !saida &&
        +input.agora >= +entrada.em + 4 * intervalo
      )
        semResposta = true;
      const contatos = ciclo.filter((f) => f.tipo === m.fato);
      for (let n = 1; n <= quantidade; n++) {
        const conclusivo = recorrente
          ? (resposta ?? contatos[n - 1])
          : contatos[0];
        tarefas.push({
          chave: `${entrada.chave}:${m.item}:${n}`,
          entrada: entrada.chave,
          etapa: entrada.etapa,
          modelo: m,
          prazo:
            m.horas === null && m.item === "responder"
              ? prazoPrimeiraResposta(input.canal, entrada.em)
              : new Date(+entrada.em + intervalo * n),
          estado: conclusivo ? "concluida" : saida ? "cancelada" : "aberta",
          fatoId: conclusivo?.id ?? null,
          motivo:
            !conclusivo && saida
              ? `Etapa passou para ${rotuloEtapa[inferirEtapa(fatos.slice(0, entrada.fim + 1))]}`
              : null,
        });
      }
    }
  }
  return { etapa: inferirEtapa(fatos), tarefas, semResposta };
}
export const FATOS_MODELO = [
  "contato",
  "cotacao",
  "envio",
  "aceite",
  "pensando",
  "invoice",
  "pagamento",
  "voucher",
] as const;

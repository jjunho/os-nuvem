import type { Etapa } from "./regras";
export type TipoFatoEtapa =
  | "orcamento"
  | "envio"
  | "nova_versao"
  | "mudancas"
  | "pensando"
  | "aceite"
  | "perda"
  | "cancelamento"
  | "descarte"
  | "correcao";
export type FatoEtapa = {
  id: number;
  tipo: TipoFatoEtapa;
  em: Date;
  corrigeId?: number | null;
};
/** Replay facts in event order, excluding facts explicitly undone by a correction. Time alone changes nothing. */
export function inferirEtapa(fatos: readonly FatoEtapa[]): Etapa {
  const corrigidos = new Set(
    fatos.filter((f) => f.tipo === "correcao").map((f) => f.corrigeId),
  );
  let etapa: Etapa = "lead";
  let enviado = false;
  for (const fato of [...fatos].sort(
    (a, b) => a.em.getTime() - b.em.getTime() || a.id - b.id,
  )) {
    if (corrigidos.has(fato.id) || fato.tipo === "correcao") continue;
    if (["perdida", "cancelada", "descartada", "concluida"].includes(etapa))
      continue;
    if (fato.tipo === "perda") etapa = "perdida";
    else if (fato.tipo === "descarte") etapa = "descartada";
    else if (fato.tipo === "cancelamento" && etapa === "confirmada")
      etapa = "cancelada";
    else if (etapa === "confirmada") continue;
    else if (fato.tipo === "aceite") etapa = "confirmada";
    else if (fato.tipo === "envio") {
      etapa = "proposta_enviada";
      enviado = true;
    } else if (
      (fato.tipo === "mudancas" || fato.tipo === "nova_versao") &&
      enviado
    )
      etapa = "em_negociacao";
    else if (fato.tipo === "orcamento" && etapa === "lead")
      etapa = "em_orcamento";
  }
  return etapa;
}

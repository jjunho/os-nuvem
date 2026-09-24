import type { calcularOpcao, RascunhoOrcamento } from "./calculo";
import type { Referencias } from "./sugestoes";
export type CondicoesProposta = {
  sinal: number;
  saldoDias: number;
  validadeDias: number;
  cancelamento: string;
  formasPagamento: string;
  dadosBancarios: string;
  incluso: string;
  naoIncluso: string;
  iva: number;
  notasB2B: string;
  generica: boolean;
  detalhe: "nenhum" | "dia" | "servico";
};
export const condicoesPadrao: CondicoesProposta = {
  sinal: 30,
  saldoDias: 30,
  validadeDias: 15,
  cancelamento:
    "Cancelamento conforme as condições dos fornecedores. Serviços de terceiros emitidos ou reservados não são reembolsáveis; aplica-se a multa do fornecedor e 10% de processamento.",
  formasPagamento:
    "Cartão (+5% por parcela), PIX em BRL (taxa do pagamento × 1,035), Wise.",
  dadosBancarios: "A informar",
  incluso: "Serviços discriminados no roteiro e na opção escolhida.",
  naoIncluso:
    "Despesas pessoais e itens reservados pelo cliente ou pela agência.",
  iva: 0,
  notasB2B: "",
  generica: false,
  detalhe: "nenhum",
};
export type MemoriaOrcamento = {
  numero: string;
  versao: number;
  enviadaEm: string;
  validadeAte: string;
  cliente: string;
  idioma: string;
  marca: string;
  viagemCodigo: string;
  dados: RascunhoOrcamento;
  referencias: Referencias;
  versoesTabelas: Record<string, number>;
  pessoas: {
    id: number;
    nome: string | null;
    idade: number | null;
    pagante: boolean;
  }[];
  calculos: ReturnType<typeof calcularOpcao>[];
  condicoes: CondicoesProposta;
};
export function localizarCondicoes(
  condicoes: CondicoesProposta,
  idioma: string,
): CondicoesProposta {
  const traducoes: Record<string, Partial<CondicoesProposta>> = {
    es: {
      cancelamento:
        "Cancelación según las condiciones de los proveedores. Los servicios de terceros emitidos o reservados no son reembolsables; se aplica la penalización del proveedor más un 10% de gestión.",
      formasPagamento:
        "Tarjeta (+5% por cuota), PIX en BRL (tipo de cambio del pago × 1,035), Wise.",
      dadosBancarios: "Por confirmar",
      incluso: "Servicios indicados en el itinerario y en la opción elegida.",
      naoIncluso:
        "Gastos personales y servicios reservados por el cliente o la agencia.",
    },
    en: {
      cancelamento:
        "Cancellation follows supplier terms. Issued or reserved third-party services are non-refundable; supplier penalties plus a 10% processing charge apply.",
      formasPagamento:
        "Card (+5% per instalment), PIX in BRL (payment exchange rate × 1.035), Wise.",
      dadosBancarios: "To be confirmed",
      incluso: "Services listed in the itinerary and the selected option.",
      naoIncluso:
        "Personal expenses and services booked by the client or agency.",
    },
    fr: {
      cancelamento:
        "Annulation selon les conditions des fournisseurs. Les services tiers émis ou réservés ne sont pas remboursables ; les pénalités du fournisseur et 10 % de frais de traitement s’appliquent.",
      formasPagamento:
        "Carte (+5 % par versement), PIX en BRL (taux du paiement × 1,035), Wise.",
      dadosBancarios: "À confirmer",
      incluso: "Services indiqués dans l’itinéraire et l’option choisie.",
      naoIncluso:
        "Dépenses personnelles et services réservés par le client ou l’agence.",
    },
  };
  const atual = { ...condicoes };
  for (const [chave, valor] of Object.entries(traducoes[idioma] ?? {}))
    if (
      condicoes[chave as keyof CondicoesProposta] ===
      condicoesPadrao[chave as keyof CondicoesProposta]
    )
      Object.assign(atual, { [chave]: valor });
  return atual;
}

export function condicoesDasReferencias(refs: Referencias): CondicoesProposta {
  const condicoes = { ...condicoesPadrao };
  for (const linha of refs.condicoes_proposta?.linhas ?? []) {
    if (["sinal", "saldoDias", "validadeDias", "iva"].includes(linha.id)) {
      const valor = Number(linha.valor);
      if (Number.isFinite(valor))
        Object.assign(condicoes, { [linha.id]: valor });
    } else if (
      [
        "cancelamento",
        "formasPagamento",
        "dadosBancarios",
        "incluso",
        "naoIncluso",
      ].includes(linha.id)
    )
      Object.assign(condicoes, { [linha.id]: String(linha.valor ?? "") });
  }
  return condicoes;
}

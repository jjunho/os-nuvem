import type { PedidoExtraido } from "./pedido.server";
import type { RascunhoOrcamento } from "./calculo";
import type { Importacao } from "./excel.server";

export type Resposta =
  | { tipo: "erro"; erro: string }
  | { tipo: "pagar-taxa" | "enviar" }
  | { tipo: "preparar-pedido"; pedido: PedidoExtraido; texto: string }
  | { tipo: "importar-excel"; importacao: Importacao; revisao: number }
  | {
      tipo: "salvar" | "confirmar-pedido";
      revisao: number;
      dados: RascunhoOrcamento;
    };
export type RetornoOrcamento = Resposta & {
  requestId: string;
  orcamentoId: number;
};

import { mesmaSelecao, type Selecao } from "./estado-ui";
import type { Mensagem } from "./tipos";
import type { Cartao } from "./cartao";

export type Pagina = {
  mensagens: Mensagem[];
  cartoes?: Cartao[];
  leitores?: { nome: string; lida_ate: number }[];
};
export type EstadoPainel = {
  selecao: Selecao;
  carga: "vazia" | "carregando" | "pronta" | "falhou";
  erro: { escopo: Selecao | null; texto: string } | null;
};
export type EventoPainel =
  | { tipo: "selecionar"; conversaId: number | null }
  | { tipo: "pagina"; escopo: Selecao; carga: "carregando" | "pronta" | "falhou" | "vazia" }
  | { tipo: "abertura-falhou"; escopo: Selecao; texto: string }
  | { tipo: "erro"; escopo: Selecao | null; texto: string }
  | { tipo: "descartar" };

export function reduzirPainel(estado: EstadoPainel, evento: EventoPainel): EstadoPainel {
  switch (evento.tipo) {
    case "selecionar": {
      const selecao = { conversaId: evento.conversaId, geracao: estado.selecao.geracao + 1 };
      return { selecao, carga: evento.conversaId === null ? "vazia" : evento.conversaId < 0 ? "pronta" : "carregando", erro: null };
    }
    case "pagina":
      if (!mesmaSelecao(estado.selecao, evento.escopo)) return estado;
      return { ...estado, carga: evento.carga, erro: evento.carga === "falhou" ? estado.erro : null };
    case "abertura-falhou":
      if (!mesmaSelecao(estado.selecao, evento.escopo)) return estado;
      return { ...estado, carga: "falhou", erro: { escopo: evento.escopo, texto: evento.texto } };
    case "erro":
      if (evento.escopo && !mesmaSelecao(estado.selecao, evento.escopo)) return estado;
      return { ...estado, erro: { escopo: evento.escopo, texto: evento.texto } };
    case "descartar":
      return { ...estado, selecao: { ...estado.selecao, geracao: estado.selecao.geracao + 1 }, erro: null };
  }
}

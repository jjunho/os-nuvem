import type { Disponibilidade } from "~/modules/profissionais/profissionais.server";
import type { OrcamentoLido } from "./orcamentos.server";
import type { DiaOrcamento, LinhaCusto, OpcaoOrcamento } from "./calculo";
import type { CondicoesProposta } from "./versoes";

export type Carregados = OrcamentoLido &
  Disponibilidade & {
    destinatario: string;
  };

export type CriarLinha =
  | { tipo: "vazia" }
  | { tipo: "hotel" }
  | { tipo: "item"; item: string }
  | { tipo: "transfer"; trecho: string; nivel: string };

export type MudarOpcao = (fn: (opcao: OpcaoOrcamento) => void) => void;
export type MudarDia = (fn: (dia: DiaOrcamento) => void) => void;
export type MudarLinha = (fn: (linha: LinhaCusto) => void) => void;
export type MudarCondicoes = (fn: (condicoes: CondicoesProposta) => void) => void;

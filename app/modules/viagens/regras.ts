// Pure rules for the first-contact part of a Viagem. No I/O, no clock:
// callers pass "now" in. Values here are Valores sugeridos (ADR-0001).

export type CanalComercial = "operadora" | "agencia" | "cliente_final" | "influencer";
export type Etapa =
  | "lead"
  | "em_orcamento"
  | "proposta_enviada"
  | "em_negociacao"
  | "confirmada"
  | "em_viagem"
  | "concluida"
  | "perdida"
  | "cancelada"
  | "descartada";

export const ETAPAS_ABERTAS: readonly Etapa[] = [
  "lead",
  "em_orcamento",
  "proposta_enviada",
  "em_negociacao",
  "confirmada",
  "em_viagem",
];

export const ETAPAS_ENCERRADAS: readonly Etapa[] = ["concluida", "perdida", "cancelada", "descartada"];

const HORA = 60 * 60 * 1000;

// Padrão provisório (docs/padroes-provisorios.md, "Resposta por canal"):
// B2C waits least, Operadora short, Agência within the business day.
export const PRAZO_PRIMEIRA_RESPOSTA_HORAS: Record<CanalComercial, number> = {
  cliente_final: 2,
  influencer: 2,
  operadora: 4,
  agencia: 8,
};

export const ALERTA_SEM_RESPOSTA_HORAS = 24;

export function prazoPrimeiraResposta(canal: CanalComercial, criadaEm: Date): Date {
  return new Date(criadaEm.getTime() + PRAZO_PRIMEIRA_RESPOSTA_HORAS[canal] * HORA);
}

export function semRespostaHumana(v: {
  etapa: Etapa;
  criadaEm: Date;
  primeiraRespostaEm: Date | null;
}, agora: Date): boolean {
  if (v.primeiraRespostaEm) return false;
  if (!ETAPAS_ABERTAS.includes(v.etapa)) return false;
  return agora.getTime() - v.criadaEm.getTime() >= ALERTA_SEM_RESPOSTA_HORAS * HORA;
}

export function codigoDaViagem(ano: number, sequencia: number): string {
  const aa = String(ano % 100).padStart(2, "0");
  return `V${aa}-${String(sequencia).padStart(4, "0")}`;
}

export function marcaSugerida(canal: CanalComercial): "corealux" | "guia_na_coreia" {
  return canal === "agencia" || canal === "operadora" ? "corealux" : "guia_na_coreia";
}

export function podeDescartar(etapa: Etapa): boolean {
  return etapa === "lead";
}

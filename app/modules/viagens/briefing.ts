export type Planejamento = {
  dataInicio: string | null;
  dataFim: string | null;
  hotelNome: string | null;
  hotelEndereco: string | null;
  nivelRestaurante: string | null;
  ritmo: string | null;
  interesses: string | null;
  pontosDesejados: string | null;
};
import type { ChaveTraducao } from "~/modules/idiomas/catalogo";
export const perguntas = {
  pt: {
    datas: "Datas",
    viajantes: "Viajantes",
    idades: "Idades",
    hotel: "Hotel",
    mobilidade: "Mobilidade",
    alimentacao: "O que você não come",
    nivelRestaurante: "Nível de restaurante",
    ritmo: "Ritmo",
    interesses: "Interesses",
    pontosDesejados: "Pontos que gostaria",
  },
  es: {
    datas: "Fechas",
    viajantes: "Viajeros",
    idades: "Edades",
    hotel: "Hotel",
    mobilidade: "Movilidad",
    alimentacao: "Qué no come",
    nivelRestaurante: "Nivel de restaurantes",
    ritmo: "Ritmo",
    interesses: "Intereses",
    pontosDesejados: "Lugares que le gustaría visitar",
  },
  en: {
    datas: "Dates",
    viajantes: "Travellers",
    idades: "Ages",
    hotel: "Hotel",
    mobilidade: "Mobility",
    alimentacao: "What you do not eat",
    nivelRestaurante: "Restaurant level",
    ritmo: "Pace",
    interesses: "Interests",
    pontosDesejados: "Places you would like to visit",
  },
  fr: {
    datas: "Dates",
    viajantes: "Voyageurs",
    idades: "Âges",
    hotel: "Hôtel",
    mobilidade: "Mobilité",
    alimentacao: "Ce que vous ne mangez pas",
    nivelRestaurante: "Gamme de restaurants",
    ritmo: "Rythme",
    interesses: "Centres d’intérêt",
    pontosDesejados: "Lieux que vous souhaitez visiter",
  },
} as const satisfies {
  pt: Record<string, ChaveTraducao>;
  es: Record<string, string>;
  en: Record<string, string>;
  fr: Record<string, string>;
};
export type DadoFaltante = keyof typeof perguntas.pt;
export function dadosFaltantes(
  v: Planejamento,
  pessoas: {
    nascimento?: string | null;
    idade: number | null;
    mobilidade: string | null;
    alimentacao: string | null;
  }[],
): DadoFaltante[] {
  const faltas: DadoFaltante[] = [];
  if (!v.dataInicio || !v.dataFim) faltas.push("datas");
  if (!pessoas.length) faltas.push("viajantes");
  if (!pessoas.length || pessoas.some((p) => p.idade === null && !p.nascimento))
    faltas.push("idades");
  if (!v.hotelNome) faltas.push("hotel");
  if (!pessoas.length || pessoas.some((p) => !p.mobilidade))
    faltas.push("mobilidade");
  if (!pessoas.length || pessoas.some((p) => !p.alimentacao))
    faltas.push("alimentacao");
  for (const campo of [
    "nivelRestaurante",
    "ritmo",
    "interesses",
    "pontosDesejados",
  ] as const)
    if (!v[campo]) faltas.push(campo);
  return faltas;
}
export function mensagemDeBriefing(idioma: string, faltas: DadoFaltante[]) {
  const catalogo = perguntas[idioma as keyof typeof perguntas];
  if (!catalogo) return "A informar";
  const inicio = {
    pt: "Para planejar sua viagem, informe:",
    es: "Para planificar su viaje, indique:",
    en: "To plan your trip, please provide:",
    fr: "Pour préparer votre voyage, veuillez préciser :",
  };
  return faltas.length
    ? `${inicio[idioma as keyof typeof inicio]}\n${faltas.map((f) => `• ${catalogo[f]}`).join("\n")}`
    : "";
}

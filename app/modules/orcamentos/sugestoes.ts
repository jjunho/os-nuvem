import type { DadosReferencia } from "~/modules/tabelas/linha";
export type Referencias = Record<string, DadosReferencia>;
export function valorReferencia(
  refs: Referencias,
  tabela: string,
  id: string,
  campo = "valor",
): number | null {
  const v = refs[tabela]?.linhas.find((l) => l.id === id)?.[campo];
  return typeof v === "number" ? v : null;
}
export function sugerirEquipe(categoria: string, pax: number) {
  const tamanho = categoria === "vip" ? 5 : categoria === "premium" ? 7 : null;
  if (!tamanho) return { guias: 1, assistentes: 0 };
  const n = Math.max(1, Math.ceil(pax / tamanho));
  return { guias: Math.ceil(n / 2), assistentes: Math.floor(n / 2) };
}
export function calcularDiaria(
  d: {
    base: number | null;
    tipo: "guia" | "assistente" | "carro";
    minutos: number | null;
    adicionais: number[];
    noturno?: boolean;
  },
  refs: Referencias,
) {
  if (d.base === null || d.minutos === null)
    return { valor: null, extras: 0, provisorio: true };
  const meia = valorReferencia(refs, "fatores", "meia") ?? 0.6;
  const intermediaria =
    valorReferencia(refs, "fatores", "intermediaria") ?? 0.8;
  const fator = d.minutos <= 240 ? meia : d.minutos <= 360 ? intermediaria : 1;
  const percentualExtra =
    valorReferencia(
      refs,
      "jornada",
      d.tipo === "carro" ? "extra_carro" : "extra_equipe",
    ) ?? (d.tipo === "carro" ? 0.08 : 0.07);
  const noturno =
    d.noturno && d.tipo !== "carro"
      ? (valorReferencia(refs, "jornada", "noturno") ?? 0.15)
      : 0;
  const extras =
    d.base * Math.max(0, Math.floor((d.minutos - 540) / 60)) * percentualExtra;
  return {
    valor: Math.round(
      d.base * (1 + d.adicionais.reduce((a, b) => a + b, 0) + noturno) * fator +
        extras,
    ),
    extras,
    provisorio: d.minutos <= 360,
  };
}
function dentro(data: string, inicio: string, fim: string) {
  return inicio <= fim
    ? data >= inicio && data <= fim
    : data >= inicio || data <= fim;
}
export function temporada(
  data: string,
  refs: Referencias,
  tabela = "temporada_corealux",
) {
  const instante = Date.parse(`${data}T00:00:00Z`);
  const janela =
    (valorReferencia(refs, "fatores", "feriado_janela") ?? 2) * 86400000;
  const feriado =
    refs.feriados?.linhas.some(
      (l) =>
        instante >= Date.parse(String(l.inicio)) - janela &&
        instante <= Date.parse(String(l.fim)) + janela,
    ) ?? false;
  if (feriado && tabela !== "temporada_onibus")
    return {
      adicional: Number(
        (
          (valorReferencia(refs, "fatores", "temporada_feriado") ?? 1.2) - 1
        ).toFixed(8),
      ),
      feriado: true,
    };
  const dia = data.slice(5);
  const fatores =
    refs[tabela]?.linhas
      .filter((l) =>
        dentro(dia, String(l.inicio), String(l.fim).replace("ultimo", "29")),
      )
      .map((l) => Number(l.fator)) ?? [];
  return {
    adicional: Number(
      ((fatores.length ? Math.max(...fatores) : 1) - 1).toFixed(8),
    ),
    feriado: false,
  };
}
export function adicionalEvento(data: string, refs: Referencias) {
  return Math.max(
    0,
    ...(refs.eventos?.linhas
      .filter((l) => data >= String(l.inicio) && data <= String(l.fim))
      .map((l) => Number(l.adicional)) ?? []),
  );
}

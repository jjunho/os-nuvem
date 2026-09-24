import { valorReferencia, type Referencias } from "./sugestoes";
export function calcularOnibus(
  base: number,
  porte: number,
  temporada: number,
  fimSemana: number,
  refs: Referencias,
) {
  return Math.round(
    base *
      porte *
      Math.max(temporada, fimSemana) *
      (1 + (valorReferencia(refs, "fatores", "onibus") ?? 0.15)),
  );
}
export function multaOnibus(multa: number, refs: Referencias) {
  return Math.round(
    multa * (1 + (valorReferencia(refs, "fatores", "processamento") ?? 0.1)),
  );
}
export function avaliarVeiculo(
  modelo: string,
  pax: number,
  equipe: number,
  malas: number,
  refs: Referencias,
) {
  const v = refs.frota?.linhas.find((v) => v.id === modelo);
  const fisicos = typeof v?.assentos === "number" ? v.assentos : null;
  const conforto = typeof v?.conforto === "number" ? v.conforto : null;
  // The driver is one of the guides only for an owned vehicle.
  const capacidade =
    fisicos === null
      ? null
      : Math.max(0, fisicos - equipe - (v?.motorista === "guia" ? 0 : 1));
  const assentosInsuficientes = capacidade !== null && pax > capacidade;
  const bagagemExcedente = conforto !== null && malas > conforto * 2;
  return {
    capacidade,
    conforto,
    confortoExcedido: conforto !== null && pax > conforto,
    assentosInsuficientes,
    bagagemExcedente,
    solucoes: assentosInsuficientes
      ? ["Veículo maior", "Segundo veículo"]
      : bagagemExcedente
        ? ["Veículo maior", "Caminhão de bagagem"]
        : [],
  };
}
export function sugerirVeiculo(
  pax: number,
  equipe: number,
  malas: number,
  categoria: string,
  refs: Referencias,
) {
  const modelos = [
    "spark",
    "sedan",
    "carnival",
    "staria",
    "solati",
    "sprinter",
  ];
  for (const modelo of modelos) {
    if (categoria === "vip" && modelo === "spark") continue;
    const v = avaliarVeiculo(modelo, pax, equipe, malas, refs);
    if (
      v.capacidade !== null &&
      !v.assentosInsuficientes &&
      !v.bagagemExcedente &&
      (v.conforto === null || pax <= v.conforto)
    )
      return { modelo, quantidade: 1 };
  }
  return {
    modelo: "onibus",
    quantidade: Math.ceil(pax / Math.max(1, 45 - 1 - equipe)),
  };
}

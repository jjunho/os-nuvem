import { temporada, valorReferencia, type Referencias } from "./sugestoes";
export function precoItem(
  item: string,
  pax: number,
  data: string,
  refs: Referencias,
  custo?: number | null,
): {
  unitario: number | null;
  quantidade: number;
  grupo: "servicos" | "terceiros" | "hotel";
} {
  let quantidade = pax,
    grupo: "servicos" | "terceiros" | "hotel" = "servicos";
  let unitario = valorReferencia(
    refs,
    "tickets",
    item === "ktx_guia" ? "ktx_economica" : item,
  );
  unitario = unitario === null ? null : unitario * 100;

  if (item === "sky_capsule") quantidade = Math.ceil(pax / 4);
  if (item.startsWith("ktx_")) {
    grupo = "terceiros";
    const feriado = refs.feriados?.linhas.some(
      (f) => data >= String(f.inicio) && data <= String(f.fim),
    );
    if (unitario !== null && feriado)
      unitario *= 1 + (valorReferencia(refs, "fatores", "ktx_feriado") ?? 0.2);
  }
  if (item === "voo_jeju") {
    const semana = new Date(`${data}T00:00:00Z`).getUTCDay();
    const alta =
      temporada(data, refs, "temporada_jeju").feriado ||
      refs.temporada_jeju?.linhas.some(
        (f) =>
          data.slice(5) >= String(f.inicio) && data.slice(5) <= String(f.fim),
      );
    const chave =
      alta || [0, 5, 6].includes(semana)
        ? "jeju_alta"
        : semana === 4
          ? "jeju_quinta"
          : "jeju_baixa";
    const valor = valorReferencia(refs, "tickets", chave);
    unitario = valor === null ? null : valor * 100;
    grupo = "terceiros";
  }
  if (item === "voo_equipe") {
    unitario =
      custo == null
        ? null
        : custo *
          (1 + (valorReferencia(refs, "fatores", "voo_equipe") ?? 0.15));
    grupo = "terceiros";
  }
  return {
    unitario: unitario === null ? null : Math.round(unitario),
    quantidade,
    grupo,
  };
}
export function gorjetaSugerida(
  pax: number,
  categoria: string,
  guias: number,
  assistentes: number,
  motoristas: number,
  refs: Referencias,
) {
  const extra = ["premium", "vip"].includes(categoria)
    ? (valorReferencia(refs, "gorjetas", "premium_vip") ?? 3)
    : 0;
  const valor = (id: string) =>
    (valorReferencia(refs, "gorjetas", id) ?? 0) + extra;
  return Math.round(
    pax *
      100 *
      (guias * valor("guia") +
        assistentes * valor("assistente") +
        motoristas * valor("motorista") +
        valor("backoffice")),
  );
}

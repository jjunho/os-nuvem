import type { IdiomaInterface } from "~/modules/idiomas/catalogo";

type Traduzir = (texto: string) => string;
type OpcaoConhecida = { valor: string; nome: string };

export function conhecidas(
  campo: string,
  base: OpcaoConhecida[],
  catalogo: Record<string, OpcaoConhecida[]>,
  mensagem: Traduzir,
): OpcaoConhecida[] {
  return [
    ...base,
    ...(catalogo[campo] ?? []).filter(
      (opcao) => !base.some((existente) => existente.valor === opcao.valor),
    ),
  ].map((opcao) => ({ ...opcao, nome: mensagem(opcao.nome) }));
}

export function moeda(
  valor: number | null,
  idioma: IdiomaInterface,
  traduzir: Traduzir,
): string {
  return valor === null
    ? traduzir("A informar")
    : new Intl.NumberFormat(idioma === "ko" ? "ko-KR" : "pt-BR", {
        style: "currency",
        currency: "USD",
      }).format(valor / 100);
}

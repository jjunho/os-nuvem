export function precoPagamento(
  valor: number,
  forma: "cartao" | "pix" | "wise",
  taxaBRL = 1,
  fatorCartao = 1.05,
  fatorPix = 1.035,
) {
  return {
    valor: Math.round(
      valor *
        (forma === "cartao"
          ? fatorCartao
          : forma === "pix"
            ? taxaBRL * fatorPix
            : 1),
    ),
    moeda: forma === "pix" ? "BRL" : "USD",
  };
}

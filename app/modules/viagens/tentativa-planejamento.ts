export type Tentativa = { id: string; assinatura: string };
export function identificarTentativa(
  anterior: Tentativa | null,
  assinatura: string,
  novoId: () => string,
): Tentativa {
  return anterior?.assinatura === assinatura
    ? anterior
    : { id: novoId(), assinatura };
}

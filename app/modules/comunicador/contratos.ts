// These are the persisted outbox and write acknowledgements, not a second model
// of the conversation. Invalid input must not acknowledge or discard a send.
export function registro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}
export function identificador(valor: unknown): valor is number {
  return typeof valor === "number" && Number.isSafeInteger(valor) && valor > 0;
}
export class ConfirmacaoInvalida extends Error {}
export function confirmarEnvio(
  valor: unknown,
  destino: number,
  midia = false,
): { id: number; conversaId: number } {
  if (
    !registro(valor) ||
    !identificador(valor.id) ||
    (destino < 0 && !identificador(valor.conversaId)) ||
    (midia && (typeof valor.midiaId !== "string" || !valor.midiaId))
  )
    throw new ConfirmacaoInvalida("Resposta inválida do comunicador");
  return {
    id: valor.id,
    conversaId: destino < 0 ? Number(valor.conversaId) : destino,
  };
}

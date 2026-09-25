/** IDs use PostgreSQL integer columns. Reject coercions rather than changing user intent. */
export function inteiroEntrada(
  valor: unknown,
  {
    min = 1,
    max = 2147483647,
    mensagem = "Identificador inválido",
  }: { min?: number; max?: number; mensagem?: string } = {},
): number {
  const numero =
    typeof valor === "number"
      ? valor
      : typeof valor === "string" && /^[0-9]+$/.test(valor)
        ? Number(valor)
        : NaN;
  if (!Number.isSafeInteger(numero) || numero < min || numero > max)
    throw new Response(mensagem, { status: 400 });
  return numero;
}
export function idOpcional(valor: unknown): number | undefined {
  return valor === null || valor === undefined || valor === ""
    ? undefined
    : inteiroEntrada(valor);
}
export function dataISOValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || valor.startsWith("0000-"))
    return false;
  const timestamp = Date.parse(`${valor}T00:00:00.000Z`);
  return (
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === valor
  );
}

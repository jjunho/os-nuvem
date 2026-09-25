/** Process-local invalidation signals; readers fetch their own authorized data. */
export const eventos = new Set<(id: number, tipo: string) => void>();
export function publicar(id: number, tipo = "mensagem") {
  for (const fn of eventos) fn(id, tipo);
}

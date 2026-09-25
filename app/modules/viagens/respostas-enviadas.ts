// File/Blob content is immutable; the DOM's selected File identifies that selection.
export type RespostasEnviadas = { texto: string; arquivo: File | null };
export function camposReconhecidos(
  enviado: RespostasEnviadas,
  atual: RespostasEnviadas,
) {
  return {
    texto: enviado.texto === atual.texto,
    arquivo: enviado.arquivo === atual.arquivo,
  };
}

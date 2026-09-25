export type DocumentoViajante = { id: string };
/** The media endpoint uses UUID identifiers. Validate before constructing links. */
export function lerDocumentosResposta(entrada: unknown): DocumentoViajante[] {
  if (
    typeof entrada !== "object" ||
    entrada === null ||
    !("documentos" in entrada) ||
    !Array.isArray(entrada.documentos)
  )
    throw new Error("Resposta de documentos inválida");
  const ids = new Set<string>();
  return entrada.documentos.map((documento: unknown) => {
    if (
      typeof documento !== "object" ||
      documento === null ||
      !("id" in documento) ||
      typeof documento.id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        documento.id,
      ) ||
      ids.has(documento.id.toLowerCase())
    )
      throw new Error("Resposta de documentos inválida");
    ids.add(documento.id.toLowerCase());
    return { id: documento.id };
  });
}

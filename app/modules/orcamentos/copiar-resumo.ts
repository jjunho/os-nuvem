export async function copiarResumo(
  url: string,
  io: {
    buscar: (url: string) => Promise<Response>;
    escrever: (texto: string) => Promise<void>;
    atual: () => boolean;
  },
): Promise<boolean> {
  const response = await io.buscar(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const texto = await response.text();
  if (!io.atual()) return false;
  await io.escrever(texto);
  return io.atual();
}

export async function comprimirFoto(arquivo: File): Promise<File> {
  if (!arquivo.type.startsWith("image/")) return arquivo;
  const imagem = await createImageBitmap(arquivo);
  const escala = Math.min(1, 1920 / Math.max(imagem.width, imagem.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(imagem.width * escala));
  canvas.height = Math.max(1, Math.round(imagem.height * escala));
  canvas.getContext("2d")!.drawImage(imagem, 0, 0, canvas.width, canvas.height);
  imagem.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(Error("Imagem inválida"))),
      "image/jpeg",
      0.8,
    ),
  );
  return blob.size < arquivo.size ||
    !["image/jpeg", "image/png", "image/webp"].includes(arquivo.type)
    ? new File([blob], "foto.jpg", { type: "image/jpeg" })
    : arquivo;
}
export async function enviarArquivo(
  conversaId: number,
  arquivo: File,
  clientId: string,
  texto = "",
) {
  const f = new FormData();
  f.set("conversaId", String(conversaId));
  f.set("clientId", clientId);
  f.set("arquivo", arquivo);
  f.set("texto", texto);
  const r = await fetch("/comunicador/midia", { method: "POST", body: f });
  if (!r.ok) throw Error(await r.text());
  return r.json();
}

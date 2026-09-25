import { createHash } from "node:crypto";

export function assinaturaRespostas(
  texto: string,
  arquivos: { nome: string; tipo: string; conteudo: Buffer }[],
) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        texto,
        arquivos.map((a) => [
          a.nome,
          a.tipo,
          createHash("sha256").update(a.conteudo).digest("hex"),
        ]),
      ]),
    )
    .digest("hex");
}
export function conferirRecibo(anterior: string, atual: string) {
  return anterior === atual;
}
export function validarTentativa(valor: FormDataEntryValue | null | undefined) {
  if (valor == null || valor === "") return null;
  if (
    typeof valor !== "string" ||
    !/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(valor)
  )
    throw new Response("Tentativa inválida", { status: 400 });
  return valor;
}

import { identificarTentativa, type Tentativa } from "./tentativa-planejamento";

export function prepararTentativa(
  armazenamento: Pick<Storage, "getItem" | "setItem">,
  chave: string,
  assinatura: string,
  novoId: () => string,
): string {
  const salvo = armazenamento.getItem(chave);
  const valor: unknown = salvo === null ? null : JSON.parse(salvo);
  const anterior: Tentativa | null =
    valor &&
    typeof valor === "object" &&
    "id" in valor &&
    typeof valor.id === "string" &&
    "assinatura" in valor &&
    typeof valor.assinatura === "string"
      ? { id: valor.id, assinatura: valor.assinatura }
      : null;
  const tentativa = identificarTentativa(anterior, assinatura, novoId);
  armazenamento.setItem(chave, JSON.stringify(tentativa));
  return tentativa.id;
}

export async function assinaturaEnvio(
  form: FormData,
  digest: (bytes: ArrayBuffer) => Promise<ArrayBuffer>,
): Promise<string> {
  const valorArquivo = form.get("arquivo");
  const arquivo: File | null =
    typeof File !== "undefined" &&
    valorArquivo instanceof File &&
    valorArquivo.size > 0
      ? valorArquivo
      : null;
  const bytes = arquivo ? await arquivo.arrayBuffer() : new ArrayBuffer(0);
  const resultado = await digest(bytes);
  const conteudo = Array.from(new Uint8Array(resultado), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
  return JSON.stringify([
    String(form.get("textoRecebido") ?? "").trim(),
    arquivo ? [arquivo.name, arquivo.type, conteudo] : null,
  ]);
}

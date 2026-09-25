type Tentativa = { id: string; assinatura: string };
export function identificarTentativa(
  anterior: Tentativa | null,
  assinatura: string,
  novoId: () => string,
): Tentativa {
  return anterior?.assinatura === assinatura
    ? anterior
    : { id: novoId(), assinatura };
}
export function prepararTentativa(chave: string, assinatura: string) {
  const salvo = sessionStorage.getItem(chave);
  const valor: unknown = salvo ? JSON.parse(salvo) : null;
  const anterior =
    valor &&
    typeof valor === "object" &&
    "id" in valor &&
    typeof valor.id === "string" &&
    "assinatura" in valor &&
    typeof valor.assinatura === "string"
      ? { id: valor.id, assinatura: valor.assinatura }
      : null;
  const tentativa = identificarTentativa(anterior, assinatura, () =>
    crypto.randomUUID(),
  );
  sessionStorage.setItem(chave, JSON.stringify(tentativa));
  return tentativa.id;
}
export async function assinaturaEnvio(form: FormData) {
  const arquivo = form.get("arquivo");
  const bytes =
    arquivo instanceof File && arquivo.size
      ? await arquivo.arrayBuffer()
      : new ArrayBuffer(0);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const conteudo = Array.from(new Uint8Array(digest), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
  return JSON.stringify([
    String(form.get("textoRecebido") ?? "").trim(),
    arquivo instanceof File && arquivo.size
      ? [arquivo.name, arquivo.type, conteudo]
      : null,
  ]);
}

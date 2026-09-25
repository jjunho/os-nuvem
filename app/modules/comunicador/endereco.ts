export type EnderecoComunicador = { interna: string | null; conversa: string | null; mensagem: string | null };

export function interpretarEndereco(params: URLSearchParams): EnderecoComunicador {
  return {
    interna: params.get("interna"),
    conversa: params.get("conversa"),
    mensagem: params.get("mensagem"),
  };
}

export function deveAbrirPainel(pathname: string, params: URLSearchParams): boolean {
  return pathname === "/comunicador" || params.has("interna") || params.has("conversa") || params.has("mensagem");
}

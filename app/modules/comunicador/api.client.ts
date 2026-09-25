import { ConfirmacaoInvalida } from "./contratos";
import type { Comando } from "./acoes";

export class RespostaHttp extends Error {
  constructor(readonly status: number, mensagem: string) {
    super(mensagem);
    this.name = "RespostaHttp";
  }
}

export async function comando<T = void>(dados: Comando): Promise<T> {
  const resposta = await fetch("/comunicador/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  if (!resposta.ok) {
    const mensagem = await resposta.text();
    if (resposta.status >= 500 || resposta.status === 408)
      throw new ConfirmacaoInvalida(mensagem || "Confirmação indisponível");
    throw Error(mensagem);
  }
  try {
    return (await resposta.json()) as T;
  } catch {
    throw new ConfirmacaoInvalida("Resposta inválida do comunicador");
  }
}

export async function lerApi<T>(url: string, sinal?: AbortSignal): Promise<T> {
  const resposta = await fetch(url, { signal: sinal });
  if (!resposta.ok) throw new RespostaHttp(resposta.status, await resposta.text());
  return (await resposta.json()) as T;
}

import { expect, test } from "vitest";
import { lerLinha } from "./linha";
import type { DadosReferencia, LinhaReferencia } from "./linha";

const dados: DadosReferencia = {
  colunas: [
    { chave: "valor", nome: "Valor", tipo: "numero" },
    { chave: "inicio", nome: "Início", tipo: "data" },
    { chave: "fim", nome: "Fim", tipo: "data" },
  ],
  linhas: [],
};

const formulario = (valores: Record<string, string>) => {
  const form = new FormData();
  for (const [chave, valor] of Object.entries(valores)) form.set(chave, valor);
  return form;
};

async function respostaDe(acao: () => unknown): Promise<Response> {
  try {
    acao();
  } catch (erro) {
    if (erro instanceof Response) return erro;
    throw erro;
  }
  throw new Error("Esperava resposta de validação");
}

test("linha mantém campos anteriores e interpreta número, texto e datas válidas", () => {
  const anterior: LinhaReferencia = { id: "antiga", nome: "Original", provisorio: "Base" };
  expect(
    lerLinha(
      formulario({
        "linha.nome": "  Nova linha  ",
        "linha.valor": "12.5",
        "linha.inicio": "2026-02-28",
        "linha.fim": "2026-03-01",
      }),
      "linha",
      "nova-id",
      dados,
      anterior,
    ),
  ).toEqual({
    id: "nova-id",
    nome: "Nova linha",
    provisorio: "Base",
    valor: 12.5,
    inicio: "2026-02-28",
    fim: "2026-03-01",
  });
});

test("linha mantém as recusas de nome, valor, data e período", async () => {
  for (const [valores, mensagem] of [
    [{ "linha.valor": "1" }, "Informe o nome"],
    [{ "linha.nome": "X", "linha.valor": "NaN" }, "Valor inválido"],
    [
      { "linha.nome": "X", "linha.valor": "", "linha.inicio": "2026-02-30" },
      "Data inválida",
    ],
    [
      {
        "linha.nome": "X",
        "linha.valor": "",
        "linha.inicio": "2026-03-02",
        "linha.fim": "2026-03-01",
      },
      "Período inválido",
    ],
  ] as [Record<string, string>, string][]) {
    const resposta = await respostaDe(() =>
      lerLinha(formulario(valores), "linha", "id", dados),
    );
    expect(resposta.status).toBe(400);
    expect(await resposta.text()).toBe(mensagem);
  }
});

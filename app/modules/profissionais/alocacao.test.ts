import { expect, test } from "vitest";
import { dadosDeAlocacao, dadosDeProfissional } from "./alocacao";

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

test("profissional interpreta nome, papel, idiomas e especialidades como o formulário atual", async () => {
  expect(
    dadosDeProfissional(
      formulario({
        nome: "  Guia Kim  ",
        papel: "guia",
        idiomas: "pt, ko, , en",
        especialidades: "história, gastronomia",
      }),
    ),
  ).toEqual({
    nome: "Guia Kim",
    papel: "guia",
    idiomas: ["pt", "ko", "en"],
    especialidades: ["história", "gastronomia"],
  });
  const resposta = await respostaDe(() =>
    dadosDeProfissional(formulario({ nome: "", papel: "motorista" })),
  );
  expect(resposta.status).toBe(400);
  expect(await resposta.text()).toBe("Profissional inválido");
});

test("alocação preserva os campos válidos e rejeita identificadores, datas, período e ordem inválidos", async () => {
  expect(
    dadosDeAlocacao(
      formulario({
        profissionalId: "12",
        viagemId: "27",
        inicio: "2026-02-28",
        fim: "2026-03-01",
        periodo: "manha",
      }),
    ),
  ).toEqual({
    profissionalId: 12,
    viagemId: 27,
    inicio: "2026-02-28",
    fim: "2026-03-01",
    periodo: "manha",
  });
  for (const [valores, mensagem] of [
    [
      { profissionalId: "x", viagemId: "27", inicio: "2026-02-28", fim: "2026-03-01", periodo: "manha" },
      "Identificador inválido",
    ],
    [
      { profissionalId: "12", viagemId: "27", inicio: "2026-02-30", fim: "2026-03-01", periodo: "manha" },
      "Alocação inválida",
    ],
    [
      { profissionalId: "12", viagemId: "27", inicio: "2026-03-02", fim: "2026-03-01", periodo: "manha" },
      "Alocação inválida",
    ],
    [
      { profissionalId: "12", viagemId: "27", inicio: "2026-02-28", fim: "2026-03-01", periodo: "noite" },
      "Alocação inválida",
    ],
  ] as [Record<string, string>, string][]) {
    const resposta = await respostaDe(() => dadosDeAlocacao(formulario(valores)));
    expect(resposta.status).toBe(400);
    expect(await resposta.text()).toBe(mensagem);
  }
});

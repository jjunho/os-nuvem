import { expect, test } from "vitest";
import { dadosDeProfissional } from "./profissional";

const formulario = (valores: Record<string, string>) => {
  const form = new FormData();
  for (const [chave, valor] of Object.entries(valores)) form.set(chave, valor);
  return form;
};

function respostaDe(acao: () => unknown): Response {
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
  const resposta = respostaDe(() =>
    dadosDeProfissional(formulario({ nome: "", papel: "motorista" })),
  );
  expect(resposta.status).toBe(400);
  expect(await resposta.text()).toBe("Profissional inválido");
});

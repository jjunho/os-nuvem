import { expect, it } from "vitest";
import {
  bloqueiaEdicao,
  podeSolicitar,
  reduzirVoo,
  vooInicial,
} from "./em-voo";

const livre = { salvando: false, operacao: false, pedido: false, importacao: false };
it("recusa um segundo comando principal enquanto o primeiro está em voo", () => {
  const atual = reduzirVoo(vooInicial, {
    tipo: "solicitou-principal",
    intent: "salvar",
    id: "a",
  });
  expect(
    reduzirVoo(atual, {
      tipo: "solicitou-principal",
      intent: "enviar",
      id: "b",
    }),
  ).toBe(atual);
  expect(podeSolicitar(atual, "enviar", livre)).toBe(false);
});

it("uma resposta antiga não libera a tentativa principal atual", () => {
  const atual = reduzirVoo(vooInicial, {
    tipo: "solicitou-principal",
    intent: "salvar",
    id: "atual",
  });
  expect(reduzirVoo(atual, { tipo: "liberou-principal", id: "antiga" })).toBe(
    atual,
  );
  expect(atual.principal?.id).toBe("atual");
});

it("prévia de pedido e save ocupam slots independentes", () => {
  const pedido = reduzirVoo(vooInicial, {
    tipo: "solicitou-previa",
    intent: "preparar-pedido",
    id: "p",
  });
  expect(podeSolicitar(pedido, "salvar", livre)).toBe(true);
  const salvo = reduzirVoo(pedido, {
    tipo: "solicitou-principal",
    intent: "salvar",
    id: "s",
  });
  expect(salvo.principal?.id).toBe("s");
  expect(salvo.previas["preparar-pedido"]).toBe("p");
  const salvar = reduzirVoo(vooInicial, {
    tipo: "solicitou-principal",
    intent: "salvar",
    id: "s",
  });
  expect(
    podeSolicitar(salvar, "preparar-pedido", { ...livre, salvando: true }),
  ).toBe(true);
  expect(bloqueiaEdicao(salvo)).toBe(false);
});

it("bloqueia edição apenas durante ações que congelam o orçamento", () => {
  for (const intent of [
    "confirmar-pedido",
    "enviar",
    "pagar-taxa",
    "nova-versao",
  ] as const) {
    const voo = reduzirVoo(vooInicial, {
      tipo: "solicitou-principal",
      intent,
      id: intent,
    });
    expect(bloqueiaEdicao(voo)).toBe(true);
  }
  const salvar = reduzirVoo(vooInicial, {
    tipo: "solicitou-principal",
    intent: "salvar",
    id: "salvar",
  });
  expect(bloqueiaEdicao(salvar)).toBe(false);
});

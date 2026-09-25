import { expect, it } from "vitest";
import { validarRascunho, lerIntent, lerInteiroPositivo } from "./validacao";
const base = () => ({
  canal: "agencia",
  categoria: "padrao",
  diaInicial: 1,
  opcoes: [
    {
      id: "o",
      nome: "Opção A",
      pagantes: 2,
      gratuidades: 0,
      margem: 0.3,
      dias: [
        {
          id: "d",
          data: "2026-11-01",
          cidade: "Seul",
          periodo: "completo",
          manha: "",
          almoco: "",
          tarde: "",
          linhas: [
            {
              id: "l",
              nome: "Guia",
              quantidade: 1,
              valor: null,
              moeda: "USD",
              grupo: "servicos",
            },
          ],
        },
      ],
    },
  ],
});
it("aceita draft completo e opcionais legítimos, sem alterar entrada", () => {
  const v = base();
  expect(validarRascunho(v)).toEqual(v);
  expect(v).toEqual(base());
});
it.each([
  null,
  [],
  {},
  { ...base(), categoria: 3 },
  { ...base(), canal: null },
  { ...base(), condicoes: { sinal: 30 } },
  { ...base(), taxaElaboracao: { ativa: "false", valor: 0 } },
])("rejeita estrutura externa inválida com 400 (%j)", (v) => {
  try {
    validarRascunho(v);
    expect.fail("accepted");
  } catch (e) {
    expect(e).toBeInstanceOf(Response);
    expect((e as Response).status).toBe(400);
  }
});
it("rejeita viajantes, texto e motivo de ajuste com tipos errados antes de chamar trim", () => {
  for (const alteracao of [
    { viajanteIds: "1" },
    { motivoAjuste: 3, regra: "guia", valor: 100 },
    { hotel: { nome: 3 } },
  ]) {
    const v = base();
    Object.assign(v.opcoes[0].dias[0].linhas[0], alteracao);
    expect(() => validarRascunho(v)).toThrow(Response);
  }
});
it("preserva limites de domínio e rejeita ids duplicados", () => {
  const v = base();
  v.opcoes[0].dias[0].linhas[0].quantidade = 10000;
  expect(() => validarRascunho(v)).not.toThrow();
  v.opcoes[0].dias[0].linhas[0].quantidade = 10001;
  expect(() => validarRascunho(v)).toThrow(Response);
  v.opcoes[0].dias[0].linhas[0].quantidade = 1;
  v.opcoes[0].dias[0].id = "o";
  expect(() => validarRascunho(v)).toThrow(Response);
});
it("intents e inteiros não aceitam ausência, typo, fração ou coerção ambígua", () => {
  expect(lerIntent("salvar")).toBe("salvar");
  for (const v of [null, "", "SALVAR", "apagar"])
    expect(() => lerIntent(v)).toThrow(Response);
  expect(lerInteiroPositivo("1")).toBe(1);
  for (const v of [null, "", 0, "0", "-1", "1.2", "1e2", "Infinity"])
    expect(() => lerInteiroPositivo(v)).toThrow(Response);
});
it("snapshot validado não compartilha objetos mutáveis com entrada", () => {
  const entrada = base();
  const snapshot = validarRascunho(entrada);
  entrada.opcoes[0].nome = "mudou";
  expect(snapshot.opcoes[0].nome).toBe("Opção A");
});
it("categoria vazia e data impossível recebem 400 antes de efeitos externos", () => {
  const v = base();
  v.categoria = " ";
  expect(() => validarRascunho(v)).toThrow(Response);
  v.categoria = "padrao";
  v.opcoes[0].dias[0].data = "2026-02-30";
  expect(() => validarRascunho(v)).toThrow(Response);
});
it("ids e revisão respeitam limite integer PostgreSQL", () => {
  expect(lerInteiroPositivo("2147483647")).toBe(2147483647);
  expect(() => lerInteiroPositivo("2147483648")).toThrow(Response);
});

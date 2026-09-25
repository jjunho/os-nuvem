import { expect, it } from "vitest";
import {
  iniciarEditor,
  editor,
  reconciliar,
  iniciarRevisao,
  revisar,
} from "./editor";
const inicial = () => iniciarEditor(1, 3, { valor: "original" });
it("falha conserva base/revisão e sucesso reconhece somente snapshot enviado", () => {
  const s = editor(inicial(), {
    tipo: "salvar",
    id: "a",
    snapshot: { valor: "A" },
    alterado: true,
  });
  const erro = editor(s, { tipo: "falha", id: "a", erro: "inválido" });
  expect(erro.base).toEqual({ valor: "original" });
  expect(erro.revisao).toBe(3);
  const salvo = editor(s, {
    tipo: "salvo",
    id: "a",
    revisao: 4,
    dados: { valor: "A" },
  });
  expect(salvo.base).toEqual({ valor: "A" });
  expect(salvo.revisao).toBe(4);
  expect(
    reconciliar({ valor: "A" }, { valor: "B" }, { valor: "A normalizado" }),
  ).toEqual({ valor: "B" });
  expect(
    reconciliar({ valor: "A" }, { valor: "A" }, { valor: "A normalizado" }),
  ).toEqual({ valor: "A normalizado" });
});
it("retorno obsoleto e revisão externa nunca trocam a base do formulário", () => {
  const s = editor(inicial(), {
    tipo: "salvar",
    id: "a",
    snapshot: { valor: "A" },
    alterado: true,
  });
  expect(
    editor(s, {
      tipo: "salvo",
      id: "outro",
      revisao: 9,
      dados: { valor: "externo" },
    }),
  ).toBe(s);
  const externo = editor(s, { tipo: "externo", revisao: 9 });
  expect(externo.revisao).toBe(3);
  expect(externo.remota).toBe(9);
  const conflito = editor(inicial(), { tipo: "externo", revisao: 9 });
  expect(
    editor(conflito, {
      tipo: "salvar",
      id: "b",
      snapshot: { valor: "A" },
      alterado: true,
    }),
  ).toBe(conflito);
});
it("confirmação exige formulário limpo e operação pendente rejeita novo submit", () => {
  const s = inicial();
  expect(
    editor(s, { tipo: "confirmar", id: "p", snapshot: s.base, alterado: true }),
  ).toBe(s);
  const pending = editor(s, {
    tipo: "confirmar",
    id: "p",
    snapshot: s.base,
    alterado: false,
  });
  expect(
    editor(pending, {
      tipo: "salvar",
      id: "b",
      snapshot: s.base,
      alterado: false,
    }),
  ).toBe(pending);
  const done = editor(pending, {
    tipo: "salvo",
    id: "p",
    revisao: 4,
    dados: { valor: "confirmado" },
  });
  expect(done.base.valor).toBe("confirmado");
  expect(done.resultado).toBe("confirmado");
});
it("editar ou substituir prévia invalida respostas antigas inclusive A→B→A", () => {
  let s = iniciarRevisao<number>();
  s = revisar(s, { tipo: "solicitar", id: "a" });
  s = revisar(s, { tipo: "invalidar" });
  expect(revisar(s, { tipo: "receber", id: "a", valor: 1 })).toBe(s);
  s = revisar(s, { tipo: "solicitar", id: "b" });
  expect(revisar(s, { tipo: "receber", id: "a", valor: 1 })).toBe(s);
  expect(revisar(s, { tipo: "receber", id: "b", valor: 2 })).toEqual({
    fase: "pronta",
    id: "b",
    valor: 2,
  });
});

it("RHF mantém B dirty ao reconhecer A e limpa dirty somente após salvar B", async () => {
  const { createFormControl } = await import("react-hook-form");
  const f = createFormControl({
    defaultValues: { dados: { valor: "original" } },
  });
  let dirty = false;
  const unsubscribe = f.subscribe({
    formState: { isDirty: true },
    callback: (s) => {
      if (s.isDirty !== undefined) dirty = s.isDirty;
    },
  });
  f.setValue("dados", { valor: "A" }, { shouldDirty: true });
  const snapshot = structuredClone(f.getValues("dados"));
  f.setValue("dados", { valor: "B" }, { shouldDirty: true });
  const atual = reconciliar(snapshot, f.getValues("dados"), { valor: "A" });
  f.reset({ dados: { valor: "A" } });
  f.setValue("dados", atual, { shouldDirty: true });
  expect(f.getValues("dados")).toEqual({ valor: "B" });
  expect(dirty).toBe(true);
  f.reset({ dados: { valor: "B" } });
  expect(dirty).toBe(false);
  unsubscribe();
});

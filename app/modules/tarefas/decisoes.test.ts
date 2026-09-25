import { describe, expect, it } from "vitest";
import { decidirMudancaEstado, validarCriacaoTarefa } from "./decisoes";

const agora = new Date("2026-09-25T00:00:00Z");

describe("decisão de estado da Tarefa", () => {
  it("recusa Tarefa não manual antes de validar intent ou motivo", () => {
    expect(
      decidirMudancaEstado(
        { tipo: "responder", estado: "aberta" },
        "inválido",
        "",
        agora,
      ),
    ).toEqual({
      tipo: "recusa",
      texto: "Registre o fato na Viagem para concluir esta Tarefa",
      status: 400,
    });
  });

  it("exige intent conhecido e motivo não vazio para cancelar, antes da idempotência", () => {
    expect(
      decidirMudancaEstado(
        { tipo: "manual", estado: "concluida" },
        "inválido",
        "",
        agora,
      ),
    ).toEqual({ tipo: "recusa", texto: "Informe o motivo", status: 400 });
    expect(
      decidirMudancaEstado(
        { tipo: "manual", estado: "cancelada" },
        "cancelar",
        "  ",
        agora,
      ),
    ).toEqual({ tipo: "recusa", texto: "Informe o motivo", status: 400 });
    expect(
      decidirMudancaEstado(
        { tipo: "manual", estado: "concluida" },
        "concluir",
        "",
        agora,
      ),
    ).toEqual({ tipo: "sem-alteracao" });
  });

  it("define timestamps, campos e evento conforme a mudança efetiva", () => {
    expect(
      decidirMudancaEstado(
        { tipo: "manual", estado: "aberta" },
        "concluir",
        "",
        agora,
      ),
    ).toEqual({
      tipo: "alterar",
      campos: {
        estado: "concluida",
        concluidaEm: agora,
        canceladaEm: null,
        motivoCancelamento: null,
      },
      evento: "concluida",
      motivo: "",
    });
    expect(
      decidirMudancaEstado(
        { tipo: "manual", estado: "aberta" },
        "cancelar",
        "   sem necessidade  ",
        agora,
      ),
    ).toMatchObject({
      tipo: "alterar",
      campos: {
        estado: "cancelada",
        concluidaEm: null,
        canceladaEm: agora,
        motivoCancelamento: "sem necessidade",
      },
      evento: "cancelada",
      motivo: "sem necessidade",
    });
    expect(
      decidirMudancaEstado(
        { tipo: "manual", estado: "concluida" },
        "reabrir",
        "motivo livre",
        agora,
      ),
    ).toMatchObject({
      tipo: "alterar",
      campos: {
        estado: "aberta",
        concluidaEm: null,
        canceladaEm: null,
        motivoCancelamento: null,
      },
      evento: "reaberta",
      motivo: "motivo livre",
    });
  });
});

describe("validação da criação de Tarefa", () => {
  const usuario = { id: 1, papel: "guiamento" };

  it("permite prazo nulo e une cópias com o usuário ao delegar", () => {
    expect(
      validarCriacaoTarefa(
        {
          titulo: "Revisar",
          prazo: null,
          responsavelId: 2,
          copias: [3, 3],
        },
        usuario,
      ),
    ).toEqual({
      ok: true,
      dados: {
        titulo: "Revisar",
        prazo: null,
        responsavelId: 2,
        copias: [3, 1],
      },
    });
  });

  it("recusa título vazio e data inválida antes da guarda de acesso", () => {
    expect(
      validarCriacaoTarefa(
        { titulo: "", prazo: null, responsavelId: 2, copias: [] },
        usuario,
      ),
    ).toEqual({ ok: false, texto: "Informe título e prazo", status: 400 });
    expect(
      validarCriacaoTarefa(
        {
          titulo: "Delegar",
          prazo: new Date("inválida"),
          responsavelId: 2,
          copias: [],
        },
        usuario,
      ),
    ).toEqual({ ok: false, texto: "Informe título e prazo", status: 400 });
  });
});

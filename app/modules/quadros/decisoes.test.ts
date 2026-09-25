import { describe, expect, it } from "vitest";
import { decidirAdministracao, decidirMovimento } from "./decisoes";

describe("decisões administrativas de Quadro", () => {
  const pessoal = { pessoal: true, criador_id: 1 };
  const compartilhado = { pessoal: false, criador_id: 1 };
  const membro = { id: 2, papel: "propostas" };

  it("permite compartilhar mas restringe remover membro e arquivar ao criador/Admin", () => {
    expect(decidirAdministracao("compartilhar", compartilhado, membro)).toBeNull();
    expect(decidirAdministracao("remover-membro", compartilhado, membro)).toEqual({
      texto: "Acesso restrito",
      status: 403,
    });
    expect(decidirAdministracao("arquivar-quadro", compartilhado, membro)).toEqual({
      texto: "Acesso restrito",
      status: 403,
    });
    expect(
      decidirAdministracao("remover-membro", compartilhado, {
        id: 3,
        papel: "admin",
      }),
    ).toBeNull();
  });

  it("protege Quadro pessoal e listas pessoais antes da autorização por criador", () => {
    for (const intent of ["compartilhar", "remover-membro", "arquivar-quadro"])
      expect(decidirAdministracao(intent, pessoal, membro)).toEqual({
        texto: "Quadro pessoal é protegido",
        status: 400,
      });
    expect(decidirAdministracao("arquivar-lista", pessoal, membro)).toEqual({
      texto: "Listas pessoais são protegidas",
      status: 400,
    });
    expect(decidirAdministracao("arquivar-lista", compartilhado, membro)).toBeNull();
  });
});

describe("movimento de Tarefa em Quadro", () => {
  const destino = { id: 8, quadroId: 4, conclusao: true };

  it("exige fato para Tarefa automática, sem alterar seu estado", () => {
    expect(
      decidirMovimento(
        { tipo: "responder", estado: "aberta", lista_id: 7, quadro_id: 4 },
        destino,
      ),
    ).toEqual({
      exigeFato: true,
      estado: null,
      guardarListaAnterior: true,
    });
    expect(
      decidirMovimento(
        { tipo: "responder", estado: "concluida", lista_id: 7, quadro_id: 4 },
        destino,
      ).exigeFato,
    ).toBe(false);
  });

  it("conclui manual ao entrar na conclusão e reabre ao sair", () => {
    expect(
      decidirMovimento(
        { tipo: "manual", estado: "aberta", lista_id: 7, quadro_id: 4 },
        destino,
      ).estado,
    ).toBe("concluida");
    expect(
      decidirMovimento(
        { tipo: "manual", estado: "concluida", lista_id: 8, quadro_id: 4 },
        { id: 7, quadroId: 4, conclusao: false },
      ).estado,
    ).toBe("aberta");
  });

  it("guarda a lista anterior apenas ao entrar na conclusão em outra lista do mesmo Quadro", () => {
    expect(
      decidirMovimento(
        { tipo: "manual", estado: "aberta", lista_id: 7, quadro_id: 4 },
        destino,
      ).guardarListaAnterior,
    ).toBe(true);
    expect(
      decidirMovimento(
        { tipo: "manual", estado: "aberta", lista_id: 8, quadro_id: 4 },
        destino,
      ).guardarListaAnterior,
    ).toBe(false);
    expect(
      decidirMovimento(
        { tipo: "manual", estado: "aberta", lista_id: 7, quadro_id: 3 },
        destino,
      ).guardarListaAnterior,
    ).toBe(false);
  });
});

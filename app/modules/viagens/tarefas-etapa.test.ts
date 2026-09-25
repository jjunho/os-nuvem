import { describe, it, expect } from "vitest";
import { inferirTarefasEtapa, type ModeloEtapa } from "./tarefas-etapa";
import type { FatoEtapa } from "./etapas";
const criadaEm = new Date("2026-01-01T00:00:00Z");
const em = (dia: number) => new Date(+criadaEm + dia * 86400000);
const modelos: ModeloEtapa[] = [
  ["responder", "lead", "contato", 2],
  ["cotacoes", "em_orcamento", "cotacao", 24],
  ["proposta", "em_orcamento", "envio", 48],
  ["followup", "proposta_enviada", "contato", 72],
  ["nova-versao", "em_negociacao", "envio", 48],
].map(([item, etapa, fato, horas], i) => ({
  id: i + 1,
  item: String(item),
  etapa: String(etapa),
  titulo: String(item),
  fato: String(fato),
  horas: Number(horas),
  ativo: true,
  destinatario: "responsavel",
  usuarioId: null,
  vigenteDesde: em(-1),
}));
const inferir = (fatos: FatoEtapa[], dia = 1, modelosAtuais = modelos) =>
  inferirTarefasEtapa({
    fatos,
    modelos: modelosAtuais,
    criadaEm,
    canal: "cliente_final",
    agora: em(dia),
  });
describe("tarefas inferidas por entrada", () => {
  it("repete e ordena fatos sem duplicar; fecha tarefas por fato ou passagem", () => {
    const fatos: FatoEtapa[] = [
      { id: 1, tipo: "orcamento", em: em(1) },
      { id: 2, tipo: "envio", em: em(2) },
    ];
    expect(inferir([fatos[1], fatos[0], fatos[1]])).toEqual(inferir(fatos));
    expect(
      inferir(fatos)
        .tarefas.filter((t) => t.etapa === "em_orcamento")
        .map((t) => [t.modelo.item, t.estado, t.fatoId]),
    ).toEqual([
      ["cotacoes", "cancelada", null],
      ["proposta", "concluida", 2],
    ]);
  });
  it("nova entrada não reutiliza contato anterior e usa versão vigente", () => {
    const fatos: FatoEtapa[] = [
      { id: 1, tipo: "envio", em: em(1) },
      { id: 2, tipo: "contato", em: em(2) },
      { id: 3, tipo: "mudancas", em: em(3) },
      { id: 4, tipo: "envio", em: em(4) },
    ];
    const novo = {
      ...modelos[3],
      id: 20,
      titulo: "Novo título",
      vigenteDesde: em(3),
    };
    const tarefas = inferir(fatos, 4, [...modelos, novo]).tarefas;
    expect(
      tarefas
        .filter((t) => t.entrada === "fato:4")
        .every((t) => t.estado === "aberta" && t.modelo.id === 20),
    ).toBe(true);
    expect(tarefas.find((t) => t.entrada === "fato:1")?.modelo.id).toBe(4);
  });
  it("corrigir aceite restaura ciclo sem apagar identidade; encerramento não depende de tempo", () => {
    const fatos: FatoEtapa[] = [
      { id: 1, tipo: "envio", em: em(1) },
      { id: 2, tipo: "aceite", em: em(2) },
      { id: 3, tipo: "correcao", corrigeId: 2, em: em(3) },
    ];
    expect(inferir(fatos).tarefas).toEqual(inferir([fatos[0]]).tarefas);
    expect(
      inferir(
        [...fatos, { id: 4, tipo: "perda", em: em(4) }],
        100,
      ).tarefas.every((t) => t.estado !== "aberta"),
    ).toBe(true);
  });
  it("continua além do terceiro sem limite; marca no ciclo seguinte e resposta conclui", () => {
    const envio: FatoEtapa = { id: 1, tipo: "envio", em: em(0) };
    expect(inferir([envio], 9).semResposta).toBe(false);
    expect(inferir([envio], 12).semResposta).toBe(true);
    expect(
      inferir([envio], 3003).tarefas.filter((t) => t.modelo.item === "followup")
        .length,
    ).toBe(1001);
    const resposta: FatoEtapa = { id: 2, tipo: "pensando", em: em(12) };
    expect(inferir([envio, resposta], 12).semResposta).toBe(false);
    expect(
      inferir([envio, resposta], 12)
        .tarefas.filter((t) => t.modelo.item === "followup")
        .every((t) => t.fatoId === 2),
    ).toBe(true);
  });
});

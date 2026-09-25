import { describe, expect, it } from "vitest";
import { mesclarPagina, type Conteudo } from "./conteudo";
import type { Mensagem } from "./tipos";

function mensagem(id: number, texto: string): Mensagem {
  return {
    id,
    client_id: `cliente-${id}`,
    conversa_id: 1,
    autor_id: 1,
    autor: "Pessoa",
    ativo: true,
    texto,
    segmentos: [],
    criada_em: "2026-01-01T00:00:00.000Z",
    apagada: false,
    sistema: false,
    atividade_tipo: null,
    atividade_motivo: null,
    urgente: false,
    citada_id: null,
    versoes: [],
    transcricao: "",
    reacoes: [],
    midia: null,
  };
}

const atual: Conteudo = {
  mensagens: [mensagem(5, "cinco"), mensagem(10, "antiga")],
  cartoes: [{ referencia: "V26-0001", titulo: "Viagem" }],
  leitores: [{ nome: "Leitora", lida_ate: 8 }],
};

describe("mesclarPagina", () => {
  it("deduplica por id, aplica versão mais nova e ordena mensagens", () => {
    const resultado = mesclarPagina(atual, {
      mensagens: [mensagem(10, "atualizada"), mensagem(3, "três"), mensagem(7, "sete")],
    });
    expect(resultado.mensagens.map(({ id }) => id)).toEqual([3, 5, 7, 10]);
    expect(resultado.mensagens.find(({ id }) => id === 10)?.texto).toBe("atualizada");
    expect(resultado.leitores).toEqual(atual.leitores);
    expect(resultado.cartoes).toEqual(atual.cartoes);
  });

  it("substitui leitores somente quando a resposta inclui a projeção", () => {
    const resultado = mesclarPagina(atual, { mensagens: [], leitores: [] });
    expect(resultado.leitores).toEqual([]);
  });
});

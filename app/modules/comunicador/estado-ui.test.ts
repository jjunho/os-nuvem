import { describe, expect, it } from "vitest";
import {
  compositor,
  novoCompositor,
  mesmaSelecao,
  reporte,
  type ReporteEstado,
} from "./estado-ui";

describe("identidade do Comunicador", () => {
  it("recusa sucesso e erro de uma visita anterior, mesmo voltando à mesma conversa", () => {
    expect(
      mesmaSelecao(
        { conversaId: 2, geracao: 3 },
        { conversaId: 1, geracao: 1 },
      ),
    ).toBe(false);
    expect(
      mesmaSelecao(
        { conversaId: 1, geracao: 3 },
        { conversaId: 1, geracao: 1 },
      ),
    ).toBe(false);
    expect(
      mesmaSelecao(
        { conversaId: 1, geracao: 3 },
        { conversaId: 1, geracao: 3 },
      ),
    ).toBe(true);
  });
  it("trocar conversa invalida edição e citação anteriores", () => {
    const a = compositor(novoCompositor(1), {
      tipo: "editar",
      mensagemId: 12,
      texto: "Original",
    });
    const b = compositor(a, { tipo: "conversa", conversaId: 2 });
    expect(b).toEqual({
      fase: "compondo",
      conversaId: 2,
      rascunho: { tipo: "novo", texto: "" },
    });
    const citando = compositor(novoCompositor(1), {
      tipo: "citar",
      mensagemId: 12,
    });
    expect(compositor(citando, { tipo: "conversa", conversaId: 2 })).toEqual(b);
  });
  it("editar substitui citação e preserva rascunho na falha", () => {
    let s = compositor(novoCompositor(1), { tipo: "citar", mensagemId: 11 });
    s = compositor(s, { tipo: "editar", mensagemId: 12, texto: "Corrigido" });
    s = compositor(s, { tipo: "enviar", tentativa: "x" });
    s = compositor(s, { tipo: "falhou", tentativa: "x", erro: "Sem rede" });
    expect(s).toMatchObject({
      fase: "falhou",
      conversaId: 1,
      rascunho: { tipo: "editar", mensagemId: 12, texto: "Corrigido" },
      erro: "Sem rede",
    });
  });
  it("resposta antiga não limpa nova edição nem rascunho de outra conversa", () => {
    const enviando = compositor(
      compositor(novoCompositor(1), { tipo: "texto", texto: "A" }),
      { tipo: "enviar", tentativa: "x" },
    );
    const b = compositor(
      compositor(enviando, { tipo: "conversa", conversaId: 2 }),
      { tipo: "texto", texto: "B" },
    );
    expect(compositor(b, { tipo: "enviado", tentativa: "x" })).toEqual(b);
    expect(
      compositor(b, { tipo: "falhou", tentativa: "x", erro: "antigo" }),
    ).toEqual(b);
    expect(compositor(enviando, { tipo: "enviar", tentativa: "y" })).toEqual(
      enviando,
    );
  });
});

describe("tentativa de reporte", () => {
  it("bloqueia novo envio, preserva captura e identidade após erro para retentar", () => {
    const captura = new Blob(["foto"]);
    const pronta: ReporteEstado = { fase: "pronta", captura };
    const enviando = reporte(pronta, {
      tipo: "enviar",
      clientId: "mesma-tentativa",
      texto: "problema",
    });
    expect(
      reporte(enviando, {
        tipo: "enviar",
        clientId: "duplicada",
        texto: "outro",
      }),
    ).toEqual(enviando);
    const erro = reporte(enviando, {
      tipo: "falhou",
      clientId: "mesma-tentativa",
    });
    expect(erro).toMatchObject({
      fase: "erro-envio",
      captura,
      clientId: "mesma-tentativa",
      texto: "problema",
    });
    expect(reporte(erro, { tipo: "retentar" })).toEqual(enviando);
  });
  it("ignora término de captura cancelada e erro de outra tentativa", () => {
    const pronta: ReporteEstado = { fase: "pronta", captura: new Blob() };
    expect(reporte(pronta, { tipo: "capturada", captura: new Blob() })).toBe(
      pronta,
    );
    expect(reporte(pronta, { tipo: "falhou", clientId: "velho" })).toBe(pronta);
  });
});

it("materializar a Interna conserva o rascunho digitado durante a confirmação", () => {
  const s = compositor(novoCompositor(-8), {
    tipo: "texto",
    texto: "Próxima mensagem",
  });
  expect(
    compositor(s, { tipo: "materializada", anterior: -8, conversaId: 20 }),
  ).toMatchObject({ conversaId: 20, rascunho: { texto: "Próxima mensagem" } });
  expect(
    compositor(s, { tipo: "materializada", anterior: -9, conversaId: 20 }),
  ).toBe(s);
});

it("selecionar novamente a mesma conversa preserva edição, citação e envio em curso", () => {
  const editando = compositor(novoCompositor(4), {
    tipo: "editar",
    mensagemId: 10,
    texto: "Rascunho",
  });
  expect(compositor(editando, { tipo: "conversa", conversaId: 4 })).toBe(
    editando,
  );
  const citando = compositor(novoCompositor(4), {
    tipo: "citar",
    mensagemId: 10,
  });
  expect(compositor(citando, { tipo: "conversa", conversaId: 4 })).toBe(
    citando,
  );
  const enviando = compositor(editando, {
    tipo: "enviar",
    tentativa: "pendente",
  });
  expect(compositor(enviando, { tipo: "conversa", conversaId: 4 })).toBe(
    enviando,
  );
});

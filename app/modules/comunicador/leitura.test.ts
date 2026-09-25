import { describe, it, expect } from "vitest";
import { segmentar, notificar } from "./leitura";
const contexto = {
  usuarios: [{ id: 2, nome: "Lia" }],
  grupos: [{ id: 5, nome: "Seul" }],
  origem: "https://os.corealux.com",
};
describe("Leitura de mensagem", () => {
  it.each([
    ["Olá @Lia 서울 V26-0142", ["texto", "usuario", "texto", "codigo"]],
    ["lia@exemplo.com AV26-0142x", ["texto"]],
    ["https://os.corealux.com/viagens/3", ["app"]],
    ["https://example.com/V26-0142", ["link"]],
    ["/urgente @todos", ["comando", "texto", "todos"]],
    ["texto /urgente", ["texto"]],
    ["#Seul TAR-0001", ["grupo", "texto", "codigo"]],
  ])("%s", (texto, tipos) =>
    expect(segmentar(texto, contexto).map((s) => s.tipo)).toEqual(tipos),
  );
});
describe("Decisão de notificação", () => {
  it.each([
    ["direta", "mencoes", false, false, false, true],
    ["grupo", "mencoes", false, false, false, false],
    ["grupo", "todas", false, false, false, true],
    ["grupo", "mudo", true, false, false, false],
    ["grupo", "mencoes", true, false, false, true],
    ["direta", "todas", true, true, true, false],
  ])(
    "%s %s mention %s reading %s urgent %s",
    (tipo, modo, mencionado, lendo, urgente, esperado) =>
      expect(
        notificar({
          tipo,
          modo,
          mencionado,
          lendo,
          urgente,
          agora: new Date("2026-09-25T12:00:00Z"),
        }),
      ).toBe(esperado),
  );
  it.each([
    ["Asia/Seoul", false, false],
    ["Asia/Seoul", true, true],
    ["America/Sao_Paulo", false, true],
  ])("DND %s urgente %s", (fuso, urgente, esperado) =>
    expect(
      notificar({
        tipo: "direta",
        modo: "todas",
        mencionado: false,
        lendo: false,
        urgente,
        dndInicio: "22:00",
        dndFim: "07:00",
        fuso,
        agora: new Date("2026-09-25T14:00:00Z"),
      }),
    ).toBe(esperado),
  );
});

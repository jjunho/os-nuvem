import { describe, expect, it } from "vitest";
import { inferirEtapa, type FatoEtapa } from "./etapas";
const fato = (
  id: number,
  tipo: FatoEtapa["tipo"],
  corrigeId?: number,
): FatoEtapa => ({ id, tipo, em: new Date(2026, 0, id), corrigeId });
describe("inferência a partir dos fatos", () => {
  it.each([
    [[], "lead"],
    [[fato(1, "orcamento")], "em_orcamento"],
    [[fato(2, "envio"), fato(1, "orcamento")], "proposta_enviada"],
    [[fato(1, "orcamento"), fato(2, "nova_versao")], "em_orcamento"],
    [[fato(1, "envio"), fato(2, "mudancas")], "em_negociacao"],
    [
      [fato(1, "envio"), fato(2, "nova_versao"), fato(3, "envio")],
      "proposta_enviada",
    ],
    [[fato(1, "envio"), fato(2, "pensando")], "proposta_enviada"],
    [[fato(1, "envio"), fato(2, "aceite"), fato(3, "envio")], "confirmada"],
    [[fato(1, "envio"), fato(2, "perda"), fato(3, "nova_versao")], "perdida"],
    [[fato(1, "aceite"), fato(2, "cancelamento")], "cancelada"],
    [[fato(1, "envio"), fato(2, "descarte")], "descartada"],
    [
      [fato(1, "orcamento"), fato(2, "envio"), fato(3, "correcao", 2)],
      "em_orcamento",
    ],
    [
      [fato(1, "envio"), fato(2, "perda"), fato(3, "correcao", 2)],
      "proposta_enviada",
    ],
  ] as const)("%j → %s", (fatos, etapa) =>
    expect(inferirEtapa([...fatos])).toBe(etapa),
  );
  it("não infere perda pela passagem do tempo", () =>
    expect(inferirEtapa([fato(1, "envio")])).toBe("proposta_enviada"));
});

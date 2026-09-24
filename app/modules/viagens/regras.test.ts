import { describe, expect, it } from "vitest";
import {
  codigoDaViagem,
  marcaSugerida,
  podeDescartar,
  prazoPrimeiraResposta,
  semRespostaHumana,
} from "./regras";

const t0 = new Date("2026-09-24T09:00:00+09:00");
const horas = (h: number) => new Date(t0.getTime() + h * 3600_000);

describe("prazo da primeira resposta", () => {
  it.each([
    ["cliente_final", 2],
    ["influencer", 2],
    ["operadora", 4],
    ["agencia", 8],
  ] as const)("%s → %ih", (canal, h) => {
    expect(prazoPrimeiraResposta(canal, t0)).toEqual(horas(h));
  });
});

describe("alerta de 24h sem resposta humana", () => {
  const lead = { etapa: "lead" as const, criadaEm: t0, primeiraRespostaEm: null };
  it("não alerta antes de 24h", () => expect(semRespostaHumana(lead, horas(23.9))).toBe(false));
  it("alerta a partir de 24h", () => expect(semRespostaHumana(lead, horas(24))).toBe(true));
  it("não alerta depois de respondida", () =>
    expect(semRespostaHumana({ ...lead, primeiraRespostaEm: horas(1) }, horas(30))).toBe(false));
  it("não alerta Viagem encerrada", () =>
    expect(semRespostaHumana({ ...lead, etapa: "descartada" }, horas(30))).toBe(false));
});

describe("código da viagem", () => {
  it("usa ano de dois dígitos e sequência de quatro", () => {
    expect(codigoDaViagem(2026, 1)).toBe("V26-0001");
    expect(codigoDaViagem(2026, 142)).toBe("V26-0142");
    expect(codigoDaViagem(2027, 12345)).toBe("V27-12345");
  });
});

describe("marca sugerida", () => {
  it("B2B é CoreaLux, B2C é Guia na Coreia", () => {
    expect(marcaSugerida("agencia")).toBe("corealux");
    expect(marcaSugerida("operadora")).toBe("corealux");
    expect(marcaSugerida("cliente_final")).toBe("guia_na_coreia");
  });
});

describe("descartar", () => {
  it("só um lead pode ser descartado", () => {
    expect(podeDescartar("lead")).toBe(true);
    expect(podeDescartar("confirmada")).toBe(false);
  });
});

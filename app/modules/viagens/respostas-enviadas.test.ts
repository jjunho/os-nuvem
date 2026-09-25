import { expect, test } from "vitest";
import { camposReconhecidos } from "./respostas-enviadas";

test("sucesso reconhece apenas texto e arquivo que pertenciam ao envio", () => {
  const arquivo = new File(["original"], "briefing.txt");
  const novoArquivo = new File(["novo"], "briefing.txt");
  const enviado = { texto: "Hotel: Primeiro", arquivo };
  expect(
    camposReconhecidos(enviado, { texto: "Hotel: Segundo", arquivo }),
  ).toEqual({ texto: false, arquivo: true });
  expect(
    camposReconhecidos(enviado, {
      texto: "Hotel: Primeiro",
      arquivo: novoArquivo,
    }),
  ).toEqual({ texto: true, arquivo: false });
});

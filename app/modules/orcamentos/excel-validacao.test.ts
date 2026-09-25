import ExcelJS from "exceljs";
import { expect, it } from "vitest";
import { importarExcel } from "./excel.server";
const dados = () => ({
  canal: "agencia",
  categoria: "padrao",
  diaInicial: 1,
  opcoes: [
    {
      id: "o",
      nome: "Opção A",
      pagantes: 2,
      gratuidades: 0,
      margem: 0.3,
      dias: [
        {
          id: "d",
          data: "2026-11-01",
          cidade: "Seul",
          periodo: "completo",
          manha: "",
          almoco: "",
          tarde: "",
          linhas: [],
        },
      ],
    },
  ],
});
async function arquivo(meta: unknown, grupo = "servicos") {
  const wb = new ExcelJS.Workbook();
  const m = wb.addWorksheet("_CoreaLux");
  m.addRow(["COREALUX-ORCAMENTO-1"]);
  m.addRow([JSON.stringify(meta)]);
  const f = wb.addWorksheet("Opção A");
  f.addRow(["Tipo"]);
  f.addRow(["DIA", "d", "", "2026-11-01", "Seul", "completo", "", "", ""]);
  f.addRow([
    "LINHA",
    "d",
    "l",
    "",
    "",
    "",
    "",
    "",
    "",
    "Serviço",
    1,
    "USD",
    20,
    "",
    "",
    grupo,
    "",
  ]);
  const buffer = await wb.xlsx.writeBuffer();
  return new Uint8Array(buffer).buffer;
}
it("metadados externos de Excel inválidos não chegam ao mapeamento de viajantes", async () => {
  for (const meta of [
    null,
    { dados: { ...dados(), categoria: 9 }, pessoas: [] },
    {
      dados: dados(),
      pessoas: [{ id: 1, nome: 44, idade: null, pagante: true }],
    },
  ])
    await expect(importarExcel(await arquivo(meta), [])).rejects.toMatchObject({
      status: 400,
    });
});
it("valida também as células editadas depois de ler metadados válidos", async () => {
  await expect(
    importarExcel(
      await arquivo({ dados: dados(), pessoas: [] }, "grupo inválido"),
      [],
    ),
  ).rejects.toMatchObject({ status: 400 });
  const resultado = await importarExcel(
    await arquivo({ dados: dados(), pessoas: [] }),
    [],
  );
  expect(resultado.dados.opcoes[0].dias[0].linhas[0].valor).toBe(2000);
});

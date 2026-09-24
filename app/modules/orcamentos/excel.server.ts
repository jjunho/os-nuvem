import ExcelJS from "exceljs";
import {
  calcularOpcao,
  type RascunhoOrcamento,
  type DiaOrcamento,
  type LinhaCusto,
} from "./calculo";
import type { Referencias } from "./sugestoes";
type Pessoa = {
  id: number;
  nome: string | null;
  idade: number | null;
  pagante: boolean;
};
const modelo = "COREALUX-ORCAMENTO-1";
export async function exportarExcel(
  dados: RascunhoOrcamento,
  referencias: Referencias,
  pessoas: Pessoa[],
  congelados?: ReturnType<typeof calcularOpcao>[],
) {
  const arquivo = new ExcelJS.Workbook();
  arquivo.creator = "CoreaLux";
  const metadados = arquivo.addWorksheet("_CoreaLux", { state: "veryHidden" });
  metadados.addRow([modelo]);
  const json = JSON.stringify({ dados, pessoas });
  for (let i = 0; i < json.length; i += 30000)
    metadados.addRow([json.slice(i, i + 30000)]);
  for (const [i, o] of dados.opcoes.entries()) {
    const folha = arquivo.addWorksheet(
      `${i + 1} ${o.nome}`.replace(/[\\/*?:\[\]]/g, " ").slice(0, 31),
    );
    folha.addRow([
      "Tipo",
      "Dia ID",
      "Linha ID",
      "Data",
      "Cidade/trecho",
      "Período",
      "Manhã",
      "Almoço",
      "Tarde",
      "Descrição",
      "Quantidade",
      "Moeda",
      "Valor unitário original",
      "Sugerido USD",
      "Aplicado USD",
      "Grupo",
      "Motivo do ajuste",
    ]);
    const calculo =
      congelados?.[i] ??
      calcularOpcao(o, {
        canal: dados.canal,
        categoria: o.categoria ?? dados.categoria,
        referencias,
        viajantes: pessoas,
      });
    for (const dia of o.dias) {
      folha.addRow([
        "DIA",
        dia.id,
        "",
        dia.data,
        dia.cidade,
        dia.periodo,
        dia.manha,
        dia.almoco,
        dia.tarde,
      ]);
      for (const l of dia.linhas) {
        const c = calculo.linhas.find((c) => c.id === l.id)!;
        folha.addRow([
          "LINHA",
          dia.id,
          l.id,
          "",
          "",
          "",
          "",
          "",
          "",
          l.nome,
          l.quantidade,
          l.moeda,
          l.valor === null
            ? null
            : l.valor / (["KRW", "JPY"].includes(l.moeda) ? 1 : 100),
          c.sugerido === null ? null : c.sugerido / 100,
          c.convertido === null ? null : c.convertido / 100,
          l.grupo,
          l.motivoAjuste ?? "",
        ]);
      }
    }
    folha.addRow(["RESUMO", "Serviços", calculo.servicos / 100]);
    folha.addRow(["RESUMO", "Margem", calculo.margem / 100]);
    folha.addRow(["RESUMO", "Hotéis", calculo.hoteis / 100]);
    folha.addRow(["RESUMO", "Terceiros", calculo.terceiros / 100]);
    folha.addRow(["RESUMO", "Preço calculado", calculo.calculado / 100]);
    folha.addRow(["RESUMO", "Preço enviado", calculo.enviado / 100]);
    folha.addRow([
      "RESUMO",
      "Por pessoa",
      calculo.porPessoa === null ? null : calculo.porPessoa / 100,
    ]);
    folha.getRow(1).font = { bold: true };
    folha.views = [{ state: "frozen", ySplit: 1 }];
    folha.columns.forEach((c, i) => {
      c.width = i === 9 ? 32 : 20;
    });
  }
  return new Uint8Array(await arquivo.xlsx.writeBuffer());
}
export async function importarExcel(conteudo: ArrayBuffer, pessoas: Pessoa[]) {
  const arquivo = new ExcelJS.Workbook();
  try {
    await arquivo.xlsx.load(conteudo);
  } catch {
    throw new Response("Arquivo inválido: use o modelo CoreaLux", {
      status: 400,
    });
  }
  const meta = arquivo.getWorksheet("_CoreaLux");
  if (meta?.getCell("A1").text !== modelo)
    throw new Response("Arquivo fora do modelo CoreaLux", { status: 400 });
  let original: { dados: RascunhoOrcamento; pessoas: Pessoa[] };
  try {
    original = JSON.parse(
      Array.from(
        { length: meta.rowCount - 1 },
        (_, i) => meta.getCell(i + 2, 1).text,
      ).join(""),
    );
  } catch {
    throw new Response("Metadados inválidos no modelo CoreaLux", {
      status: 400,
    });
  }
  if (
    !Array.isArray(original.dados?.opcoes) ||
    !Array.isArray(original.pessoas)
  )
    throw new Response("Modelo CoreaLux incompleto", { status: 400 });
  const folhas = arquivo.worksheets.filter((f) => f.name !== "_CoreaLux");
  if (folhas.length !== original.dados.opcoes.length)
    throw new Response("Quantidade de opções difere do modelo CoreaLux", {
      status: 400,
    });
  const pendencias: string[] = [];
  const mapa = new Map<number, number>();
  for (const p of original.pessoas) {
    const mesmo = pessoas.find((x) => x.id === p.id && x.nome === p.nome);
    const porNome = p.nome
      ? pessoas.filter(
          (x) => x.nome?.trim().toLowerCase() === p.nome!.trim().toLowerCase(),
        )
      : [];
    const encontrado = mesmo ?? (porNome.length === 1 ? porNome[0] : undefined);
    if (encontrado) mapa.set(p.id, encontrado.id);
    else pendencias.push(`Viajante sem correspondência: ${p.nome ?? p.id}`);
  }
  const numero = (celula: ExcelJS.Cell) => {
    const v = celula.value;
    const n =
      typeof v === "object" && v !== null && "result" in v ? v.result : v;
    if (n === null || n === "" || n === undefined) return null;
    if (typeof n !== "number" || !Number.isFinite(n))
      throw new Response(`Valor numérico inválido em ${celula.address}`, {
        status: 400,
      });
    return n;
  };
  const remapear = (ids?: number[]) =>
    ids?.flatMap((id) => (mapa.has(id) ? [mapa.get(id)!] : []));
  for (const [i, folha] of folhas.entries()) {
    const opcao = original.dados.opcoes[i];
    const diasAntigos = new Map(opcao.dias.map((d) => [d.id, d]));
    const linhasAntigas = new Map(
      opcao.dias.flatMap((d) => d.linhas).map((l) => [l.id, l]),
    );
    const dias: DiaOrcamento[] = [];
    folha.eachRow((row, n) => {
      if (n === 1 || row.getCell(1).text === "RESUMO") return;
      if (row.getCell(1).text === "DIA") {
        const id = row.getCell(2).text || crypto.randomUUID();
        const anterior = diasAntigos.get(id);
        dias.push({
          ...anterior,
          id,
          data: row.getCell(4).text,
          cidade: row.getCell(5).text,
          periodo: row.getCell(6).text as DiaOrcamento["periodo"],
          manha: row.getCell(7).text,
          almoco: row.getCell(8).text,
          tarde: row.getCell(9).text,
          viajanteIds: remapear(anterior?.viajanteIds),
          linhas: [],
        });
      } else if (row.getCell(1).text === "LINHA") {
        const dia = dias.find((d) => d.id === row.getCell(2).text);
        if (!dia)
          throw new Response("Linha sem Dia no modelo CoreaLux", {
            status: 400,
          });
        const id = row.getCell(3).text || crypto.randomUUID();
        const anterior = linhasAntigas.get(id);
        const moeda = row.getCell(12).text as LinhaCusto["moeda"];
        const valor = numero(row.getCell(13));
        const quantidade = numero(row.getCell(11)) ?? 1;
        dia.linhas.push({
          ...anterior,
          id,
          nome: row.getCell(10).text,
          quantidade,
          quantidadeManual:
            anterior?.quantidadeManual || quantidade !== anterior?.quantidade,
          moeda,
          valor:
            valor === null
              ? null
              : Math.round(valor * (["KRW", "JPY"].includes(moeda) ? 1 : 100)),
          grupo: row.getCell(16).text as LinhaCusto["grupo"],
          motivoAjuste: row.getCell(17).text,
          viajanteIds: remapear(anterior?.viajanteIds),
        });
      }
    });
    opcao.dias = dias;
  }
  return { dados: original.dados, pendencias };
}

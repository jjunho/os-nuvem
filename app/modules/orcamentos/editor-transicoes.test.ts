import { expect, it } from "vitest";
import type { OpcaoOrcamento } from "./calculo";
import {
  novaLinhaHotel,
  novaLinhaItem,
  novaLinhaTransfer,
  novaLinhaVazia,
  novaOpcao,
  novoDia,
} from "./editor-transicoes";

const origem: OpcaoOrcamento = {
  id: "opcao-original",
  nome: "Base",
  pagantes: 2,
  gratuidades: 0,
  margem: 20,
  dias: [
    {
      id: "dia-original",
      data: "2026-11-01",
      cidade: "Seul",
      periodo: "completo",
      manha: "programa",
      almoco: "refeição",
      tarde: "visita",
      linhas: [
        {
          id: "guia-original",
          nome: "Guia",
          quantidade: 1,
          valor: 100,
          moeda: "USD",
          grupo: "servicos",
          regra: "guia",
          motivoAjuste: "acordado",
          autorAjuste: 7,
          quantidadeManual: true,
        },
        {
          id: "ingresso-original",
          nome: "Ingresso",
          quantidade: 2,
          valor: 50,
          moeda: "USD",
          grupo: "servicos",
          automatica: true,
        },
        {
          id: "linha-original",
          nome: "Linha manual",
          quantidade: 3,
          valor: 20,
          moeda: "USD",
          grupo: "servicos",
        },
      ],
    },
  ],
};

it("copia opção em ordem de IDs sem mudar a origem", () => {
  const copia = novaOpcao(origem, 1, ["opcao-nova", "dia-novo", "guia-novo", "ingresso-novo", "linha-nova"]);
  expect(copia.nome).toBe("Opção B");
  expect(copia.id).toBe("opcao-nova");
  expect(copia.dias[0].id).toBe("dia-novo");
  expect(copia.dias[0].linhas.map((linha) => linha.id)).toEqual([
    "guia-novo",
    "ingresso-novo",
    "linha-nova",
  ]);
  expect(copia.dias[0].linhas[0]).not.toBe(origem.dias[0].linhas[0]);
  expect(origem.dias[0].linhas.map((linha) => linha.id)).toEqual([
    "guia-original",
    "ingresso-original",
    "linha-original",
  ]);
});

it("novo dia reinicia valores, mantém só linhas automáticas/regras e conserva autor do ajuste", () => {
  const dia = novoDia(origem.dias[0], ["dia-c", "guia-c", "ingresso-c"]);
  expect(dia).toMatchObject({
    id: "dia-c",
    data: "2026-11-01",
    cidade: "Seul",
    periodo: "completo",
    manha: "",
    almoco: "",
    tarde: "",
  });
  expect(dia.linhas).toHaveLength(2);
  expect(dia.linhas[0]).toMatchObject({
    id: "guia-c",
    valor: null,
    motivoAjuste: undefined,
    quantidadeManual: false,
    autorAjuste: 7,
  });
  expect(dia.linhas[1].id).toBe("ingresso-c");
});

it("builders mantêm os contratos de linha de serviço, hotel, transfer e item", () => {
  expect(novaLinhaVazia("v")).toMatchObject({ id: "v", quantidade: 1, grupo: "servicos", valor: null });
  expect(novaLinhaHotel("h")).toMatchObject({ id: "h", grupo: "hotel", hotel: { ocupacao: "duplo", fonte: "Booking" } });
  expect(novaLinhaTransfer({ id: "t", nome: "A · simples", item: "transfer:a:simples" })).toMatchObject({ id: "t", nome: "A · simples", item: "transfer:a:simples", grupo: "servicos" });
  expect(novaLinhaItem({ id: "i", item: "voo_equipe", nome: "Voo equipe", quantidade: 1, quantidadeManual: true })).toMatchObject({ id: "i", item: "voo_equipe", quantidade: 1, quantidadeManual: true, grupo: "servicos" });
});

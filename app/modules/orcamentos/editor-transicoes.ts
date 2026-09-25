import type {
  DiaOrcamento,
  LinhaCusto,
  OpcaoOrcamento,
} from "./calculo";

type LinhaItem = Pick<
  LinhaCusto,
  "id" | "item" | "nome" | "quantidade" | "quantidadeManual"
>;
type LinhaTransfer = { id: string; nome: string; item: string };

export function novaOpcao(
  origem: OpcaoOrcamento,
  total: number,
  ids: string[],
): OpcaoOrcamento {
  const opcao = structuredClone(origem);
  let indice = 0;
  opcao.id = ids[indice++];
  opcao.nome = `Opção ${String.fromCharCode(65 + total)}`;
  for (const dia of opcao.dias) {
    dia.id = ids[indice++];
    for (const linha of dia.linhas) linha.id = ids[indice++];
  }
  return opcao;
}

export function novoDia(origem: DiaOrcamento, ids: string[]): DiaOrcamento {
  let indice = 0;
  return {
    id: ids[indice++],
    data: origem.data,
    cidade: origem.cidade,
    periodo: "completo",
    manha: "",
    almoco: "",
    tarde: "",
    linhas: origem.linhas
      .filter((linha) => linha.regra || linha.automatica)
      .map((linha) => ({
        ...linha,
        id: ids[indice++],
        valor: null,
        motivoAjuste: undefined,
        quantidadeManual: false,
      })),
  };
}

export function novaLinhaVazia(id: string): LinhaCusto {
  return {
    id,
    nome: "",
    quantidade: 1,
    valor: null,
    moeda: "USD",
    grupo: "servicos",
  };
}

export function novaLinhaHotel(id: string): LinhaCusto {
  return {
    id,
    nome: "Hotel",
    quantidade: 1,
    valor: null,
    moeda: "USD",
    grupo: "hotel",
    hotel: {
      nome: "Hotel",
      endereco: "",
      quartos: 1,
      noites: 1,
      taxas: 0,
      cafe: 0,
      ocupacao: "duplo",
      fonte: "Booking",
      dataFonte: "",
    },
  };
}

export function novaLinhaTransfer({ id, nome, item }: LinhaTransfer): LinhaCusto {
  return {
    id,
    nome,
    item,
    valor: null,
    quantidade: 1,
    moeda: "USD",
    grupo: "servicos",
  };
}

export function novaLinhaItem({
  id,
  item,
  nome,
  quantidade,
  quantidadeManual,
}: LinhaItem): LinhaCusto {
  return {
    id,
    nome,
    item,
    quantidade,
    quantidadeManual,
    valor: null,
    moeda: "USD",
    grupo: "servicos",
  };
}

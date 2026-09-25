export const normalizar = (texto: string) =>
  texto
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase();

export function opcaoExistente<T extends { valor: string; nomePt: string; nomeKo: string }>(
  opcoes: T[],
  valor: string,
): T | undefined {
  return opcoes.find(
    (opcao) =>
      opcao.valor === valor ||
      normalizar(opcao.nomePt) === normalizar(valor) ||
      normalizar(opcao.nomeKo) === normalizar(valor),
  );
}

export function novosContextos(
  existente: Record<string, string>,
  contexto: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(contexto).filter(([chave, valor]) => valor && !existente[chave]),
  );
}

type PlanoDeMesclagem = {
  chaveJson: null | "canal" | "categoria" | "periodo" | "moeda" | "veiculo" | "cidade";
  modo: "apagar" | "array" | "coluna";
  coluna:
    | null
    | "hotelNome"
    | "nivelRestaurante"
    | "ritmo"
    | "origem"
    | "canalComercial"
    | "categoria"
    | "marca"
    | "idiomaCliente"
    | "idiomaGuiamento"
    | "cidades"
    | "meiosContato";
};

const planos: Record<string, PlanoDeMesclagem> = {
  canalComercial: { chaveJson: "canal", modo: "coluna", coluna: "canalComercial" },
  categoria: { chaveJson: "categoria", modo: "coluna", coluna: "categoria" },
  periodo: { chaveJson: "periodo", modo: "apagar", coluna: null },
  moeda: { chaveJson: "moeda", modo: "apagar", coluna: null },
  veiculo: { chaveJson: "veiculo", modo: "apagar", coluna: null },
  cidades: { chaveJson: "cidade", modo: "array", coluna: "cidades" },
  meiosContato: { chaveJson: null, modo: "array", coluna: "meiosContato" },
  hotelNome: { chaveJson: null, modo: "coluna", coluna: "hotelNome" },
  nivelRestaurante: { chaveJson: null, modo: "coluna", coluna: "nivelRestaurante" },
  ritmo: { chaveJson: null, modo: "coluna", coluna: "ritmo" },
  origem: { chaveJson: null, modo: "coluna", coluna: "origem" },
  marca: { chaveJson: null, modo: "coluna", coluna: "marca" },
  idiomaCliente: { chaveJson: null, modo: "coluna", coluna: "idiomaCliente" },
  idiomaGuiamento: { chaveJson: null, modo: "coluna", coluna: "idiomaGuiamento" },
};

export function planoDeMesclagem(campo: string): PlanoDeMesclagem | null {
  return Object.prototype.hasOwnProperty.call(planos, campo) ? planos[campo] : null;
}

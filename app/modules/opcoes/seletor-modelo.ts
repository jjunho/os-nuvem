import type { Opcao } from "./contexto";

type Escolha =
  | { tipo: "livre"; texto: string }
  | { tipo: "opcao"; texto: string; valor: string };
export type EstadoSeletor = {
  escolha: Escolha;
  menu: { fase: "fechado" } | { fase: "aberto"; indice: number };
  selecionadas: string[];
  multiplo: boolean;
  base: { valor: string; nome: string };
};
type Evento =
  | { tipo: "abriu" | "fechou" }
  | { tipo: "editou"; texto: string }
  | { tipo: "escolheu"; opcao: Pick<Opcao, "valor" | "nome"> }
  | { tipo: "moveu"; direcao: 1 | -1; total: number }
  | { tipo: "removeu"; valor: string }
  | { tipo: "sincronizou"; valor: string; nome: string };
export function iniciarSeletor(
  valor: string,
  nome: string,
  multiplo: boolean,
): EstadoSeletor {
  return {
    escolha: valor
      ? { tipo: "opcao", texto: nome, valor }
      : { tipo: "livre", texto: "" },
    menu: { fase: "fechado" },
    selecionadas: [],
    multiplo,
    base: { valor, nome },
  };
}
export function valorSeletor(estado: EstadoSeletor) {
  return estado.escolha.tipo === "opcao"
    ? estado.escolha.valor
    : estado.escolha.texto.trim();
}
export function escolhaAoConfirmar(estado: EstadoSeletor, filtradas: Opcao[]) {
  const indice = estado.menu.fase === "aberto" ? estado.menu.indice : -1;
  if (indice >= 0 && indice < filtradas.length) return filtradas[indice];
  // Only an explicit cursor on Outro replaces a selected code with free text.
  if (indice !== filtradas.length && estado.escolha.tipo === "opcao")
    return { nome: estado.escolha.texto, valor: estado.escolha.valor };
  return {
    nome: estado.escolha.texto.trim(),
    valor: estado.escolha.texto.trim(),
  };
}
export function reduzirSeletor(
  estado: EstadoSeletor,
  evento: Evento,
): EstadoSeletor {
  switch (evento.tipo) {
    case "abriu":
      return { ...estado, menu: { fase: "aberto", indice: -1 } };
    case "fechou":
      return { ...estado, menu: { fase: "fechado" } };
    case "editou":
      return {
        ...estado,
        escolha: { tipo: "livre", texto: evento.texto },
        menu: { fase: "aberto", indice: -1 },
      };
    case "escolheu":
      return {
        ...estado,
        escolha: estado.multiplo
          ? { tipo: "livre", texto: "" }
          : {
              tipo: "opcao",
              texto: evento.opcao.nome,
              valor: evento.opcao.valor,
            },
        selecionadas: estado.multiplo
          ? [...new Set([...estado.selecionadas, evento.opcao.valor])].filter(
              Boolean,
            )
          : estado.selecionadas,
        menu: { fase: "fechado" },
      };
    case "moveu":
      return {
        ...estado,
        menu: {
          fase: "aberto",
          indice: Math.max(
            0,
            Math.min(
              evento.total,
              (estado.menu.fase === "aberto" ? estado.menu.indice : -1) +
                evento.direcao,
            ),
          ),
        },
      };
    case "removeu":
      if (!estado.selecionadas.includes(evento.valor)) return estado;
      return {
        ...estado,
        selecionadas: estado.selecionadas.filter(
          (valor) => valor !== evento.valor,
        ),
      };
    case "sincronizou": {
      if (
        estado.base.valor === evento.valor &&
        estado.base.nome === evento.nome
      )
        return estado;
      const mudouValor = estado.base.valor !== evento.valor;
      const segueBase =
        estado.escolha.tipo === "opcao" &&
        estado.escolha.valor === estado.base.valor;
      return {
        ...estado,
        base: { valor: evento.valor, nome: evento.nome },
        ...(mudouValor || segueBase
          ? {
              escolha: evento.valor
                ? {
                    tipo: "opcao" as const,
                    texto: evento.nome,
                    valor: evento.valor,
                  }
                : { tipo: "livre" as const, texto: "" },
              menu: { fase: "fechado" as const },
            }
          : {}),
      };
    }
    default: {
      return assertNever(evento);
    }
  }
}

function assertNever(evento: never): never {
  throw new Error(`Evento não reconhecido: ${JSON.stringify(evento)}`);
}

// The request owner supplies IDs; this transition neither starts I/O nor generates IDs.
export type Operacao<T> =
  | { fase: "inicial" }
  | { fase: "carregando"; tentativa: number; chave: string }
  | { fase: "pronto"; chave: string; dados: T }
  | { fase: "erro"; chave: string; erro: string };
type Evento<T> =
  | { tipo: "iniciou"; tentativa: number; chave: string }
  | { tipo: "concluiu"; tentativa: number; dados: T }
  | { tipo: "cancelou"; tentativa: number }
  | { tipo: "falhou"; tentativa: number; erro: string };
export function reduzirOperacao<T>(
  estado: Operacao<T>,
  evento: Evento<T>,
): Operacao<T> {
  switch (evento.tipo) {
    case "iniciou":
      return {
        fase: "carregando",
        tentativa: evento.tentativa,
        chave: evento.chave,
      };
    case "concluiu":
      return estado.fase === "carregando" &&
        estado.tentativa === evento.tentativa
        ? { fase: "pronto", chave: estado.chave, dados: evento.dados }
        : estado;
    case "cancelou":
      return estado.fase === "carregando" &&
        estado.tentativa === evento.tentativa
        ? { fase: "inicial" }
        : estado;
    case "falhou":
      return estado.fase === "carregando" &&
        estado.tentativa === evento.tentativa
        ? { fase: "erro", chave: estado.chave, erro: evento.erro }
        : estado;
    default: {
      return assertNever(evento);
    }
  }
}

function assertNever(evento: never): never {
  throw new Error(`Evento não reconhecido: ${JSON.stringify(evento)}`);
}

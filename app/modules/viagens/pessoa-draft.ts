type Campo = { valor: string; origem: "herdado" | "editado" };
export type PessoaDraft = {
  identidade: { tipo: "novo" } | { tipo: "conhecido"; id: number };
  campos: Record<string, Campo>;
};
type EventoPessoa =
  | { tipo: "selecionou"; id: number; campos: Record<string, string | null> }
  | { tipo: "editouNome" }
  | { tipo: "editouCampo"; campo: string; valor: string };
export function iniciarPessoa(
  campos: Record<string, string | null>,
  id?: number | null,
): PessoaDraft {
  return {
    identidade: id ? { tipo: "conhecido", id } : { tipo: "novo" },
    campos: Object.fromEntries(
      Object.entries(campos).map(([chave, valor]) => [
        chave,
        { valor: valor ?? "", origem: "herdado" },
      ]),
    ),
  };
}
export function reduzirPessoa(
  estado: PessoaDraft,
  evento: EventoPessoa,
): PessoaDraft {
  switch (evento.tipo) {
    case "selecionou":
      return iniciarPessoa(evento.campos, evento.id);
    case "editouNome":
      if (estado.identidade.tipo === "novo") return estado;
      return {
        identidade: { tipo: "novo" },
        campos: Object.fromEntries(
          Object.entries(estado.campos).map(([chave, campo]) => [
            chave,
            campo.origem === "herdado" ? { ...campo, valor: "" } : campo,
          ]),
        ),
      };
    case "editouCampo":
      if (!Object.hasOwn(estado.campos, evento.campo)) return estado;
      return {
        ...estado,
        campos: {
          ...estado.campos,
          [evento.campo]: { valor: evento.valor, origem: "editado" },
        },
      };
    default: {
      return assertNever(evento);
    }
  }
}

function assertNever(evento: never): never {
  throw new Error(`Evento não reconhecido: ${JSON.stringify(evento)}`);
}

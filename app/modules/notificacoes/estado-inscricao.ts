export type FaseInscricao =
  | "inativa"
  | "ativando"
  | "recusada"
  | "ativa"
  | "erro";

type EventoInscricao =
  | { tipo: "ativando" }
  | { tipo: "resultado"; fase: Exclude<FaseInscricao, "inativa" | "ativando"> };

export function transicionarInscricao(
  fase: FaseInscricao,
  evento: EventoInscricao,
): FaseInscricao {
  if (evento.tipo === "ativando")
    return fase === "ativando" ? fase : "ativando";
  return fase === "ativando" ? evento.fase : fase;
}

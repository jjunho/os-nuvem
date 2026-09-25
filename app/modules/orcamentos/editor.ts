/** The revision belongs to the acknowledged snapshot, never to a fresh loader. */
export type Editor<T> = {
  orcamentoId: number;
  revisao: number;
  remota: number;
  base: T;
  operacao:
    | { fase: "idle" }
    | { fase: "salvando" | "confirmando"; id: string; snapshot: T };
  resultado: "nenhum" | "salvo" | "confirmado" | { erro: string };
};
export type EventoEditor<T> =
  | { tipo: "editado" }
  | { tipo: "externo"; revisao: number }
  | { tipo: "salvar" | "confirmar"; id: string; snapshot: T; alterado: boolean }
  | { tipo: "salvo"; id: string; revisao: number; dados: T }
  | { tipo: "falha"; id: string; erro: string };
export function iniciarEditor<T>(
  orcamentoId: number,
  revisao: number,
  dados: T,
): Editor<T> {
  return {
    orcamentoId,
    revisao,
    remota: revisao,
    base: dados,
    operacao: { fase: "idle" },
    resultado: "nenhum",
  };
}
/** Return the acknowledged data only if no newer edits were made in the form. */
export function reconciliar<T>(snapshot: T, atual: T, salvo: T): T {
  return JSON.stringify(snapshot) === JSON.stringify(atual) ? salvo : atual;
}
export function editor<T>(s: Editor<T>, e: EventoEditor<T>): Editor<T> {
  switch (e.tipo) {
    case "editado":
      return s.operacao.fase === "confirmando" || s.resultado === "nenhum"
        ? s
        : { ...s, resultado: "nenhum" };
    case "externo":
      return s.remota === e.revisao ? s : { ...s, remota: e.revisao };
    case "salvar":
    case "confirmar":
      if (
        s.operacao.fase !== "idle" ||
        s.remota !== s.revisao ||
        (e.tipo === "confirmar" && e.alterado)
      )
        return s;
      return {
        ...s,
        resultado: "nenhum",
        operacao: {
          fase: e.tipo === "salvar" ? "salvando" : "confirmando",
          id: e.id,
          snapshot: e.snapshot,
        },
      };
    case "salvo":
      if (s.operacao.fase === "idle" || s.operacao.id !== e.id) return s;
      return {
        ...s,
        revisao: e.revisao,
        remota: Math.max(s.remota, e.revisao),
        base: e.dados,
        resultado: s.operacao.fase === "confirmando" ? "confirmado" : "salvo",
        operacao: { fase: "idle" },
      };
    case "falha":
      if (s.operacao.fase === "idle" || s.operacao.id !== e.id) return s;
      return { ...s, operacao: { fase: "idle" }, resultado: { erro: e.erro } };
    default:
      return assertNever(e);
  }
}
function assertNever(e: never): never {
  throw new Error(`Evento inválido: ${JSON.stringify(e)}`);
}
export type Revisao<T> =
  | { fase: "vazia" }
  | { fase: "carregando"; id: string }
  | { fase: "pronta"; id: string; valor: T }
  | { fase: "erro"; id: string; erro: string };
export type EventoRevisao<T> =
  | { tipo: "invalidar" }
  | { tipo: "solicitar"; id: string }
  | { tipo: "receber"; id: string; valor: T }
  | { tipo: "falha"; id: string; erro: string };
export const iniciarRevisao = <T>(): Revisao<T> => ({ fase: "vazia" });
export function revisar<T>(s: Revisao<T>, e: EventoRevisao<T>): Revisao<T> {
  switch (e.tipo) {
    case "invalidar":
      return { fase: "vazia" };
    case "solicitar":
      return { fase: "carregando", id: e.id };
    case "receber":
      return s.fase === "carregando" && s.id === e.id
        ? { fase: "pronta", id: e.id, valor: e.valor }
        : s;
    case "falha":
      return s.fase === "carregando" && s.id === e.id
        ? { fase: "erro", id: e.id, erro: e.erro }
        : s;
    default:
      return assertNever(e);
  }
}

export type IntentPrevia = "preparar-pedido" | "importar-excel";
export type IntentPrincipal =
  | "salvar"
  | "atualizar-referencias"
  | "enviar"
  | "pagar-taxa"
  | "nova-versao"
  | "confirmar-pedido";
export type Voo = {
  principal: { intent: IntentPrincipal; id: string } | null;
  previas: Partial<Record<IntentPrevia, string>>;
};
export type EventoVoo =
  | { tipo: "solicitou-principal"; intent: IntentPrincipal; id: string }
  | { tipo: "solicitou-previa"; intent: IntentPrevia; id: string }
  | { tipo: "liberou-principal"; id: string }
  | { tipo: "liberou-previa"; intent: IntentPrevia; id: string };

export const vooInicial: Voo = { principal: null, previas: {} };

export function reduzirVoo(estado: Voo, evento: EventoVoo): Voo {
  switch (evento.tipo) {
    case "solicitou-principal":
      return estado.principal
        ? estado
        : { ...estado, principal: { intent: evento.intent, id: evento.id } };
    case "solicitou-previa":
      return estado.previas[evento.intent] !== undefined
        ? estado
        : {
            ...estado,
            previas: { ...estado.previas, [evento.intent]: evento.id },
          };
    case "liberou-principal":
      return estado.principal?.id === evento.id
        ? { ...estado, principal: null }
        : estado;
    case "liberou-previa":
      return estado.previas[evento.intent] === evento.id
        ? {
            ...estado,
            previas: Object.fromEntries(
              Object.entries(estado.previas).filter(
                ([intent]) => intent !== evento.intent,
              ),
            ),
          }
        : estado;
  }
}

export function podeSolicitar(
  estado: Voo,
  intent: IntentPrincipal | IntentPrevia,
  f: { salvando: boolean; operacao: boolean; pedido: boolean; importacao: boolean },
): boolean {
  if (intent === "preparar-pedido")
    return estado.previas[intent] === undefined && !f.pedido;
  if (intent === "importar-excel")
    return estado.previas[intent] === undefined && !f.importacao;
  return (
    !estado.principal &&
    !f.salvando &&
    !f.operacao &&
    (intent !== "confirmar-pedido" || !f.pedido)
  );
}

export function bloqueiaEdicao(estado: Voo): boolean {
  return !!estado.principal &&
    ["confirmar-pedido", "enviar", "pagar-taxa", "nova-versao"].includes(
      estado.principal.intent,
    );
}

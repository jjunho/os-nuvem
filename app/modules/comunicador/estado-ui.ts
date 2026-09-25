export type Selecao = { conversaId: number | null; geracao: number };
export function mesmaSelecao(atual: Selecao, resposta: Selecao) {
  return (
    atual.conversaId === resposta.conversaId &&
    atual.geracao === resposta.geracao
  );
}

type Rascunho =
  | { tipo: "novo"; texto: string }
  | { tipo: "citar" | "editar"; mensagemId: number; texto: string };
type Base = { conversaId: number | null; rascunho: Rascunho };
export type Compositor = Base &
  (
    | { fase: "compondo" }
    | { fase: "enviando"; tentativa: string }
    | { fase: "falhou"; erro: string }
  );
type EventoCompositor =
  | { tipo: "materializada"; anterior: number; conversaId: number }
  | { tipo: "conversa"; conversaId: number | null }
  | { tipo: "texto"; texto: string }
  | { tipo: "citar"; mensagemId: number }
  | { tipo: "editar"; mensagemId: number; texto: string }
  | { tipo: "cancelar" }
  | { tipo: "enviar" | "enviado"; tentativa: string }
  | { tipo: "falhou"; tentativa: string; erro: string };
export function novoCompositor(conversaId: number | null): Compositor {
  return {
    fase: "compondo",
    conversaId,
    rascunho: { tipo: "novo", texto: "" },
  };
}
export function compositor(s: Compositor, e: EventoCompositor): Compositor {
  switch (e.tipo) {
    case "materializada":
      return s.conversaId === e.anterior
        ? { ...s, conversaId: e.conversaId }
        : s;
    case "conversa":
      return s.conversaId === e.conversaId ? s : novoCompositor(e.conversaId);
    case "cancelar":
      return s.fase === "enviando" ? s : novoCompositor(s.conversaId);
    case "texto":
      return s.fase === "enviando"
        ? s
        : {
            fase: "compondo",
            conversaId: s.conversaId,
            rascunho: { ...s.rascunho, texto: e.texto },
          };
    case "citar":
      return s.fase === "enviando"
        ? s
        : {
            fase: "compondo",
            conversaId: s.conversaId,
            rascunho: {
              tipo: "citar",
              mensagemId: e.mensagemId,
              texto: s.rascunho.texto,
            },
          };
    case "editar":
      return s.fase === "enviando"
        ? s
        : {
            fase: "compondo",
            conversaId: s.conversaId,
            rascunho: {
              tipo: "editar",
              mensagemId: e.mensagemId,
              texto: e.texto,
            },
          };
    case "enviar":
      return s.fase === "enviando" || s.conversaId === null
        ? s
        : {
            fase: "enviando",
            conversaId: s.conversaId,
            rascunho: s.rascunho,
            tentativa: e.tentativa,
          };
    case "enviado":
      return s.fase === "enviando" && s.tentativa === e.tentativa
        ? novoCompositor(s.conversaId)
        : s;
    case "falhou":
      return s.fase === "enviando" && s.tentativa === e.tentativa
        ? {
            fase: "falhou",
            conversaId: s.conversaId,
            rascunho: s.rascunho,
            erro: e.erro,
          }
        : s;
    default:
      return assertNever(e);
  }
}

type TentativaReporte = { captura: Blob; clientId: string; texto: string };
export type ReporteEstado =
  | { fase: "capturando" }
  | { fase: "erro-captura" }
  | { fase: "pronta"; captura: Blob }
  | ({ fase: "enviando" | "erro-envio" | "enviado" } & TentativaReporte);
type EventoReporte =
  | { tipo: "capturar" }
  | { tipo: "capturada"; captura: Blob }
  | { tipo: "captura-falhou" }
  | { tipo: "enviar"; clientId: string; texto: string }
  | { tipo: "retentar" }
  | { tipo: "falhou" | "enviado"; clientId: string };
export function reporte(s: ReporteEstado, e: EventoReporte): ReporteEstado {
  switch (e.tipo) {
    case "capturar":
      return s.fase === "erro-captura" ? { fase: "capturando" } : s;
    case "capturada":
      return s.fase === "capturando"
        ? { fase: "pronta", captura: e.captura }
        : s;
    case "captura-falhou":
      return s.fase === "capturando" ? { fase: "erro-captura" } : s;
    case "enviar":
      return s.fase === "pronta"
        ? {
            fase: "enviando",
            captura: s.captura,
            texto: e.texto,
            clientId: e.clientId,
          }
        : s;
    case "retentar":
      return s.fase === "erro-envio" ? { ...s, fase: "enviando" } : s;
    case "falhou":
      return s.fase === "enviando" && s.clientId === e.clientId
        ? { ...s, fase: "erro-envio" }
        : s;
    case "enviado":
      return s.fase === "enviando" && s.clientId === e.clientId
        ? { ...s, fase: "enviado" }
        : s;
    default:
      return assertNever(e);
  }
}

function assertNever(evento: never): never {
  throw Error(`Evento desconhecido: ${JSON.stringify(evento)}`);
}

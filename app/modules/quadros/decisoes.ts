export function decidirAdministracao(
  intent: string,
  q: { pessoal: boolean; criador_id: number },
  u: { id: number; papel: string },
): { texto: string; status: 400 | 403 } | null {
  if (
    (intent === "compartilhar" ||
      intent === "remover-membro" ||
      intent === "arquivar-quadro") &&
    q.pessoal
  )
    return { texto: "Quadro pessoal é protegido", status: 400 };
  if (
    (intent === "remover-membro" || intent === "arquivar-quadro") &&
    q.criador_id !== u.id &&
    u.papel !== "admin"
  )
    return { texto: "Acesso restrito", status: 403 };
  if (intent === "arquivar-lista" && q.pessoal)
    return { texto: "Listas pessoais são protegidas", status: 400 };
  return null;
}

export type TarefaPosicionada = {
  tipo: string;
  estado: string;
  lista_id: number;
  quadro_id: number;
};

export type ListaDeDestino = {
  id: number;
  quadro_id: number;
  conclusao: boolean;
};

export function decidirMovimento(
  t: TarefaPosicionada,
  destino: ListaDeDestino,
): {
  exigeFato: boolean;
  estado: "concluida" | "aberta" | null;
  guardarListaAnterior: boolean;
} {
  const exigeFato =
    destino.conclusao && t.tipo !== "manual" && t.estado !== "concluida";
  const estado =
    t.tipo === "manual" && destino.conclusao && t.estado !== "concluida"
      ? "concluida"
      : t.tipo === "manual" && !destino.conclusao && t.estado === "concluida"
        ? "aberta"
        : null;
  return {
    exigeFato,
    estado,
    guardarListaAnterior:
      destino.conclusao &&
      t.lista_id !== destino.id &&
      t.quadro_id === destino.quadro_id,
  };
}

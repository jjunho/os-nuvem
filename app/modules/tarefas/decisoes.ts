export type MudancaEstadoTarefa =
  | { tipo: "recusa"; texto: string; status: 400 }
  | { tipo: "sem-alteracao" }
  | {
      tipo: "alterar";
      campos: {
        estado: "concluida" | "aberta" | "cancelada";
        concluidaEm: Date | null;
        canceladaEm: Date | null;
        motivoCancelamento: string | null;
      };
      evento: "reaberta" | "concluida" | "cancelada";
      motivo: string;
    };

export function decidirMudancaEstado(
  t: { tipo: string; estado: string },
  intent: string,
  motivo: string,
  agora: Date,
): MudancaEstadoTarefa {
  if (t.tipo !== "manual")
    return {
      tipo: "recusa",
      texto: "Registre o fato na Viagem para concluir esta Tarefa",
      status: 400,
    };
  const estado =
    intent === "concluir"
      ? "concluida"
      : intent === "reabrir"
        ? "aberta"
        : intent === "cancelar"
          ? "cancelada"
          : null;
  if (!estado || (estado === "cancelada" && !motivo.trim()))
    return { tipo: "recusa", texto: "Informe o motivo", status: 400 };
  if (estado === t.estado) return { tipo: "sem-alteracao" };
  return {
    tipo: "alterar",
    campos: {
      estado,
      concluidaEm: estado === "concluida" ? agora : null,
      canceladaEm: estado === "cancelada" ? agora : null,
      motivoCancelamento: estado === "cancelada" ? motivo.trim() : null,
    },
    evento: estado === "aberta" ? "reaberta" : estado,
    motivo: motivo.trim(),
  };
}

export function validarCriacaoTarefa(
  entrada: {
    titulo: string;
    prazo: Date | null;
    copias: number[];
    responsavelId: number;
  },
  usuario: { id: number; papel: string },
):
  | { ok: true; dados: typeof entrada }
  | { ok: false; texto: string; status: 400 | 403 } {
  const dados = {
    ...entrada,
    copias: [
      ...new Set([
        ...entrada.copias,
        ...(entrada.responsavelId !== usuario.id ? [usuario.id] : []),
      ]),
    ],
  };
  if (
    !dados.titulo ||
    (dados.prazo !== null && !Number.isFinite(dados.prazo.getTime()))
  )
    return { ok: false, texto: "Informe título e prazo", status: 400 };
  if (
    usuario.papel === "guiamento" &&
    dados.responsavelId !== usuario.id &&
    !dados.copias.includes(usuario.id)
  )
    return { ok: false, texto: "Acesso restrito", status: 403 };
  return { ok: true, dados };
}

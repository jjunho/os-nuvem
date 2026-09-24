export type Profissional = {
  id: number;
  nome: string;
  papel: string;
  idiomas: string[];
  especialidades: string[];
};
export type Alocacao = {
  profissionalId: number;
  viagemId: number;
  inicio: string;
  fim: string;
  periodo: string;
  confirmada: boolean;
};
export function disponibilidade(
  profissionais: Profissional[],
  alocacoes: Alocacao[],
  dia: { data: string; periodo: string; horaInicio?: string; horaFim?: string },
  idioma: string,
  viagemId: number,
) {
  const periodo =
    dia.periodo === "meio" && dia.horaInicio
      ? dia.horaInicio < "12:00"
        ? "manha"
        : "tarde"
      : "inteiro";
  return profissionais.map((p) => ({
    ...p,
    falaIdioma: p.idiomas.includes(idioma),
    ocupado: alocacoes.some(
      (a) =>
        a.profissionalId === p.id &&
        a.viagemId !== viagemId &&
        a.confirmada &&
        a.inicio <= dia.data &&
        a.fim >= dia.data &&
        (a.periodo === "inteiro" ||
          periodo === "inteiro" ||
          a.periodo === periodo),
    ),
  }));
}

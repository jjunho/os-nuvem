import { dataISOValida, inteiroEntrada } from "~/modules/validacao/entrada";

export function dadosDeAlocacao(form: FormData) {
  const profissionalId = inteiroEntrada(form.get("profissionalId"));
  const viagemId = inteiroEntrada(form.get("viagemId"));
  const inicio = String(form.get("inicio"));
  const fim = String(form.get("fim"));
  const periodo = String(form.get("periodo"));
  if (
    !Number.isInteger(profissionalId) ||
    !Number.isInteger(viagemId) ||
    !dataISOValida(inicio) ||
    !dataISOValida(fim) ||
    fim < inicio ||
    !["inteiro", "manha", "tarde"].includes(periodo)
  )
    throw new Response("Alocação inválida", { status: 400 });
  return {
    profissionalId,
    viagemId,
    inicio,
    fim,
    periodo: periodo as "inteiro" | "manha" | "tarde",
  };
}

import { eq } from "drizzle-orm";
import { db } from "~/db/client.server";
import { viagens } from "~/db/schema";
import { registrarOpcao } from "~/modules/opcoes/opcoes.server";
export async function salvarPlanejamento(viagemId: number, form: FormData) {
  const dataInicio = String(form.get("dataInicio") ?? "") || null;
  const dataFim = String(form.get("dataFim") ?? "") || null;
  if (
    [dataInicio, dataFim].some(
      (d) =>
        d &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !Number.isFinite(Date.parse(d))),
    ) ||
    (dataInicio && dataFim && dataInicio > dataFim)
  )
    throw new Response("Datas inválidas", { status: 400 });
  const [viagem] = await db
    .select()
    .from(viagens)
    .where(eq(viagens.id, viagemId));
  const opcoes: Record<string, string | null> = {};
  for (const campo of ["hotelNome", "nivelRestaurante", "ritmo"]) {
    const valor = String(form.get(campo) ?? "").trim();
    opcoes[campo] = valor
      ? await registrarOpcao(
          campo,
          valor,
          campo === "hotelNome"
            ? {
                cidade: viagem.cidades.length === 1 ? viagem.cidades[0] : "",
                endereco: String(form.get("hotelEndereco") ?? ""),
              }
            : {},
        )
      : null;
  }
  await db
    .update(viagens)
    .set({
      dataInicio,
      dataFim,
      ...opcoes,
      hotelEndereco: String(form.get("hotelEndereco") ?? "").trim() || null,
      interesses: String(form.get("interesses") ?? "").trim() || null,
      pontosDesejados: String(form.get("pontosDesejados") ?? "").trim() || null,
    })
    .where(eq(viagens.id, viagemId));
}

export function dadosDeProfissional(form: FormData) {
  const nome = String(form.get("nome") ?? "").trim();
  const papel = String(form.get("papel"));
  const lista = (chave: string) =>
    String(form.get(chave) ?? "")
      .split(",")
      .map((valor) => valor.trim())
      .filter(Boolean);
  if (!nome || !["guia", "assistente"].includes(papel))
    throw new Response("Profissional inválido", { status: 400 });
  return {
    nome,
    papel: papel as "guia" | "assistente",
    idiomas: lista("idiomas"),
    especialidades: lista("especialidades"),
  };
}

export type ValorReferencia = string | number | null;
export type ColunaReferencia = {
  chave: string;
  nome: string;
  tipo: "texto" | "numero" | "data";
};
export type LinhaReferencia = {
  id: string;
  nome: string;
  provisorio?: string;
  [chave: string]: ValorReferencia | undefined;
};
export type DadosReferencia = {
  colunas: ColunaReferencia[];
  linhas: LinhaReferencia[];
};

export function lerLinha(
  form: FormData,
  prefixo: string,
  id: string,
  dados: DadosReferencia,
  anterior?: LinhaReferencia,
): LinhaReferencia {
  const nome = String(form.get(`${prefixo}.nome`) ?? anterior?.nome ?? "").trim();
  if (!nome) throw new Response("Informe o nome", { status: 400 });
  const linha: LinhaReferencia = { ...anterior, id, nome };
  for (const coluna of dados.colunas) {
    const valor = String(form.get(`${prefixo}.${coluna.chave}`) ?? "").trim();
    if (coluna.tipo === "numero") {
      if (valor !== "" && !Number.isFinite(Number(valor)))
        throw new Response("Valor inválido", { status: 400 });
      linha[coluna.chave] = valor === "" ? null : Number(valor);
    } else {
      if (
        coluna.tipo === "data" &&
        valor &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(valor) ||
          new Date(`${valor}T00:00:00Z`).toISOString().slice(0, 10) !== valor)
      )
        throw new Response("Data inválida", { status: 400 });
      linha[coluna.chave] = valor;
    }
  }
  if (
    linha.inicio &&
    linha.fim &&
    dados.colunas.some((coluna) => coluna.chave === "inicio" && coluna.tipo === "data") &&
    String(linha.inicio) > String(linha.fim)
  )
    throw new Response("Período inválido", { status: 400 });
  return linha;
}

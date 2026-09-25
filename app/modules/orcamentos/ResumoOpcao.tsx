import { useIdioma } from "~/modules/idiomas/idioma";
import type { CalculoOpcao } from "./calculo";

type Props = {
  calculo: CalculoOpcao;
  moeda: (valor: number | null) => string;
};

export function ResumoOpcao({ calculo, moeda }: Props) {
  const { t } = useIdioma();
  return (
    <dl className="resumo-orcamento">
      <dt>{t("Serviços")}</dt>
      <dd>{moeda(calculo.servicos)}</dd>
      <dt>{t("Margem")}</dt>
      <dd>{moeda(calculo.margem)}</dd>
      <dt>{t("Hotéis")}</dt>
      <dd>{moeda(calculo.hoteis)}</dd>
      <dt>{t("Terceiros")}</dt>
      <dd>{moeda(calculo.terceiros)}</dd>
      <dt>{t("Preço calculado")}</dt>
      <dd data-testid="preco-calculado">{moeda(calculo.calculado)}</dd>
      <dt>{t("Preço enviado")}</dt>
      <dd data-testid="preco-enviado">{moeda(calculo.enviado)}</dd>
      <dt>{t("Diferença")}</dt>
      <dd data-testid="diferenca-preco">{moeda(calculo.diferenca)}</dd>
      <dt>{t("Por pessoa pagante")}</dt>
      <dd data-testid="por-pessoa">{moeda(calculo.porPessoa)}</dd>
    </dl>
  );
}

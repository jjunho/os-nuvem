import { useIdioma } from "~/modules/idiomas/idioma";
import { condicoesPadrao, type CondicoesProposta } from "./versoes";
import type { MudarCondicoes } from "./editor-tipos";


type Props = {
  condicoes?: CondicoesProposta;
  mudar: MudarCondicoes;
};

export function CondicoesEditor({ condicoes, mudar }: Props) {
  const { t } = useIdioma();
  const valor = condicoes ?? condicoesPadrao;
  const alterar = <K extends keyof CondicoesProposta>(
    campo: K,
    novoValor: CondicoesProposta[K],
  ) => mudar((atual) => { atual[campo] = novoValor; });

  return (
    <fieldset>
      <legend>{t("Condições da proposta")}</legend>
      {(
        [
          ["sinal", "Sinal (%)"],
          ["saldoDias", "Saldo: dias antes da viagem"],
          ["validadeDias", "Validade em dias"],
          ["iva", "IVA (%)"],
        ] as const
      ).map(([campo, rotulo]) => (
        <label key={campo}>
          {t(rotulo)}
          <input
            type="number"
            min="0"
            value={valor[campo] * (campo === "iva" ? 100 : 1)}
            onChange={(e) =>
              alterar(
                campo,
                Number(e.target.value) / (campo === "iva" ? 100 : 1),
              )
            }
          />
        </label>
      ))}
      {(
        [
          ["incluso", "Incluso"],
          ["naoIncluso", "Não incluso"],
          ["cancelamento", "Condições de cancelamento"],
          ["formasPagamento", "Formas de pagamento"],
          ["dadosBancarios", "Dados bancários"],
          ["notasB2B", "Notas para a agência"],
        ] as const
      ).map(([campo, rotulo]) => (
        <label key={campo}>
          {t(rotulo)}
          <textarea
            aria-label={t(rotulo)}
            value={valor[campo]}
            onChange={(e) =>
              alterar(campo, e.target.value)
            }
          />
        </label>
      ))}
      <label>
        <input
          type="checkbox"
          checked={valor.generica}
          onChange={(e) => alterar("generica", e.target.checked)}
        />
        {t("Proposta genérica")}
      </label>
      <label>
        {t("Detalhamento de preços")}
        <select
          value={valor.detalhe}
          onChange={(e) =>
            alterar("detalhe", e.target.value as CondicoesProposta["detalhe"])
          }
        >
          <option value="nenhum">{t("Total")}</option>
          <option value="dia">{t("Por dia")}</option>
          <option value="servico">{t("Por serviço")}</option>
        </select>
      </label>
    </fieldset>
  );
}

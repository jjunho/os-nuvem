import { useIdioma } from "~/modules/idiomas/idioma";

type Props = {
  pendencias: string[];
  revisaoAtual: boolean;
  ocupado: boolean;
  desabilitado: boolean;
  onAplicar: () => void;
};

export function PreviaExcel({ pendencias, revisaoAtual, ocupado, desabilitado, onAplicar }: Props) {
  const { t } = useIdioma();
  return (
    <section>
      {!revisaoAtual && (
        <p role="alert">{t("O orçamento mudou. Revise a importação novamente.")}</p>
      )}
      <ul>
        {pendencias.map((pendencia) => (
          <li key={pendencia}>{pendencia}</li>
        ))}
      </ul>
      <button disabled={ocupado || desabilitado} onClick={onAplicar}>
        {t("Aplicar importação")}
      </button>
    </section>
  );
}

import { useIdioma } from "~/modules/idiomas/idioma";
import type { PedidoExtraido } from "./pedido.server";

type Props = {
  pedido: PedidoExtraido;
  alterado: boolean;
  ocupado: boolean;
  conflito: boolean;
  onConfirmar: () => void;
};

export function PreviaPedido({ pedido, alterado, ocupado, conflito, onConfirmar }: Props) {
  const { t } = useIdioma();
  return (
    <section aria-label={t("Revisão do pedido")}>
      <p>
        {pedido.dias} {t("dias")} · {pedido.cidades.join(" / ")} · {pedido.pagantes} + {pedido.gratuidades}
      </p>
      <p>
        {t("Confirmar substitui os dias da primeira opção e atualiza datas e viajantes na Viagem.")}
      </p>
      {alterado && <p>{t("Salve o orçamento antes de confirmar o pedido.")}</p>}
      <button disabled={ocupado || alterado || conflito} onClick={onConfirmar}>
        {t("Confirmar pedido")}
      </button>
    </section>
  );
}

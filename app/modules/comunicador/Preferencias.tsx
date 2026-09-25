import type { TradutorComunicador } from "./textos";
import type { GruposPainel } from "./use-painel";

type PreferenciasProps = Pick<GruposPainel["preferencias"], "atual" | "salvar"> & {
  t: TradutorComunicador;
};
export function Preferencias({ atual, salvar, t }: PreferenciasProps) {
  return (
    <details>
      <summary>{t("Não perturbe")}</summary>
      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          const formulario = new FormData(evento.currentTarget);
          const inicio = formulario.get("inicio");
          const fim = formulario.get("fim");
          const fuso = formulario.get("fuso");
          if (
            typeof inicio !== "string" ||
            typeof fim !== "string" ||
            typeof fuso !== "string"
          ) {
            return;
          }
          salvar(inicio || null, fim || null, fuso || null);
        }}
      >
        <label>
          {t("Início")}
          <input name="inicio" type="time" defaultValue={atual.dnd_inicio} />
        </label>
        <label>
          {t("Fim")}
          <input name="fim" type="time" defaultValue={atual.dnd_fim} />
        </label>
        <label>
          {t("Fuso horário")}
          <input name="fuso" defaultValue={atual.fuso} />
        </label>
        <button>{t("Salvar")}</button>
      </form>
    </details>
  );
}

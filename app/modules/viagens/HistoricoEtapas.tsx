import { Form } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import type { historicoEtapas } from "./etapas.server";
import { ETAPAS_ABERTAS, type Etapa } from "./regras";
import { rotuloEtapa } from "./rotulos";
export function Etapas({
  historico,
  etapa,
  podeCorrigir,
}: {
  historico: Awaited<ReturnType<typeof historicoEtapas>>;
  etapa: Etapa;
  podeCorrigir: boolean;
}) {
  const { t, mensagem, idioma } = useIdioma();
  const corrigidos = new Set(historico.map((f) => f.corrigeId));
  const tipos = {
    contato: "Nota de contato",
    cotacao: "Cotação de fornecedor",
    orcamento: "Orçamento criado",
    envio: "Proposta enviada",
    nova_versao: "Nova versão",
    mudancas: "Pediu mudanças",
    pensando: "Ainda pensando",
    aceite: "Aceitou",
    perda: "Recusou",
    cancelamento: "Cancelamento",
    descarte: "Descartar",
    correcao: "Correção de etapa",
  };
  return (
    <section>
      <h2>{t("Resposta do cliente")}</h2>
      {ETAPAS_ABERTAS.includes(etapa) && (
        <Form method="post" className="linha">
          <input type="hidden" name="intent" value="resposta-cliente" />
          <label>
            {t("Resposta do cliente")}
            <select name="resposta" aria-label={t("Resposta do cliente")}>
              <option value="aceitou">{t("Aceitou")}</option>
              <option value="pensando">{t("Ainda pensando")}</option>
              <option value="mudancas">{t("Pediu mudanças")}</option>
              <option value="perda">{t("Recusou")}</option>
              {etapa === "confirmada" && (
                <option value="cancelamento">{t("Cancelamento")}</option>
              )}
            </select>
          </label>
          <label>
            {t("Motivo da resposta")}
            <input name="motivoResposta" />
          </label>
          <button>{t("Registrar resposta do cliente")}</button>
        </Form>
      )}
      <section aria-label={t("Histórico de etapas")}>
        <h3>{t("Histórico de etapas")}</h3>
        <ul>
          {historico.map((f) => (
            <li key={f.id} id={`fato-${f.id}`}>
              {mensagem(tipos[f.tipo])} ·{" "}
              {mensagem(rotuloEtapa[f.etapaAnterior as Etapa])} →{" "}
              {mensagem(rotuloEtapa[f.etapaResultante as Etapa])} · {f.autor} ·{" "}
              {f.em.toLocaleString(idioma === "ko" ? "ko-KR" : "pt-BR")} ·{" "}
              {f.motivo}
              {podeCorrigir &&
                f.tipo !== "correcao" &&
                !corrigidos.has(f.id) && (
                  <Form method="post" className="linha">
                    <input type="hidden" name="intent" value="corrigir-etapa" />
                    <input type="hidden" name="fatoId" value={f.id} />
                    <label>
                      {t("Motivo da correção")}
                      <input name="motivoCorrecao" required />
                    </label>
                    <button>{t("Corrigir fato")}</button>
                  </Form>
                )}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

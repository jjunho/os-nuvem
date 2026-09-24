import { useState } from "react";
import { Form } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import { Seletor } from "~/modules/opcoes/Seletor";
import {
  dadosFaltantes,
  mensagemDeBriefing,
  perguntas,
  type Planejamento,
} from "./briefing";
import type { listarViajantes } from "./viajantes.server";
export function Briefing({
  viagem,
  pessoas,
  opcoes,
  modelo,
}: {
  modelo: string | null;
  viagem: Planejamento & { idiomaCliente: string };
  pessoas: Awaited<ReturnType<typeof listarViajantes>>;
  opcoes: Record<string, { valor: string; nome: string }[]>;
}) {
  const { t } = useIdioma();
  const [copiado, setCopiado] = useState(false);
  const faltas = dadosFaltantes(viagem, pessoas);
  const mensagem = mensagemDeBriefing(viagem.idiomaCliente, faltas);
  const primeiraResposta =
    modelo?.replaceAll("{dados_faltantes}", mensagem) ?? t("A informar");
  return (
    <section>
      <label>
        {t("Primeira resposta")}
        <textarea
          aria-label={t("Primeira resposta")}
          readOnly
          rows={5}
          value={primeiraResposta}
        />
      </label>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(primeiraResposta)}
      >
        {t("Copiar primeira resposta")}
      </button>
      <section aria-label={t("Dados faltantes")}>
        <h2>{t("Dados faltantes")}</h2>
        <ul>
          {faltas.map((f) => (
            <li key={f}>{t(perguntas.pt[f])}</li>
          ))}
        </ul>
        <label>
          {t("Mensagem para pedir dados")}
          <textarea
            aria-label={t("Mensagem para pedir dados")}
            readOnly
            value={mensagem}
            rows={5}
          />
        </label>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(mensagem);
            setCopiado(true);
          }}
        >
          {t(copiado ? "Copiado" : "Copiar mensagem")}
        </button>
      </section>
      <Form method="post">
        <input type="hidden" name="intent" value="planejamento" />
        <h2>{t("Planejamento")}</h2>
        <div className="linha">
          <label>
            {t("Chegada")}
            <input
              type="date"
              name="dataInicio"
              defaultValue={viagem.dataInicio ?? ""}
            />
          </label>
          <label>
            {t("Partida")}
            <input
              type="date"
              name="dataFim"
              defaultValue={viagem.dataFim ?? ""}
            />
          </label>
          <Seletor
            nome="hotelNome"
            rotulo={t("Hotel")}
            opcoes={opcoes.hotelNome ?? []}
            valorInicial={viagem.hotelNome ?? ""}
          />
          <label>
            {t("Endereço do hotel")}
            <input
              name="hotelEndereco"
              defaultValue={viagem.hotelEndereco ?? ""}
            />
          </label>
          <Seletor
            nome="nivelRestaurante"
            rotulo={t("Nível de restaurante")}
            opcoes={opcoes.nivelRestaurante ?? []}
            valorInicial={viagem.nivelRestaurante ?? ""}
          />
          <Seletor
            nome="ritmo"
            rotulo={t("Ritmo")}
            opcoes={opcoes.ritmo ?? []}
            valorInicial={viagem.ritmo ?? ""}
          />
          <label>
            {t("Interesses")}
            <input name="interesses" defaultValue={viagem.interesses ?? ""} />
          </label>
          <label>
            {t("Pontos que gostaria")}
            <input
              name="pontosDesejados"
              defaultValue={viagem.pontosDesejados ?? ""}
            />
          </label>
        </div>
        <button>{t("Salvar planejamento")}</button>
      </Form>
    </section>
  );
}

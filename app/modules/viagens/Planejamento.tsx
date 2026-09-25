import { useEffect, useReducer, useRef } from "react";
import { reduzirOperacao } from "./operacao-remota";
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
      <CopiarTexto texto={primeiraResposta} rotulo="Copiar primeira resposta" />
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
        <CopiarTexto texto={mensagem} rotulo="Copiar mensagem" />
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

function CopiarTexto({
  texto,
  rotulo,
}: {
  texto: string;
  rotulo: "Copiar primeira resposta" | "Copiar mensagem";
}) {
  const { t } = useIdioma();
  const [estado, dispatch] = useReducer(reduzirOperacao<null>, {
    fase: "inicial",
  });
  const tentativa = useRef(0);
  const ocupada = useRef(false);
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  const atual = estado.fase !== "inicial" && estado.chave === texto;
  async function copiar() {
    if (!montado.current || ocupada.current) return;
    ocupada.current = true;
    const id = ++tentativa.current;
    dispatch({ tipo: "iniciou", tentativa: id, chave: texto });
    try {
      await navigator.clipboard.writeText(texto);
      if (montado.current)
        dispatch({ tipo: "concluiu", tentativa: id, dados: null });
    } catch (erro) {
      if (montado.current)
        dispatch({
          tipo: "falhou",
          tentativa: id,
          erro: erro instanceof Error ? erro.message : String(erro),
        });
    } finally {
      ocupada.current = false;
    }
  }
  return (
    <>
      <button
        type="button"
        disabled={estado.fase === "carregando"}
        onClick={() => void copiar()}
      >
        {t(
          estado.fase === "carregando"
            ? "Copiando…"
            : atual && estado.fase === "pronto"
              ? "Copiado"
              : rotulo,
        )}
      </button>
      {atual && estado.fase === "erro" && (
        <p role="alert">{t("Não foi possível copiar o texto")}</p>
      )}
    </>
  );
}

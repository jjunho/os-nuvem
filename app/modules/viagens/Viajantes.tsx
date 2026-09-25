import { DocumentosViajante } from "./DocumentosViajante";
import { useEffect, useReducer, useRef, useState } from "react";
import { Form, useNavigation } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import { Seletor } from "~/modules/opcoes/Seletor";
import { iniciarPessoa, reduzirPessoa } from "./pessoa-draft";
import type { listarViajantes } from "./viajantes.server";
export function Viajantes({
  lista,
  contatos,
  impactos,
  podeVerDocumentos = false,
}: {
  podeVerDocumentos?: boolean;
  impactos: Record<number, string[]>;
  lista: Awaited<ReturnType<typeof listarViajantes>>;
  contatos: {
    id: number;
    nome: string;
    mobilidade: string | null;
    alimentacao: string | null;
  }[];
}) {
  const { t } = useIdioma();
  const navigation = useNavigation();
  const enviando = navigation.state !== "idle";
  const envioEmCurso = useRef(false);
  useEffect(() => {
    if (navigation.state === "idle") envioEmCurso.current = false;
  }, [navigation.state]);
  const iniciarEnvio = (evento: React.FormEvent<HTMLFormElement>) => {
    if (envioEmCurso.current || enviando) {
      evento.preventDefault();
      return;
    }
    envioEmCurso.current = true;
  };
  const [removendo, setRemovendo] = useState<number | null>(null);
  return (
    <section>
      <h2>{t("Viajantes")}</h2>
      <table className="tabela" aria-label={t("Viajantes")}>
        <thead>
          <tr>
            <th>{t("Viajante")}</th>
            <th>{t("Alterar")}</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((v, i) => (
            <tr key={v.id}>
              <td>
                {v.nome ??
                  `${t(v.faixa === "crianca" ? "Criança" : v.faixa === "bebe" ? "Bebê" : "Adulto")} ${i + 1}`}
              </td>
              <td>
                {podeVerDocumentos && <DocumentosViajante id={v.id} />}
                <span data-testid="bagagem-salva">
                  {v.malas} · {v.bagagemMao}
                </span>
                <Form method="post" onSubmit={iniciarEnvio}>
                  <fieldset
                    className="linha"
                    style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
                    disabled={enviando}
                    inert={enviando}
                  >
                    <input type="hidden" name="viajanteId" value={v.id} />
                    <IdentidadeViajante
                      key={`${v.contatoId}-${v.mobilidade}-${v.alimentacao}`}
                      viajante={v}
                      contatos={contatos}
                    />
                    <label>
                      {t("Pagamento")}
                      <select
                        name="pagamento"
                        defaultValue={v.pagante ? "pagante" : "gratuidade"}
                      >
                        <option value="pagante">{t("Pagante")}</option>
                        <option value="gratuidade">{t("Gratuidade")}</option>
                      </select>
                    </label>
                    <label>
                      {t("Faixa etária")}
                      <select name="faixa" defaultValue={v.faixa}>
                        <option value="adulto">{t("Adulto")}</option>
                        <option value="crianca">{t("Criança")}</option>
                        <option value="bebe">{t("Bebê")}</option>
                      </select>
                    </label>
                    <label>
                      {t("Idade")}
                      <input
                        type="number"
                        min="0"
                        max="120"
                        name="idade"
                        defaultValue={v.idade ?? ""}
                      />
                    </label>
                    <label>
                      {t("Malas de 23 kg")}
                      <input
                        type="number"
                        name="malas"
                        min="0"
                        max="20"
                        defaultValue={v.malas}
                      />
                    </label>
                    <label>
                      {t("Bagagem de mão")}
                      <input
                        type="number"
                        name="bagagemMao"
                        min="0"
                        max="20"
                        defaultValue={v.bagagemMao}
                      />
                    </label>
                    <button name="intent" value="viajante-salvar">
                      {t("Salvar")}
                    </button>
                    {impactos[v.id]?.length ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setRemovendo(v.id)}
                        >
                          {t("Remover")}
                        </button>
                        {removendo === v.id && (
                          <div
                            role="alertdialog"
                            aria-label={t("Confirmar remoção")}
                          >
                            <p>{t("Dias e linhas afetados")}</p>
                            <ul>
                              {impactos[v.id].map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                            <input
                              type="hidden"
                              name="confirmarRemocao"
                              value="1"
                            />
                            <button name="intent" value="viajante-remover">
                              {t("Confirmar remoção")}
                            </button>
                            <button
                              type="button"
                              onClick={() => setRemovendo(null)}
                            >
                              {t("Cancelar")}
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <button name="intent" value="viajante-remover">
                        {t("Remover")}
                      </button>
                    )}
                  </fieldset>
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Form method="post" onSubmit={iniciarEnvio}>
        <button disabled={enviando} name="intent" value="viajante-adicionar">
          {t("Adicionar viajante")}
        </button>
      </Form>
    </section>
  );
}

function IdentidadeViajante({
  viajante: v,
  contatos,
}: {
  viajante: Awaited<ReturnType<typeof listarViajantes>>[number];
  contatos: {
    id: number;
    nome: string;
    mobilidade: string | null;
    alimentacao: string | null;
  }[];
}) {
  const { t } = useIdioma();
  const [draft, dispatch] = useReducer(reduzirPessoa, undefined, () =>
    iniciarPessoa(
      { mobilidade: v.mobilidade, alimentacao: v.alimentacao },
      v.contatoId,
    ),
  );
  return (
    <>
      <Seletor
        nome="contato"
        rotulo={t("Nome")}
        valorInicial={v.nome && v.contatoId ? `contato:${v.contatoId}` : ""}
        onEditar={() => dispatch({ tipo: "editouNome" })}
        onChange={(valor) => {
          const contato = contatos.find((c) => `contato:${c.id}` === valor);
          if (contato)
            dispatch({
              tipo: "selecionou",
              id: contato.id,
              campos: {
                mobilidade: contato.mobilidade,
                alimentacao: contato.alimentacao,
              },
            });
          else dispatch({ tipo: "editouNome" });
        }}
        opcoes={contatos.map((c) => ({
          valor: `contato:${c.id}`,
          nome: c.nome,
        }))}
      />
      <label>
        {t("Mobilidade")}
        <input
          name="mobilidade"
          value={draft.campos.mobilidade.valor}
          onChange={(e) =>
            dispatch({
              tipo: "editouCampo",
              campo: "mobilidade",
              valor: e.target.value,
            })
          }
        />
      </label>
      <label>
        {t("O que você não come")}
        <input
          name="alimentacao"
          value={draft.campos.alimentacao.valor}
          onChange={(e) =>
            dispatch({
              tipo: "editouCampo",
              campo: "alimentacao",
              valor: e.target.value,
            })
          }
        />
      </label>
    </>
  );
}

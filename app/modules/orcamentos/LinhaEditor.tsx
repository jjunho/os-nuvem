import { Seletor } from "~/modules/opcoes/Seletor";
import type { DiaOrcamento, LinhaCusto, LinhaCalculada } from "./calculo";
import type { Carregados, MudarLinha } from "./editor-tipos";
import type { ChaveTraducao } from "~/modules/idiomas/catalogo";

type Props = {
  linha: LinhaCusto;
  calculada: LinhaCalculada;
  dia: DiaOrcamento;
  hoteis: Carregados["hoteis"];
  pessoas: Carregados["pessoas"];
  autorAjuste?: string;
  t: (chave: ChaveTraducao) => string;
  moeda: (valor: number | null) => string;
  conhecidas: (
    campo: string,
    base: { valor: string; nome: string }[],
  ) => { valor: string; nome: string }[];
  mudar: MudarLinha;
  remover: () => void;
};

export type LinhaEditorProps = Props;

export function LinhaEditor(props: LinhaEditorProps) {
  const {
    linha: l,
    calculada,
    dia,
    hoteis,
    pessoas,
    autorAjuste,
    t,
    moeda,
    conhecidas,
    mudar,
    remover,
  } = props;
  const unidade = ["KRW", "JPY"].includes(l.moeda) ? 1 : 100;

  if (
    (l.regra || l.automatica) &&
    ["livre", "deslocamento"].includes(dia.periodo)
  )
    return null;

  return (
    <tr
      data-testid={
        l.hotel
          ? "linha-hotel"
          : l.regra
            ? `linha-${l.regra}`
            : l.item
              ? `item-${l.item}`
              : undefined
      }
    >
      <td>
        <label>
          <input
            type="checkbox"
            checked={!!l.provisorio}
            onChange={(e) => mudar((linha) => (linha.provisorio = e.target.checked))}
          />
          {t("Padrão provisório")}
        </label>
        <input
          aria-label={t("Descrição da linha")}
          value={l.nome}
          onChange={(e) => mudar((linha) => (linha.nome = e.target.value))}
        />
        {l.hotel && (
          <>
            <Seletor
              nome={`hotel-${l.id}`}
              rotulo={t("Hotel da linha")}
              opcoes={hoteis}
              valorInicial={l.hotel.nome}
              contexto={{ cidade: dia.cidade }}
              filtro={(o, c) => o.contexto?.cidade === c.cidade}
              onChange={(valor) =>
                mudar((linha) => {
                  const hotel = linha.hotel;
                  if (!hotel) return;
                  const encontrado = hoteis.find((opcao) => opcao.valor === valor);
                  hotel.nome = encontrado?.valor ?? valor;
                  linha.nome = encontrado?.nome ?? valor;
                  if (encontrado?.contexto?.endereco)
                    hotel.endereco = encontrado.contexto.endereco;
                })
              }
            />
            <label>
              {t("Endereço do hotel")}
              <input
                value={l.hotel.endereco}
                onChange={(e) =>
                  mudar((linha) => {
                    if (linha.hotel) linha.hotel.endereco = e.target.value;
                  })
                }
              />
            </label>
            <label>
              {t("Quartos")}
              <input
                type="number"
                min="1"
                value={l.hotel.quartos}
                onChange={(e) =>
                  mudar((linha) => {
                    if (linha.hotel) linha.hotel.quartos = Number(e.target.value);
                  })
                }
              />
            </label>
            <label>
              {t("Noites")}
              <input
                type="number"
                min="1"
                value={l.hotel.noites}
                onChange={(e) =>
                  mudar((linha) => {
                    if (linha.hotel) linha.hotel.noites = Number(e.target.value);
                  })
                }
              />
            </label>
            <label>
              {t("Impostos do hotel (%)")}
              <input
                type="number"
                min="0"
                value={l.hotel.taxas * 100}
                onChange={(e) =>
                  mudar((linha) => {
                    if (linha.hotel) linha.hotel.taxas = Number(e.target.value) / 100;
                  })
                }
              />
            </label>
            <label>
              {t("Café por quarto e noite")}
              <input
                type="number"
                step=".01"
                min="0"
                value={l.hotel.cafe / unidade}
                onChange={(e) =>
                  mudar((linha) => {
                    if (linha.hotel)
                      linha.hotel.cafe = Math.round(Number(e.target.value) * unidade);
                  })
                }
              />
            </label>
            <label>
              {t("Ocupação")}
              <select
                value={l.hotel.ocupacao}
                onChange={(e) => {
                  const ocupacao = e.target.value;
                  if (ocupacao !== "duplo" && ocupacao !== "single") return;
                  mudar((linha) => {
                    if (linha.hotel) linha.hotel.ocupacao = ocupacao;
                  });
                }}
              >
                <option value="duplo">{t("Duplo")}</option>
                <option value="single">{t("Single")}</option>
              </select>
            </label>
            <label>
              {t("Fonte da cotação")}
              <input
                value={l.hotel.fonte}
                onChange={(e) =>
                  mudar((linha) => {
                    if (linha.hotel) linha.hotel.fonte = e.target.value;
                  })
                }
              />
            </label>
            <label>
              {t("Data da cotação")}
              <input
                type="date"
                value={l.hotel.dataFonte}
                onChange={(e) =>
                  mudar((linha) => {
                    if (linha.hotel) linha.hotel.dataFonte = e.target.value;
                  })
                }
              />
            </label>
            <fieldset>
              <legend>{t("Viajantes do quarto")}</legend>
              {pessoas.map((p, i) => (
                <label key={p.id}>
                  <input
                    type="checkbox"
                    checked={!!l.viajanteIds?.includes(p.id)}
                    onChange={(e) =>
                      mudar((linha) => {
                        const ids = linha.viajanteIds ?? [];
                        linha.viajanteIds = e.target.checked
                          ? [...ids, p.id]
                          : ids.filter((id) => id !== p.id);
                      })
                    }
                  />
                  {p.nome ?? `${t("Viajante")} ${i + 1}`}
                </label>
              ))}
            </fieldset>
          </>
        )}
        <label>
          <input
            type="checkbox"
            checked={!!l.terceiro}
            onChange={(e) => mudar((linha) => (linha.terceiro = e.target.checked))}
          />
          {t("Reservado por terceiro, sem cobrança")}
        </label>
        {!l.regra && (
          <>
            <label>
              <input
                type="checkbox"
                checked={!!l.porViajante}
                onChange={(e) => mudar((linha) => (linha.porViajante = e.target.checked))}
              />
              {t("Cobrar por viajante")}
            </label>
            {l.porViajante && (
              <>
                <fieldset>
                  <legend>{t("Viajantes desta linha")}</legend>
                  {pessoas
                    .filter((p) => !dia.viajanteIds || dia.viajanteIds.includes(p.id))
                    .map((p, i) => (
                      <label key={p.id}>
                        <input
                          type="checkbox"
                          checked={!l.viajanteIds || l.viajanteIds.includes(p.id)}
                          onChange={(e) =>
                            mudar((linha) => {
                              const ids =
                                linha.viajanteIds ??
                                pessoas
                                  .filter((pessoa) => !dia.viajanteIds || dia.viajanteIds.includes(pessoa.id))
                                  .map((pessoa) => pessoa.id);
                              linha.viajanteIds = e.target.checked
                                ? [...ids, p.id]
                                : ids.filter((id) => id !== p.id);
                            })
                          }
                        />
                        {p.nome ?? `${t("Viajante")} ${i + 1}`}
                      </label>
                    ))}
                </fieldset>
                <label>
                  {t("Tarifa infantil USD")}
                  <input
                    type="number"
                    step=".01"
                    min="0"
                    value={l.tarifaCrianca === undefined ? "" : l.tarifaCrianca / 100}
                    onChange={(e) =>
                      mudar((linha) => {
                        linha.tarifaCrianca =
                          e.target.value === "" ? undefined : Math.round(Number(e.target.value) * 100);
                      })
                    }
                  />
                </label>
                <label>
                  {t("Idade máxima infantil")}
                  <input
                    type="number"
                    min="0"
                    max="18"
                    value={l.idadeCriancaMax ?? 12}
                    onChange={(e) => mudar((linha) => (linha.idadeCriancaMax = Number(e.target.value)))}
                  />
                </label>
                <label>
                  {t("Tarifa sênior USD")}
                  <input
                    type="number"
                    step=".01"
                    min="0"
                    value={l.tarifaSenior === undefined ? "" : l.tarifaSenior / 100}
                    onChange={(e) =>
                      mudar((linha) => {
                        linha.tarifaSenior =
                          e.target.value === "" ? undefined : Math.round(Number(e.target.value) * 100);
                      })
                    }
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!l.seniorElegivel}
                    onChange={(e) => mudar((linha) => (linha.seniorElegivel = e.target.checked))}
                  />
                  {t("Fornecedor confirma elegibilidade sênior destes viajantes")}
                </label>
              </>
            )}
          </>
        )}
      </td>
      <td>
        <input
          aria-label={t("Quantidade")}
          type="number"
          min="0"
          step="any"
          value={calculada.quantidade}
          onChange={(e) =>
            mudar((linha) => {
              linha.quantidade = Number(e.target.value);
              linha.quantidadeManual = true;
            })
          }
        />
      </td>
      <td>
        {!l.regra && !l.item && (
          <Seletor
            nome={`moeda-${l.id}`}
            rotulo={t("Moeda da linha")}
            opcoes={conhecidas(
              "moeda",
              ["USD", "KRW", "JPY", "EUR", "BRL"].map((m) => ({ valor: m, nome: m })),
            )}
            valorInicial={l.moeda}
            onChange={(valor) =>
              mudar((linha) => {
                linha.moeda = valor;
                linha.valor = null;
                linha.fonteTaxa = valor === "KRW" ? "Naver" : "";
              })
            }
          />
        )}
        <input
          aria-label={`${t("Valor unitário")} ${l.moeda}`}
          type="number"
          step={unidade === 1 ? "1" : ".01"}
          min="0"
          placeholder={calculada.sugerido === null ? "" : String(calculada.sugerido / unidade)}
          value={l.valor === null ? "" : l.valor / unidade}
          onChange={(e) =>
            mudar((linha) => {
              linha.valor =
                e.target.value === ""
                  ? null
                  : Math.round(Number(e.target.value) * unidade);
            })
          }
        />
        {l.moeda !== "USD" && (
          <>
            <label>
              {t("Unidades da moeda por USD")}
              <input
                type="number"
                step="any"
                min="0"
                value={l.taxa ?? ""}
                onChange={(e) =>
                  mudar((linha) => {
                    linha.taxa = e.target.value === "" ? undefined : Number(e.target.value);
                  })
                }
              />
            </label>
            <label>
              {t("Data do câmbio")}
              <input
                type="date"
                value={l.dataTaxa ?? ""}
                onChange={(e) => mudar((linha) => (linha.dataTaxa = e.target.value))}
              />
            </label>
            <label>
              {t("Fonte do câmbio")}
              <input
                value={l.fonteTaxa ?? ""}
                onChange={(e) => mudar((linha) => (linha.fonteTaxa = e.target.value))}
              />
            </label>
          </>
        )}
      </td>
      <td>
        <select
          aria-label={t("Grupo")}
          value={l.grupo}
          onChange={(e) => {
            const grupo = e.target.value;
            if (grupo === "servicos" || grupo === "hotel" || grupo === "terceiros")
              mudar((linha) => (linha.grupo = grupo));
          }}
        >
          <option value="servicos">{t("Serviços")}</option>
          <option value="hotel">{t("Hotel")}</option>
          <option value="terceiros">{t("Terceiros")}</option>
        </select>
      </td>
      <td>
        <label>
          {t("Custo real da linha USD")}
          <input
            type="number"
            step=".01"
            min="0"
            value={l.custoRealUSD === undefined ? "" : l.custoRealUSD / 100}
            onChange={(e) =>
              mudar((linha) => {
                linha.custoRealUSD =
                  e.target.value === "" ? undefined : Math.round(Number(e.target.value) * 100);
              })
            }
          />
        </label>
        {l.item === "voo_equipe" && (
          <label>
            {t("Custo do voo USD")}
            <input
              type="number"
              step=".01"
              min="0"
              value={l.custoFornecedor === undefined ? "" : l.custoFornecedor / 100}
              onChange={(e) =>
                mudar((linha) => {
                  linha.custoFornecedor =
                    e.target.value === "" ? undefined : Math.round(Number(e.target.value) * 100);
                })
              }
            />
          </label>
        )}
        {moeda(calculada.total)}
        {!l.regra && !l.item && !l.terceiro && (calculada.total ?? 0) > 0 && l.custoRealUSD === undefined && (
          <small>{t("Estimativa: informe o custo real antes de enviar")}</small>
        )}
        {(l.regra || l.item) && (
          <small>
            {t("Valor sugerido")}: {moeda(calculada.sugerido)}
            {calculada.provisorio && ` · ${t("Padrão provisório")}`}
          </small>
        )}
        {(l.regra || l.item) && l.valor !== null && (
          <label>
            {t("Motivo do ajuste")}
            <input
              value={l.motivoAjuste ?? ""}
              onChange={(e) => mudar((linha) => (linha.motivoAjuste = e.target.value))}
            />
          </label>
        )}
        {(l.regra || l.item) && autorAjuste && <small>{autorAjuste}</small>}
      </td>
      <td>
        <button onClick={remover}>{t("Remover linha")}</button>
      </td>
    </tr>
  );
}

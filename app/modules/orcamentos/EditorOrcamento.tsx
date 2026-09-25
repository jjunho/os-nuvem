import { Link } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import { Seletor } from "~/modules/opcoes/Seletor";
import { calcularOpcao } from "./calculo";
import { conhecidas as listarConhecidas, moeda as formatarMoeda } from "./formatos";
import { CopiarResumo } from "./CopiarResumo";
import type { Carregados, MudarCondicoes } from "./editor-tipos";
import { CondicoesEditor } from "./CondicoesEditor";
import { OpcaoEditor } from "./OpcaoEditor";
import { PreviaPedido } from "./PreviaPedido";
import { PreviaExcel } from "./PreviaExcel";
import { useEditorOrcamento } from "./use-editor-orcamento";
import { condicoesPadrao } from "./versoes";

export function EditorOrcamento({ carregados }: { carregados: Carregados }) {
  const { t, mensagem, idioma } = useIdioma();
  const controlador = useEditorOrcamento(carregados);
  const {
    formulario: { dados, alterado, carregados: d },
    operacao: {
      ocupado,
      confirmando,
      salvando,
      conflito,
      erroVisivel,
      revisao,
      resultado,
    },
    pedido: {
      previa: previaPedido,
      texto: pedidoTexto,
      definirTexto,
      preparar: prepararPedido,
      confirmar: confirmarPedido,
    },
    excel: {
      previa: previaExcel,
      importar: importarExcel,
      aplicar: aplicarExcel,
      invalidar: invalidarExcel,
    },
    acoes: {
      gravar,
      comandar,
      copiarOpcao,
      inserirDia,
      moverDia,
      removerDia,
      criarLinha,
      removerLinha,
      editar: alterar,
    },
    envio: {
      SalvarForm,
      PedidoForm,
      ImportarForm,
      erroEnvio,
      pedidoOcupado,
      importacaoOcupada,
    },
  } = controlador;
  const malasPorPessoa = d.pessoas.length
    ? d.pessoas.reduce((soma, pessoa) => soma + pessoa.malas, 0) /
      d.pessoas.length
    : 2;
  const conhecidas = (campo: string, base: { valor: string; nome: string }[]) =>
    listarConhecidas(campo, base, d.opcoesConhecidas, mensagem);
  const moeda = (valor: number | null) => formatarMoeda(valor, idioma, mensagem);
  const mudarCondicoes: MudarCondicoes = (fn) =>
    alterar((rascunho) => {
      const condicoes = { ...condicoesPadrao, ...rascunho.condicoes };
      fn(condicoes);
      rascunho.condicoes = condicoes;
    });
  if (d.orcamento.memoria) {
    const m = d.orcamento.memoria;
    return (
      <>
        <Link to={`/viagens/${d.viagem.id}`}>{t("Voltar à viagem")}</Link>
        <h1>
          {t("Orçamento")} {m.viagemCodigo} · {t("Versão")} {m.versao}
        </h1>
        <p data-testid="numero-proposta">{m.numero}</p>
        <p>{t("Versão congelada")}</p>
        {m.dados.taxaElaboracao?.ativa &&
          (d.taxaPaga ? (
            <p>{t("Taxa paga")}</p>
          ) : (
            <SalvarForm
              method="post"
              onSubmit={(evento) => {
                evento.preventDefault();
                comandar(evento.currentTarget);
              }}
            >
              <input type="hidden" name="intent" value="pagar-taxa" />
              <button disabled={ocupado}>
                {t("Registrar pagamento da taxa")}
              </button>
            </SalvarForm>
          ))}
        <p>
          <Link to={`/viagens/${d.viagem.id}/aceite?versao=${d.orcamento.id}`}>
            {t("Registrar aceite")}
          </Link>
        </p>
        <p>
          <a href={`/propostas/${d.orcamento.id}`}>{t("Abrir proposta")}</a>
        </p>
        <CopiarResumo
          key={`/propostas/${d.orcamento.id}?formato=texto`}
          url={`/propostas/${d.orcamento.id}?formato=texto`}
          t={t}
        />
        {m.calculos.map((c, i) => (
          <section key={i}>
            <h2>{m.dados.opcoes[i].nome}</h2>
            <p data-testid="valor-congelado">{moeda(c.enviado)}</p>
            <p>
              {m.cliente} · {m.enviadaEm}
            </p>
          </section>
        ))}
        <SalvarForm
          method="post"
          onSubmit={(evento) => {
            evento.preventDefault();
            comandar(evento.currentTarget);
          }}
        >
          <input type="hidden" name="intent" value="nova-versao" />
          <button disabled={ocupado}>{t("Iniciar nova versão")}</button>
        </SalvarForm>
        {erroEnvio && <p role="alert">{mensagem(erroEnvio)}</p>}
      </>
    );
  }
  return (
    <fieldset
      disabled={confirmando || (ocupado && !salvando)}
      className="editor-orcamento"
      style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
    >
      <Link to={`/viagens/${d.viagem.id}`}>{t("Voltar à viagem")}</Link>
      <h1>
        {t("Orçamento")} {d.viagem.codigo} · {t("Versão")} {d.orcamento.versao}
      </h1>
      {conflito && (
        <p role="alert">
          {t("O orçamento mudou. Recarregue antes de confirmar.")}
        </p>
      )}
      <PedidoForm
        method="post"
        onSubmit={(evento) => {
          evento.preventDefault();
          prepararPedido(evento.currentTarget);
        }}
      >
        <input type="hidden" name="intent" value="preparar-pedido" />
        <label>
          {t("Pedido do cliente")}
          <textarea
            name="pedidoTexto"
            aria-label={t("Pedido do cliente")}
            value={pedidoTexto}
            onChange={(evento) => definirTexto(evento.target.value)}
            required
          />
        </label>
        <button disabled={pedidoOcupado}>
          {t("Preparar rascunho")}
        </button>
      </PedidoForm>
      {previaPedido.fase === "erro" && (
        <p role="alert">{mensagem(previaPedido.erro)}</p>
      )}
      {previaPedido.fase === "pronta" && (
        <PreviaPedido
          pedido={previaPedido.valor.pedido}
          alterado={alterado}
          ocupado={ocupado}
          conflito={conflito}
          onConfirmar={confirmarPedido}
        />
      )}
      {resultado === "confirmado" && (
        <p role="status">{t("Pedido confirmado")}</p>
      )}
      {erroVisivel && <p role="alert">{mensagem(erroVisivel)}</p>}
      <a href={`/orcamentos/${d.orcamento.id}/excel`}>{t("Exportar Excel")}</a>
      <ImportarForm
        method="post"
        encType="multipart/form-data"
        onSubmit={(evento) => {
          evento.preventDefault();
          importarExcel(evento.currentTarget);
        }}
      >
        <input type="hidden" name="intent" value="importar-excel" />
        <label>
          {t("Arquivo Excel")}
          <input
            type="file"
            name="arquivo"
            accept=".xlsx"
            required
            onChange={invalidarExcel}
          />
        </label>
        <button disabled={importacaoOcupada}>
          {t("Revisar importação")}
        </button>
      </ImportarForm>
      {previaExcel.fase === "erro" && (
        <p role="alert">{mensagem(previaExcel.erro)}</p>
      )}
      {previaExcel.fase === "pronta" && (
        <PreviaExcel
          pendencias={previaExcel.valor.pendencias}
          revisaoAtual={previaExcel.valor.revisao === revisao}
          ocupado={ocupado}
          desabilitado={
            importacaoOcupada ||
            conflito ||
            previaExcel.valor.revisao !== revisao ||
            previaExcel.valor.pendencias.length > 0
          }
          onAplicar={aplicarExcel}
        />
      )}
      <p>
        {d.viagem.canalComercial} · {d.viagem.categoria}
      </p>
      <Seletor
        nome="categoria-orcamento"
        rotulo={t("Categoria do orçamento")}
        opcoes={conhecidas("categoria", [])}
        valorInicial={dados.categoria}
        onChange={(valor) =>
          alterar((r) => {
            r.categoria = valor;
          })
        }
      />
      <label>
        {t("Contagem dos dias")}
        <select
          aria-label={t("Contagem dos dias")}
          value={dados.diaInicial}
          onChange={(e) =>
            alterar((r) => {
              r.diaInicial = Number(e.target.value);
            })
          }
        >
          <option value="1">{t("Dia")} 1</option>
          <option value="0">{t("Dia")} 0</option>
        </select>
      </label>
      <div className="opcoes-orcamento">
        {dados.opcoes.map((opcao, oi) => {
          const calculo = calcularOpcao(opcao, {
            canal: dados.canal,
            categoria: opcao.categoria ?? dados.categoria,
            referencias: d.referencias,
            malasPorPessoa,
            viajantes: d.pessoas,
          });
          return (
            <OpcaoEditor
              key={opcao.id}
              opcao={opcao}
              calculo={calculo}
              dados={d}
              canal={dados.canal}
              categoria={dados.categoria}
              diaInicial={dados.diaInicial}
              malasPorPessoa={malasPorPessoa}
              t={t}
              mensagem={mensagem}
              moeda={moeda}
              conhecidas={conhecidas}
              mudar={(fn) => alterar((rascunho) => fn(rascunho.opcoes[oi]))}
              copiar={() => copiarOpcao(oi)}
              criarLinha={(di, entrada) => criarLinha(oi, di, entrada)}
              removerLinha={(di, li) => removerLinha(oi, di, li)}
              inserirDia={(di) => inserirDia(oi, di)}
              moverDia={(di, direcao) => moverDia(oi, di, direcao)}
              removerDia={(di) => removerDia(oi, di)}
            />
          );
        })}
      </div>
      <button disabled={ocupado || conflito} onClick={() => gravar("salvar")}>
        {t("Salvar orçamento")}
      </button>
      <button
        disabled={ocupado || conflito}
        onClick={() => gravar("atualizar-referencias")}
      >
        {t("Atualizar referências")}
      </button>
      {["cliente_final", "influencer"].includes(dados.canal) && (
        <section>
          <label>
            <input
              type="checkbox"
              checked={!!dados.taxaElaboracao?.ativa}
              onChange={(e) =>
                alterar((r) => {
                  r.taxaElaboracao = {
                    valor: r.taxaElaboracao?.valor ?? 0,
                    ativa: e.target.checked,
                  };
                })
              }
            />
            {t("Cobrar elaboração de roteiro")}
          </label>
          {dados.taxaElaboracao?.ativa && (
            <>
              <label>
                {t("Taxa de elaboração USD")}
                <input
                  type="number"
                  step=".01"
                  min="0"
                  value={dados.taxaElaboracao.valor / 100}
                  onChange={(e) =>
                    alterar((r) => {
                      r.taxaElaboracao = {
                        ativa: true,
                        valor: Math.round(Number(e.target.value) * 100),
                      };
                    })
                  }
                />
              </label>
              {d.taxaPaga ? (
                <p>{t("Taxa paga")}</p>
              ) : (
                <SalvarForm
                  method="post"
                  onSubmit={(evento) => {
                    evento.preventDefault();
                    comandar(evento.currentTarget);
                  }}
                >
                  <input type="hidden" name="intent" value="pagar-taxa" />
                  <button disabled={alterado || ocupado || conflito}>
                    {t("Registrar pagamento da taxa")}
                  </button>
                </SalvarForm>
              )}
            </>
          )}
        </section>
      )}
      <CondicoesEditor condicoes={dados.condicoes} mudar={mudarCondicoes} />
      <SalvarForm
        method="post"
        onSubmit={(evento) => {
          evento.preventDefault();
          comandar(evento.currentTarget);
        }}
      >
        <input type="hidden" name="intent" value="enviar" />
        <input type="hidden" name="revisao" value={revisao} />
        <label>
          {t("Destinatário do envio")}
          <input name="destinatario" defaultValue={d.destinatario} required />
        </label>
        <label>
          {t("Canal do envio")}
          <input
            name="canal"
            defaultValue={d.viagem.meiosContato[0] ?? "WhatsApp"}
            required
          />
        </label>
        <button disabled={alterado || ocupado || conflito}>
          {t("Registrar envio")}
        </button>
      </SalvarForm>
      {erroEnvio && typeof resultado !== "object" && (
        <p role="alert">{mensagem(erroEnvio)}</p>
      )}
      {resultado === "salvo" && !alterado && !ocupado && (
        <p role="status">{t("Orçamento salvo")}</p>
      )}
    </fieldset>
  );
}

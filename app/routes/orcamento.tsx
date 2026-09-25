import { listarDisponibilidade } from "~/modules/profissionais/profissionais.server";
import { disponibilidade } from "~/modules/profissionais/disponibilidade";
import {
  condicoesPadrao,
  type CondicoesProposta,
} from "~/modules/orcamentos/versoes";
import {
  destinatarioDaViagem,
  enviarOrcamento,
  iniciarNovaVersao,
} from "~/modules/orcamentos/envios.server";
import {
  confirmarPedido,
  extrairPedido,
  type PedidoExtraido,
} from "~/modules/orcamentos/pedido.server";
import { importarExcel } from "~/modules/orcamentos/excel.server";
import { Seletor } from "~/modules/opcoes/Seletor";
import { sugerirEquipe } from "~/modules/orcamentos/sugestoes";
import {
  sugerirVeiculo,
  avaliarVeiculo,
} from "~/modules/orcamentos/transportes";
import { useState, useEffect, useReducer, useRef, type FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useFetcher, data, redirect } from "react-router";
import type { Route } from "./+types/orcamento";
import { now } from "~/clock.server";
import { exigirUsuario } from "~/session.server";
import {
  lerOrcamento,
  salvarOrcamento,
  registrarPagamentoTaxa,
} from "~/modules/orcamentos/orcamentos.server";
import {
  alternativasTransporte,
  calcularOpcao,
  type RascunhoOrcamento,
  type DiaOrcamento,
} from "~/modules/orcamentos/calculo";
import { lerIntent, lerInteiroPositivo } from "~/modules/orcamentos/validacao";
import { copiarResumo } from "~/modules/orcamentos/copiar-resumo";
import { useIdioma } from "~/modules/idiomas/idioma";
import {
  editor,
  iniciarEditor,
  reconciliar,
  revisar,
  iniciarRevisao,
} from "~/modules/orcamentos/editor";
type Importacao = Awaited<ReturnType<typeof importarExcel>>;
type Resposta =
  | { tipo: "erro"; erro: string }
  | { tipo: "pagar-taxa" | "enviar" }
  | { tipo: "preparar-pedido"; pedido: PedidoExtraido; texto: string }
  | { tipo: "importar-excel"; importacao: Importacao; revisao: number }
  | {
      tipo: "salvar" | "confirmar-pedido";
      revisao: number;
      dados: RascunhoOrcamento;
    };
type ResultadoAction = Resposta & { requestId: string; orcamentoId: number };
export async function loader({ request, params }: Route.LoaderArgs) {
  await exigirUsuario(request);
  const d = await lerOrcamento(lerInteiroPositivo(params.id));
  return {
    ...d,
    ...(await listarDisponibilidade()),
    destinatario: await destinatarioDaViagem(d.viagem.id),
  };
}
export async function action({ request, params }: Route.ActionArgs) {
  const usuario = await exigirUsuario(request);
  const f = await request.formData();
  const resultado = (r: Resposta): ResultadoAction => ({
    ...r,
    requestId: String(f.get("requestId") ?? ""),
    orcamentoId: Number(params.id),
  });
  try {
    const intent = lerIntent(f.get("intent"));
    const orcamentoId = lerInteiroPositivo(params.id);
    if (intent === "pagar-taxa") {
      await registrarPagamentoTaxa(orcamentoId, usuario.id, now(request));
      return resultado({ tipo: "pagar-taxa" });
    }
    if (intent === "enviar") {
      await enviarOrcamento(
        orcamentoId,
        usuario.id,
        String(f.get("destinatario") ?? ""),
        String(f.get("canal") ?? ""),
        now(request),
        lerInteiroPositivo(f.get("revisao")),
      );
      return resultado({ tipo: "enviar" });
    }
    if (intent === "nova-versao") {
      const nova = await iniciarNovaVersao(
        orcamentoId,
        usuario.id,
        now(request),
      );
      return redirect(`/orcamentos/${nova.id}`);
    }
    if (intent === "preparar-pedido")
      return resultado({
        tipo: "preparar-pedido",
        texto: String(f.get("pedidoTexto") ?? ""),
        pedido: extrairPedido(String(f.get("pedidoTexto") ?? "")),
      });
    if (intent === "confirmar-pedido") {
      const salvo = await confirmarPedido(
        orcamentoId,
        lerInteiroPositivo(f.get("revisao")),
        String(f.get("pedidoTexto") ?? ""),
      );
      return resultado({
        tipo: "confirmar-pedido",
        revisao: salvo.revisao,
        dados: salvo.dados,
      });
    }
    if (intent === "importar-excel") {
      const arquivo = f.get("arquivo");
      if (!(arquivo instanceof File) || arquivo.size > 5 * 1024 * 1024)
        throw new Response("Use um arquivo do modelo CoreaLux com até 5 MB", {
          status: 400,
        });
      const d = await lerOrcamento(lerInteiroPositivo(params.id));
      const importacao = await importarExcel(
        await arquivo.arrayBuffer(),
        d.pessoas,
      );
      return resultado({
        tipo: "importar-excel",
        importacao,
        revisao: d.orcamento.revisao,
      });
    }
    let dados: unknown;
    try {
      dados = JSON.parse(String(f.get("dados")));
    } catch {
      throw new Response("Orçamento inválido", { status: 400 });
    }
    const salvo = await salvarOrcamento(
      orcamentoId,
      lerInteiroPositivo(f.get("revisao")),
      dados,
      usuario.id,
      now(request),
      intent === "atualizar-referencias",
    );
    return resultado({
      tipo: "salvar",
      revisao: salvo.revisao,
      dados: salvo.dados,
    });
  } catch (e) {
    if (e instanceof Response && [400, 409].includes(e.status))
      return data<ResultadoAction>(
        resultado({ tipo: "erro", erro: await e.text() }),
        { status: e.status },
      );
    throw e;
  }
}

export default function Orcamento(props: Route.ComponentProps) {
  return <EditorOrcamento key={props.loaderData.orcamento.id} {...props} />;
}
function EditorOrcamento({ loaderData: d }: Route.ComponentProps) {
  const { t, mensagem, idioma } = useIdioma();
  const salvar = useFetcher<typeof action>();
  const importar = useFetcher<typeof action>();
  const pedido = useFetcher<typeof action>();
  const [pedidoTexto, setPedidoTexto] = useState("");
  const [copia, setCopia] = useState<"idle" | "copiando" | "copiado" | "erro">(
    "idle",
  );
  const copiaAtual = useRef(0);
  const copiando = useRef(false);
  useEffect(
    () => () => {
      copiaAtual.current++;
    },
    [],
  );
  const [estado, dispatch] = useReducer(
    editor<RascunhoOrcamento>,
    iniciarEditor(d.orcamento.id, d.orcamento.revisao, d.orcamento.dados),
  );
  const [previaPedido, revisarPedido] = useReducer(
    revisar<{ texto: string; pedido: PedidoExtraido }>,
    iniciarRevisao<{ texto: string; pedido: PedidoExtraido }>(),
  );
  const [previaExcel, revisarExcel] = useReducer(
    revisar<Importacao & { revisao: number }>,
    iniciarRevisao<Importacao & { revisao: number }>(),
  );
  const {
    control,
    getValues,
    setValue,
    reset,
    formState: { isDirty: alterado },
  } = useForm<{ dados: RascunhoOrcamento }>({
    defaultValues: { dados: d.orcamento.dados },
  });
  const dados = useWatch({ control, name: "dados" });
  const temEdicoes = () =>
    JSON.stringify(getValues("dados")) !== JSON.stringify(estado.base);
  const emVoo = useRef<{ id: string; intent: string } | null>(null);
  const previasEmVoo = useRef<Record<string, string>>({});
  const adquirir = (id: string, intent: string) => {
    if (intent === "preparar-pedido" || intent === "importar-excel") {
      if (
        previasEmVoo.current[intent] ||
        (intent === "preparar-pedido" && pedido.state !== "idle") ||
        (intent === "importar-excel" && importar.state !== "idle")
      )
        return false;
      previasEmVoo.current[intent] = id;
      return true;
    }
    if (
      emVoo.current ||
      ocupado ||
      (intent === "confirmar-pedido" && pedido.state !== "idle")
    )
      return false;
    emVoo.current = { id, intent };
    return true;
  };
  const conflito =
    (estado.revisao !== d.orcamento.revisao ||
      estado.revisao !== estado.remota) &&
    estado.operacao.fase === "idle";
  const ocupado = salvar.state !== "idle" || estado.operacao.fase !== "idle";
  const confirmando = estado.operacao.fase === "confirmando";
  const malasPorPessoa = d.pessoas.length
    ? d.pessoas.reduce((s, p) => s + p.malas, 0) / d.pessoas.length
    : 2;
  const [itens, setItens] = useState<Record<string, string>>({});
  useEffect(() => {
    dispatch({ tipo: "externo", revisao: d.orcamento.revisao });
  }, [d.orcamento.revisao]);
  useEffect(() => {
    for (const r of [salvar.data, pedido.data]) {
      if (
        !r ||
        r.orcamentoId !== d.orcamento.id ||
        estado.operacao.fase === "idle" ||
        r.requestId !== estado.operacao.id
      )
        continue;
      if (r.tipo === "salvar" || r.tipo === "confirmar-pedido") {
        const atual = getValues("dados");
        const proximo =
          r.tipo === "confirmar-pedido"
            ? r.dados
            : reconciliar(estado.operacao.snapshot, atual, r.dados);
        reset({ dados: r.dados });
        if (proximo !== r.dados)
          setValue("dados", proximo, { shouldDirty: true });
        dispatch({
          tipo: "salvo",
          id: r.requestId,
          revisao: r.revisao,
          dados: r.dados,
        });
        if (r.tipo === "confirmar-pedido") revisarPedido({ tipo: "invalidar" });
      }
      if (r.tipo === "erro")
        dispatch({ tipo: "falha", id: r.requestId, erro: r.erro });
    }
  }, [
    salvar.data,
    pedido.data,
    d.orcamento.id,
    estado.operacao,
    getValues,
    reset,
    setValue,
  ]);
  useEffect(() => {
    const r = pedido.data;
    if (!r || r.orcamentoId !== d.orcamento.id) return;
    if (r.tipo === "preparar-pedido")
      revisarPedido({
        tipo: "receber",
        id: r.requestId,
        valor: { texto: r.texto, pedido: r.pedido },
      });
    if (r.tipo === "erro")
      revisarPedido({ tipo: "falha", id: r.requestId, erro: r.erro });
  }, [pedido.data, d.orcamento.id]);
  useEffect(() => {
    const r = importar.data;
    if (!r || r.orcamentoId !== d.orcamento.id) return;
    if (r.tipo === "importar-excel")
      revisarExcel({
        tipo: "receber",
        id: r.requestId,
        valor: { ...r.importacao, revisao: r.revisao },
      });
    if (r.tipo === "erro")
      revisarExcel({ tipo: "falha", id: r.requestId, erro: r.erro });
  }, [importar.data, d.orcamento.id]);
  useEffect(() => {
    if (
      pedido.state === "idle" &&
      pedido.data?.requestId === previasEmVoo.current["preparar-pedido"]
    )
      delete previasEmVoo.current["preparar-pedido"];
    if (
      importar.state === "idle" &&
      importar.data?.requestId === previasEmVoo.current["importar-excel"]
    )
      delete previasEmVoo.current["importar-excel"];
    const voo = emVoo.current;
    if (!voo) return;
    const f = voo.intent === "confirmar-pedido" ? pedido : salvar;
    if (
      f.state === "idle" &&
      f.data?.orcamentoId === d.orcamento.id &&
      f.data.requestId === voo.id
    )
      emVoo.current = null;
  }, [
    salvar.state,
    pedido.state,
    importar.state,
    salvar.data,
    pedido.data,
    importar.data,
    d.orcamento.id,
  ]);
  const comandar = (
    e: FormEvent<HTMLFormElement>,
    intent: "enviar" | "pagar-taxa" | "nova-versao",
  ) => {
    e.preventDefault();
    if (!d.orcamento.memoria && (temEdicoes() || conflito)) return;
    const requestId = crypto.randomUUID();
    if (!adquirir(requestId, intent)) return;
    const form = new FormData(e.currentTarget);
    form.set("intent", intent);
    form.set("requestId", requestId);
    form.set("revisao", String(estado.revisao));
    salvar.submit(form, { method: "post" });
  };
  const gravar = (intent: "salvar" | "atualizar-referencias") => {
    if (ocupado || conflito) return;
    const requestId = crypto.randomUUID();
    if (!adquirir(requestId, intent)) return;
    const snapshot = structuredClone(getValues("dados"));
    dispatch({ tipo: "salvar", id: requestId, snapshot, alterado });
    salvar.submit(
      {
        intent,
        requestId,
        dados: JSON.stringify(snapshot),
        revisao: String(estado.revisao),
      },
      { method: "post" },
    );
  };
  const conhecidas = (campo: string, base: { valor: string; nome: string }[]) =>
    [
      ...base,
      ...(d.opcoesConhecidas[campo] ?? []).filter(
        (o) => !base.some((b) => b.valor === o.valor),
      ),
    ].map((o) => ({ ...o, nome: mensagem(o.nome) }));
  const moeda = (n: number | null) =>
    n === null
      ? t("A informar")
      : new Intl.NumberFormat(idioma === "ko" ? "ko-KR" : "pt-BR", {
          style: "currency",
          currency: "USD",
        }).format(n / 100);
  const alterar = (fn: (rascunho: RascunhoOrcamento) => void) => {
    if (
      confirmando ||
      (emVoo.current &&
        ["confirmar-pedido", "enviar", "pagar-taxa", "nova-versao"].includes(
          emVoo.current.intent,
        ))
    )
      return;
    const novo = structuredClone(getValues("dados"));
    fn(novo);
    setValue("dados", novo, { shouldDirty: true });
    dispatch({ tipo: "editado" });
  };
  const alterarDia = (
    opcao: number,
    dia: number,
    fn: (d: DiaOrcamento) => void,
  ) => alterar((r) => fn(r.opcoes[opcao].dias[dia]));
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
            <salvar.Form
              method="post"
              onSubmit={(e) => comandar(e, "pagar-taxa")}
            >
              <button disabled={ocupado} name="intent" value="pagar-taxa">
                {t("Registrar pagamento da taxa")}
              </button>
            </salvar.Form>
          ))}
        <p>
          <Link to={`/viagens/${d.viagem.id}/aceite?versao=${d.orcamento.id}`}>
            {t("Registrar aceite")}
          </Link>
        </p>
        <p>
          <a href={`/propostas/${d.orcamento.id}`}>{t("Abrir proposta")}</a>
        </p>
        <button
          disabled={copia === "copiando"}
          onClick={async () => {
            if (copiando.current) return;
            copiando.current = true;
            const id = ++copiaAtual.current;
            setCopia("copiando");
            try {
              const copiou = await copiarResumo(
                `/propostas/${d.orcamento.id}?formato=texto`,
                {
                  buscar: fetch,
                  escrever: (texto) => navigator.clipboard.writeText(texto),
                  atual: () => id === copiaAtual.current,
                },
              );
              if (copiou) setCopia("copiado");
            } catch {
              if (id === copiaAtual.current) setCopia("erro");
            } finally {
              if (id === copiaAtual.current) copiando.current = false;
            }
          }}
        >
          {t("Copiar resumo B2B")}
        </button>
        {copia === "copiado" && <p role="status">{t("Texto copiado")}</p>}
        {copia === "erro" && (
          <p role="alert">{t("Não foi possível copiar. Tente novamente.")}</p>
        )}
        {m.calculos.map((c, i) => (
          <section key={i}>
            <h2>{m.dados.opcoes[i].nome}</h2>
            <p data-testid="valor-congelado">{moeda(c.enviado)}</p>
            <p>
              {m.cliente} · {m.enviadaEm}
            </p>
          </section>
        ))}
        <salvar.Form method="post" onSubmit={(e) => comandar(e, "nova-versao")}>
          <button disabled={ocupado} name="intent" value="nova-versao">
            {t("Iniciar nova versão")}
          </button>
        </salvar.Form>
        {salvar.data?.tipo === "erro" && (
          <p role="alert">{mensagem(salvar.data.erro)}</p>
        )}
      </>
    );
  }
  return (
    <fieldset
      disabled={
        confirmando ||
        (salvar.state !== "idle" && estado.operacao.fase !== "salvando")
      }
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
      <pedido.Form
        method="post"
        onSubmit={(e) => {
          e.preventDefault();
          if (pedido.state !== "idle") return;
          const requestId = crypto.randomUUID();
          if (!adquirir(requestId, "preparar-pedido")) return;
          revisarPedido({ tipo: "solicitar", id: requestId });
          pedido.submit(
            { intent: "preparar-pedido", pedidoTexto, requestId },
            { method: "post" },
          );
        }}
      >
        <label>
          {t("Pedido do cliente")}
          <textarea
            name="pedidoTexto"
            aria-label={t("Pedido do cliente")}
            value={pedidoTexto}
            onChange={(e) => {
              setPedidoTexto(e.target.value);
              revisarPedido({ tipo: "invalidar" });
            }}
            required
          />
        </label>
        <button disabled={pedido.state !== "idle"}>
          {t("Preparar rascunho")}
        </button>
      </pedido.Form>
      {previaPedido.fase === "erro" && (
        <p role="alert">{mensagem(previaPedido.erro)}</p>
      )}
      {previaPedido.fase === "pronta" && (
        <section aria-label={t("Revisão do pedido")}>
          <p>
            {previaPedido.valor.pedido.dias} {t("dias")} ·{" "}
            {previaPedido.valor.pedido.cidades.join(" / ")} ·{" "}
            {previaPedido.valor.pedido.pagantes} +{" "}
            {previaPedido.valor.pedido.gratuidades}
          </p>
          <p>
            {t(
              "Confirmar substitui os dias da primeira opção e atualiza datas e viajantes na Viagem.",
            )}
          </p>
          {alterado && (
            <p>{t("Salve o orçamento antes de confirmar o pedido.")}</p>
          )}
          <button
            disabled={ocupado || alterado || conflito}
            onClick={() => {
              if (ocupado || temEdicoes() || conflito) return;
              const requestId = crypto.randomUUID();
              if (!adquirir(requestId, "confirmar-pedido")) return;
              dispatch({
                tipo: "confirmar",
                id: requestId,
                snapshot: structuredClone(getValues("dados")),
                alterado,
              });
              pedido.submit(
                {
                  intent: "confirmar-pedido",
                  pedidoTexto: previaPedido.valor.texto,
                  revisao: String(estado.revisao),
                  requestId,
                },
                { method: "post" },
              );
            }}
          >
            {t("Confirmar pedido")}
          </button>
        </section>
      )}
      {estado.resultado === "confirmado" && (
        <p role="status">{t("Pedido confirmado")}</p>
      )}
      {typeof estado.resultado === "object" && (
        <p role="alert">{mensagem(estado.resultado.erro)}</p>
      )}
      <a href={`/orcamentos/${d.orcamento.id}/excel`}>{t("Exportar Excel")}</a>
      <importar.Form
        method="post"
        encType="multipart/form-data"
        onSubmit={(e) => {
          e.preventDefault();
          if (importar.state !== "idle") return;
          const form = new FormData(e.currentTarget);
          const requestId = crypto.randomUUID();
          if (!adquirir(requestId, "importar-excel")) return;
          form.set("requestId", requestId);
          revisarExcel({ tipo: "solicitar", id: requestId });
          importar.submit(form, {
            method: "post",
            encType: "multipart/form-data",
          });
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
            onChange={() => revisarExcel({ tipo: "invalidar" })}
          />
        </label>
        <button disabled={importar.state !== "idle"}>
          {t("Revisar importação")}
        </button>
      </importar.Form>
      {previaExcel.fase === "erro" && (
        <p role="alert">{mensagem(previaExcel.erro)}</p>
      )}
      {previaExcel.fase === "pronta" && (
        <section>
          {previaExcel.valor.revisao !== estado.revisao && (
            <p role="alert">
              {t("O orçamento mudou. Revise a importação novamente.")}
            </p>
          )}
          <ul>
            {previaExcel.valor.pendencias.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <button
            disabled={
              ocupado ||
              importar.state !== "idle" ||
              conflito ||
              previaExcel.valor.revisao !== estado.revisao ||
              previaExcel.valor.pendencias.length > 0
            }
            onClick={() => {
              if (
                ocupado ||
                importar.state !== "idle" ||
                conflito ||
                previaExcel.valor.revisao !== estado.revisao ||
                emVoo.current ||
                previaExcel.valor.pendencias.length > 0
              )
                return;
              setValue("dados", previaExcel.valor.dados, {
                shouldDirty: true,
              });
              dispatch({ tipo: "editado" });
              revisarExcel({ tipo: "invalidar" });
            }}
          >
            {t("Aplicar importação")}
          </button>
        </section>
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
        {dados.opcoes.map((o, oi) => {
          const c = calcularOpcao(o, {
            canal: dados.canal,
            categoria: o.categoria ?? dados.categoria,
            referencias: d.referencias,
            malasPorPessoa,
            viajantes: d.pessoas,
          });
          return (
            <section key={o.id} aria-label={o.nome} className="opcao-orcamento">
              <h2>{o.nome}</h2>
              <button
                onClick={() =>
                  alterar((r) => {
                    const copia = structuredClone(r.opcoes[oi]);
                    copia.id = crypto.randomUUID();
                    copia.nome = `Opção ${String.fromCharCode(65 + r.opcoes.length)}`;
                    for (const d of copia.dias) {
                      d.id = crypto.randomUUID();
                      for (const l of d.linhas) l.id = crypto.randomUUID();
                    }
                    r.opcoes.push(copia);
                  })
                }
              >
                {t("Copiar opção")}
              </button>
              <Seletor
                nome={`categoria-${o.id}`}
                rotulo={t("Categoria da opção")}
                opcoes={conhecidas("categoria", [])}
                valorInicial={o.categoria ?? dados.categoria}
                onChange={(valor) =>
                  alterar((r) => {
                    r.opcoes[oi].categoria = valor;
                  })
                }
              />
              <div className="linha">
                <label>
                  {t("Pagantes")}
                  <input
                    type="number"
                    min="0"
                    value={o.pagantes}
                    onChange={(e) =>
                      alterar((r) => {
                        r.opcoes[oi].pagantes = Number(e.target.value);
                      })
                    }
                  />
                </label>
                <label>
                  {t("Gratuidades")}
                  <input
                    type="number"
                    min="0"
                    value={o.gratuidades}
                    onChange={(e) =>
                      alterar((r) => {
                        r.opcoes[oi].gratuidades = Number(e.target.value);
                      })
                    }
                  />
                </label>
                <label>
                  {t("Margem (%)")}
                  <input
                    type="number"
                    list={`margens-${o.id}`}
                    value={o.margem * 100}
                    onChange={(e) =>
                      alterar((r) => {
                        r.opcoes[oi].margem = Number(e.target.value) / 100;
                      })
                    }
                  />
                  <datalist id={`margens-${o.id}`}>
                    {(["agencia", "operadora"].includes(dados.canal)
                      ? [10, 20, 30, 40]
                      : [20, 30, 40, 50]
                    ).map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </label>
              </div>
              {o.dias.map((dia, di) => {
                const pax = o.pagantes + o.gratuidades;
                const equipe = sugerirEquipe(
                  o.categoria ?? dados.categoria,
                  pax,
                );
                const qtdEquipe = equipe.guias + equipe.assistentes;
                const veiculo = sugerirVeiculo(
                  pax,
                  qtdEquipe,
                  pax * malasPorPessoa,
                  o.categoria ?? dados.categoria,
                  d.referencias,
                );
                const modelo = dia.veiculo || veiculo.modelo;
                const capacidade = avaliarVeiculo(
                  modelo,
                  pax,
                  qtdEquipe,
                  pax * malasPorPessoa,
                  d.referencias,
                );
                const staff = disponibilidade(
                  d.profissionais,
                  d.alocacoes,
                  dia,
                  d.viagem.idiomaGuiamento,
                  d.viagem.id,
                );
                const necessario = staff.find(
                  (p) => p.id === dia.profissionalNecessarioId,
                );
                return (
                  <section key={dia.id} className="dia-orcamento">
                    <h3>
                      {t("Dia")} {di + dados.diaInicial}
                    </h3>
                    <div className="linha">
                      <label>
                        {t("Data")}
                        <input
                          type="date"
                          value={dia.data}
                          onChange={(e) =>
                            alterarDia(oi, di, (d) => {
                              d.data = e.target.value;
                            })
                          }
                        />
                      </label>
                      <label>
                        {t("Profissional necessário")}
                        <select
                          aria-label={t("Profissional necessário")}
                          value={dia.profissionalNecessarioId ?? ""}
                          onChange={(e) =>
                            alterarDia(oi, di, (d) => {
                              d.profissionalNecessarioId =
                                Number(e.target.value) || undefined;
                            })
                          }
                        >
                          <option value="">{t("Nenhum")}</option>
                          {staff.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome}
                            </option>
                          ))}
                        </select>
                      </label>
                      {(["guia", "assistente"] as const).map((papel) => (
                        <label key={papel}>
                          {t(
                            papel === "guia"
                              ? "Guia do dia"
                              : "Assistente do dia",
                          )}
                          <select
                            aria-label={t(
                              papel === "guia"
                                ? "Guia do dia"
                                : "Assistente do dia",
                            )}
                            value={
                              dia[
                                papel === "guia" ? "guiaId" : "assistenteId"
                              ] ?? ""
                            }
                            onChange={(e) =>
                              alterarDia(oi, di, (d) => {
                                d[
                                  papel === "guia" ? "guiaId" : "assistenteId"
                                ] = Number(e.target.value) || undefined;
                              })
                            }
                          >
                            <option value="">{t("A informar")}</option>
                            {staff
                              .filter((p) => p.papel === papel && p.falaIdioma)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.nome}
                                  {p.ocupado ? ` — ${t("ocupada")}` : ""}
                                </option>
                              ))}
                          </select>
                        </label>
                      ))}
                      {necessario?.ocupado && (
                        <p role="alert">
                          {necessario.nome} {t("está ocupada")}
                        </p>
                      )}
                      {necessario && !necessario.falaIdioma && (
                        <p role="alert">
                          {necessario.nome}{" "}
                          {t("não fala o idioma de guiamento")}
                        </p>
                      )}
                      <Link to="/profissionais">
                        {t("Profissionais e disponibilidade")}
                      </Link>
                      <Seletor
                        nome={`cidade-${dia.id}`}
                        rotulo={t("Cidade ou trecho")}
                        opcoes={conhecidas("cidades", [])}
                        valorInicial={dia.cidade}
                        onChange={(valor) =>
                          alterarDia(oi, di, (d) => {
                            d.cidade = valor;
                          })
                        }
                      />
                      <Seletor
                        nome={`periodo-${dia.id}`}
                        rotulo={t("Período")}
                        opcoes={conhecidas(
                          "periodo",
                          Object.entries({
                            completo: "Dia completo",
                            meio: "Meio período",
                            livre: "Dia livre",
                            deslocamento: "Deslocamento",
                          }).map(([valor, nome]) => ({ valor, nome })),
                        )}
                        valorInicial={dia.periodo}
                        onChange={(valor) =>
                          alterarDia(oi, di, (d) => {
                            d.periodo = valor;
                          })
                        }
                      />
                      <label>
                        {t("Início do serviço")}
                        <input
                          type="time"
                          value={dia.horaInicio ?? ""}
                          onChange={(e) =>
                            alterarDia(oi, di, (d) => {
                              d.horaInicio = e.target.value;
                            })
                          }
                        />
                      </label>
                      <label>
                        {t("Fim do serviço")}
                        <input
                          type="time"
                          value={dia.horaFim ?? ""}
                          onChange={(e) =>
                            alterarDia(oi, di, (d) => {
                              d.horaFim = e.target.value;
                            })
                          }
                        />
                      </label>
                    </div>
                    <div className="linha">
                      {(["manha", "almoco", "tarde"] as const).map(
                        (campo, i) => (
                          <label key={campo}>
                            {t((["Manhã", "Almoço", "Tarde"] as const)[i])}
                            <input
                              value={dia[campo]}
                              onChange={(e) =>
                                alterarDia(oi, di, (d) => {
                                  d[campo] = e.target.value;
                                })
                              }
                            />
                          </label>
                        ),
                      )}
                    </div>
                    <fieldset>
                      <legend>{t("Viajantes do dia")}</legend>
                      {d.pessoas.map((p, i) => (
                        <label key={p.id}>
                          <input
                            type="checkbox"
                            checked={
                              !dia.viajanteIds || dia.viajanteIds.includes(p.id)
                            }
                            onChange={(e) =>
                              alterarDia(oi, di, (dia) => {
                                const ids =
                                  dia.viajanteIds ?? d.pessoas.map((p) => p.id);
                                dia.viajanteIds = e.target.checked
                                  ? [...ids, p.id]
                                  : ids.filter((id) => id !== p.id);
                              })
                            }
                          />
                          {p.nome ?? `${t("Viajante")} ${i + 1}`}
                        </label>
                      ))}
                    </fieldset>
                    {pax > 8 && (
                      <ul aria-label={t("Alternativas de transporte")}>
                        {alternativasTransporte(o, dia, {
                          canal: dados.canal,
                          categoria: o.categoria ?? dados.categoria,
                          referencias: d.referencias,
                        }).map((a) => (
                          <li key={a.modelo}>
                            {a.modelo} × {a.quantidade}: {moeda(a.total)}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p data-testid="sugestao-veiculo">
                      {t("Veículo sugerido")}:{" "}
                      {d.referencias.frota.linhas.find(
                        (v) => v.id === veiculo.modelo,
                      )?.nome ?? t("Ônibus")}{" "}
                      × {veiculo.quantidade}
                    </p>
                    <Seletor
                      nome={`veiculo-${dia.id}`}
                      rotulo={t("Veículo do dia")}
                      opcoes={conhecidas("veiculo", [
                        ...d.referencias.frota.linhas.map((v) => ({
                          valor: v.id,
                          nome: v.nome,
                        })),
                        { valor: "onibus", nome: t("Ônibus") },
                      ])}
                      valorInicial={dia.veiculo ?? modelo}
                      onChange={(valor) =>
                        alterarDia(oi, di, (d) => {
                          d.veiculo = valor;
                        })
                      }
                    />
                    {modelo === "onibus" && (
                      <>
                        <label>
                          {t("Distância contratada km")}
                          <input
                            type="number"
                            min="1"
                            value={dia.distanciaOnibus ?? 200}
                            onChange={(e) =>
                              alterarDia(oi, di, (d) => {
                                d.distanciaOnibus = Number(e.target.value);
                              })
                            }
                          />
                        </label>
                        <label>
                          {t("Duração contratada dias")}
                          <input
                            type="number"
                            min="1"
                            max="4"
                            value={dia.duracaoOnibus ?? 1}
                            onChange={(e) =>
                              alterarDia(oi, di, (d) => {
                                d.duracaoOnibus = Number(e.target.value);
                              })
                            }
                          />
                        </label>
                        <p>
                          {t(
                            "Registre a contratação contínua uma vez; nos demais dias zere a quantidade do ônibus.",
                          )}
                        </p>
                      </>
                    )}
                    {modelo === "onibus" && (
                      <label>
                        {t("Porte do ônibus")}
                        <select
                          value={dia.porteOnibus ?? "45"}
                          onChange={(e) =>
                            alterarDia(oi, di, (d) => {
                              d.porteOnibus = e.target.value;
                            })
                          }
                        >
                          {d.referencias.porte_onibus.linhas.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nome}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {capacidade.confortoExcedido && (
                      <p role="alert">
                        {t("Capacidade de conforto excedida")}:{" "}
                        {capacidade.conforto}
                      </p>
                    )}
                    {capacidade.assentosInsuficientes && (
                      <p className="alerta" data-testid="alerta-assentos">
                        {t("Assentos insuficientes")}: {capacidade.capacidade} ·{" "}
                        {t("Veículo maior ou segundo veículo")}
                      </p>
                    )}
                    {!capacidade.assentosInsuficientes &&
                      capacidade.bagagemExcedente && (
                        <p className="alerta">
                          {t(
                            "Bagagem excede a referência de conforto; confirme veículo maior ou caminhão de bagagem",
                          )}
                        </p>
                      )}
                    <label>
                      {t("Transporte autorizado pelo cliente")}
                      <select
                        aria-label={t("Transporte autorizado pelo cliente")}
                        value={dia.autorizacaoTransporte ?? ""}
                        onChange={(e) =>
                          alterarDia(oi, di, (d) => {
                            d.autorizacaoTransporte = e.target.value;
                          })
                        }
                      >
                        <option value="">{t("A informar")}</option>
                        {[
                          "Veículo maior",
                          "Segundo veículo",
                          "Caminhão de bagagem",
                          "Transporte público",
                        ].map((v) => (
                          <option key={v} value={v}>
                            {mensagem(v)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <table>
                      <thead>
                        <tr>
                          {[
                            "Descrição da linha",
                            "Quantidade",
                            "Valor unitário USD",
                            "Grupo",
                            "Total",
                          ].map((n) => (
                            <th key={n}>{mensagem(n)}</th>
                          ))}
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {dia.linhas.map((l, li) => {
                          const calculada = c.linhas.find(
                            (v) => v.id === l.id,
                          )!;
                          const unidade = ["KRW", "JPY"].includes(l.moeda)
                            ? 1
                            : 100;
                          if (
                            (l.regra || l.automatica) &&
                            ["livre", "deslocamento"].includes(dia.periodo)
                          )
                            return null;
                          return (
                            <tr
                              key={l.id}
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
                                    onChange={(e) =>
                                      alterarDia(oi, di, (d) => {
                                        d.linhas[li].provisorio =
                                          e.target.checked;
                                      })
                                    }
                                  />
                                  {t("Padrão provisório")}
                                </label>
                                <input
                                  aria-label={t("Descrição da linha")}
                                  value={l.nome}
                                  onChange={(e) =>
                                    alterarDia(oi, di, (d) => {
                                      d.linhas[li].nome = e.target.value;
                                    })
                                  }
                                />
                                {l.hotel && (
                                  <>
                                    <Seletor
                                      nome={`hotel-${l.id}`}
                                      rotulo={t("Hotel da linha")}
                                      opcoes={d.hoteis}
                                      valorInicial={l.hotel.nome}
                                      contexto={{ cidade: dia.cidade }}
                                      filtro={(o, c) =>
                                        o.contexto?.cidade === c.cidade
                                      }
                                      onChange={(valor) =>
                                        alterarDia(oi, di, (dia) => {
                                          const h = d.hoteis.find(
                                            (h) => h.valor === valor,
                                          );
                                          dia.linhas[li].hotel!.nome =
                                            h?.valor ?? valor;
                                          dia.linhas[li].nome =
                                            h?.nome ?? valor;
                                          if (h?.contexto?.endereco)
                                            dia.linhas[li].hotel!.endereco =
                                              h.contexto.endereco;
                                        })
                                      }
                                    />
                                    <label>
                                      {t("Endereço do hotel")}
                                      <input
                                        value={l.hotel.endereco}
                                        onChange={(e) =>
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].hotel!.endereco =
                                              e.target.value;
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
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].hotel!.quartos =
                                              Number(e.target.value);
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
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].hotel!.noites = Number(
                                              e.target.value,
                                            );
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
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].hotel!.taxas =
                                              Number(e.target.value) / 100;
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
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].hotel!.cafe =
                                              Math.round(
                                                Number(e.target.value) *
                                                  unidade,
                                              );
                                          })
                                        }
                                      />
                                    </label>
                                    <label>
                                      {t("Ocupação")}
                                      <select
                                        value={l.hotel.ocupacao}
                                        onChange={(e) =>
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].hotel!.ocupacao = e
                                              .target.value as
                                              "duplo" | "single";
                                          })
                                        }
                                      >
                                        <option value="duplo">
                                          {t("Duplo")}
                                        </option>
                                        <option value="single">
                                          {t("Single")}
                                        </option>
                                      </select>
                                    </label>
                                    <label>
                                      {t("Fonte da cotação")}
                                      <input
                                        value={l.hotel.fonte}
                                        onChange={(e) =>
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].hotel!.fonte =
                                              e.target.value;
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
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].hotel!.dataFonte =
                                              e.target.value;
                                          })
                                        }
                                      />
                                    </label>
                                    <fieldset>
                                      <legend>
                                        {t("Viajantes do quarto")}
                                      </legend>
                                      {d.pessoas.map((p, i) => (
                                        <label key={p.id}>
                                          <input
                                            type="checkbox"
                                            checked={
                                              !!l.viajanteIds?.includes(p.id)
                                            }
                                            onChange={(e) =>
                                              alterarDia(oi, di, (d) => {
                                                d.linhas[li].viajanteIds = e
                                                  .target.checked
                                                  ? [
                                                      ...(l.viajanteIds ?? []),
                                                      p.id,
                                                    ]
                                                  : (
                                                      l.viajanteIds ?? []
                                                    ).filter(
                                                      (id) => id !== p.id,
                                                    );
                                              })
                                            }
                                          />
                                          {p.nome ??
                                            `${t("Viajante")} ${i + 1}`}
                                        </label>
                                      ))}
                                    </fieldset>
                                  </>
                                )}
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={!!l.terceiro}
                                    onChange={(e) =>
                                      alterarDia(oi, di, (d) => {
                                        d.linhas[li].terceiro =
                                          e.target.checked;
                                      })
                                    }
                                  />
                                  {t("Reservado por terceiro, sem cobrança")}
                                </label>
                                {!l.regra && (
                                  <>
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={!!l.porViajante}
                                        onChange={(e) =>
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].porViajante =
                                              e.target.checked;
                                          })
                                        }
                                      />
                                      {t("Cobrar por viajante")}
                                    </label>
                                    {l.porViajante && (
                                      <>
                                        <fieldset>
                                          <legend>
                                            {t("Viajantes desta linha")}
                                          </legend>
                                          {d.pessoas
                                            .filter(
                                              (p) =>
                                                !dia.viajanteIds ||
                                                dia.viajanteIds.includes(p.id),
                                            )
                                            .map((p, i) => (
                                              <label key={p.id}>
                                                <input
                                                  type="checkbox"
                                                  checked={
                                                    !l.viajanteIds ||
                                                    l.viajanteIds.includes(p.id)
                                                  }
                                                  onChange={(e) =>
                                                    alterarDia(
                                                      oi,
                                                      di,
                                                      (dia) => {
                                                        const ids =
                                                          l.viajanteIds ??
                                                          d.pessoas
                                                            .filter(
                                                              (p) =>
                                                                !dia.viajanteIds ||
                                                                dia.viajanteIds.includes(
                                                                  p.id,
                                                                ),
                                                            )
                                                            .map((p) => p.id);
                                                        dia.linhas[
                                                          li
                                                        ].viajanteIds = e.target
                                                          .checked
                                                          ? [...ids, p.id]
                                                          : ids.filter(
                                                              (id) =>
                                                                id !== p.id,
                                                            );
                                                      },
                                                    )
                                                  }
                                                />
                                                {p.nome ??
                                                  `${t("Viajante")} ${i + 1}`}
                                              </label>
                                            ))}
                                        </fieldset>
                                        <label>
                                          {t("Tarifa infantil USD")}
                                          <input
                                            type="number"
                                            step=".01"
                                            min="0"
                                            value={
                                              l.tarifaCrianca === undefined
                                                ? ""
                                                : l.tarifaCrianca / 100
                                            }
                                            onChange={(e) =>
                                              alterarDia(oi, di, (d) => {
                                                d.linhas[li].tarifaCrianca =
                                                  e.target.value === ""
                                                    ? undefined
                                                    : Math.round(
                                                        Number(e.target.value) *
                                                          100,
                                                      );
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
                                            onChange={(e) =>
                                              alterarDia(oi, di, (d) => {
                                                d.linhas[li].idadeCriancaMax =
                                                  Number(e.target.value);
                                              })
                                            }
                                          />
                                        </label>
                                        <label>
                                          {t("Tarifa sênior USD")}
                                          <input
                                            type="number"
                                            step=".01"
                                            min="0"
                                            value={
                                              l.tarifaSenior === undefined
                                                ? ""
                                                : l.tarifaSenior / 100
                                            }
                                            onChange={(e) =>
                                              alterarDia(oi, di, (d) => {
                                                d.linhas[li].tarifaSenior =
                                                  e.target.value === ""
                                                    ? undefined
                                                    : Math.round(
                                                        Number(e.target.value) *
                                                          100,
                                                      );
                                              })
                                            }
                                          />
                                        </label>
                                        <label>
                                          <input
                                            type="checkbox"
                                            checked={!!l.seniorElegivel}
                                            onChange={(e) =>
                                              alterarDia(oi, di, (d) => {
                                                d.linhas[li].seniorElegivel =
                                                  e.target.checked;
                                              })
                                            }
                                          />
                                          {t(
                                            "Fornecedor confirma elegibilidade sênior destes viajantes",
                                          )}
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
                                    alterarDia(oi, di, (d) => {
                                      d.linhas[li].quantidade = Number(
                                        e.target.value,
                                      );
                                      d.linhas[li].quantidadeManual = true;
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
                                      ["USD", "KRW", "JPY", "EUR", "BRL"].map(
                                        (m) => ({ valor: m, nome: m }),
                                      ),
                                    )}
                                    valorInicial={l.moeda}
                                    onChange={(valor) =>
                                      alterarDia(oi, di, (d) => {
                                        d.linhas[li].moeda = valor;
                                        d.linhas[li].valor = null;
                                        d.linhas[li].fonteTaxa =
                                          valor === "KRW" ? "Naver" : "";
                                      })
                                    }
                                  />
                                )}
                                <input
                                  aria-label={`${t("Valor unitário")} ${l.moeda}`}
                                  type="number"
                                  step={unidade === 1 ? "1" : ".01"}
                                  min="0"
                                  placeholder={
                                    calculada.sugerido === null
                                      ? ""
                                      : String(calculada.sugerido / unidade)
                                  }
                                  value={
                                    l.valor === null ? "" : l.valor / unidade
                                  }
                                  onChange={(e) =>
                                    alterarDia(oi, di, (d) => {
                                      d.linhas[li].valor =
                                        e.target.value === ""
                                          ? null
                                          : Math.round(
                                              Number(e.target.value) * unidade,
                                            );
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
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].taxa =
                                              e.target.value === ""
                                                ? undefined
                                                : Number(e.target.value);
                                          })
                                        }
                                      />
                                    </label>
                                    <label>
                                      {t("Data do câmbio")}
                                      <input
                                        type="date"
                                        value={l.dataTaxa ?? ""}
                                        onChange={(e) =>
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].dataTaxa =
                                              e.target.value;
                                          })
                                        }
                                      />
                                    </label>
                                    <label>
                                      {t("Fonte do câmbio")}
                                      <input
                                        value={l.fonteTaxa ?? ""}
                                        onChange={(e) =>
                                          alterarDia(oi, di, (d) => {
                                            d.linhas[li].fonteTaxa =
                                              e.target.value;
                                          })
                                        }
                                      />
                                    </label>
                                  </>
                                )}
                              </td>
                              <td>
                                <select
                                  aria-label={t("Grupo")}
                                  value={l.grupo}
                                  onChange={(e) =>
                                    alterarDia(oi, di, (d) => {
                                      d.linhas[li].grupo = e.target
                                        .value as typeof l.grupo;
                                    })
                                  }
                                >
                                  <option value="servicos">
                                    {t("Serviços")}
                                  </option>
                                  <option value="hotel">{t("Hotel")}</option>
                                  <option value="terceiros">
                                    {t("Terceiros")}
                                  </option>
                                </select>
                              </td>
                              <td>
                                <label>
                                  {t("Custo real da linha USD")}
                                  <input
                                    type="number"
                                    step=".01"
                                    min="0"
                                    value={
                                      l.custoRealUSD === undefined
                                        ? ""
                                        : l.custoRealUSD / 100
                                    }
                                    onChange={(e) =>
                                      alterarDia(oi, di, (d) => {
                                        d.linhas[li].custoRealUSD =
                                          e.target.value === ""
                                            ? undefined
                                            : Math.round(
                                                Number(e.target.value) * 100,
                                              );
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
                                      value={
                                        l.custoFornecedor === undefined
                                          ? ""
                                          : l.custoFornecedor / 100
                                      }
                                      onChange={(e) =>
                                        alterarDia(oi, di, (d) => {
                                          d.linhas[li].custoFornecedor =
                                            e.target.value === ""
                                              ? undefined
                                              : Math.round(
                                                  Number(e.target.value) * 100,
                                                );
                                        })
                                      }
                                    />
                                  </label>
                                )}
                                {moeda(calculada.total)}
                                {!l.regra &&
                                  !l.item &&
                                  !l.terceiro &&
                                  (calculada.total ?? 0) > 0 &&
                                  l.custoRealUSD === undefined && (
                                    <small>
                                      {t(
                                        "Estimativa: informe o custo real antes de enviar",
                                      )}
                                    </small>
                                  )}
                                {(l.regra || l.item) && (
                                  <small>
                                    {t("Valor sugerido")}:{" "}
                                    {moeda(calculada.sugerido)}
                                    {calculada.provisorio &&
                                      ` · ${t("Padrão provisório")}`}
                                  </small>
                                )}
                                {(l.regra || l.item) && l.valor !== null && (
                                  <label>
                                    {t("Motivo do ajuste")}
                                    <input
                                      value={l.motivoAjuste ?? ""}
                                      onChange={(e) =>
                                        alterarDia(oi, di, (d) => {
                                          d.linhas[li].motivoAjuste =
                                            e.target.value;
                                        })
                                      }
                                    />
                                  </label>
                                )}
                                {(l.regra || l.item) && (
                                  <small>
                                    {
                                      d.autores.find(
                                        (a) =>
                                          a.id ===
                                          d.orcamento.dados.opcoes
                                            .flatMap((o) =>
                                              o.dias.flatMap((d) => d.linhas),
                                            )
                                            .find((v) => v.id === l.id)
                                            ?.autorAjuste,
                                      )?.nome
                                    }
                                  </small>
                                )}
                              </td>
                              <td>
                                <button
                                  onClick={() =>
                                    alterarDia(oi, di, (d) => {
                                      d.linhas.splice(li, 1);
                                    })
                                  }
                                >
                                  {t("Remover linha")}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="linha">
                      <label>
                        {t("Item de referência")}
                        <select
                          aria-label={t("Item de referência")}
                          value={itens[dia.id] ?? "sky_capsule"}
                          onChange={(e) =>
                            setItens({ ...itens, [dia.id]: e.target.value })
                          }
                        >
                          {d.referencias.tickets.linhas.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.nome}
                            </option>
                          ))}
                          {Object.entries({
                            voo_jeju: "Voo Jeju",
                            voo_equipe: "Voo da equipe",
                            ktx_guia: "KTX do guia",
                          }).map(([id, nome]) => (
                            <option key={id} value={id}>
                              {mensagem(nome)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={() =>
                          alterarDia(oi, di, (dia) => {
                            const item = itens[dia.id] ?? "sky_capsule";
                            dia.linhas.push({
                              id: crypto.randomUUID(),
                              nome:
                                d.referencias.tickets.linhas.find(
                                  (l) => l.id === item,
                                )?.nome ??
                                {
                                  voo_jeju: "Voo Jeju",
                                  voo_equipe: "Voo da equipe",
                                  ktx_guia: "KTX do guia",
                                }[item] ??
                                item,
                              item,
                              quantidade: ["voo_equipe", "ktx_guia"].includes(
                                item,
                              )
                                ? 1
                                : o.pagantes + o.gratuidades,
                              quantidadeManual: [
                                "voo_equipe",
                                "ktx_guia",
                              ].includes(item),
                              valor: null,
                              moeda: "USD",
                              grupo: "servicos",
                            });
                          })
                        }
                      >
                        {t("Adicionar item")}
                      </button>
                    </div>
                    <label>
                      {t("Adicionar transfer")}
                      <select
                        aria-label={t("Adicionar transfer")}
                        value=""
                        onChange={(e) => {
                          const [trecho, nivel] = e.target.value.split(":");
                          if (!trecho) return;
                          alterarDia(oi, di, (dia) => {
                            dia.linhas.push({
                              id: crypto.randomUUID(),
                              nome: `${d.referencias.transfers.linhas.find((l) => l.id === trecho)?.nome} · ${nivel}`,
                              item: `transfer:${trecho}:${nivel}`,
                              valor: null,
                              quantidade: 1,
                              moeda: "USD",
                              grupo: "servicos",
                            });
                          });
                        }}
                      >
                        <option value="">{t("Selecionar")}</option>
                        {d.referencias.transfers.linhas.flatMap((l) =>
                          [
                            "simples",
                            "recepcao",
                            "placa",
                            "checkin",
                            "onibus",
                          ].map((n) => (
                            <option key={`${l.id}:${n}`} value={`${l.id}:${n}`}>
                              {l.nome} · {n}
                            </option>
                          )),
                        )}
                      </select>
                    </label>
                    <button
                      onClick={() =>
                        alterarDia(oi, di, (d) => {
                          d.linhas.push({
                            id: crypto.randomUUID(),
                            nome: "Hotel",
                            quantidade: 1,
                            valor: null,
                            moeda: "USD",
                            grupo: "hotel",
                            hotel: {
                              nome: "Hotel",
                              endereco: "",
                              quartos: 1,
                              noites: 1,
                              taxas: 0,
                              cafe: 0,
                              ocupacao: "duplo",
                              fonte: "Booking",
                              dataFonte: "",
                            },
                          });
                        })
                      }
                    >
                      {t("Adicionar hotel")}
                    </button>
                    <div className="linha">
                      <button
                        onClick={() =>
                          alterarDia(oi, di, (d) => {
                            d.linhas.push({
                              id: crypto.randomUUID(),
                              nome: "",
                              quantidade: 1,
                              valor: null,
                              moeda: "USD",
                              grupo: "servicos",
                            });
                          })
                        }
                      >
                        {t("Adicionar linha")}
                      </button>
                      <button
                        onClick={() =>
                          alterar((r) => {
                            r.opcoes[oi].dias.splice(di + 1, 0, {
                              id: crypto.randomUUID(),
                              data: dia.data,
                              cidade: dia.cidade,
                              periodo: "completo",
                              manha: "",
                              almoco: "",
                              tarde: "",
                              linhas: dia.linhas
                                .filter((l) => l.regra || l.automatica)
                                .map((l) => ({
                                  ...l,
                                  id: crypto.randomUUID(),
                                  valor: null,
                                  motivoAjuste: undefined,
                                  quantidadeManual: false,
                                })),
                            });
                          })
                        }
                      >
                        {t("Inserir dia após este")}
                      </button>
                      {di > 0 && (
                        <button
                          onClick={() =>
                            alterar((r) => {
                              const dias = r.opcoes[oi].dias;
                              [dias[di - 1], dias[di]] = [
                                dias[di],
                                dias[di - 1],
                              ];
                            })
                          }
                        >
                          {t("Mover dia para cima")}
                        </button>
                      )}
                      {o.dias.length > 1 && (
                        <button
                          onClick={() =>
                            alterar((r) => {
                              r.opcoes[oi].dias.splice(di, 1);
                            })
                          }
                        >
                          {t("Remover dia")}
                        </button>
                      )}
                    </div>
                  </section>
                );
              })}
              <dl className="resumo-orcamento">
                <dt>{t("Serviços")}</dt>
                <dd>{moeda(c.servicos)}</dd>
                <dt>{t("Margem")}</dt>
                <dd>{moeda(c.margem)}</dd>
                <dt>{t("Hotéis")}</dt>
                <dd>{moeda(c.hoteis)}</dd>
                <dt>{t("Terceiros")}</dt>
                <dd>{moeda(c.terceiros)}</dd>
                <dt>{t("Preço calculado")}</dt>
                <dd data-testid="preco-calculado">{moeda(c.calculado)}</dd>
                <dt>{t("Preço enviado")}</dt>
                <dd data-testid="preco-enviado">{moeda(c.enviado)}</dd>
                <dt>{t("Diferença")}</dt>
                <dd data-testid="diferenca-preco">{moeda(c.diferenca)}</dd>
                <dt>{t("Por pessoa pagante")}</dt>
                <dd data-testid="por-pessoa">{moeda(c.porPessoa)}</dd>
              </dl>
              {["duplo", "single"].map((ocupacao) => {
                const hoteis = c.linhas.filter(
                  (l) =>
                    l.hotel && !l.terceiro && l.hotel.ocupacao === ocupacao,
                );
                if (!hoteis.length) return null;
                const valor = hoteis.some((l) => l.total === null)
                  ? null
                  : (c.servicos + c.margem + c.terceiros) /
                      Math.max(1, o.pagantes) +
                    hoteis.reduce(
                      (s, l) =>
                        s +
                        l.total! /
                          (l.hotel!.quartos * (ocupacao === "duplo" ? 2 : 1)),
                      0,
                    );
                return (
                  <p key={ocupacao}>
                    {t(ocupacao === "duplo" ? "Duplo" : "Single")} ·{" "}
                    {t("Por pessoa pagante")}: {moeda(valor)}
                  </p>
                );
              })}
              <details>
                <summary>{t("Linhas com padrões provisórios")}</summary>
                <ul>
                  {c.linhas
                    .filter((l) => l.provisorio)
                    .map((l) => (
                      <li key={l.id}>
                        {l.nome} · {moeda(l.total)}
                      </li>
                    ))}
                </ul>
              </details>
              <label>
                <input
                  type="checkbox"
                  checked={!!o.mostrarGorjeta}
                  onChange={(e) =>
                    alterar((r) => {
                      r.opcoes[oi].mostrarGorjeta = e.target.checked;
                    })
                  }
                />
                {t("Mostrar gorjeta sugerida")}
              </label>
              {c.gorjeta !== null && (
                <p data-testid="gorjeta-sugerida">
                  {t("Gorjeta sugerida, não incluída")}: {moeda(c.gorjeta)}
                </p>
              )}
              <label>
                {t("Preço enviado USD")}
                <input
                  type="number"
                  step=".01"
                  min="0"
                  placeholder={String(c.sugerido / 100)}
                  value={
                    o.precoEnviado === undefined ? "" : o.precoEnviado / 100
                  }
                  onChange={(e) =>
                    alterar((r) => {
                      r.opcoes[oi].precoEnviado =
                        e.target.value === ""
                          ? undefined
                          : Math.round(Number(e.target.value) * 100);
                    })
                  }
                />
              </label>
              <p data-testid="margem-real">
                {t("Margem estimada")}:{" "}
                {c.margemReal === null
                  ? t("não verificável")
                  : `${Number((c.margemReal * 100).toFixed(2))}%`}
              </p>
              {c.margemReal !== null && c.margemReal < 0.1 && (
                <label>
                  {t("Motivo da margem")}
                  <input
                    value={o.motivoMargem ?? ""}
                    onChange={(e) =>
                      alterar((r) => {
                        r.opcoes[oi].motivoMargem = e.target.value;
                      })
                    }
                  />
                </label>
              )}
              {c.comissaoInfluencer > 0 && (
                <p>
                  {t("Comissão Influencer")}: {moeda(c.comissaoInfluencer)}
                </p>
              )}
              {c.avisos.map((a) => (
                <p className="alerta" key={a}>
                  {mensagem(a)}
                </p>
              ))}
            </section>
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
                <salvar.Form
                  method="post"
                  onSubmit={(e) => comandar(e, "pagar-taxa")}
                >
                  <button
                    disabled={alterado || ocupado || conflito}
                    name="intent"
                    value="pagar-taxa"
                  >
                    {t("Registrar pagamento da taxa")}
                  </button>
                </salvar.Form>
              )}
            </>
          )}
        </section>
      )}
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
              value={
                (dados.condicoes ?? condicoesPadrao)[campo] *
                (campo === "iva" ? 100 : 1)
              }
              onChange={(e) =>
                alterar((r) => {
                  r.condicoes = {
                    ...condicoesPadrao,
                    ...r.condicoes,
                    [campo]:
                      Number(e.target.value) / (campo === "iva" ? 100 : 1),
                  };
                })
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
              value={(dados.condicoes ?? condicoesPadrao)[campo]}
              onChange={(e) =>
                alterar((r) => {
                  r.condicoes = {
                    ...condicoesPadrao,
                    ...r.condicoes,
                    [campo]: e.target.value,
                  };
                })
              }
            />
          </label>
        ))}
        <label>
          <input
            type="checkbox"
            checked={(dados.condicoes ?? condicoesPadrao).generica}
            onChange={(e) =>
              alterar((r) => {
                r.condicoes = {
                  ...condicoesPadrao,
                  ...r.condicoes,
                  generica: e.target.checked,
                };
              })
            }
          />
          {t("Proposta genérica")}
        </label>
        <label>
          {t("Detalhamento de preços")}
          <select
            value={(dados.condicoes ?? condicoesPadrao).detalhe}
            onChange={(e) =>
              alterar((r) => {
                r.condicoes = {
                  ...condicoesPadrao,
                  ...r.condicoes,
                  detalhe: e.target.value as CondicoesProposta["detalhe"],
                };
              })
            }
          >
            <option value="nenhum">{t("Total")}</option>
            <option value="dia">{t("Por dia")}</option>
            <option value="servico">{t("Por serviço")}</option>
          </select>
        </label>
      </fieldset>
      <salvar.Form method="post" onSubmit={(e) => comandar(e, "enviar")}>
        <input type="hidden" name="intent" value="enviar" />
        <input type="hidden" name="revisao" value={estado.revisao} />
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
      </salvar.Form>
      {salvar.data?.tipo === "erro" && typeof estado.resultado !== "object" && (
        <p role="alert">{mensagem(salvar.data.erro)}</p>
      )}
      {estado.resultado === "salvo" && !alterado && !ocupado && (
        <p role="status">{t("Orçamento salvo")}</p>
      )}
    </fieldset>
  );
}

import { useEffect, useReducer, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useFetcher } from "react-router";
import { useMaquina } from "~/modules/interface/use-maquina";
import { editor, emConflito, iniciarEditor, iniciarRevisao, revisar, sincronizarFormulario } from "./editor";
import { bloqueiaEdicao, podeSolicitar, reduzirVoo, vooInicial } from "./em-voo";
import type { IntentPrevia, IntentPrincipal } from "./em-voo";
import type { RetornoOrcamento } from "./acoes";
import type { Importacao } from "./excel.server";
import type { PedidoExtraido } from "./pedido.server";
import type { RascunhoOrcamento } from "./calculo";
import type { Carregados, CriarLinha } from "./editor-tipos";
import { novaLinhaHotel, novaLinhaItem, novaLinhaTransfer, novaLinhaVazia, novaOpcao, novoDia } from "./editor-transicoes";

export type DadosFormularioOrcamento = { dados: RascunhoOrcamento };

export function useEditorOrcamento(carregados: Carregados) {
  const salvar = useFetcher<RetornoOrcamento>();
  const importar = useFetcher<RetornoOrcamento>();
  const pedido = useFetcher<RetornoOrcamento>();
  const [pedidoTexto, setPedidoTexto] = useState("");
  const [estado, dispatch] = useReducer(
    editor<RascunhoOrcamento>,
    iniciarEditor(carregados.orcamento.id, carregados.orcamento.revisao, carregados.orcamento.dados),
  );
  const [previaPedido, revisarPedido] = useReducer(
    revisar<{ texto: string; pedido: PedidoExtraido }>,
    iniciarRevisao<{ texto: string; pedido: PedidoExtraido }>(),
  );
  const [previaExcel, revisarExcel] = useReducer(
    revisar<Importacao & { revisao: number }>,
    iniciarRevisao<Importacao & { revisao: number }>(),
  );
  const formulario = useForm<DadosFormularioOrcamento>({
    defaultValues: { dados: carregados.orcamento.dados },
  });
  const { control, getValues, setValue, reset, formState: { isDirty: alterado } } = formulario;
  const dados = useWatch({ control, name: "dados" });
  const { estado: voo, emitir: emitirVoo, atual: vooAtual } = useMaquina(reduzirVoo, vooInicial);
  const temEdicoes = () => JSON.stringify(getValues("dados")) !== JSON.stringify(estado.base);
  const conflito = emConflito(estado, carregados.orcamento.revisao);
  const ocupado = salvar.state !== "idle" || estado.operacao.fase !== "idle";
  const confirmando = estado.operacao.fase === "confirmando";
  const adquirir = (id: string, intent: IntentPrincipal | IntentPrevia) => {
    if (!podeSolicitar(vooAtual(), intent, {
      salvando: salvar.state !== "idle",
      operacao: estado.operacao.fase !== "idle",
      pedido: pedido.state !== "idle",
      importacao: importar.state !== "idle",
    })) return false;
    emitirVoo(intent === "preparar-pedido" || intent === "importar-excel"
      ? { tipo: "solicitou-previa", intent, id }
      : { tipo: "solicitou-principal", intent, id });
    return true;
  };

  useEffect(() => {
    dispatch({ tipo: "externo", revisao: carregados.orcamento.revisao });
  }, [carregados.orcamento.revisao]);

  useEffect(() => {
    for (const retorno of [salvar.data, pedido.data]) {
      if (!retorno || retorno.orcamentoId !== carregados.orcamento.id || estado.operacao.fase === "idle" || retorno.requestId !== estado.operacao.id) continue;
      if (retorno.tipo === "salvar" || retorno.tipo === "confirmar-pedido") {
        const sincronizado = sincronizarFormulario({
          snapshot: estado.operacao.snapshot,
          atual: getValues("dados"),
          salvo: retorno.dados,
          confirmacao: retorno.tipo === "confirmar-pedido",
        });
        reset({ dados: sincronizado.reset });
        if (sincronizado.manter !== null) setValue("dados", sincronizado.manter, { shouldDirty: true });
        dispatch({ tipo: "salvo", id: retorno.requestId, revisao: retorno.revisao, dados: retorno.dados });
        if (retorno.tipo === "confirmar-pedido") revisarPedido({ tipo: "invalidar" });
      }
      if (retorno.tipo === "erro") dispatch({ tipo: "falha", id: retorno.requestId, erro: retorno.erro });
    }
  }, [salvar.data, pedido.data, carregados.orcamento.id, estado.operacao, getValues, reset, setValue]);

  useEffect(() => {
    const retorno = pedido.data;
    if (!retorno || retorno.orcamentoId !== carregados.orcamento.id) return;
    if (retorno.tipo === "preparar-pedido") revisarPedido({ tipo: "receber", id: retorno.requestId, valor: { texto: retorno.texto, pedido: retorno.pedido } });
    if (retorno.tipo === "erro") revisarPedido({ tipo: "falha", id: retorno.requestId, erro: retorno.erro });
  }, [pedido.data, carregados.orcamento.id]);

  useEffect(() => {
    const retorno = importar.data;
    if (!retorno || retorno.orcamentoId !== carregados.orcamento.id) return;
    if (retorno.tipo === "importar-excel") revisarExcel({ tipo: "receber", id: retorno.requestId, valor: { ...retorno.importacao, revisao: retorno.revisao } });
    if (retorno.tipo === "erro") revisarExcel({ tipo: "falha", id: retorno.requestId, erro: retorno.erro });
  }, [importar.data, carregados.orcamento.id]);

  useEffect(() => {
    const slots = voo;
    const pedidoId = slots.previas["preparar-pedido"];
    if (pedidoId && pedido.state === "idle" && pedido.data?.requestId === pedidoId && pedido.data.orcamentoId === carregados.orcamento.id)
      emitirVoo({ tipo: "liberou-previa", intent: "preparar-pedido", id: pedidoId });
    const excelId = slots.previas["importar-excel"];
    if (excelId && importar.state === "idle" && importar.data?.requestId === excelId && importar.data.orcamentoId === carregados.orcamento.id)
      emitirVoo({ tipo: "liberou-previa", intent: "importar-excel", id: excelId });
    const principal = slots.principal;
    if (!principal) return;
    const fetcher = principal.intent === "confirmar-pedido" ? pedido : salvar;
    if (fetcher.state === "idle" && fetcher.data?.orcamentoId === carregados.orcamento.id && fetcher.data.requestId === principal.id)
      emitirVoo({ tipo: "liberou-principal", id: principal.id });
  }, [voo, salvar.state, pedido.state, importar.state, salvar.data, pedido.data, importar.data, carregados.orcamento.id, emitirVoo]);

  const comandar = (form: HTMLFormElement) => {
    const dadosFormulario = new FormData(form);
    const valor = dadosFormulario.get("intent");
    if (
      valor !== "enviar" &&
      valor !== "pagar-taxa" &&
      valor !== "nova-versao"
    )
      return;
    const intent = valor;
    if (!carregados.orcamento.memoria && (temEdicoes() || conflito)) return;
    const requestId = crypto.randomUUID();
    if (!adquirir(requestId, intent)) return;
    dadosFormulario.set("requestId", requestId);
    dadosFormulario.set("revisao", String(estado.revisao));
    salvar.submit(dadosFormulario, { method: "post" });
  };

  const gravar = (intent: "salvar" | "atualizar-referencias") => {
    if (ocupado || conflito) return;
    const requestId = crypto.randomUUID();
    if (!adquirir(requestId, intent)) return;
    const snapshot = structuredClone(getValues("dados"));
    dispatch({ tipo: "salvar", id: requestId, snapshot, alterado });
    salvar.submit({ intent, requestId, dados: JSON.stringify(snapshot), revisao: String(estado.revisao) }, { method: "post" });
  };

  const alterar = (fn: (rascunho: RascunhoOrcamento) => void) => {
    if (confirmando || bloqueiaEdicao(vooAtual())) return;
    const novo = structuredClone(getValues("dados"));
    fn(novo);
    setValue("dados", novo, { shouldDirty: true });
    dispatch({ tipo: "editado" });
  };
  const editarPedidoTexto = (texto: string) => { setPedidoTexto(texto); revisarPedido({ tipo: "invalidar" }); };
  const prepararPedido = (form: HTMLFormElement) => {
    if (pedido.state !== "idle") return;
    const requestId = crypto.randomUUID();
    if (!adquirir(requestId, "preparar-pedido")) return;
    revisarPedido({ tipo: "solicitar", id: requestId });
    const dadosFormulario = new FormData(form);
    dadosFormulario.set("intent", "preparar-pedido");
    dadosFormulario.set("pedidoTexto", pedidoTexto);
    dadosFormulario.set("requestId", requestId);
    pedido.submit(dadosFormulario, { method: "post" });
  };
  const confirmarPedido = () => {
    if (ocupado || temEdicoes() || conflito || previaPedido.fase !== "pronta") return;
    const requestId = crypto.randomUUID();
    if (!adquirir(requestId, "confirmar-pedido")) return;
    dispatch({ tipo: "confirmar", id: requestId, snapshot: structuredClone(getValues("dados")), alterado });
    pedido.submit({ intent: "confirmar-pedido", pedidoTexto: previaPedido.valor.texto, revisao: String(estado.revisao), requestId }, { method: "post" });
  };
  const prepararExcel = (form: HTMLFormElement) => {
    if (importar.state !== "idle") return;
    const dadosFormulario = new FormData(form);
    const requestId = crypto.randomUUID();
    if (!adquirir(requestId, "importar-excel")) return;
    dadosFormulario.set("requestId", requestId);
    revisarExcel({ tipo: "solicitar", id: requestId });
    importar.submit(dadosFormulario, { method: "post", encType: "multipart/form-data" });
  };

  const aplicarExcel = () => {
    if (ocupado || importar.state !== "idle" || conflito || previaExcel.fase !== "pronta" || previaExcel.valor.revisao !== estado.revisao || vooAtual().principal || previaExcel.valor.pendencias.length > 0) return;
    setValue("dados", previaExcel.valor.dados, { shouldDirty: true });
    dispatch({ tipo: "editado" });
    revisarExcel({ tipo: "invalidar" });
  };
  const alterarCriandoLinha = (opcao: number, dia: number, criar: CriarLinha) => {
    const id = crypto.randomUUID();
    alterar((rascunho) => {
      const linhas = rascunho.opcoes[opcao].dias[dia].linhas;
      switch (criar.tipo) {
        case "vazia": linhas.push(novaLinhaVazia(id)); break;
        case "hotel": linhas.push(novaLinhaHotel(id)); break;
        case "item": {
          const nomesAlternativos: Record<string, string> = {
            voo_jeju: "Voo Jeju",
            voo_equipe: "Voo da equipe",
            ktx_guia: "KTX do guia",
          };
          const nome = carregados.referencias.tickets.linhas.find((linha) => linha.id === criar.item)?.nome ??
            nomesAlternativos[criar.item] ??
            criar.item;
          const manual = ["voo_equipe", "ktx_guia"].includes(criar.item);
          const opcaoAtual = rascunho.opcoes[opcao];
          linhas.push(novaLinhaItem({
            id,
            item: criar.item,
            nome,
            quantidade: manual ? 1 : opcaoAtual.pagantes + opcaoAtual.gratuidades,
            quantidadeManual: manual,
          }));
          break;
        }
        case "transfer": {
          const trecho = carregados.referencias.transfers.linhas.find((linha) => linha.id === criar.trecho);
          linhas.push(novaLinhaTransfer({
            id,
            nome: `${trecho?.nome} · ${criar.nivel}`,
            item: `transfer:${criar.trecho}:${criar.nivel}`,
          }));
          break;
        }
      }
    });
  };
  const copiarOpcao = (opcao: number) => {
    const atual = getValues("dados");
    const totalIds = 1 + atual.opcoes[opcao].dias.reduce((total, dia) => total + 1 + dia.linhas.length, 0);
    const ids = Array.from({ length: totalIds }, () => crypto.randomUUID());
    alterar((rascunho) => rascunho.opcoes.push(novaOpcao(rascunho.opcoes[opcao], rascunho.opcoes.length, ids)));
  };
  const inserirDia = (opcao: number, dia: number) => {
    const origem = getValues("dados").opcoes[opcao].dias[dia];
    const quantidadeLinhasCopiadas = origem.linhas.filter(
      (linha) => linha.regra || linha.automatica,
    ).length;
    const ids = Array.from({ length: 1 + quantidadeLinhasCopiadas }, () =>
      crypto.randomUUID(),
    );
    const novo = novoDia(origem, ids);
    alterar((rascunho) => {
      rascunho.opcoes[opcao].dias.splice(dia + 1, 0, novo);
    });
  };
  const moverDia = (
    opcao: number,
    dia: number,
    direcao: -1 | 1,
  ) => {
    const origem = dia;
    const destino = dia + direcao;
    const dias = getValues("dados").opcoes[opcao]?.dias;
    if (!dias || destino < 0 || destino >= dias.length) return;
    alterar((rascunho) => {
      const lista = rascunho.opcoes[opcao].dias;
      [lista[origem], lista[destino]] = [lista[destino], lista[origem]];
    });
  };
  const removerDia = (opcao: number, dia: number) => {
    alterar((rascunho) => {
      rascunho.opcoes[opcao].dias.splice(dia, 1);
    });
  };
  const removerLinha = (opcao: number, dia: number, linha: number) => {
    alterar((rascunho) => {
      rascunho.opcoes[opcao].dias[dia].linhas.splice(linha, 1);
    });
  };

  const erroVisivel = typeof estado.resultado === "object" ? estado.resultado.erro : null;
  const erroEnvio = salvar.data?.tipo === "erro" ? salvar.data.erro : null;

  return {
    formulario: { dados, alterado, carregados },
    operacao: {
      ocupado,
      confirmando,
      salvando: estado.operacao.fase === "salvando",
      conflito,
      erroVisivel,
      revisao: estado.revisao,
      resultado: estado.resultado,
    },
    pedido: {
      previa: previaPedido,
      texto: pedidoTexto,
      definirTexto: editarPedidoTexto,
      preparar: prepararPedido,
      confirmar: confirmarPedido,
    },
    excel: {
      previa: previaExcel,
      importando: importar.state !== "idle",
      importar: prepararExcel,
      aplicar: aplicarExcel,
      invalidar: () => revisarExcel({ tipo: "invalidar" }),
    },
    acoes: {
      gravar,
      comandar,
      copiarOpcao,
      inserirDia,
      moverDia,
      removerDia,
      criarLinha: alterarCriandoLinha,
      removerLinha,
      editar: alterar,
    },
    envio: {
      SalvarForm: salvar.Form,
      PedidoForm: pedido.Form,
      ImportarForm: importar.Form,
      erroEnvio,
      pedidoOcupado: pedido.state !== "idle",
      importacaoOcupada: importar.state !== "idle",
    },
  };

}

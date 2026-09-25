import { useRef } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
import { useLeituraVisivel } from "./use-leitura-visivel";
import { usePainel } from "./use-painel";
import { textos, erroTraduzido } from "./textos";
import { Preferencias } from "./Preferencias";
import { ListaConversas } from "./ListaConversas";
import { BuscaMensagens } from "./BuscaMensagens";
import { GrupoForm } from "./GrupoForm";
import { ListaMensagens } from "./ListaMensagens";
import { Compositor } from "./Compositor";
import { Midia } from "./Midia";
import { PainelTarefa } from "./PainelTarefa";
import { Reporte } from "./Reporte";

export function Painel({
  fechar,
  usuarioId,
  aberta,
  aoNaoLidas,
}: {
  fechar: () => void;
  usuarioId: number;
  aberta: boolean;
  aoNaoLidas: (n: number) => void;
}) {
  const painel = usePainel({ usuarioId, aberta, aoNaoLidas });
  const { idioma, mensagem } = useIdioma();
  const t = textos(idioma);
  const raiz = useRef<HTMLDivElement>(null);
  const selecao = painel.compositor.selecao;
  const conversaId = selecao.conversaId;
  const conversa = painel.conversas.lista.find((item) => item.id === conversaId) ?? null;
  useLeituraVisivel({
    ativo: aberta,
    conversaId,
    mensagens: painel.conteudo.mensagens,
    carga: painel.conteudo.carga,
    raiz,
    aoLer: painel.conteudo.marcarLidaVisivel,
  });

  if (!aberta) return null;
  return (
    <aside hidden={!aberta} className="comunicador" aria-label={t("Comunicador")}>
      <header>
        <h2>{t("Comunicador")}</h2>
        <button onClick={fechar}>{t("Fechar")}</button>
      </header>
      <Preferencias atual={painel.preferencias.atual} salvar={painel.preferencias.salvar} t={t} />
      <ListaConversas
        {...painel.conversas}
        abrir={painel.compositor.abrir}
        selecionada={conversaId}
        papel={painel.perfil.papel}
        t={t}
      />
      <BuscaMensagens
        lista={painel.conversas.lista}
        pessoas={painel.conversas.pessoas}
        resultados={painel.busca.resultados}
        buscar={painel.busca.buscar}
        abrirMensagem={painel.busca.abrirMensagem}
        t={t}
      />
      {painel.conteudo.erro && <p role="alert">{erroTraduzido(idioma, painel.conteudo.erro)}</p>}
      {painel.midia.reporte && conversaId !== null && (
        <Reporte
          cancelar={painel.midia.cancelarReporte}
          enviar={async (texto, arquivo, clientId) => {
            await painel.midia.enviarReporte(texto, arquivo, clientId);
          }}
        />
      )}
      {conversaId !== null && conversaId < 0 && <h3>{t("Conversa interna")}</h3>}
      {painel.tarefa.atual && (
        <PainelTarefa
          key={painel.tarefa.atual.clientId}
          atual={painel.tarefa.atual}
          pessoas={painel.conversas.pessoas}
          usuarioId={painel.perfil.usuario}
          traduzirErro={(erro) => erroTraduzido(idioma, erro)}
          idioma={idioma}
          referencias={painel.tarefa.referencias}
          salvar={painel.tarefa.salvar}
          cancelar={painel.tarefa.cancelar}
          carregarReferencias={painel.tarefa.carregarReferencias}
          mostrarBuscaViagem={painel.perfil.papel !== "guiamento" && !conversa?.viagem_id}
          t={t}
        />
      )}
      {conversa?.tipo === "grupo" && (
        <GrupoForm
          key={conversa.id}
          conversa={conversa}
          pessoas={painel.conversas.pessoas}
          podeGerenciar={painel.perfil.papel === "admin" || conversa.criador_id === painel.perfil.usuario}
          definirModo={painel.preferencias.definirModo}
          editarGrupo={painel.preferencias.editarGrupo}
          sair={painel.preferencias.sair}
          convidar={painel.preferencias.convidar}
          remover={painel.preferencias.remover}
          t={t}
        />
      )}
      {painel.conteudo.carga === "carregando" && <p role="status">{t("Carregando…")}</p>}
      {painel.conteudo.carga === "falhou" && conversaId !== null && (
        <button onClick={() => void painel.conteudo.tentarNovamente()}>{t("Tentar novamente")}</button>
      )}
      <ListaMensagens
        mensagens={painel.conteudo.mensagens}
        carregarPagina={painel.conteudo.carregarPagina}
        cartoes={painel.conteudo.cartoes}
        leitores={painel.conteudo.leitores}
        fila={painel.midia.fila}
        conversa={conversa}
        usuarioId={painel.perfil.usuario}
        papel={painel.perfil.papel}
        idioma={idioma}
        raiz={raiz}
        traduzirStatus={mensagem}
        t={t}
        origem={typeof window === "undefined" ? "" : window.location.origin}
        marcarNaoLida={painel.compositor.marcarNaoLida}
        abrir={painel.compositor.abrir}
        citar={painel.compositor.citar}
        editar={painel.compositor.editar}
        apagarMensagem={painel.compositor.apagarMensagem}
        reagir={painel.compositor.reagir}
        aoCriarTarefa={(mensagemId, titulo) => { painel.tarefa.abrir({ mensagemId, titulo }); }}
        concluir={painel.tarefa.concluir}
        reenviar={painel.midia.reenviar}
        ampliarFoto={painel.midia.ampliarFoto}
        purgarMidia={painel.midia.purgarMidia}
        prepararMovimento={painel.midia.prepararMovimento}
      />
      <Midia
        {...painel.midia}
        habilitada={Boolean(conversaId && conversaId > 0 && !conversa?.arquivada)}
        t={t}
      />
      {conversaId !== null && (
        <Compositor
          key={conversaId}
          estado={painel.compositor.estado}
          definirTexto={painel.compositor.definirTexto}
          enviar={painel.compositor.enviar}
          cancelarEdicao={painel.compositor.cancelarEdicao}
          referencias={painel.busca.referencias}
          selecionarReferencia={painel.busca.selecionarReferencia}
          pessoas={painel.conversas.pessoas}
          lista={painel.conversas.lista}
          t={t}
        />
      )}
    </aside>
  );
}

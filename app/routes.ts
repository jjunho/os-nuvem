import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  route("propostas/:id", "routes/proposta.tsx"),
  route("orcamentos/:id/excel", "routes/orcamento-excel.ts"),
  route("viagens/:id/anexos/:anexoId", "routes/anexo-planejamento.ts"),
  route("planejamento/:token", "routes/formulario.tsx"),
  route("preferencias", "routes/preferencias.ts"),
  route("sair", "routes/sair.tsx"),
  route("entrar", "routes/entrar.tsx"),
  route("buscar", "routes/buscar.tsx"),
  route("test/push", "routes/test-push.ts"),
  route("test/reset", "routes/test-reset.tsx"),
  layout("routes/app-layout.tsx", [
    index("routes/pipeline.tsx"),
    route("profissionais", "routes/profissionais.tsx"),
    route("notificacoes", "routes/notificacoes.tsx"),
    route("orcamentos/:id", "routes/orcamento.tsx"),
    route("tabelas", "routes/tabelas.tsx"),
    route("tabelas/:codigo", "routes/tabela.tsx"),
    route("tarefas", "routes/tarefas.tsx"),
    route("tarefas/:id", "routes/tarefa.tsx"),
    route("modelos-resposta", "routes/modelos-resposta.tsx"),
    route("opcoes", "routes/opcoes.tsx"),
    route("viagens/nova", "routes/viagem-nova.tsx"),
    route("viagens/:id/aceite", "routes/aceite.tsx"),
    route("viagens/:id", "routes/viagem.tsx"),
  ]),
] satisfies RouteConfig;

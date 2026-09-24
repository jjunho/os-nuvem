import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  route("entrar", "routes/entrar.tsx"),
  route("buscar", "routes/buscar.tsx"),
  route("test/reset", "routes/test-reset.tsx"),
  layout("routes/app-layout.tsx", [
    index("routes/pipeline.tsx"),
    route("viagens/nova", "routes/viagem-nova.tsx"),
    route("viagens/:id", "routes/viagem.tsx"),
  ]),
] satisfies RouteConfig;

export type ContextoOpcoes = Record<string, string>;
export type Opcao = { valor: string; nome: string; contexto?: ContextoOpcoes };
export function filtrarIntermediario(opcao: Opcao, contexto: ContextoOpcoes) {
  return (
    !["agencia", "operadora"].includes(contexto.canalComercial) ||
    opcao.contexto?.tipo === contexto.canalComercial
  );
}

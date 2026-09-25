# 04: Compartilhar Quadros

**What to build:** Membros organizam juntos um Quadro compartilhado, com movimentos transmitidos pelo fluxo SSE do Comunicador e direitos conferidos a cada leitura, escrita e evento.

**Blocked by:** 02 (Organizar Quadros e listas); Comunicador 02 (Tracer bullet: a live Conversa direta).

**Status:** done

- [x] Compartilhar um Quadro adicional; membros têm os mesmos direitos sobre suas listas e Tarefas.
- [x] Um movimento aparece em outro contexto de navegador sem recarregar; reconexão recupera o estado atualizado.
- [x] Somente o criador e o Admin removem membros ou arquivam o Quadro; arquivar preserva a leitura e o histórico.
- [x] Remover um membro revoga o acesso do Quadro e a entrega de seus eventos em tempo real.
- [x] Guiamento vê apenas Tarefas sob sua responsabilidade ou em cópia; as demais ficam ocultas, sem cartões “restritos”.
- [x] Impedir acesso indevido por URL, requisição ou SSE; manter a privacidade dos Quadros pessoais.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Cobrir este recorte com testes verticais da parte 2 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).

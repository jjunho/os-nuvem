# 04: Compartilhar Quadros

**What to build:** Membros organizam juntos um Quadro compartilhado, com movimentos transmitidos pelo fluxo SSE do Comunicador e direitos conferidos a cada leitura, escrita e evento.

**Blocked by:** 02 (Organizar Quadros e listas); Comunicador 02 (Tracer bullet: a live Conversa direta).

**Status:** ready-for-agent

- [ ] Compartilhar um Quadro adicional; membros têm os mesmos direitos sobre suas listas e Tarefas.
- [ ] Um movimento aparece em outro contexto de navegador sem recarregar; reconexão recupera o estado atualizado.
- [ ] Somente o criador e o Admin removem membros ou arquivam o Quadro; arquivar preserva a leitura e o histórico.
- [ ] Remover um membro revoga o acesso do Quadro e a entrega de seus eventos em tempo real.
- [ ] Guiamento vê apenas Tarefas sob sua responsabilidade ou em cópia; as demais ficam ocultas, sem cartões “restritos”.
- [ ] Impedir acesso indevido por URL, requisição ou SSE; manter a privacidade dos Quadros pessoais.
- [ ] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [ ] Cobrir este recorte com testes verticais da parte 2 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


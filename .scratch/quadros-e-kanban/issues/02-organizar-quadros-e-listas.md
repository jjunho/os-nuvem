# 02: Organizar Quadros e listas

**What to build:** O Usuário cria outros Quadros e organiza suas listas e Tarefas por arraste ou teclado, inclusive entre Quadros aos quais tem acesso.

**Blocked by:** 01 (Quadro pessoal com Tarefas).

**Status:** ready-for-agent

- [ ] Criar outro Quadro e criar, renomear, reordenar e arquivar listas.
- [ ] Mover Tarefas dentro da mesma lista, entre listas e entre Quadros, tanto por arraste quanto pelo teclado.
- [ ] Persistir cada movimento mantendo uma única posição por Tarefa, usando ordenação fracionária para atualizar apenas sua posição.
- [ ] Mostrar o movimento imediatamente e desfazê-lo na interface se o servidor recusar a operação.
- [ ] Arquivar uma lista preserva suas Tarefas e histórico, sem concluir nem apagar trabalho.
- [ ] Recusar movimentos para Quadros ou listas sem autorização, inclusive por requisição direta.
- [ ] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [ ] Cobrir este recorte com testes verticais da parte 1 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


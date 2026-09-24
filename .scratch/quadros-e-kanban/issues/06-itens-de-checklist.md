# 06: Itens de checklist

**What to build:** O Usuário divide uma Tarefa em Itens de checklist e promove um item a Tarefa própria quando ele passa a precisar de Responsável ou Prazo.

**Blocked by:** 01 (Quadro pessoal com Tarefas).

**Status:** ready-for-agent

- [ ] Adicionar e marcar Itens de checklist dentro da Tarefa.
- [ ] Um Item de checklist simples não recebe código TAR, Responsável ou Prazo próprios.
- [ ] Promover o item cria uma Tarefa com código, Responsável, Prazo e posição no Quadro, ligada à Tarefa de origem.
- [ ] Preencher título e contexto conhecidos na promoção; não pedir novamente dados já disponíveis.
- [ ] Marcar um item não conclui automaticamente a Tarefa nem gera push.
- [ ] Aplicar as mesmas permissões da Tarefa às alterações do checklist.
- [ ] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [ ] Cobrir este recorte com testes verticais da parte 3 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


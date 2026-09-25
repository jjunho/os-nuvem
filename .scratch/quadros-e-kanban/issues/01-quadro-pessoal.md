# 01: Quadro pessoal com Tarefas

**What to build:** Cada Usuário, inclusive Guiamento, encontra seu Quadro pessoal com Novo, Em foco, Aguardando e Concluído. Pode criar uma Tarefa diretamente em uma lista e encontra ali também as Tarefas existentes e as criadas por Mensagem ou /tarefa. Reutilizar Tarefas e Cartões do Comunicador.

**Blocked by:** Comunicador 12 (Tarefas replace Próximas ações); Comunicador 13 (Tarefas in the chat).

**Status:** done

- [x] Criar o Quadro junto com novos Usuários e disponibilizá-lo para Usuários existentes, sem duplicação ao repetir a operação.
- [x] Toda Tarefa tem exatamente uma posição: um Quadro, uma lista e uma chave de ordenação. Atribuir posição às existentes preservando Responsável, Prazo, estado, pessoas em cópia, Viagem e código TAR.
- [x] Criar uma Tarefa pessoal sem Viagem, como “dentista às 17h”, e encontrá-la também em Minhas Tarefas.
- [x] Tarefas criadas por Mensagem e /tarefa recebem posição no Quadro do Responsável sem perder o vínculo de origem.
- [x] Somente o dono e o Admin podem abrir o Quadro pessoal; a restrição é aplicada no servidor.
- [x] O Quadro pessoal não pode ser apagado, arquivado, compartilhado ou transferido. Suas listas podem ser renomeadas e reordenadas.
- [x] Renderizar Tarefas por Cartões, respeitando o Papel do leitor e sem expor informações de Viagem indevidas.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Cobrir este recorte com testes verticais da parte 1 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).

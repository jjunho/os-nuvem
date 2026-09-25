# 05: Enviar uma Tarefa a outro Usuário

**What to build:** Enviar uma Tarefa delega o trabalho: o destinatário vira Responsável e o remetente permanece em cópia. Reutilizar a Decisão de notificação e os avisos de Tarefas.

**Blocked by:** 04 (Compartilhar Quadros); Comunicador 10 (Grupo settings, DND and /urgente); Comunicador 13 (Tarefas in the chat).

**Status:** done

- [x] Enviar a outro Usuário muda o Responsável e põe o remetente em cópia, sem duplicar a Tarefa.
- [x] A Tarefa vai para a primeira lista do Quadro pessoal do destinatário.
- [x] Se estiver em Quadro compartilhado do qual o novo Responsável é membro, a Tarefa permanece na lista atual.
- [x] Permitir escolher qualquer membro autorizado como Responsável no Quadro compartilhado.
- [x] Registrar push de atribuição e de inclusão em cópia, respeitando DND e leitura atual, sem duplicar avisos já emitidos pelo Comunicador.
- [x] Prazo vencido de Tarefa aberta gera o aviso previsto uma vez; movimentos entre listas não geram push.
- [x] Atualizar posição e direitos de forma coerente, sem mostrar a Tarefa a quem perdeu acesso.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Cobrir este recorte com testes verticais da parte 2 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).

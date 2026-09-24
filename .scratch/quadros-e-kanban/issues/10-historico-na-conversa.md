# 10: Histórico da Tarefa na conversa

**What to build:** A Conversa da tarefa reúne comentários e atividade em um único histórico, com mensagens de sistema que permitem entender quem fez cada mudança.

**Blocked by:** 03 (Concluir, reabrir e arquivar Tarefas); 06 (Itens de checklist); 09 (Conversa da tarefa).

**Status:** ready-for-agent

- [ ] Registrar movimentos, delegações, marcações de checklist, conclusão, reabertura, cancelamento e arquivamento com autor e momento.
- [ ] Cancelamento mostra seu motivo; delegação identifica Responsável anterior e atual.
- [ ] A atividade aparece junto das Mensagens da conversa, respeitando seus direitos de acesso.
- [ ] Repetir uma requisição não duplica a atividade correspondente.
- [ ] Movimentos e marcações de checklist não geram push nem contador de não lidas; delegações mantêm apenas seus avisos próprios.
- [ ] As ações existentes passam a produzir histórico pela mesma interface, sem duplicar conversas ou registros.
- [ ] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [ ] Cobrir este recorte com testes verticais da parte 3 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


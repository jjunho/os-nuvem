# 11: Tarefa da etapa no primeiro contato

**What to build:** Uma Viagem criada como lead gera “responder” no Quadro do Responsável, e registrar o contato conclui a Tarefa. Estender a Inferência de etapa com decisões de criação, conclusão e cancelamento de Tarefas, reutilizando Tarefas do Comunicador.

Decisão aprovada por Juliano nesta divisão: a inferência da Etapa nasce em Viagem 07; Quadros a estende com Tarefas da etapa. O ticket Viagem 07 ainda registra a decisão antiga como needs-info; esta aprovação resolve a escolha para esta sequência, sem editar o ticket existente.

**Blocked by:** 03 (Concluir, reabrir e arquivar Tarefas); Viagem 07 (Inferência de etapa, Cliente's reply, perdida, Correção).

**Status:** ready-for-agent

- [ ] Criar lead gera uma única Tarefa da etapa “responder”, com Prazo segundo seu modelo e vínculo com a Viagem e a entrada na Etapa.
- [ ] Registrar contato com Meio de contato, o que ocorreu e por quê conclui a Tarefa e vincula o fato conclusivo.
- [ ] Tentar concluir por clique, chat, Minhas Tarefas ou lista de conclusão abre a ação de registrar o fato; não aceita marcação simples.
- [ ] Recusar criação manual de Tarefa da etapa também pela API; somente os resultados da Inferência podem originá-la.
- [ ] Substituir a geração anterior de “responder” sem duplicar trabalho, perder histórico ou modificar Tarefas pessoais.
- [ ] A Inferência é pura: recebe fatos datados, Correções, encerramento, modelos e horário explícito; não faz I/O nem lê relógio.
- [ ] Testes de tabela verificam repetição e chegada fora de ordem dos fatos; a aplicação repetida do resultado não duplica Tarefas.
- [ ] Manter a Próxima ação como a Tarefa aberta de menor Prazo e preservar os testes existentes do primeiro contato.
- [ ] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [ ] Cobrir este recorte com testes verticais da parte 4 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


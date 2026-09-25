# 14: Follow-ups como Tarefas da etapa

**What to build:** Integrar os follow-ups existentes ao mecanismo de Tarefas da etapa, mantendo a cadência ilimitada de três dias e os alertas de ausência de resposta, sem um segundo agendador concorrente.

**Blocked by:** 13 (Tarefas do Orçamento ao Aceite); Viagem 25 (Follow-ups and sem resposta); Comunicador 10 (Grupo settings, DND and /urgente).

**Status:** done

- [x] Após o Envio, criar follow-ups nos dias 3, 6 e 9 e continuar a cada três dias enquanto não houver resposta, segundo os padrões editáveis.
- [x] Depois do terceiro sem resposta, no ciclo seguinte mostrar “sem resposta” no Pipeline e criar o quarto follow-up.
- [x] Alertar Responsável e Admin uma vez para essa condição, pela Decisão de notificação, respeitando DND e leitura atual.
- [x] Qualquer resposta registrada do Cliente remove a marca e conclui os follow-ups abertos; o resultado comercial segue a inferência existente.
- [x] Uma nota de contato conclui o follow-up correspondente, sem inventar resposta do Cliente.
- [x] O sistema nunca declara perdida automaticamente.
- [x] Reexecução do trabalho agendado não duplica Tarefas nem alertas; testar com relógio controlado.
- [x] Migrar ou reconciliar follow-ups já existentes sem perder histórico e sem gerar uma segunda série.
- [x] Toda interface nova está em português e coreano; campos conhecidos vêm preenchidos conforme ADR-0008.
- [x] Cobrir este recorte com testes verticais da parte 4 da spec Quadros, pela app e banco reais, sem mocks dos módulos internos.


## Implementação

Concluído com a spec Pipeline e Quadros. Evidências e instruções em
[`docs/execucao-quadros.md`](../../../docs/execucao-quadros.md).

# 07: Inferência de etapa, Cliente's reply, perdida, Correção

**What to build:** The Etapa of a Viagem is inferred from what is recorded on it and never set by hand (ADR-0007). A salesperson records the Cliente's reply (aceitou, pediu mudanças, recusou, ainda pensando), so a fact that happened outside the system still moves the Etapa. They declare perdida with a Motivo de perda. The system never sets perdida. The Responsável or an Admin makes a Correção de etapa, undoing a fact recorded by mistake, with who, when and why. The Etapa history keeps every change with its cause. Spec: stories 22–24, 26a, 26b; Implementation Decisions: Etapa.

**Decisão de implementação:** a execução integral deste spec usa o módulo puro de Inferência de etapa. O spec de Quadros poderá estendê-lo com Tarefas da etapa; Orçamento, Envio, nova Versão e Aceite já fornecem os fatos. O pré-requisito de Tarefas compartilhadas foi implementado nesta entrega.

**Blocked by:** 01 (Known options: a filtered list with an open last option), Comunicador 12 (Tarefas replace Próximas ações).

**Status:** done

- [x] Fast table tests of the Inferência: facts in different orders × Correções × endings × time.
- [x] No screen or request sets the Etapa directly.
- [x] "Pediu mudanças" after an Envio gives em negociação. "Recusou" asks for the Motivo de perda and ends the Viagem perdida. "Ainda pensando" moves nothing.
- [x] A Correção de etapa is refused to anyone but the Responsável or an Admin, and requires a reason.
- [x] The Etapa history on the Viagem shows each change with its fact or Correção.
- [x] The part 1 tests and the Pipeline's overdue view still pass.

## Entrega

Implementado e revisado. Verificação: parte2-etapas.spec.ts; etapas.test.ts.

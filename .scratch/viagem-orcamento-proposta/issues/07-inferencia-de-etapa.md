# 07: Inferência de etapa, Cliente's reply, perdida, Correção

**What to build:** The Etapa of a Viagem is inferred from what is recorded on it and never set by hand (ADR-0007). A salesperson records the Cliente's reply (aceitou, pediu mudanças, recusou, ainda pensando), so a fact that happened outside the system still moves the Etapa. They declare perdida with a Motivo de perda. The system never sets perdida. The Responsável or an Admin makes a Correção de etapa, undoing a fact recorded by mistake, with who, when and why. The Etapa history keeps every change with its cause. Spec: stories 22–24, 26a, 26b; Implementation Decisions: Etapa.

**Open decision (Juliano, 2026-09-24: "later"):** whether this ticket builds the pure **Inferência de etapa** module for the Etapa alone, with `.scratch/quadros-e-kanban/spec.md` later extending it with Tarefas da etapa, or whether the Etapa waits for the Quadros spec. Settle it before starting. Either way, the facts that come later (Orçamento created, Envio, new Versão, Aceite) are recorded by tickets 11, 24 and 28 and passed to whichever Inferência exists.

**Blocked by:** 01 (Known options: a filtered list with an open last option), Comunicador 12 (Tarefas replace Próximas ações).

**Status:** needs-info

- [ ] Fast table tests of the Inferência: facts in different orders × Correções × endings × time.
- [ ] No screen or request sets the Etapa directly.
- [ ] "Pediu mudanças" after an Envio gives em negociação. "Recusou" asks for the Motivo de perda and ends the Viagem perdida. "Ainda pensando" moves nothing.
- [ ] A Correção de etapa is refused to anyone but the Responsável or an Admin, and requires a reason.
- [ ] The Etapa history on the Viagem shows each change with its fact or Correção.
- [ ] The part 1 tests and the Pipeline's overdue view still pass.

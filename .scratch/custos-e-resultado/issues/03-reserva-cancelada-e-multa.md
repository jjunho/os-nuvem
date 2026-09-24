# 03: Cancelled Reserva becomes its penalty

**What to build:** Cancelling a Reserva (Operação 20, or an Alteração that removes it, Operação 19) changes its Conta a pagar: it becomes the supplier's penalty from the Reserva's cancellation terms, with the date the penalty is charged, or it is cancelled when the cancellation is free. A bus penalty in KRW is counted at the debit date's rate (K919). The 10% processing on the penalty is already charged to the Cliente by Operação 20's refund calculation, so this ticket only records what CoreaLux owes. An already paid Conta whose cancellation gives money back shows the amount to receive from the Fornecedor. Spec: `.scratch/custos-e-resultado/spec.md` (story 7; Revisions of 2026-09-24).

**Blocked by:** 01 (Contas a pagar tracer), Operação 20 (Cancelamento and refunds).

**Status:** ready-for-agent

- [ ] A bus Reserva cancelled at D-4 turns its Conta into a 20% penalty; on the day, 100%.
- [ ] A Playce Reserva cancelled 8 days before cancels its Conta.
- [ ] A prepaid Bene deposit cancelled at 20 days shows the part to receive back per its scale.
- [ ] The Viagem's Contas show the cancelled Reserva with its penalty and reason.

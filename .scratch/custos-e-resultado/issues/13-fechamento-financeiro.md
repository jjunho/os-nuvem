# 13: Financial closing

**What to build:** A Viagem is closed financially only when every Conta a pagar is paid or cancelled, every Invoice is paid or its open balance written off, every amount to recover is received or written off, and its Despesas de campo are reconciled. A write-off is recorded by Faturamento or Admin with who, when and why (ADR-0001). Financial closing is a state separate from the Etapa: a Viagem can be concluída and still financially open, and the Viagem shows both. What still blocks closing is listed. Closing freezes the Resultado; reopening needs Admin and records why. A list shows concluída Viagens still financially open. Spec: `.scratch/custos-e-resultado/spec.md` (story 22; Revisions of 2026-09-24).

**Blocked by:** 02 (Payment calendar and the cover warning), 06 (Comissões), 07 (Reimbursing Despesas de campo), 08 (Amounts to recover), 10 (Resultado da viagem tracer).

**Status:** ready-for-agent

- [ ] A concluída Viagem with one open Conta can't close and lists that Conta.
- [ ] Writing off a USD 15 bank-fee shortfall with a reason lets it close; the write-off shows who and why.
- [ ] The closed Viagem shows concluída and financially closed; its Resultado no longer changes.
- [ ] Reopening needs Admin and a reason.
- [ ] Vertical tests in `custos-parte5-*.spec.ts`.

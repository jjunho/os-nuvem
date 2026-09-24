# 07: Pendências and the D-2 check

**What to build:** Each Dia has its Pendências (send train tickets, K-ETA guidance, receive hotel voucher, confirm restaurant, passport reminder for the DMZ), with a due date and done or not done, suggested from what the Dia holds. Each Dia has a D-2 check (opening hours, times, programme, closures from the Catálogo, travel time), and the Viagem has a "checklist no envio do roteiro" (K273). Overdue Pendências join the cross-Viagem list of ticket 06. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 10–12).

**Blocked by:** 01 (Operational plan tracer).

**Status:** ready-for-agent

- [ ] A DMZ Dia suggests the passport reminder Pendência.
- [ ] Two days before a Dia, its D-2 check appears, flagging an Atração closed that day (Catálogo 06).
- [ ] An overdue Pendência shows in the daily list.

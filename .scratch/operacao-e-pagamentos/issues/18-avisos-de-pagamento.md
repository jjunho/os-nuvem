# 18: Payment schedule, reminders and the non-refundable rule

**What to build:** The schedule comes from the accepted Proposta's Condições: by default Sinal 30% and Saldo 30 days before the trip, editable, and more instalments when needed (hotels in two or three). A Tarefa is created before each due date, with an alert when it passes (Comunicador 12). Each Viagem shows its planned next Invoice date, and a list shows Invoices due to be sent. **Carlos's rule (K918):** the whole Saldo is paid before any non-refundable item is issued, and the Sinal covers the penalties already exposed. Marking a non-refundable Reserva as solicitada before that warns, and going ahead needs a recorded override by Faturamento or Admin, with who and why (ADR-0001). Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 27, 31, 32, 38; Revisions of 2026-09-24).

**Blocked by:** 17 (Pagamentos, Recibos and the Situação de pagamento), 04 (Reservas tracer), Comunicador 12 (Tarefas replace Próximas ações).

**Status:** ready-for-agent

- [ ] Accepting a Proposta with default Condições schedules the Sinal now and the Saldo at D-30.
- [ ] A Tarefa "cobrar saldo" appears before the Saldo's due date; passing it alerts the Responsável.
- [ ] Soliciting a non-refundable KTX before the Saldo is paid warns; Propostas e Orçamentos can't override it, Faturamento can, with a reason.
- [ ] A Sinal smaller than the penalties already exposed warns.
- [ ] The "Invoices a enviar" list shows each Viagem's planned date.

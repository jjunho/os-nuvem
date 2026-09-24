# 20: Cancelamento and refunds

**What to build:** A confirmada Viagem can be cancelled with a Motivo, becoming cancelada; a single service can also be cancelled. The refund suggestion is a pure calculation: inputs are the Pagamentos, the Reservas with their penalties (Catálogo 20 and 22) and the Condições; outputs are amounts and reasons. Its rules, all editable: supplier penalties per Reserva, plus 10% processing **on the penalty** (K919); a bus penalty in KRW converts at the debit date's rate, without the 15% intermediation; our own transfer terms (free until 2 days before, 50% the day before, 100% no-show, K115–K116); the refund compared in USD and BRL, taking the smaller. The refund is then recorded as paid out, net of fees, or given as a credit (e.g. one year, transferable with a referral). A Jeju Air group ticket can't be partly refunded (K709). Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 46, 47; Revisions of 2026-09-24).

**Blocked by:** 17 (Pagamentos, Recibos and the Situação de pagamento), 04 (Reservas tracer), Catálogo 20 (Tarifário extras, group rates, cancellation), Catálogo 22 (Conditions of non-hotel Fornecedores).

**Status:** ready-for-agent

- [ ] Table tests of the refund calculation with the fixtures: bus 20/30/40/50/100%; Playce free to 7 days, 30% at 6–5, 50% at 4–3, 100% at 2–1; Paradise free until 18h two days before; Stanford group 50/75/100%; Bene 100/50/30/0 at 30/20/15/10 days; a non-refundable KTX with 10% on the penalty; a BRL vs USD refund.
- [ ] Cancelling after the Sinal gives cancelada and the suggested refund with reasons.
- [ ] Choosing a credit instead records it with its validity.
- [ ] Vertical tests in `operacao-parte6-*.spec.ts`.

# 17: Pagamentos, Recibos and the Situação de pagamento

**What to build:** A Pagamento is recorded against an Invoice with date, amount, currency, method (PIX, Wise, cartão, espécie, international transfer, "Agência remete") and proof. It is "informado pelo cliente" until the bank confirms it. The amount sent and the amount received are both kept, with the fees (a Wise payment converts to KRW at the transfer day's rate, K335). One Invoice can be settled by several Pagamentos and shows open, partially paid or paid. Each Pagamento produces a Recibo showing what was paid, how and what remains. The Situação de pagamento (sem sinal, sinal recebido, pago) and the open Saldo show on the Viagem and on the Cliente across all their Viagens (Carlos, K835). A Saldo collected during the trip by the Equipe is recorded; the Guia given a collection sees only that amount. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 28, 30, 39–41, 74; Revisions of 2026-09-24).

**Blocked by:** 16 (Invoice tracer).

**Status:** ready-for-agent

- [ ] Fixture Ygara: Saldo USD 980 = R$ 5,255.15 paid in two Pagamentos → the Invoice goes open → partially paid → paid, with two Recibos.
- [ ] Fixture Flávia: Sinal USD 120 = R$ 660, then the rest by card +5%.
- [ ] A Pagamento "informado" doesn't count as paid until confirmed.
- [ ] An Agência with two Viagens shows both Saldos on its Cliente record.
- [ ] A Guia given a USD 300 collection sees "cobrar USD 300" and no other value.

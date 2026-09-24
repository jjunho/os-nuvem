# 06: Comissões

**What to build:** A Viagem that came through an Influenciador (Canal comercial Influencer, K146) creates a Comissão of 5% (editable) of each Cliente Pagamento once it is confirmed, as a Conta a pagar to the Influenciador. A Pagamento still "informado pelo cliente" creates nothing, and a refund lowers the Comissão in proportion. The Cliente's price never changes because of it: the Influencer pays the final-client price precisely so the 5% can be set aside (S152 B51). Each Influenciador has a statement of Comissões owed and paid across their Viagens. The Influenciador is the one already named on the Viagem's Origem, never typed again (ADR-0008). There are no commissions to Agências (they get net prices, K186) nor for referrals (K706). Spec: `.scratch/custos-e-resultado/spec.md` (stories 8, 9; Revisions of 2026-09-24).

**Blocked by:** 01 (Contas a pagar tracer), Operação 17 (Pagamentos, Recibos and the Situação de pagamento).

**Status:** ready-for-agent

- [ ] An Influencer Viagem with a confirmed Pagamento of USD 1,000 gives a Comissão of USD 50; the price stays USD 1,000.
- [ ] A Pagamento "informado" gives no Comissão until confirmed.
- [ ] A refund of USD 200 lowers the Comissão to USD 40.
- [ ] The Influenciador's statement lists both of their Viagens, owed and paid.
- [ ] A B2B Viagem gives no Comissão.
- [ ] Vertical tests in `custos-parte2-*.spec.ts`.

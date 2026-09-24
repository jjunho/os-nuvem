# 14: Transversal test, Contas a pagar to financial closing

**What to build:** The end-of-spec transversal test. It continues the B2B case of the earlier specs (an Agência, 10 pagantes + 2 gratuidades) after the send-off, checking what Faturamento, Carlos and a Profissional see at each step: the Reservas give Contas a pagar with their due dates; an outside Assistente's Alocação gives a fee Conta that is paid; the driver's daily meal and tip are recorded; a Guia's personal-card Despesa de campo is reimbursed; a ticket bought for the Agência is billed back and paid; a dinner Cortesia is recorded; every Conta is paid. It checks the Resultado and the real Margem against the floor, the per-line comparison, and finally closes the Viagem financially. A second, Influencer, Viagem checks the Comissão on its confirmed Pagamento. Spec: `.scratch/custos-e-resultado/spec.md` (Testing Decisions; Revisions of 2026-09-24).

**Blocked by:** 01–13 (every ticket above).

**Status:** ready-for-agent

- [ ] Both cases run as transversal e2e tests and pass, checking the state at each step.
- [ ] The outside Assistente's statement shows the fee owed, then paid.
- [ ] All vertical and speed tests of this spec and the earlier specs still pass.

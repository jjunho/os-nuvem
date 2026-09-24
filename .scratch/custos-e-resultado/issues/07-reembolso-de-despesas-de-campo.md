# 07: Reimbursing Despesas de campo

**What to build:** When a Viagem's Despesas de campo are reconciled (Operação 24), each Profissional's personal-card total becomes a Conta a pagar to them, funcionários included (a reimbursement isn't salary). Company-card Despesas are costs of the Viagem already paid. A later correction to a reconciled Despesa updates the open Conta. The Viagem's Despesas de campo show their totals against Carlos's spending references (about USD 30–50 reported afterwards, close to USD 1,000 needs a heads-up first, K448–K449), flagged when above, never blocked. Spec: `.scratch/custos-e-resultado/spec.md` (stories 13, 15).

**Blocked by:** 01 (Contas a pagar tracer), Operação 24 (Despesas de campo).

**Status:** ready-for-agent

- [ ] Fixture Marlene/Jairo 27–30/03/2025: personal card 152,943.5 KRW → a Conta of 152,944 KRW to the Guia; the company card's 734,620 KRW counts as a paid cost.
- [ ] A funcionário Guia's personal-card Despesa gives a Conta to them.
- [ ] A single Despesa of about USD 900 is flagged against the heads-up reference, and nothing is blocked.
- [ ] Vertical tests in `custos-parte3-*.spec.ts`.

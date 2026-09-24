# 02: Payment calendar and the cover warning

**What to build:** Faturamento opens one list of Contas a pagar across all Viagens, due this week (and overdue), grouped by beneficiary, with the Viagem, amount, currency and how each is paid, so payments go out on time. Each Viagem warns when a Conta falls due before the Cliente's confirmed Pagamentos cover the Contas due by that date, so CoreaLux doesn't finance a trip without knowing. A Pagamento still "informado pelo cliente" doesn't count as cover (Operação 17). This is the cost side of Carlos's rule K918 (Operação 18). Spec: `.scratch/custos-e-resultado/spec.md` (stories 5, 6).

**Blocked by:** 01 (Contas a pagar tracer), Operação 17 (Pagamentos, Recibos and the Situação de pagamento).

**Status:** ready-for-agent

- [ ] Two Viagens with Contas due this week to the same bus company show under that beneficiary, each with its Viagem.
- [ ] An overdue Conta shows first, marked overdue.
- [ ] A hotel Conta of USD 2,000 due before a Sinal of USD 420 is confirmed warns on the Viagem; confirming the Saldo clears it.
- [ ] Speed test for opening the list in `custos-velocidade.spec.ts` (ADR-0003).

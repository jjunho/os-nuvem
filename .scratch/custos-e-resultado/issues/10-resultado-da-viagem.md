# 10: Resultado da viagem tracer

**What to build:** The Resultado is a pure calculation with no I/O. Its input is a Viagem's Pagamentos, Contas a pagar, Cortesias, Despesas a repassar and the accepted Versão. Its output is the Resultado and the real Margem, or "não verificável".
- **The Resultado:** Pagamentos received, in USD at their recorded rates, minus Contas a pagar (paid at the rate actually paid, open at the recorded rate), minus Cortesias, plus Despesas a repassar recovered. A Despesa a repassar or any other recovered amount is never counted as revenue, and neither side counts an Item de terceiros (K107).
- **The real Margem** is shown against the 10% floor (K920). Below it, the Viagem warns the Admin. Nothing is blocked.
- **"Não verificável"** is shown while any cost is estimated or missing, each missing piece listed: a sold line with no Reserva or Conta, a Reserva without a real cost, a fee "a informar", Despesas de campo not reconciled.

The screen is on the Viagem, for Faturamento and Admin only. Table tests cover the calculation; the screen is covered by vertical tests. Spec: `.scratch/custos-e-resultado/spec.md` (stories 18, 19; Revisions of 2026-09-24).

**Blocked by:** 01 (Contas a pagar tracer), Operação 17 (Pagamentos, Recibos and the Situação de pagamento), Operação 25 (Despesa a repassar and Cortesias).

**Status:** ready-for-agent

- [ ] Revenue 1,000 with all costs known at 910 → real Margem 9%, under the floor, and the Admin is warned.
- [ ] One Reserva without a real cost → "não verificável", listing that Reserva.
- [ ] A Cortesia of 30 lowers the Resultado by 30.
- [ ] A recovered Despesa a repassar of 80 doesn't raise revenue.
- [ ] A Saldo paid in BRL and a Sinal in USD both count in USD at their recorded rates.
- [ ] Propostas e Orçamentos can't see the Resultado.
- [ ] Unit tests of the calculation (Vitest) and vertical tests in `custos-parte5-*.spec.ts`.

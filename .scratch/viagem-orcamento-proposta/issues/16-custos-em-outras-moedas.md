# 16: Supplier costs in other currencies

**What to build:** A salesperson enters a supplier cost in its own currency (KRW usually; JPY, EUR or BRL outside Korea) and sees it converted to USD with the rule (rate × 1.10; Naver for KRW). The rate and its date are recorded on the line. The Orçamento is always computed in USD. Rates are typed with their date; there is no exchange-rate API. Spec: story 41.

**Blocked by:** 10 (Tabelas: fleet and the rest, which holds the exchange rule), 11 (Orçamento tracer).

**Status:** done

- [x] Fixture: 632,000 KRW at 1,350 × 1.10 → USD 514.96.
- [x] The line shows the original amount, currency, rate and rate date.
- [x] Changing the rate recomputes the line and the total.

## Entrega

Implementado e revisado. Verificação: parte4-cambio.spec.ts; calculo.test.ts.

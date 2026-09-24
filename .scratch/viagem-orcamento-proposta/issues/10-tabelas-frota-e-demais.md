# 10: Tabelas: fleet, transfers, tickets, Kit, tips, payment factors, exchange rule

**What to build:** The rest of the Tabelas de referência, each versioned like ticket 08: fleet and vehicle rates (seats, comfort capacity, regional and VIP surcharges, bus intermediation), transfers, ticket prices, the Kit and Cortesia by Categoria de atendimento, gorjetas, payment factors (card, PIX), and the exchange rule (rate × 1.10, Naver for KRW). Spec: stories 70, 72.

**Blocked by:** 08 (Versioned Tabelas de referência: Guia and Assistente rates).

**Status:** done

- [x] Each table is seeded from `negocio/05` and the Padrões provisórios, shown and editable.
- [x] Each edit creates a new version and leaves earlier ones unchanged.

## Entrega

Implementado e revisado. Verificação: parte3-tabelas.spec.ts.

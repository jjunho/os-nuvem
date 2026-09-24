# 20: Business-rule warnings

**What to build:** Warnings for exceptions, never blocks: minimum trip rules (Agência under 3 days, Jeju under 2 days of guide), a service that doesn't fit the Categoria de atendimento (e.g. an own small car for VIP), and a direct price below the Agência price for the same service. Spec: story 81.

**Blocked by:** 13 (Vehicles and luggage), 19 (Opções and Margem).

**Status:** done

- [x] Each warning shows on the Opção it concerns, with its reason.
- [x] None of them stops the Orçamento from being saved or sent.

## Entrega

Implementado e revisado. Verificação: parte4-avisos.spec.ts; parte5-revisao.spec.ts.

# 23: Taxa de elaboração de roteiro

**What to build:** The Taxa de elaboração de roteiro is available as an off-by-default line for B2C. When turned on, it is paid before the Aceite and credited as a Desconto when the client books. Carlos turns it back on through the tables (ADR-0001). Spec: story 92.

**Blocked by:** 11 (Orçamento tracer).

**Status:** done

- [x] Fixture: a new B2C quote has no USD 200 fee by default.
- [x] Turned on, the fee shows. Once the Viagem is confirmada, it appears as a Desconto.

## Entrega

Implementado e revisado. Verificação: parte5-taxa.spec.ts.

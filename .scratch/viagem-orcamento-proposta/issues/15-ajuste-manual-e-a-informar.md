# 15: Ajuste manual, Padrão provisório and "a informar"

**What to build:** A salesperson overrides any Valor sugerido with a reason and sees the original beside it (ADR-0001). They mark a line as resting on a Padrão provisório, and Carlos sees which prices rest on one. A line whose value the rules leave open comes back "a informar", flagged. A charged line may carry an estimate in the draft, but needs its real cost before a Versão can be sent (ticket 24 enforces it). Spec: stories 43, 44, 84; Implementation Decisions: "a informar".

**Blocked by:** 12 (Suggested staff lines).

**Status:** done

- [x] An override without a reason is refused. With one, the line shows both values, who and why.
- [x] Re-suggesting after a table change leaves overridden lines alone and shows the new suggestion beside them.
- [x] A view lists every line resting on a Padrão provisório.
- [x] Scenario (8): an unlisted exhibition estimated at USD 30 is allowed in the draft and flagged as needing its real cost.

## Entrega

Implementado e revisado. Verificação: parte4-ajustes.spec.ts; parte5-envio.spec.ts.

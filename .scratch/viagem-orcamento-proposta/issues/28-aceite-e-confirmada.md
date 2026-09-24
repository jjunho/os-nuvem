# 28: Aceite and confirmada

**What to build:** A salesperson records which Opção of which Versão the Cliente accepted, and when, and the Viagem becomes confirmada with a single agreed price. Recording the Cliente's reply "aceitou" (ticket 07) leads here, with the latest sent Versão and, when it has one Opção, that Opção already selected (ADR-0008). Accepting after the Proposta's validity shows a warning, so prices can be re-checked before confirming. Spec: stories 68, 69.

**Blocked by:** 26 (The Proposta, HTML and PDF).

**Status:** done

- [x] Accepting Opção 12 + 2 of Versão 2 makes the Viagem confirmada with that price.
- [x] With the test clock past the validity date, a warning shows, and confirming still works.
- [x] Only one Aceite is open per Viagem. A wrong one is undone by a Correção de etapa.

## Entrega

Implementado e revisado. Verificação: parte5-aceite.spec.ts.

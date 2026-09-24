# 28: Aceite and confirmada

**What to build:** A salesperson records which Opção of which Versão the Cliente accepted, and when, and the Viagem becomes confirmada with a single agreed price. Recording the Cliente's reply "aceitou" (ticket 07) leads here, with the latest sent Versão and, when it has one Opção, that Opção already selected (ADR-0008). Accepting after the Proposta's validity shows a warning, so prices can be re-checked before confirming. Spec: stories 68, 69.

**Blocked by:** 26 (The Proposta, HTML and PDF).

**Status:** ready-for-agent

- [ ] Accepting Opção 12 + 2 of Versão 2 makes the Viagem confirmada with that price.
- [ ] With the test clock past the validity date, a warning shows, and confirming still works.
- [ ] Only one Aceite is open per Viagem. A wrong one is undone by a Correção de etapa.

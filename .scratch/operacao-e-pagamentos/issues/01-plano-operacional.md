# 01: Operational plan tracer

**What to build:** Recording the Aceite starts the Viagem's operational plan from the accepted Opção: its Dias, Linhas de custo and the Viagem's own Viajantes, the same records and never copies (ADR-0008). An operator opens the plan and sees each Dia with its programme, Viajantes and lines. The Código da viagem, created at first contact, heads every operational screen and document. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 1, 2; Revisions of 2026-09-24).

**Blocked by:** Viagem 28 (Aceite and confirmada), Viagem 17 (Viajantes in the Orçamento).

**Status:** ready-for-agent

- [ ] Accepting Opção 12 + 2 creates the plan with that Opção's Dias and lines. The other Opções don't appear.
- [ ] Renaming a Viajante on the Viagem shows the new name in the plan at once: there is one record.
- [ ] Guiamento and Conteúdo don't reach the plan screen (ticket 15 gives the Guia their own view).
- [ ] Vertical tests in `operacao-parte1-*.spec.ts`.

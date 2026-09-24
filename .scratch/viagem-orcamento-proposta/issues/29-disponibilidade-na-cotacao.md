# 29: Staff availability while quoting

**What to build:** While quoting, a salesperson sees whether Guias and Assistentes are free on those dates, and whether a Tour needing a specific Profissional (BTS → Jessica, art → Lia) can be served, so CoreaLux doesn't sell what it can't staff. Spec: story 80.

Needs the Profissionais and their skills from `.scratch/catalogo-fornecedores-acesso/spec.md` and the Alocações from `.scratch/operacao-e-pagamentos/spec.md`. Neither is built or ticketed yet.

**Blocked by:** 12 (Suggested staff lines), Catálogo 15 (Profissionais), Operação 08 (Fleet and Alocação tracer).

**Status:** ready-for-agent

- [ ] A Dia whose dates clash with a Guia's confirmed Alocação shows that Guia as busy.
- [ ] A Tour requiring Jessica warns when she is busy or doesn't speak the Idioma de guiamento.
- [ ] The Guia picker on a Dia offers only Guias who speak the Idioma de guiamento, the busy ones marked as busy.
- [ ] Warnings never block the Orçamento.

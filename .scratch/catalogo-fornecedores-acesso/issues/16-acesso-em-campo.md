# 16: Field access: Guiamento and Dados de viagem

**What to build:** A Guiamento Usuário sees only its own Alocações, the Roteiro operacional of those Dias, Incluso and Não incluso without values, and the Dados de viagem and Observações para a Equipe needed for them (names, flights, emergency contact). It sees no value of the Viagem. It does see what is its own: its fees and the Despesas de campo it records, when those exist (Custos and Operação specs). Every view or export of Dados de viagem is recorded with who and when. Pagamentos don't appear in the app yet, so their access rules come with them. Spec: stories 30, 35, 38; Revisions of 2026-09-24.

**Blocked by:** 01 (Access by Papel: tracer), 15 (Profissionais), and Alocação and Dados de viagem from `.scratch/operacao-e-pagamentos/spec.md` (not yet ticketed).

**Status:** ready-for-agent

- [ ] A Guia sees their own Dias and nobody else's, through the screen and through requests.
- [ ] Incluso and Não incluso show with no value.
- [ ] Opening or exporting a Viajante's Dados de viagem adds a record the Admin can read.
- [ ] A Guia can't reach another Viagem's Dados de viagem by URL.

# 16: Field access: Guiamento and Dados de viagem

**What to build:** A Guiamento Usuário sees only its own Alocações, the Roteiro operacional of those Dias, Incluso and Não incluso without values, and the Dados de viagem and Observações para a Equipe needed for them (names, flights, emergency contact). It sees no value of the Viagem. It does see what is its own: its fees and the Despesas de campo it records, when those exist (Custos and Operação specs). Every view or export of Dados de viagem is recorded with who and when. A funcionário's salary never appears in the app (Juliano, 2026-09-24); a Guiamento funcionário has no fee statement, while an outside Profissional's fees are theirs to see. Invoices, Pagamentos and the Saldo are seen from Propostas e Orçamentos up; a Guia given a payment to collect sees only that amount (Operação spec, Revisions of 2026-09-24). Spec: stories 30, 35, 38; Revisions of 2026-09-24.

**Blocked by:** 01 (Access by Papel: tracer), 15 (Profissionais), Operação 02 (Dados de viagem), Operação 08 (Fleet and Alocação tracer).

**Status:** ready-for-agent

- [ ] A Guia sees their own Dias and nobody else's, through the screen and through requests.
- [ ] Incluso and Não incluso show with no value.
- [ ] Opening or exporting a Viajante's Dados de viagem adds a record the Admin can read.
- [ ] A Guia can't reach another Viagem's Dados de viagem by URL.

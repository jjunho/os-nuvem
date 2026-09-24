# 01: Access by Papel: tracer

**What to build:** Each Usuário's single Papel decides what they reach, checked on every request and read, not only in the screens. Screens, fields and commands a Papel can't reach are hidden, never shown as errors. A request to them gets a 404, as the login spec does for the Usuários screen. The Papéis are Carlos's list of 13/09 (S153), from the highest to the lowest: Admin, Faturamento, Propostas e Orçamentos, Itinerários e Produtos, Guiamento, Conteúdo. There is no Atendimento: whoever takes first contact is Propostas e Orçamentos. Spec: `.scratch/catalogo-fornecedores-acesso/spec.md` (stories 29, 36, 37; Access by Papel; Revisions of 2026-09-24).

This ticket builds the one place that answers "may this Usuário do or see this?" and applies it to the screens that exist: the Pipeline, the Viagem, the busca, the Usuários screen (from the login spec) and the Tabelas de referência. Every later ticket declares its own rows through the same place.

- Admin: everything, including Usuários and the Tabelas de referência.
- Propostas e Orçamentos and above: leads, Viagens, Contatos, the Catálogo.
- Itinerários e Produtos: the Catálogo and Roteiros. The Viagem, without totals, Margem or Preço enviado.
- Guiamento: no Pipeline. Its own Dias only (ticket 16).
- Conteúdo: the Catálogo read-only.

**Blocked by:** Login 06 (Change Papel and reset password), Viagem 08 (Versioned Tabelas de referência).

**Status:** ready-for-agent

- [ ] One table-driven test per Papel lists the screens and commands it reaches and those it doesn't, sent as raw requests, not only by looking for buttons.
- [ ] A hidden screen gives 404 to a request and doesn't appear in the menu.
- [ ] Only the Admin edits the Tabelas de referência. Others read them only where their Papel allows.
- [ ] Guiamento has no Pipeline. Conteúdo can't create or edit a Viagem.
- [ ] A Papel change applies on the next request (login spec).
- [ ] The Papel list has no Atendimento.

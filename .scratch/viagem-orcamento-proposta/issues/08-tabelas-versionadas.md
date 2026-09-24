# 08: Versioned Tabelas de referência: Guia and Assistente rates

**What to build:** Carlos sees and edits the Tabelas de referência without a developer (ADR-0002). Every change creates a new table version, so old Orçamentos keep the values they were computed with. This ticket builds the mechanism on the first table: Guia and Assistente diárias by Canal comercial. Seeded from `negocio/05` and `docs/padroes-provisorios.md`. Spec: stories 70–72; Tabelas de referência module.

The module only reads and writes reference data and knows nothing about Orçamentos. It offers "the current version" and "version N" for others to pin.

**Blocked by:** 01 (Known options: a filtered list with an open last option).

**Status:** ready-for-agent

- [ ] The rates table shows the seeded values, marking those that are Padrões provisórios.
- [ ] Editing a value creates version 2. Version 1 still reads exactly as before.
- [ ] The history lists each version with who and when.
- [ ] Only the Admin can edit. Others can read.
- [ ] Vertical tests in `parte3-*.spec.ts`.

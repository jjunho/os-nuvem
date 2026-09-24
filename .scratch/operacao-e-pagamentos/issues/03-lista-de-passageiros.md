# 03: Lista de passageiros

**What to build:** An operator exports a lista de passageiros for an airline or an attraction from the Dados de viagem, never retyped. It includes the Equipe members who fly, computes each person's type from their age on the flight date, allows "TBA" placeholder names, and exports in the airline's upload layout (Jeju Air, K626). Spec: `.scratch/operacao-e-pagamentos/spec.md` (story 5).

**Blocked by:** 02 (Dados de viagem), Catálogo 23 (Airline Fornecedor).

**Status:** ready-for-agent

- [ ] Fixture S097 (anonymised): 11 people including 1 staff member, 2 without passport data → the export warns about the 2 and lists the staff member.
- [ ] A traveller whose written age disagrees with the birth date uses the birth date, and warns.
- [ ] The Jeju Air export matches its upload columns.

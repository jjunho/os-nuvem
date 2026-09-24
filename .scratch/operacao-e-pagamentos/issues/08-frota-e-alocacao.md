# 08: Fleet and Alocação tracer

**What to build:** The physical fleet is registered: own vehicles (Tucson 2020, Spark 2020, SM5 2017, the new Carnival própria) and external ones (Carnival externa, Sedan always external Grandeur), with seats, luggage capacity and whether a Guia may drive it (K035, K126, K128). The Tabelas de referência keep only their rates (Viagem 10). An operator allocates Guias, Assistentes, drivers and vehicles to each Dia, per Período when morning and afternoon differ, picking from lists filtered by date and language (ADR-0008). Outside Profissionais and external vehicles carry their own contact. An Alocação is "a confirmar" until confirmed. The agenda shows every Dia of every Viagem by date: city, Cliente, programme, Equipe, vehicle, and whether car, tickets, lunch, dinner and hotel are confirmed. The actual hours worked are recorded on the Alocação for overtime (Custos). Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 13, 17, 18, 20, 64).

**Blocked by:** 01 (Operational plan tracer), Catálogo 15 (Profissionais), Viagem 10 (Tabelas: fleet and the rest).

**Status:** ready-for-agent

- [ ] Allocating Lia in the morning and Jessica in the afternoon of one Dia shows both.
- [ ] The agenda for next week lists every Dia of every Viagem by date, with the "Jantar?" column.
- [ ] An "a confirmar" Alocação shows as such on the agenda.
- [ ] The first Alocação creates the Viagem's Equipe conversation (Comunicador 21).
- [ ] Speed test for opening the agenda in `operacao-velocidade.spec.ts` (ADR-0003).

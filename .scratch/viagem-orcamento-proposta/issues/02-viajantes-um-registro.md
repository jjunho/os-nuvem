# 02: The Viagem's Viajantes: one record, reused everywhere

**What to build:** A prefactor that makes every later ticket reuse, never retype. Today the lead stores its headcount as loose numbers on the Viagem (pagantes, gratuidades, adultos, children's ages, bebês), apart from the Contatos linked as Viajantes. This ticket turns the headcount into the Viagem's list of **Viajantes**: one record per person who travels. Each record is Pagante or Gratuidade, and adult, child (with age) or infant. It may start unnamed ("Adulto 1") and gains a name, or a link to an existing Contato, when one is known. Counts shown anywhere are derived from the list, never stored beside it. Spec: `.scratch/viagem-orcamento-proposta/spec.md` (stories 7, 14; glossary: Viajante, Pagante, Gratuidade).

**The rule (ADR-0008, Juliano, 2026-09-24):** nothing the system knows is ever typed again. Anything known (trip dates, names, hotels, destinations, anything) shows up already filled in as the default wherever it is needed. This ticket applies it to the Viajantes, and every later ticket applies it to its own fields. The Formulário de planejamento (ticket 04), the Perfil do cliente (05), the Orçamento (17), luggage (13), the Operação spec's Dados de viagem and Observações para a Equipe, and the Comunicador's "Mover para o Viajante" all read and extend this same record in place.

**Blocked by:** 01 (Known options: a filtered list with an open last option).

**Status:** done

- [x] The new-Viagem form still accepts a quick headcount (e.g. 10 pagantes + 2 gratuidades, 1 child of 8), which creates that many Viajante records.
- [x] The Viagem screen lists its Viajantes. Naming one, linking one to a Contato, changing age or Pagante/Gratuidade edits that record, and the counts follow.
- [x] A Contato linked as Viajante on one Viagem is the same person when linked on another. No second person record is created.
- [x] Removing or adding a Viajante changes the counts everywhere they're shown.
- [x] Existing Viagens migrate: their numbers become unnamed Viajantes, and their Viajante Contatos become named ones, with nobody counted twice.
- [x] No count column remains that can disagree with the list.
- [x] The part 1 tests pass, adjusted only where the form's headcount fields changed shape.
- [x] Strings in PT and KO.
- [x] ADR-0008 check: no screen in this ticket asks for anything the Viagem already knows.

## Entrega

Implementado e revisado. Verificação: parte1-viajantes.spec.ts; migrações preservadoras.

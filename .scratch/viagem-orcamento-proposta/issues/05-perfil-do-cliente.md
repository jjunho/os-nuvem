# 05: Perfil do cliente

**What to build:** When a known Cliente or Viajante writes again, the salesperson sees their Perfil do cliente: past Viagens, preferences, restrictions, how past itineraries were received, and birthday. It is read from the same records every Viagem already holds (the Viajante records of ticket 02, the Contato, notes), not typed into a separate profile. Spec: story 17; glossary: Perfil do cliente.

**Blocked by:** 02 (The Viagem's Viajantes: one record, reused everywhere).

**Status:** ready-for-agent

- [ ] Linking an existing Contato to a new Viagem, as Solicitante or Viajante, shows "cliente conhecido" with their past Viagens.
- [ ] Restrictions and preferences recorded on the person in an earlier Viagem show on the new one without retyping.
- [ ] A note on how an itinerary was received can be added, and appears in later Viagens.
- [ ] An upcoming birthday during the trip dates is highlighted.

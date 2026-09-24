---
status: accepted
---
# Interface in Portuguese and Korean, chosen per Usuário

Every screen of Corealux OS is available in Portuguese and Korean, and each Usuário picks their Idioma da interface. Eun Bee and Hyewon Ku (Helena) prefer Korean; the rest of the team prefers Portuguese. Most of the team reads both, so Mensagens in the Comunicador are not translated; only the interface is.

We chose this now, before most screens exist, because retrofitting translation means touching every string later. A Portuguese-only interface was the alternative; it would have made the system a second-class tool for the people who run the Korean side.

## Consequences

- No interface string is written directly in a component; each goes through the translation catalogue, in both languages.
- The screens already built (login, Viagem part 1) have their strings moved into the catalogue.
- Client-facing documents keep following the Idioma do cliente, not the Idioma da interface of whoever issues them.

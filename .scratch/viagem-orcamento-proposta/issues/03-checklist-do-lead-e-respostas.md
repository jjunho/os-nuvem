# 03: Lead checklist and first-reply templates

**What to build:** A salesperson sees exactly which data is still missing on a lead (dates, pax and ages, hotel, mobility, food asked as "o que você não come", restaurant level, pace) and gets a ready message asking only for that. The first-reply template exists in português, espanhol, inglês and francês. It asks for dates, number of people, hotel, interests and "pontos que gostaria", and explains the team's time difference. Both come out in the Idioma do cliente and are copied into the channel the Viagem uses. Spec: stories 73, 74; scenario fixture (2) "incomplete input".

The checklist reads what is already recorded (the Viagem and its Viajantes from ticket 02) and never asks for something already known. Templates are editable defaults (ADR-0001). The answers the checklist asks for (hotel, mobility, food, restaurant level, pace) are stored as fields on the Viagem or on the Viajante they concern, so later steps prefill them (ADR-0008). They are not stored as free text in a note.

**Blocked by:** 02 (The Viagem's Viajantes: one record, reused everywhere).

**Status:** done

- [x] A lead with only a name shows every item missing. Filling dates and Viajantes removes those items.
- [x] The ready message lists only the missing items, in the Idioma do cliente, for all four languages.
- [x] The first-reply template shows in the Idioma do cliente and can be copied in one click.
- [x] An Admin edits a template, and the next copy uses the edit.
- [x] Recording the hotel on the Viagem, or a diet on a Viajante, removes that item and makes the value available to later steps.
- [x] Scenario fixture (2) produces the expected missing questions.

## Entrega

Implementado e revisado. Verificação: parte1-briefing.spec.ts.

# 02: Dados de viagem

**What to build:** Each Viajante record (Viagem ticket 02) gains its Dados de viagem, filled in place and never asked twice: name as in the passport, English name, sex, nationality, date of birth, passport number, issue date, issuing country and expiry, arrival, departure and internal flights, travel insurance company and policy number, diet ("o que você não come"), accessibility, emergency contact, K-ETA status (S150), and Observações para a Equipe (never shown to the client). Profissionais who travel with the group get the same travel data on their Profissional record (Catálogo 15), because their flights and KTX are booked too (K917, K716). Warnings: a passport expiring less than 6 months after the trip; data missing for a booked item (the DMZ asks name, date of birth and nationality); flights, hotel and Dia dates that disagree. In B2B, the Agência may never give a traveller's phone (K162), so contact data isn't nagged for. Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 3, 4, 63).

Access: every view or export is logged (Catálogo 16).

**Blocked by:** 01 (Operational plan tracer), Viagem 02 (The Viagem's Viajantes), Catálogo 15 (Profissionais).

**Status:** ready-for-agent

- [ ] Data typed on the Formulário de planejamento (Viagem 04) appears here already filled in.
- [ ] A passport expiring 4 months after the trip warns.
- [ ] A DMZ Dia with a Viajante missing nationality warns.
- [ ] A flight out on 14/09 with the hotel until 15/09 warns.
- [ ] A B2B Viajante without phone doesn't warn about the phone.
- [ ] Observações para a Equipe never appear on any client document.

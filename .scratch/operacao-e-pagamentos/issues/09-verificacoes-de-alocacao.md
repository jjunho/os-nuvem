# 09: Alocação checks

**What to build:** Warnings that never block (ADR-0001):
- the same person or vehicle on two Viagens at the same time, or a Profissional in two cities on the same day;
- a Guia working a Jeju morning must fly the day before and can't work in Seoul then (K069, K903);
- unavailability, including recurring (every Tuesday, a class timetable, a period);
- capacity: net capacity already deducts the driver and seated Equipe, so the check compares Viajantes against it, with a seat always kept for the Equipe (K123); suggested capacity depends on the Categoria (econômico can fill the car, VIP uses fewer seats) and luggage; over capacity, the client pays for an upgrade or a taxi (K562); a group over 45 can't go in one bus (K132);
- our own simple car never goes to a VIP Dia (K035, K913); a Guia drives only our own car (K888);
- groups of 15 or more need a Guia and an Assistente (K232);
- a list of Dias in the next 7 days without a confirmed Guia; a suggestion to keep the same Guia across the Viagem, with a warning when it changes; the clinic limit of 3 people per shift (K111).

Spec: `.scratch/operacao-e-pagamentos/spec.md` (stories 15, 16, 19, 65–69).

**Blocked by:** 08 (Fleet and Alocação tracer).

**Status:** ready-for-agent

- [ ] Lia on two Viagens on 23/08 warns on both.
- [ ] Lia in Seoul on 23/08 and Busan on 23/08 at different times warns.
- [ ] Lia on a Jeju Dia starting at 9h on 24/08 blocks her Seoul availability on 23/08, with a warning if allocated.
- [ ] 14 Viajantes Premium in a Solati warns. 50 in one bus warns.
- [ ] Our Spark on a VIP Dia warns.

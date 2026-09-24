# 05: Vehicle hire costs

**What to build:** Each vehicle Alocação suggests its recurring hire costs as Contas a pagar, all editable (ADR-0001): the driver's meal ≈ 10,000 KRW and tip ≈ 10,000 KRW per day, for every kind of transport, buses included (29/06/2026 meeting, K216, K219); external-driver overtime per hour past the 9h block (≈ 30,000 KRW Carnival, ≈ 50,000 KRW van, K220, K889) from the actual hours on the Alocação; night after 22h (K218); parking and tolls. The driver's tip here is a hire cost, not a Gorjeta. Parking, tolls and fuel that the Proposta charges to the client on top of the car price ("cobrados à parte", K384) are also amounts to bill (ticket 08). A parking or toll the Guia later logs as a Despesa de campo replaces the suggestion instead of adding to it (Operação 24). Our own vehicle driven by a funcionário gets the meal suggestion but no fee Conta. Spec: `.scratch/custos-e-resultado/spec.md` (story 3; Revisions of 2026-09-24).

**Blocked by:** 04 (Outside Profissionais' fees and bank details), Operação 24 (Despesas de campo).

**Status:** ready-for-agent

- [ ] A 3-day external Carnival Alocação suggests 3 × 10,000 KRW meal and 3 × 10,000 KRW tip to the driver.
- [ ] A Carnival day that ran from 9h to 20h suggests 2h overtime at 30,000 KRW.
- [ ] A toll suggested for a Dia and then logged as a Despesa de campo counts once.
- [ ] Parking "cobrado à parte" appears as an amount to bill.

# 13: Vehicles and luggage

**What to build:** The vehicle is suggested from the group and its luggage. When the group is large, the van and bus alternatives are both priced. Groups over the bus capacity are split into two vehicles. Capacity and seat warnings follow the comfort capacity. The regional car surcharge (+20% outside Seoul) and VIP car (+10%) are suggested. The bus carries its own intermediation, with no second markup. The salesperson records what the client authorises (bigger vehicle, second vehicle, luggage truck, public transport). Spec: stories 40, 47, 83.

Luggage (default two 23 kg bags plus hand luggage, reducible) is recorded on each Viajante record (ticket 02), the same field the Operação spec's Dados de viagem uses. It is never asked again there.

**Blocked by:** 02 (The Viagem's Viajantes), 10 (Tabelas: fleet and the rest), 12 (Suggested staff lines).

**Status:** ready-for-agent

- [ ] Fixture: bus eligible base 468 → 538.20, with no second markup. Bus penalty 100 → 110.
- [ ] Scenario (5): 14 pax Premium in a Solati → seat warning, and the luggage truck is not offered as the fix.
- [ ] Scenario (7): VIP 13 pax in a Sprinter → capacity warning (11 seated).
- [ ] A Dia outside Seoul suggests the +20% on the car.
- [ ] Reducing a Viajante's luggage changes the suggestion. The value shows on that Viajante's record.

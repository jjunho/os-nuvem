# 13: Roteiros-modelo

**What to build:** A salesperson starts a Viagem's Roteiro from a Roteiro-modelo, and every Dia arrives filled in (ADR-0008), ready to adapt. Any Roteiro can be saved as a new model, stripped of prices, Descontos and Ajustes manuais. A model records:
- its origin: a roteiro built for Interep is priced higher when resold to other Agências (K185, Carlos);
- its theme (Artes, "com criança", K283) and a quality rating from five stars to "não dá para fazer" (K430, an observed practice);
- the standard: 10 days with the last night in Seoul (K141, Carlos), with a warning when a Roteiro breaks it.

Spec: stories 16, 17, 44.

**Blocked by:** 12 (Módulos and Dia models).

**Status:** ready-for-agent

- [ ] Starting from "Seul-Busan" fills the Dias. Changing one doesn't change the model.
- [ ] Saving a Roteiro as a model carries no price, Desconto or Ajuste manual.
- [ ] An Interep-origin model used for another Agência shows the higher-price warning.
- [ ] A 10-day Roteiro ending in Busan warns.
- [ ] Seed: Seul 3d, Seul-Busan, Seul-Busan-Jeju, Seul Artes, Seul com criança (K283), the 10-day standard, the 13-day Interep route (K504), the 12-day with Andong (K298), Turis VIP, Beauty, BTS.

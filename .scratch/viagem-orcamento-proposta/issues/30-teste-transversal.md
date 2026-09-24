# 30: Transversal test, first contact to confirmada

**What to build:** The end-of-spec transversal test, with one realistic B2B case (an Agência requesting 10 pagantes + 2 gratuidades and 12 + 2 at premium) and one B2C case. Each runs through every step: first contact → Viagem with Responsável → first reply → Orçamento built Dia by Dia → two Opções → Ajuste manual with reason → Preço enviado → send (Versão frozen, Etapa proposta enviada, follow-up created) → the Cliente asks for changes (em negociação) → Versão 2 sent (proposta enviada) → Proposta PDF → Cliente accepts one Opção → Viagem confirmada. Spec: Testing Decisions.

It also checks ADR-0008 at every step: dates, cities, Viajantes' names and ages, hotel and language recorded at the lead step appear already filled in on the Orçamento, the Envio and the Proposta, and the test never types a value the system already holds.

**Blocked by:** 01–28 (every ticket above except 29).

**Status:** done

- [x] One transversal e2e test per case runs the steps above, checking what the user sees at each step, and passes.
- [x] All vertical and speed tests of this spec, the login tests and the Comunicador tests still pass.

## Entrega

Implementado e revisado. Verificação: spec1-transversal.spec.ts; suíte vertical completa e regressões corrigidas.

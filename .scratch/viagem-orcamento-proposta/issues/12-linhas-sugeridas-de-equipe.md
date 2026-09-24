# 12: Suggested staff lines

**What to build:** Each Dia starts filled in. From the Período and the Categoria de atendimento, the system suggests the Guia and Assistente diárias, and the number of Guias and Assistentes from the group size (a suggestion, never a block). Each Valor sugerido applies the rules: add-ons applied individually to the base without cascading; the duration factor as `fator × (base + soma dos adicionais)` with half day 0.60 and 4–6h 0.80; overtime in whole hours; night surcharge; Temporada precedence and the Korean holiday ±2-day window. Every line using a Padrão provisório is marked. Spec: stories 34, 35, 39; Implementation Decisions: rules applied by the calculation.

**Blocked by:** 09 (Tabelas: Temporadas, holidays and events), 11 (Orçamento tracer).

**Status:** done

- [x] Carlos's fixtures pass as table tests and through the screen: base 320 + 20% add-on at half day → 230.40; car base 200 at 9h / 9h30 / 10h → overtime 0 / 0 / 16; Premium staffing 7 / 14 / 21 pax → 1+0 / 1+1 / 2+1.
- [x] Scenario (4): a holiday on 15/08 puts services on 14–16/08 inside the ±2-day window.
- [x] Scenario (6): "manhã" without hours asks for the hours instead of assuming them.
- [x] Changing the Categoria or the Período re-suggests untouched lines and leaves adjusted ones alone.

## Entrega

Implementado e revisado. Verificação: parte4-sugestoes.spec.ts; sugestoes.test.ts.

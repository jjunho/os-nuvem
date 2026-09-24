# Every business rule is an editable default

CoreaLux negotiates every sale, and the knowledge base (`../docs/AGENTS.md`) states outright that "editável", "negociável" and "caso a caso" are the final shape of its rules, not gaps to close. So Corealux OS never enforces a price rule as a hard constraint. Every rate, percentage, count and condition is a **suggested value** on its Linha de custo. Staff can override it with an Ajuste manual that records who, when, the original value and why. The Versão de orçamento freezes both the suggestion and the override in its Memória de cálculo.

Questions the business has not closed yet (`../docs/negocio/07-questoes-abertas.md`) follow one of two paths:

- **Padrão provisório.** The question gets a sensible default derived from the evidence, marked as provisional until Carlos decides. See `docs/padroes-provisorios.md`.
- **A informar.** Where the current rules (`../docs/negocio/05` and `07`) keep a value undecided and there is no number to start from, the system leaves it blank and the person fills it in each case. Carlos answered these items only with "seguir correção recomendada" and no figures. The acervo's consolidation reads "seguir" as approving the direction without the audit's example numbers. The items are the 4–9h band, children's rates, VAT (Carlos: "definir se vamos cobrar sempre ou somente a depender da forma de pagamento"), bus stacking and the USD/BRL refund comparison.

## Consequences

- The system never blocks **negotiation**. The hard stops are integrity and data, and there are four:
  - a sent Versão de orçamento cannot change;
  - money always carries its currency;
  - a Versão cannot be sent while a charged value is still "a informar", for example an Atração with a positive price but no real cost (B45: Carlos said "seguir correção recomendada" to the audit's "informar custo real antes de fechar cotação"; K924/K935);
  - buying a non-refundable item while the Cliente's payments don't cover it needs a recorded override by Faturamento or Admin (B40: Carlos said "seguir correção recomendada" to "saldo antes da emissão de item não reembolsável"; K917–K919).
- Pricing floors such as the 10% real-margin floor raise a warning and record a reason. They never refuse a value or hold back a Proposta. At quote time the margin is shown as "não verificável" until real costs exist.
- Every calculated value stores its suggestion, its applied value and an optional reason. A model that stores only the final number would violate this ADR.

# Every business rule is an editable default

CoreaLux negotiates every sale, and the knowledge base (`../docs/AGENTS.md`) states outright that "editável", "negociável" and "caso a caso" are the final shape of its rules, not gaps to close. So Corealux OS never enforces a price rule as a hard constraint. Every rate, percentage, count and condition is a **suggested value** on its Linha de custo. Staff can override it with an Ajuste manual that records who, when, the original value and why. The Versão de orçamento freezes both the suggestion and the override in its Memória de cálculo.

Questions the business has not closed yet (`../docs/negocio/07-questoes-abertas.md`) are treated the same way. Each gets a **padrão provisório**: a sensible default derived from the evidence and marked as provisional, until Carlos decides. See `docs/padroes-provisorios.md`.

## Consequences

- The only hard blocks are integrity rules: a sent Versão de orçamento cannot change, and money always carries its currency. Pricing floors (e.g. the 10% real-margin floor) raise a warning and record a reason. They never refuse the value or hold back a Proposta.
- Every calculated value needs to store its suggestion, its applied value and an optional reason. A model that stores only the final number would violate this ADR.

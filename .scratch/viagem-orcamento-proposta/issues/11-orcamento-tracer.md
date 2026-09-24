# 11: Orçamento tracer: Dia by Dia to Preço enviado

**What to build:** The thinnest complete Orçamento. A salesperson creates an Orçamento for a Viagem, which becomes em orçamento. They add Dias with date, city or route, Período (dia completo, meio período, dia livre, deslocamento) and programme (manhã, almoço, tarde). They insert, remove and reorder Dias without breaking sums, and choose the Dia counting convention (arrival is Dia 1 or Dia 0) per Roteiro. They type Linhas de custo by hand in USD, each with its own quantity. One Opção shows its Preço calculado step by step (services, Margem, hotels, total), the Preço enviado suggested as the total rounded up to the next USD 10 (editable, with the difference shown), and the Preço por pessoa divided by Pagantes only. A quick Orçamento has a single Dia and loose lines. Spec: stories 28–32, 37, 45, 50–52.

The rest:
- **Cálculo de orçamento** is a pure function, the main seam. Its input is the draft plus a pinned Tabelas version. Its output is every line with suggested and applied values, the price steps, the Preço por pessoa and the warnings. No I/O, no clock. Later tickets extend its rules.
- The Orçamento is pinned to the current Tabelas version when created.
- Money is integer minor units plus a currency. Rounding happens only on the total.
- Nothing known is typed again (ADR-0008). A new Orçamento opens with one Dia per trip date and the Viagem's cities already filled in, and the Canal comercial, Categoria de atendimento and headcount taken from the Viagem and its Viajantes. Changing a Dia's date in the Orçamento is that Orçamento's choice (e.g. an Opção with other dates) and never rewrites the Viagem.
- Creating the Orçamento is a fact passed to the Inferência (ticket 07).

**Blocked by:** 07 (Inferência de etapa, Cliente's reply, perdida, Correção), 08 (Versioned Tabelas de referência: Guia and Assistente rates).

**Status:** done

- [x] Creating an Orçamento moves the Viagem to em orçamento.
- [x] A Viagem with dates 28/10–01/11 in Seul and Busan opens its first Orçamento with those 5 Dias and cities filled in, and nothing already known is asked.
- [x] Inserting a Dia in the middle renumbers the rest and keeps the total right. Switching to Dia 0 relabels the Dias.
- [x] A quick single-Dia Orçamento prices in a few actions.
- [x] The step-by-step shows services, Margem and total. Preço enviado 1,233 becomes 1,240 and can be edited to 1,200, with the difference shown.
- [x] 10 pagantes + 2 gratuidades divide the price by 10.
- [x] Vitest table tests for the Cálculo. Vertical tests in `parte4-*.spec.ts`. Speed tests for opening an Orçamento and recomputing after a change in `parte4-velocidade.spec.ts` (ADR-0003).

## Entrega

Implementado e revisado. Verificação: parte4-orcamento.spec.ts; parte4-velocidade.spec.ts.

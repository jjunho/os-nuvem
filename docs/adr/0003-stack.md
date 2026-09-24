---
status: accepted
---

# Stack: one TypeScript app on PostgreSQL, tested through the browser

Corealux OS is built as **one deployable TypeScript application**. It is a modular monolith: the modules named in the specs (Viagens, Tabelas de referência, Cálculo de orçamento, Orçamentos, Documentos, Operação, Alocação, Pagamentos, Catálogo, Fornecedores, Acesso, Contas a pagar, Resultado) are folders with explicit interfaces, not separate services.

The small team, the single business and the need for transactions across modules (confirming a Viagem touches Orçamentos, Operação and Pagamentos at once) make separate services a cost with no benefit. TypeScript on both server and browser lets the pure calculation modules run in both places. The unsigned SOW in `../docs` pointed the same way (TypeScript, PostgreSQL-first, modular monolith).

The choices:

- **Language and runtime:** TypeScript on Node.js (current LTS).
- **Web framework:** React Router (framework mode), for server-rendered routes, forms and data loading in one app, with React in the browser.
- **Database:** PostgreSQL, accessed through Drizzle. SQL-first queries, schema in TypeScript, versioned migrations.
- **Money:** integer minor units plus an ISO currency code, never floats (ADR-0001, specs).
- **Tests:**
  - Playwright for the vertical tests of each part and the final transversal test. These run against the real app and a real PostgreSQL.
  - Vitest for the fast table-driven tests of the pure calculation modules (Cálculo de orçamento, refund suggestion, Resultado).
- **Documents:** Proposta, Voucher, Invoice, Recibo and the others are rendered as HTML and printed to PDF with headless Chromium, the same engine Playwright already brings. Content checks read the HTML.
- **Excel import and export:** ExcelJS.

## Consequences

- There is one repository and one deploy. Module boundaries are enforced by folder structure and import rules, not by the network.
- A real PostgreSQL must be available in development and CI; tests never replace it with a fake.
- **Hosting is not decided yet.** Any host that runs a Node.js process next to PostgreSQL works. That decision belongs in its own ADR when it is made.
- **Authentication is not decided yet.** Access by Papel is enforced in the app on every request, whichever login method is chosen.

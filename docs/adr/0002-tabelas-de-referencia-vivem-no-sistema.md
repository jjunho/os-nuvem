# Reference tables live in the system, seeded from the acervo

Rates, seasons, holidays, fleet, transfers and payment factors are needed at quote time and change several times a year. Staff must be able to update them without a developer. Corealux OS therefore owns them as versioned **Tabelas de referência**, seeded once from `../docs/negocio/05-negocio-precificacao.md`, and each Versão de orçamento records the table version it used. The acervo remains the narrative record of *why* a rule exists and who decided it. It is not read by the app at runtime.

## Considered Options

- **App reads the acervo markdown at runtime**: rejected. The markdown is prose with citations, not data. Parsing it is fragile, and the acervo's own rules forbid building parsers over it.
- **Two-way sync**: rejected. There is no reliable key between K-units and table rows, and the cost of keeping them in sync is far greater than the benefit.

## Consequences

When Carlos changes a rule, two things happen: the Tabela de referência is updated in the app, and the K-unit is updated in the acervo. The app does not detect drift between the two. That is accepted, because old quotes keep the table version they were computed with.

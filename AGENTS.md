# AGENTS.md

## Agent skills

### Issue tracker

Issues are local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Development

```sh
pnpm install
pnpm db:start        # local PostgreSQL in .data/pg on port 54329 (dev and test databases)
pnpm db:migrate      # apply migrations to the dev database
pnpm db:seed         # reset dev data to the seed (staff and intermediários)
pnpm dev             # app on http://localhost:5173
pnpm test            # fast unit tests of pure rules (Vitest)
pnpm test:e2e        # vertical tests on the production build + test database (Playwright)
pnpm typecheck
```

Tests follow the specs' Testing Decisions: one vertical test file per part (`tests/e2e/parteN-*.spec.ts`), speed budgets from ADR-0003 in `parteN-velocidade.spec.ts`, and a transversal test at the end of each spec.

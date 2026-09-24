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

## Acesso

O seed é exclusivo de desenvolvimento/testes: `carlos@corealux.com`, `lia@corealux.com`, `lidiane@corealux.com`, `jessica@corealux.com` e `helena@corealux.com` usam a senha `corealux123`. Carlos e Hyewon Ku (Helena) são Admins; Lidiane é Propostas e Orçamentos. Nunca execute o seed em produção.

Para iniciar uma instalação, configure `DATABASE_URL`, rode `pnpm db:migrate` e execute `pnpm admin:criar "Nome" "email@exemplo.com" "senha com pelo menos 8 caracteres"`. O comando recusa se já houver Admin ativo; não usa o seed. A senha passada como argumento pode aparecer no histórico do shell e na lista de processos: execute em ambiente administrativo controlado.

As migrações preservam a inicial original e acrescentam Acesso. Usuários da antiga seleção por nome, sem credenciais, permanecem no histórico como inativos com e-mail reservado `usuario-<id>@legacy.invalid`; crie o primeiro Admin pelo comando. O schema intermediário que já tinha `login`, hash e sessões também é suportado, preservando suas credenciais.

No proxy HTTPS, sobrescreva `X-Forwarded-Proto` com o protocolo externo para que o cookie receba `Secure`.

# Hosting: a local Raspberry Pi, later

Corealux OS will run in production on a Raspberry Pi on the local network, with Node.js and PostgreSQL on the same machine. This is not set up yet; development and tests run on the developer's machine (`pnpm db:start`).

## Consequences

- The speed budgets of ADR-0003 must hold on the Pi, not only on a laptop. When the Pi is set up, the speed tests run there too.
- The app must stay light: one Node.js process, one PostgreSQL, no extra services.
- Backups of PostgreSQL and access from outside the office (VPN or tunnel) need their own decisions when the Pi goes live.

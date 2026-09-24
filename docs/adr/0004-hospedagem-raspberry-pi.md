# Hosting: a local Raspberry Pi, reachable from the internet

Corealux OS will run in production on a Raspberry Pi in the office, with Node.js and PostgreSQL on the same machine. This is not set up yet; development and tests run on the developer's machine (`pnpm db:start`).

The app must be reachable from the internet from its first day in production, not only from the office network. The Comunicador, the team's internal chat that replaces KakaoTalk and WhatsApp between staff, is essential, and Guias use the system in the field during Viagens.

## Consequences

- The speed budgets of ADR-0003 must hold on the Pi, not only on a laptop. When the Pi is set up, the speed tests run there too.
- The app must stay light: one Node.js process, one PostgreSQL, no extra services on the Pi. External APIs are allowed only when the app keeps working without them (e.g. Gemini transcribing voice notes in the Comunicador: when it is down, the voice note still plays and is transcribed later).
- The login is built as internet-facing from the start (ADR-0005).
- How the Pi is exposed (tunnel, port forwarding or another method) and how PostgreSQL is backed up are decided when the Pi goes live.

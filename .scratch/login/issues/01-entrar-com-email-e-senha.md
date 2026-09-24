# 01: Sign in with e-mail and password, and Sair

**What to build:** A funcionário signs in on `/entrar` with e-mail and password instead of picking their name, and signs out with Sair. The "Quem é você?" screen and the year-long cookie go away. Spec: `.scratch/login/spec.md` (stories 1–10, 17, 22, 38).

The rest of the flow:
- A session is a random token in a cookie, backed by a sessions row that expires 10 hours after sign-in and never slides. The cookie is HttpOnly, SameSite=Lax, and Secure over HTTPS.
- Any page opened while signed out goes to `/entrar`. After sign-in, the person lands on the page they asked for. Only relative paths on the same site count; anything else goes to the Pipeline.
- A wrong e-mail, a wrong password or a deactivated Usuário all get "E-mail ou senha incorretos". An unknown e-mail still runs a comparison against a dummy hash.
- E-mail is the login. It is stored lowercased and trimmed; the in-progress `login` column becomes `email`.
- The Papel is read from the Usuário on every request, never stored in the session.
- The seed gives Carlos, Lia, Lidiane and Jessica e-mails and one known dev password. AGENTS.md documents the password.
- The Papel list has no Atendimento (merged into Propostas e Orçamentos, 2026-09-24). The seed gives Lidiane Propostas e Orçamentos, and makes Carlos and Hyewon Ku (Helena), who owns the company (K820), Admins.
- The e2e sign-in helper types e-mail and password, so the part 1 tests pass unchanged otherwise.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Signing in with the right e-mail and password lands on the Pipeline and shows the Usuário's name in the header.
- [ ] "Lia@CoreaLux.com " signs in as lia@corealux.com.
- [ ] A signed-out request to a Viagem goes to `/entrar`. After sign-in, it lands on that Viagem.
- [ ] A redirect target pointing to another site is ignored, and sign-in lands on the Pipeline.
- [ ] A wrong e-mail and a wrong password show the same message.
- [ ] Sair ends the session. Going back or opening a direct link then leads to `/entrar`.
- [ ] Two browser contexts can be signed in as the same Usuário at once.
- [ ] After the test clock moves 10 hours past sign-in, the next page goes to `/entrar`.
- [ ] The "Quem é você?" screen and the old cookie are gone.
- [ ] The migration question is settled: keep the regenerated initial migration only if no shared database applied the old one; otherwise add a new migration.
- [ ] `/entrar` and the redirect after sign-in are covered by a `parteN-velocidade` test within the ADR-0003 budgets.
- [ ] All existing e2e tests, `pnpm test` and `pnpm typecheck` pass.

Status: ready-for-agent

# Spec: Login, sessions and Usuários

Carries out ADR-0005 (login with e-mail and password) for a server reachable from the internet (ADR-0004). It replaces the temporary "Quem é você?" screen. It is the base that part 4 of `.scratch/catalogo-fornecedores-acesso/spec.md` (access by Papel) is built on.

## Problem Statement

Today anyone who opens Corealux OS picks a name from a list of buttons and becomes that person. There is no password, and the cookie lasts a year. That was fine on one laptop during part 1. It isn't once the app is on the internet (ADR-0004), holding clients' personal data and, soon, prices and payments.

Carlos also has no way to add a funcionário, change someone's Papel or remove someone who left without editing the database.

## Solution

Each funcionário is a **Usuário** with an e-mail, a password and one **Papel**:
- They sign in on `/entrar` with e-mail and password.
- The session lasts one working day (10 hours) or until they click **Sair**.
- A wrong e-mail and a wrong password get the same message.
- Ten wrong attempts in a row block that e-mail for 15 minutes.

**Creating Usuários:**
- The first Admin is created with a command-line script.
- After that, an Admin creates Usuários on a **Usuários** screen. Each new Usuário gets a temporary password, which they must change at their first sign-in.

**Managing Usuários:**
- An Admin changes a Papel, resets a password or deactivates a Usuário on the same screen.
- Deactivation takes effect at once: the person's open sessions end.
- Nobody is ever deleted, because Viagens and their history point to them.

## User Stories

### Signing in and out

1. As a funcionário, I want to sign in with my e-mail and password, so that only I can act as me.
2. As a funcionário, I want my e-mail accepted regardless of capitals or surrounding spaces, so that "Lia@CoreaLux.com " works the same as "lia@corealux.com".
3. As a funcionário, I want to land on the page I originally asked for after signing in, so that a link someone sent me still works.
4. As a funcionário, I want any page I open while signed out to send me to `/entrar`, so that I never see data without signing in.
5. As a funcionário, I want my session to last a whole working day (10 hours from sign-in), so that I sign in once a day.
6. As a funcionário, I want to be sent back to `/entrar` once the 10 hours are over, even if I kept working, so that a forgotten open tab doesn't stay signed in overnight.
7. As a funcionário, I want a **Sair** button that ends my session at once, so that I can leave a shared computer safely.
8. As a funcionário, I want to see my name in the header while signed in, so that I know whose session this is.
9. As a funcionário, I want to be able to sign in on my phone and my computer at the same time, so that I can work in the field and in the office.

### Wrong attempts

10. As a funcionário who mistyped, I want one generic message ("E-mail ou senha incorretos"), so that nobody can use the screen to find out which e-mails exist.
11. As Carlos, I want 10 wrong attempts in a row on one e-mail to block it for 15 minutes, so that passwords can't be guessed from the internet.
12. As a funcionário whose e-mail is blocked, I want a message saying to try again in 15 minutes, so that I know it's temporary and not a wrong password.
13. As Carlos, I want the block to apply to e-mails that don't exist too, with the same messages, so that the block itself doesn't reveal which e-mails exist.
14. As a funcionário, I want a correct sign-in to reset my count of wrong attempts, so that old typos don't add up across days.
15. As a funcionário, I want the right password to still fail while I'm blocked, so that the block can't be bypassed by guessing right on attempt 11.
16. As a deactivated person, I want my sign-in refused with the same generic message, so that nothing is revealed about my Usuário.

### Passwords

17. As a funcionário, I want any password of at least 8 characters to be accepted, with no symbol rules, so that I can use a long phrase I remember.
18. As a funcionário, I want to change my own password by giving the current one and the new one twice, so that only I can change it and typos are caught.
19. As a funcionário, I want changing my password to end my other sessions and keep this one, so that a leaked password stops working everywhere.
20. As a new Usuário, I want to be asked to choose my own password right after my first sign-in with the temporary one, before I can open anything else, so that the temporary one is used only once.
21. As a funcionário whose password was reset, I want the same forced change at my next sign-in, so that the Admin never knows my real password.
22. As Carlos, I want passwords stored only as salted hashes, so that a copy of the database doesn't reveal them.

### Usuários (Admin)

23. As Carlos, I want a Usuários screen listing everyone with name, e-mail, Papel and whether they are active, so that I see who has access.
24. As Carlos, I want to create a Usuário with name, e-mail and Papel, and be shown a temporary password once, so that I can pass it on to the new funcionário.
25. As Carlos, I want a clear error when the e-mail is already used by another Usuário (active or not), so that two people never share a login.
26. As Carlos, I want to change a Usuário's Papel, and have their next page load reflect it without signing them out, so that someone who starts guiding sees the right screens right away (ADR-0005).
27. As Carlos, I want to reset a Usuário's password to a new temporary one, shown to me once, which also ends their open sessions, so that I can help someone who forgot theirs.
28. As Carlos, I want to deactivate a Usuário and have all their sessions end at once, so that someone who leaves loses access immediately.
29. As Carlos, I want to reactivate a deactivated Usuário, so that someone returning keeps their history.
30. As Carlos, I want a deactivated Usuário to still appear by name in the Viagens, notes and history they took part in, so that the past stays readable.
31. As Carlos, I want deactivated Usuários left out of pickers such as Responsável, so that no new work is assigned to them.
32. As Carlos, I want the system to refuse to deactivate or demote the last active Admin, so that nobody can lock the company out of its own system.
33. As a funcionário who isn't Admin, I want the Usuários screen hidden from my menu, so that the app stays simple.
34. As Carlos, I want the Usuários screen and its commands refused on the server for any non-Admin, even when called directly, so that hiding the menu isn't the only protection.

### First Admin

35. As whoever installs Corealux OS, I want a command-line script that creates the first Admin from a name, e-mail and password, so that the system can be started with no self-service sign-up.
36. As whoever installs it, I want that script to refuse when an active Admin already exists, so that it can't be used as a back door later.
37. As whoever installs it, I want the script to apply the same e-mail and password rules as the screens, so that the first Admin isn't the weak one.

### Development

38. As a developer, I want the seed to create the usual Usuários (Carlos, Lia, Lidiane, Jessica) with e-mails and one known dev password, so that local work and tests can sign in.

## Implementation Decisions

**The Acesso module** owns Usuários, passwords, sessions and wrong attempts. It exposes a small interface, and the routes only call it:
- **Sign in:** e-mail, password and now → a session, or a refusal (generic, or blocked).
- **Signed-in Usuário:** request and now → the Usuário and whether they must change their password.
- **Sair:** ends one session.
- **Change own password.**
- **Admin commands:** create, change Papel, reset password, deactivate, reactivate, list.

Every command receives the acting Usuário and checks their Papel inside the module (catalogo spec: checked at every command and read).

**Usuário fields:**
- nome;
- e-mail, unique and stored lowercased and trimmed. This is the login, per ADR-0005. The work in progress calls this column `login`; it becomes `email`;
- senha hash;
- Papel;
- ativo;
- deve trocar senha.

**Hashing:** scrypt with a random salt, stored as one self-describing string (algorithm, salt, hash). The comparison runs in constant time. When the e-mail is unknown, a comparison against a dummy hash still runs, so response time doesn't reveal whether an e-mail exists.

**Sessions:**
- Stored in the database. The cookie carries only a random token of at least 32 bytes.
- Each session has an absolute expiry 10 hours after sign-in. It never slides.
- The cookie is HttpOnly, SameSite=Lax and Path=/, marked Secure when the request came over HTTPS, and has no Max-Age beyond the session's expiry.
- Sair deletes the session row.
- Deactivating a Usuário or resetting their password deletes all their sessions. Changing one's own password deletes all their sessions except the current one.
- Expired rows are deleted when they're found.
- The Papel is read from the Usuário on every request, never stored in the session, so a Papel change applies on the next request with no sign-out.

**Wrong attempts:**
- Tracked per normalized e-mail, whether or not a Usuário has it: count of consecutive failures and blocked-until.
- The 10th consecutive failure sets blocked-until to now + 15 minutes. While blocked, every attempt is refused with the blocked message and doesn't touch the count. When the block ends, the count starts again from zero.
- A success clears the record.
- Rules come from the server's single clock (now), so the test clock moves them.
- These values (10, 15 min, 10 h, 8 characters) are fixed in code for now. They come from ADR-0005, not from a Tabela de referência.

**Temporary passwords** are generated by the system. They are readable (no ambiguous characters), at least 12 characters, and shown to the Admin once, never stored in plain text. While deve trocar senha is set, every page redirects to the change-password screen, except the screen itself and Sair.

**Redirect after sign-in:** `/entrar` carries the originally requested path. Only same-site relative paths are accepted; anything else goes to the Pipeline.

**Access to the Usuários screen:** non-Admin requests to it or its commands get a 404, as if it didn't exist (story 37 of the catalogo spec: hidden rather than errors). The full per-Papel matrix for other screens stays in part 4 of the catalogo spec.

**Last active Admin:** deactivating them, or changing their Papel away from Admin, is refused with a message.

**Deactivated Usuários** keep their rows. Lists of people for new assignments (Responsável and so on) show active Usuários only. Existing history keeps showing their names.

**First-Admin script:**
- A package script that takes nome, e-mail and password, and writes to the database named by the database URL.
- It refuses when any active Admin exists.
- It uses the Acesso module, so the rules are the same.

**Seed and migration:**
- The seed gives each seed Usuário an e-mail and a shared known dev password, documented in AGENTS.md. The seed never runs in production.
- The schema adds the Usuário fields, a sessions table and a wrong-attempts table. The in-progress change regenerated the initial migration instead of adding one. That is acceptable only while no shared database has applied it; otherwise add a new migration.

**Removed:** the "Quem é você?" screen and the year-long `usuario` cookie.

**Other screens:**
- Screen text is in português, following ADR-0006 for when coreano arrives.
- The speed budgets of ADR-0003 apply to `/entrar` like any other screen.

## Testing Decisions

- **One seam: the app from outside.** Playwright drives the production build against the real test database, as in the existing `parte1-*.spec.ts` files. It checks what the person sees and reaches, and never reads the database directly or mocks our own modules.
- **Time** moves with the existing test clock cookie, so the 10-hour expiry and the 15-minute block are tested through the app.
- **The first-Admin script** is run as a child process from the test against the test database; then the new Admin signs in through the UI. Its refusal when an Admin exists is checked from its exit code and message.
- **The existing senha unit test stays** as it is. No other unit seam is added.
- **The shared sign-in helper** in the e2e support file changes from clicking a name to typing e-mail and the dev password, so the part 1 tests keep passing unchanged otherwise.
- **Vertical tests** in one file for this spec, following the `parteN-*` naming:
  - Sign in with the right password lands on the Pipeline. The original link is honoured, and an external redirect is refused.
  - A wrong e-mail and a wrong password show the same message.
  - 10 wrong attempts block the e-mail. The right password still fails. After 15 minutes on the clock, it works. An unknown e-mail blocks the same way.
  - Sair ends the session. The back button and a direct link go to `/entrar`.
  - After 10 hours on the clock, the next page goes to `/entrar`.
  - Admin creates a Usuário. The temporary password forces a change before anything else. The new password works and the temporary one doesn't.
  - Passwords under 8 characters are refused on change.
  - A duplicate e-mail is refused on create.
  - A Papel change applies on the other person's next page load without signing them out (checked by the Usuários menu appearing or disappearing).
  - Deactivation ends an open session in another browser context. The deactivated person can't sign in, and still shows by name on a Viagem they handled, but not in the Responsável picker.
  - A password reset ends sessions and forces a change.
  - Changing one's own password ends the other context's session and keeps this one.
  - A non-Admin gets 404 on the Usuários screen and on its commands sent as raw requests.
  - The last active Admin can't be deactivated or demoted.
- **Speed:** `/entrar` and the redirect after sign-in join the existing speed-budget file pattern (`parteN-velocidade`).
- **The transversal test is written last:**
  1. The script creates Carlos as Admin, and Carlos signs in.
  2. He creates Lia (Propostas), who signs in from a second browser, changes her temporary password and creates a Viagem.
  3. Carlos changes her Papel to Itinerários e Produtos, and her next page shows it.
  4. Carlos deactivates her. Her open page goes to `/entrar` on the next click, and her Viagem still shows her name.

## Out of Scope

- OAuth or Google sign-in (ADR-0005 says it may come later, beside this).
- Password recovery by e-mail or any self-service sign-up. The Admin resets.
- Two-factor authentication, IP-based rate limiting and a list of active sessions per Usuário.
- The per-Papel access matrix for the other screens, the Guiamento restriction to its own Alocações, and the record of who viewed Dados de viagem. These are part 4 of the catalogo spec.
- Linking a Usuário to a Profissional (required for Guiamento per CONTEXT.md). Profissionais don't exist in the system yet; the link comes with them.
- HTTPS termination and hosting setup on the Raspberry Pi (ADR-0004).

## Further Notes

- Work in progress to build on: the Acesso module already has password hashing and comparison with a unit test. The schema already adds the password hash, ativo, unique login and a sessions table.
- The glossary already defines Usuário and Papel (CONTEXT.md). Use "Usuário" for the person and "e-mail" for the login field; CONTEXT.md avoids "login" and "conta" for the person.
- ADR-0005's "no forced sign-out on a Papel change" and "deactivating ends sessions at once" are both covered by reading the Usuário and Papel on every request, instead of keeping them in the session.

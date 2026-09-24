# 03: Script that creates the first Admin

**What to build:** A command-line package script creates the first Admin, so a new installation can start with no self-service sign-up. Spec: `.scratch/login/spec.md` (stories 35–37).

What the script does:
- Takes nome, e-mail and password, and writes to the database named by the database URL.
- Applies the same e-mail and password rules as the screens: at least 8 characters, e-mail unique and normalized.
- Refuses with a clear message and a non-zero exit code when any active Admin already exists.
- Goes through the Acesso module, never straight to the database.

**Blocked by:** 01 (Sign in with e-mail and password, and Sair).

**Status:** ready-for-agent

- [ ] The e2e test empties the Usuários, runs the script as a child process against the test database, then signs in as the new Admin through the UI.
- [ ] Running the script again when an active Admin exists fails with a non-zero exit code and a message, and creates nothing.
- [ ] A password under 8 characters, or an e-mail already in use, is refused.
- [ ] AGENTS.md documents how to run it.

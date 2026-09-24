# 06: Change Papel and reset password

**What to build:** On the Usuários screen, an Admin changes someone's Papel and resets someone's password. Spec: `.scratch/login/spec.md` (stories 21, 26, 27, part of 32).

What each command does:
- **Papel change:** takes effect on the person's next page load, with no sign-out (ADR-0005).
- **Reset:** generates a new temporary password, shows it to the Admin once, sets "deve trocar senha" and ends all the person's sessions.
- **Last active Admin:** changing their Papel away from Admin is refused.

**Blocked by:** 05 (Usuários screen: list and create, with a temporary password).

**Status:** ready-for-agent

- [ ] Lia is signed in as Propostas in a second browser context. The Admin changes her Papel to Admin, and her next page shows the Usuários menu item without a new sign-in. Changing it back hides the item again.
- [ ] After a reset, Lia's open context goes to `/entrar`. Her old password fails, and the temporary one leads to the forced change.
- [ ] Demoting the only active Admin is refused with a message.
- [ ] Both commands, sent as raw requests by a non-Admin, get a 404.

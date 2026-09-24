# 04: Change your own password

**What to build:** Any signed-in Usuário can change their password from a screen they reach from the header. They give the current password and the new one twice. Spec: `.scratch/login/spec.md` (stories 17–19).

The rules:
- The new password needs at least 8 characters, with no symbol rules.
- The current password must be right, and the two copies of the new one must match.
- Changing it ends all the Usuário's other sessions and keeps the current one.

**Blocked by:** 01 (Sign in with e-mail and password, and Sair).

**Status:** ready-for-agent

- [ ] After a change, the new password signs in and the old one doesn't.
- [ ] A wrong current password, a new password under 8 characters, or two copies that don't match are each refused with a message, and nothing changes.
- [ ] With two browser contexts signed in as the same Usuário, a change in one sends the other to `/entrar` on its next page, while the first stays signed in.

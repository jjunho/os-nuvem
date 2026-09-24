# 07: Deactivate and reactivate a Usuário

**What to build:** An Admin deactivates a Usuário who left and reactivates one who returned. A Usuário is never deleted. Spec: `.scratch/login/spec.md` (stories 16, 28–32).

What deactivation does:
- It deletes all the Usuário's sessions at once.
- A deactivated Usuário can't sign in, and gets the generic "E-mail ou senha incorretos".
- They keep appearing by name in the Viagens, Notas and Responsável history they took part in.
- Pickers for new assignments, such as Responsável on a Viagem, list active Usuários only.
- Deactivating the last active Admin is refused.

**Blocked by:** 05 (Usuários screen: list and create, with a temporary password).

**Status:** ready-for-agent

- [ ] Lia is signed in and responsible for a Viagem. The Admin deactivates her, and her open context goes to `/entrar` on its next page.
- [ ] Lia's sign-in is refused with the generic message.
- [ ] The Viagem still shows Lia in its Responsável history, and Lia no longer appears in the Responsável picker.
- [ ] After reactivation, Lia signs in with her password and appears in the picker again.
- [ ] Deactivating the only active Admin is refused with a message.
- [ ] The command, sent as a raw request by a non-Admin, gets a 404.

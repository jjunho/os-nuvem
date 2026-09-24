# 05: Usuários screen: list and create, with a temporary password

**What to build:** An Admin sees all Usuários (name, e-mail, Papel, active or not) and creates new ones. A new Usuário gets a system-generated temporary password, shown to the Admin once. At first sign-in, the Usuário must choose their own password before opening anything else. Spec: `.scratch/login/spec.md` (stories 20, 23–25, 33, 34).

How it works:
- The temporary password is readable (no ambiguous characters), at least 12 characters long, and stored only as a hash.
- The Usuário gets a "deve trocar senha" flag. While it is set, every page redirects to the change-password screen from 04, except that screen itself and Sair. The flag clears once the Usuário picks a new password.
- The screen and its commands exist only for Admin. Everyone else gets no menu item, and a 404 on the page and on raw requests to its commands. The Acesso module checks the acting Usuário's Papel inside every command.

**Blocked by:** 04 (Change your own password).

**Status:** ready-for-agent

- [ ] The Admin creates Lia (Propostas) and sees her temporary password once; reloading the page doesn't show it again.
- [ ] Lia signs in with the temporary password and is taken to the change-password screen. Any other URL sends her back there until she changes it.
- [ ] After the change, Lia reaches the Pipeline. Her new password works, and the temporary one doesn't.
- [ ] Creating a Usuário whose e-mail is already in use, active or not, is refused with a message.
- [ ] A Propostas Usuário sees no Usuários menu item, and gets a 404 on the page and on a raw POST to create.

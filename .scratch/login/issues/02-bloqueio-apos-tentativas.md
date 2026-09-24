# 02: Block after 10 wrong attempts

**What to build:** Ten wrong attempts in a row on one e-mail block it for 15 minutes, so passwords can't be guessed from the internet. The block works the same for e-mails nobody has, so it doesn't reveal which e-mails exist. Spec: `.scratch/login/spec.md` (stories 11–15).

How the block works:
- Attempts are tracked per normalized e-mail: the count of consecutive failures and a blocked-until time.
- The 10th failure blocks the e-mail until now + 15 minutes. While blocked, every attempt is refused with "try again in 15 minutes", including the right password, and the count doesn't change. When the block ends, the count starts again from zero.
- A success clears the record.
- Everything reads the server clock, so the test clock drives it.

**Blocked by:** 01 (Sign in with e-mail and password, and Sair).

**Status:** ready-for-agent

- [ ] 9 wrong attempts followed by the right password signs in, and the count resets.
- [ ] After 10 wrong attempts, the 11th attempt with the right password is refused with the blocked message.
- [ ] After the test clock moves 15 minutes, the right password signs in.
- [ ] An e-mail that belongs to no Usuário blocks after 10 attempts with the same messages.
- [ ] Blocking one e-mail doesn't affect sign-in for another.

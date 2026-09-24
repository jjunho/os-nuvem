# Login with e-mail and password

Each Usuário signs in with their e-mail and a password stored as a salted hash. This is the simplest method that works on a self-hosted server with no external dependency (ADR-0004). OAuth, e.g. a Google account, may come later and would sit beside it, not replace it; using the e-mail as login makes that match easy.

Because the app is reachable from the internet (ADR-0004), the login is built for it from the start.

## Consequences

- Each Usuário has an e-mail, a password hash and one Papel. The Admin changes a Papel when someone's work changes (e.g. while guiding); only the app's view changes, with no history and no forced sign-out. Access by Papel is checked on every request (Catálogo, Fornecedores e Acesso spec).
- A session lasts 10 hours from sign-in, one working day. Sair ends it earlier.
- Passwords have at least 8 characters, with no symbol rules. After 10 wrong attempts in a row, that login is blocked for 15 minutes. The error never says whether the e-mail or the password was wrong. Cookies are Secure when served over HTTPS.
- Only funcionários get a Usuário; outside Profissionais never sign in.
- There is no self-service sign-up. The first Admin is created with a command-line script. An Admin creates Usuários and resets passwords to a temporary one, which must be changed at the next sign-in; anyone can change their own password.
- A Usuário is deactivated, never deleted. Deactivating ends their sessions at once.
- The temporary "pick who you are" screen is replaced by this login.

# Login with user and password

Staff sign in with a login and a password stored as a salted hash. This is the simplest method that works on a local server with no external dependency (ADR-0004). OAuth, e.g. a Google account, may come later and would sit beside it, not replace it.

## Consequences

- Each staff member has a login, a password hash and one Papel. Access by Papel is checked on every request (Catálogo, Fornecedores e Acesso spec).
- The temporary "pick who you are" screen is replaced by this login.
- An Admin creates users and resets passwords. There is no self-service sign-up.

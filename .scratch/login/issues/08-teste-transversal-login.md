# 08: Test that runs the whole login flow in one scenario

**What to build:** The end-of-spec transversal test that runs the whole login flow as one story, with each step checking what that person sees. Spec: `.scratch/login/spec.md` (Testing Decisions).

The steps:
1. The script creates Carlos as Admin, and he signs in.
2. He creates Lia (Propostas). Lia signs in from a second browser context, changes her temporary password and creates a Viagem.
3. Carlos changes Lia's Papel to Itinerários e Produtos, and her next page reflects it.
4. Carlos deactivates Lia. Her open page goes to `/entrar` on the next click, and her Viagem still shows her name.

Along the way, the test also makes wrong attempts until the e-mail is blocked, and checks the block.

**Blocked by:** 02 (Block after 10 wrong attempts), 03 (Script that creates the first Admin), 06 (Change Papel and reset password), 07 (Deactivate and reactivate a Usuário).

**Status:** ready-for-agent

- [ ] One transversal e2e test runs the steps above against the production build and test database, and passes.
- [ ] All vertical and speed tests of this spec, and the part 1 tests, still pass.

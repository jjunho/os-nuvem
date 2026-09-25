# 01: Idioma da interface and the PT/KO catalogue

**What to build:** Each Usuário picks their Idioma da interface, português or coreano, and every screen follows it (ADR-0006). This is the prefactor the whole Comunicador builds on: no Comunicador string is written directly in a component. The screens already built (login, Viagem part 1) have their strings moved into the translation catalogue, in both languages. Client-facing documents keep following the Idioma do cliente. Spec: `.scratch/comunicador/spec.md` (story 99, Implementation Decisions: Interface language).

**Blocked by:** Login 01 (Sign in with e-mail and password, and Sair).

**Status:** done

- [x] A Usuário has an Idioma da interface, português by default, and can change it themselves.
- [x] The seed includes at least one Korean-preferring Usuário (Eun Bee and Hyewon Ku (Helena) prefer Korean, per ADR-0006).
- [x] Every string of the existing screens (login, Pipeline, Viagem, busca) goes through the catalogue, in both languages.
- [x] A Korean-preferring Usuário sees the Pipeline and a Viagem in Korean; the others see Portuguese.
- [x] A missing key fails `pnpm typecheck` or a unit test, rather than showing a blank on screen.
- [x] The part 1 tests pass unchanged, apart from being run in Portuguese.
- [x] `pnpm test`, `pnpm test:e2e` and `pnpm typecheck` pass.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-parte7-instalacao.spec.ts e testes existentes de idioma. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.

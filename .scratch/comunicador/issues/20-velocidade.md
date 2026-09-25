# 20: Speed budgets

**What to build:** The Comunicador keeps the ADR-0003 budgets on a realistic volume. `comunicador-velocidade.spec.ts` runs against a database seeded in bulk SQL with tens of Usuários, hundreds of conversations and hundreds of thousands of Mensagens. Spec: `.scratch/comunicador/spec.md` (Testing Decisions: Speed budgets).

**Blocked by:** 06 (Reading status and loading older Mensagens), 07 (Search).

**Status:** done

- [x] A sent Mensagem is visible in its sender's window within 100 ms.
- [x] It is visible in another Usuário's window within 300 ms.
- [x] Opening a conversation takes under 300 ms.
- [x] The latest page of Mensagens and a search are each a server read within 100 ms.
- [x] Any index or query change needed to meet these lands with the test.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-velocidade.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.

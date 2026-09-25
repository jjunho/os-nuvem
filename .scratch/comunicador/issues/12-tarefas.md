# 12: Tarefas replace Próximas ações

**What to build:** The Tarefa generalizes the Próxima ação. A Tarefa has a title, description, one Responsável, a Prazo, people in copy, an optional Viagem and a `TAR-…` code. It is open, concluída or cancelada (with who and why), and can be reopened. A Tarefas list defaults to "Minhas Tarefas", filtered by Responsável, by copy, by Viagem and by overdue Prazo. The Viagens module stops owning Próximas ações. A Viagem's Próxima ação becomes its open Tarefa with the earliest Prazo. The automatic "responder" and follow-up items are created as Tarefas. Guiamento sees only the Tarefas it owns or is copied on. Spec: `.scratch/comunicador/spec.md` (stories 60–63, 65, 66, 71–74; Tarefas).

The Tarefas interface is built so the Quadros spec can place Tarefas on lists, and turn the automatic ones into Tarefas da etapa, without changing it. The migration moves existing `proximas_acoes` rows into Tarefas with the same Responsável, Prazo and Viagem.

**Blocked by:** Login 01 (Sign in with e-mail and password, and Sair).

**Status:** done

- [x] Create a Tarefa with copy and a Prazo, and get a unique TAR code.
- [x] Mark it concluída, reopen it, and cancel it with a reason. Each change records who.
- [x] The list defaults to Minhas Tarefas. The filters by Responsável, copy, Viagem and overdue work.
- [x] A new Viagem gets its automatic "responder" Tarefa. Follow-ups keep their existing rules.
- [x] A Viagem's Próxima ação is its earliest open Tarefa. The pipeline's overdue view still works.
- [x] Existing rows migrate. The Viagem spec's part 1 tests pass unchanged, apart from wording that now says Tarefa.
- [x] Guiamento sees only its own and copied Tarefas, and is refused others by URL.
- [x] Strings in PT and KO. Vertical tests in `comunicador-parte4-*.spec.ts`.

## Comments

2026-09-25: implementado e revisado. Verificação: comunicador-parte4-tarefas.spec.ts. Detalhes de operação e configuração em `docs/execucao-comunicador.md`.

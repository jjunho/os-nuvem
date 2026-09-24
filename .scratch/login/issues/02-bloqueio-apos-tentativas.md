# 02: Block after 10 wrong attempts

**What to build:** Ten wrong attempts in a row on one e-mail block it for 15 minutes, so passwords can't be guessed from the internet. The block works the same for e-mails nobody has, so it doesn't reveal which e-mails exist. Spec: `.scratch/login/spec.md` (stories 11–15).

How the block works:
- Attempts are tracked per normalized e-mail: the count of consecutive failures and a blocked-until time.
- The 10th failure blocks the e-mail until now + 15 minutes. While blocked, every attempt is refused with "try again in 15 minutes", including the right password, and the count doesn't change. When the block ends, the count starts again from zero.
- A success clears the record.
- Everything reads the server clock, so the test clock drives it.

**Blocked by:** 01 (Sign in with e-mail and password, and Sair).

**Status:** resolved

- [x] 9 wrong attempts followed by the right password signs in, and the count resets.
- [x] After 10 wrong attempts, the 11th attempt with the right password is refused with the blocked message.
- [x] After the test clock moves 15 minutes, the right password signs in.
- [x] An e-mail that belongs to no Usuário blocks after 10 attempts with the same messages.
- [x] Blocking one e-mail doesn't affect sign-in for another.

## Comments

### 2026-09-24 — execução parcial dos tickets 01–03

Não implementado nesta execução. O módulo Acesso ainda não persiste tentativas nem bloqueia e-mails. Nenhum teste de bloqueio foi escrito ou executado. Execução interrompida ao conferir consumo acima do orçamento solicitado; consultar evidências e estado parcial no ticket 01. Todos os critérios permanecem pendentes.

### 2026-09-24 — retomada e conclusão dos tickets 01–03

Bloqueio concluído em Acesso com tabela por e-mail normalizado e transação serializada por e-mail. `tests/e2e/parte2-login.spec.ts` comprova: nove erros + sucesso zeram contagem; décima falha bloqueia; senha correta é recusada até 14m59s; aos 15m entra; tentativas bloqueadas não prolongam o prazo; e-mail desconhecido tem as mesmas mensagens; outro e-mail continua entrando; após expiração a contagem reinicia; dez tentativas simultâneas também bloqueiam.

O relógio é o `now(request)` existente. Teste vermelho observado antes da implementação; um problema de sincronização no teste foi corrigido aguardando a resposta da entrada antes de avançar o relógio.

Verificação final: `pnpm test:e2e` — **31 passed (25.8s)**, incluindo todos os testes da parte 1 e velocidade; `pnpm test` — **13 passed**, em 2 arquivos; `pnpm typecheck` — exit 0; `git diff --check` — exit 0. Evidências observadas em 2026-09-24, na build de produção com PostgreSQL real. Logs locais: `/tmp/login-full.log`, `/tmp/login-unit.log`, `/tmp/login-types.log`.

Revisão Matt Pocock em dois agentes independentes, contra a base `e7bd180e6379590c515324835a234df8031f097d`: **Standards:** 0 violações/heurísticas acionáveis. **Spec:** 1 P2 (seed executável em produção), corrigido e confirmado pelo revisor; teste observou vermelho antes da guarda e verde na suíte final. Nenhum achado pendente.

Escopo concluído: este ticket. Implementações parciais, impedimentos e verificações pendentes neste escopo: nenhum. Tickets 04–08 (gestão de Usuários/troca de senha/transversal completo) não fazem parte desta entrega. As notas anteriores descrevem o estado histórico, superado por esta verificação. O limite agregado atualizado de 200.000 tokens foi ultrapassado (consulta final: 224.693); nenhuma conclusão funcional depende dessa contagem.

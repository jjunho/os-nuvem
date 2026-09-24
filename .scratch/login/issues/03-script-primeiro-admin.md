# 03: Script that creates the first Admin

**What to build:** A command-line package script creates the first Admin, so a new installation can start with no self-service sign-up. Spec: `.scratch/login/spec.md` (stories 35–37).

What the script does:
- Takes nome, e-mail and password, and writes to the database named by the database URL.
- Applies the same e-mail and password rules as the screens: at least 8 characters, e-mail unique and normalized.
- Refuses with a clear message and a non-zero exit code when any active Admin already exists.
- Goes through the Acesso module, never straight to the database.

**Blocked by:** 01 (Sign in with e-mail and password, and Sair).

**Status:** resolved

- [x] The e2e test empties the Usuários, runs the script as a child process against the test database, then signs in as the new Admin through the UI.
- [x] Running the script again when an active Admin exists fails with a non-zero exit code and a message, and creates nothing.
- [x] A password under 8 characters, or an e-mail already in use, is refused.
- [x] AGENTS.md documents how to run it.

## Comments

### 2026-09-24 — execução parcial dos tickets 01–03

Não implementado nesta execução. Não existe ainda o comando de criação do primeiro Admin nem sua validação/teste como processo filho. Helena e Carlos no seed de desenvolvimento não substituem este comando. Execução interrompida ao conferir consumo acima do orçamento solicitado; consultar evidências e estado parcial no ticket 01. Todos os critérios permanecem pendentes.

### 2026-09-24 — retomada e conclusão dos tickets 01–03

Primeiro Admin concluído: `pnpm admin:criar "Nome" "email@exemplo.com" "senha"`, usando DATABASE_URL e exclusivamente a interface Acesso para regras/escrita. O módulo normaliza e-mail, exige nome/e-mail válido e senha de pelo menos 8 caracteres, recusa e-mail já usado e qualquer Admin ativo, com transação que serializa o bootstrap.

`tests/e2e/parte2-login.spec.ts` executa o package script como processo filho no banco de testes, após esvaziar Usuários, e comprova pela UI a entrada do Admin criado. Também comprova saída não zero/mensagem e ausência de criação na segunda execução, senha com 7 caracteres recusada e 8 aceita, e-mail inválido/duplicado (ativo e inativo), recusa sem substituir credenciais e concorrência de dois processos criando exatamente um Admin. AGENTS.md documenta o comando e o uso administrativo dos argumentos.

Verificação final: `pnpm test:e2e` — **31 passed (25.8s)**, incluindo todos os testes da parte 1 e velocidade; `pnpm test` — **13 passed**, em 2 arquivos; `pnpm typecheck` — exit 0; `git diff --check` — exit 0. Evidências observadas em 2026-09-24, na build de produção com PostgreSQL real. Logs locais: `/tmp/login-full.log`, `/tmp/login-unit.log`, `/tmp/login-types.log`.

Revisão Matt Pocock em dois agentes independentes, contra a base `e7bd180e6379590c515324835a234df8031f097d`: **Standards:** 0 violações/heurísticas acionáveis. **Spec:** 1 P2 (seed executável em produção), corrigido e confirmado pelo revisor; teste observou vermelho antes da guarda e verde na suíte final. Nenhum achado pendente.

Escopo concluído: este ticket. Implementações parciais, impedimentos e verificações pendentes neste escopo: nenhum. Tickets 04–08 (gestão de Usuários/troca de senha/transversal completo) não fazem parte desta entrega. As notas anteriores descrevem o estado histórico, superado por esta verificação. O limite agregado atualizado de 200.000 tokens foi ultrapassado (consulta final: 224.693); nenhuma conclusão funcional depende dessa contagem.

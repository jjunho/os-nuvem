# 01: Sign in with e-mail and password, and Sair

**What to build:** A funcionário signs in on `/entrar` with e-mail and password instead of picking their name, and signs out with Sair. The "Quem é você?" screen and the year-long cookie go away. Spec: `.scratch/login/spec.md` (stories 1–10, 17, 22, 38).

The rest of the flow:
- A session is a random token in a cookie, backed by a sessions row that expires 10 hours after sign-in and never slides. The cookie is HttpOnly, SameSite=Lax, and Secure over HTTPS.
- Any page opened while signed out goes to `/entrar`. After sign-in, the person lands on the page they asked for. Only relative paths on the same site count; anything else goes to the Pipeline.
- A wrong e-mail, a wrong password or a deactivated Usuário all get "E-mail ou senha incorretos". An unknown e-mail still runs a comparison against a dummy hash.
- E-mail is the login. It is stored lowercased and trimmed; the in-progress `login` column becomes `email`.
- The Papel is read from the Usuário on every request, never stored in the session.
- The seed gives Carlos, Lia, Lidiane and Jessica e-mails and one known dev password. AGENTS.md documents the password.
- The Papel list has no Atendimento (merged into Propostas e Orçamentos, 2026-09-24). The seed gives Lidiane Propostas e Orçamentos, and makes Carlos and Hyewon Ku (Helena), who owns the company (K820), Admins.
- The e2e sign-in helper types e-mail and password, so the part 1 tests pass unchanged otherwise.

**Blocked by:** None (can start immediately).

**Status:** resolved

- [x] Signing in with the right e-mail and password lands on the Pipeline and shows the Usuário's name in the header.
- [x] "Lia@CoreaLux.com " signs in as lia@corealux.com.
- [x] A signed-out request to a Viagem goes to `/entrar`. After sign-in, it lands on that Viagem.
- [x] A redirect target pointing to another site is ignored, and sign-in lands on the Pipeline.
- [x] A wrong e-mail and a wrong password show the same message.
- [x] Sair ends the session. Going back or opening a direct link then leads to `/entrar`.
- [x] Two browser contexts can be signed in as the same Usuário at once.
- [x] After the test clock moves 10 hours past sign-in, the next page goes to `/entrar`.
- [x] The "Quem é você?" screen and the old cookie are gone.
- [x] The migration question is settled: keep the regenerated initial migration only if no shared database applied the old one; otherwise add a new migration.
- [x] `/entrar` and the redirect after sign-in are covered by a `parteN-velocidade` test within the ADR-0003 budgets.
- [x] All existing e2e tests, `pnpm test` and `pnpm typecheck` pass.

## Comments

### 2026-09-24 — execução parcial dos tickets 01–03

Implementação parcial nesta execução, interrompida ao consultar o consumo: a ferramenta do objetivo reportou 73.905 tokens, acima do orçamento solicitado de 20.000, sem limite automático configurado. Nenhum critério foi marcado concluído globalmente.

Entregue no workspace: entrada por e-mail normalizado e senha com scrypt existente; token aleatório de 32 bytes; consulta de sessão com expiração absoluta e Usuário/Papel atual; cookie HttpOnly/SameSite=Lax; retorno relativo; seed com e-mails, senha de desenvolvimento `corealux123`, Lidiane em Propostas e Helena Admin; migração incremental `0001_careful_sleeper.sql`, preservando a inicial, renomeando login e convertendo Atendimento. Dados retornados às páginas deixam de incluir hashes.

Evidências executadas:
- Baseline: `pnpm typecheck` falhou porque o seed não preenchia login/senhaHash. Corrigido.
- Primeiro teste vertical observado vermelho na tela antiga “Quem é você?”.
- `pnpm typecheck` passou após implementação da entrada.
- `pnpm test:e2e tests/e2e/parte2-login.spec.ts`: 1 teste passou naquele momento (e-mail normalizado, Pipeline e nome Lia), incluindo aplicação da migração no banco de testes.
- Depois foram adicionados testes de sessões, redirecionamentos e erros. `pnpm test:e2e tests/e2e/parte2-login.spec.ts -g 'Sair invalida'` falhou aguardando o botão Sair, ainda ausente.

Pendências: rota e botão Sair (a função de exclusão existe no módulo, sem integração); executar os demais novos testes; testes de velocidade, cookie HTTPS, Usuário desativado e leitura atual do Papel; suíte existente completa, unitários e typecheck final; documentar senha/comando em AGENTS.md; revisão independente em dois eixos e commit. A remoção do cookie antigo significa que ele não autentica; não foi implementada a limpeza explícita de cookies antigos no navegador. Migração incremental aplicada no banco de teste; migração de outras instalações/versões históricas não foi verificada. Os testes novos não executados não constituem evidência.

Alterações preexistentes em AGENTS.md e arquivos não rastreados foram preservadas. Sem commit nesta execução.

### 2026-09-24 — retomada e conclusão dos tickets 01–03

Entrada/sessões/Sair concluídos e comprovados em `tests/e2e/parte2-login.spec.ts`: normalização do e-mail, nome no Pipeline, retorno à Viagem, recusa de destinos externos, erro genérico, cookie legado sem poder de autenticação, revogação de token copiado, botão voltar, duas sessões, expiração absoluta, Usuário inativo, Papel atual, ausência de hashes nos dados enviados, rotas/comandos diretos protegidos e cookie Secure atrás de proxy HTTPS. Inspeção do módulo confirma scrypt com comparação constante, hash simulado para desconhecidos/inativos, token aleatório de 32 bytes, exclusão de sessões expiradas e leitura do Papel no Usuário.

`tests/e2e/parte2-velocidade.spec.ts` passou com 5.000 Viagens: leitura <100 ms, navegação/entrada <300 ms e feedback <100 ms. O teste antigo que avança 24 horas passou após entrar novamente no dia seguinte; o relógio agora é fixado antes da entrada na preparação da parte 1. As verificações originais da Viagem foram mantidas.

Migração resolvida conservadoramente, sem presumir ausência de banco compartilhado: restaurada `0000_left_virginia_dare.sql` original; acrescentadas `0001_acesso.sql`, `0002_careful_sleeper.sql` e `0003_keen_black_panther.sql`. Testes migraram banco vazio e banco da versão original com histórico, criaram Admin via script e verificaram entrada e preservação de vínculos pela UI. O caminho intermediário com login/hash/sessões é tratado com DDL condicional. Usuários legados sem credenciais ficam inativos e preservados, com e-mail reservado; procedimento documentado em AGENTS.md. Nenhum banco de produção foi alterado.

Seed e comando documentados em AGENTS.md; seed recusado em produção antes da limpeza, salvo TEST_MODE explícito. A proteção foi comprovada por processo filho e dados preservados pela UI.

Verificação final: `pnpm test:e2e` — **31 passed (25.8s)**, incluindo todos os testes da parte 1 e velocidade; `pnpm test` — **13 passed**, em 2 arquivos; `pnpm typecheck` — exit 0; `git diff --check` — exit 0. Evidências observadas em 2026-09-24, na build de produção com PostgreSQL real. Logs locais: `/tmp/login-full.log`, `/tmp/login-unit.log`, `/tmp/login-types.log`.

Revisão Matt Pocock em dois agentes independentes, contra a base `e7bd180e6379590c515324835a234df8031f097d`: **Standards:** 0 violações/heurísticas acionáveis. **Spec:** 1 P2 (seed executável em produção), corrigido e confirmado pelo revisor; teste observou vermelho antes da guarda e verde na suíte final. Nenhum achado pendente.

Escopo concluído: este ticket. Implementações parciais, impedimentos e verificações pendentes neste escopo: nenhum. Tickets 04–08 (gestão de Usuários/troca de senha/transversal completo) não fazem parte desta entrega. As notas anteriores descrevem o estado histórico, superado por esta verificação. O limite agregado atualizado de 200.000 tokens foi ultrapassado (consulta final: 224.693); nenhuma conclusão funcional depende dessa contagem.

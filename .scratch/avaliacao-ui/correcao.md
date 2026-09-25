# Correção da UI

Implementação sobre `cf34e2721f7126e4016f00517d1af41f1a4956ca`, preservando o trabalho existente. O [parecer original](review.md) registra o diagnóstico anterior; este documento registra a correção.

| Achados | Correção | Regressão |
|---|---|---|
| F01–F04 | Valores dinâmicos do orçamento em react-hook-form; protocolo puro com identidade, revisão-base, snapshot submetido e reconhecimento. Erro conserva dirty, sucesso antigo conserva edição nova. Prévia corresponde ao texto/arquivo revisado; confirmação exige salvar antes. Envio verifica revisão no servidor. | `ui-orcamento.spec.ts`, `editor.test.ts` |
| F05–F07 | Compositor identificado por conversa e tentativa; paginação, busca, abertura e erros correlacionados. Troca real cancela edição/citação; sucesso tardio não navega nem apaga outro draft. Sessão de áudio possui seus recursos e cancelamento. | `ui-comunicador.spec.ts`, `estado-ui.test.ts`, `gravacao.test.ts` |
| F08–F10 | Código separado do rótulo e cursor validado; pessoa conhecida/nova e origem herdada/editada dos campos. Abandonar seleção limpa apenas os dados herdados. | `ui-seletores.spec.ts`, `seletor.test.ts`, `pessoa-draft.test.ts` |
| F11–F12 | Validação recuperável permanece no formulário; autorização/ausência/falhas inesperadas continuam no limite da rota. Controles seguem URL ao voltar; filtro de viagem mantém opção selecionada sem resultados. Nota reconhece somente o texto submetido. | `ui-navegacao.spec.ts`, `erro-formulario.test.ts` |
| F13 | Reporte com fases, exclusão síncrona e identidade estável na retentativa. | `ui-comunicador.spec.ts`, `estado-ui.test.ts`, harness |
| F14 | Cópia reconhece texto/identidade e trata falha HTTP/clipboard. | `ui-seletores.spec.ts`, `ui-orcamento.spec.ts`, `copiar-resumo.test.ts` |

Também corrigidos: documentos com carga/erro/retentativa/cancelamento; erro e pendência de notificações/instalação; cursor da busca; cadeia comercial ao abandonar canal; envio duplicado de alocação; preservação de campos no descarte recusado e criação inválida. Revisão independente da implementação encontrou e orientou correções para sincronização SSE durante carga e reabertura da mesma conversa.

O protocolo revisado foi aplicado: efeitos de comando nos handlers, guardas síncronas antes do efeito, reducers puros com `assertNever`, dados opcionais por semântica e transições inválidas conservando referência. Os efeitos de React reconhecem resultados externos ou sincronizam recursos; não iniciam salvamento em reação a uma fase.

## Verificação

Resultado acumulado da suíte e retestes: **144 dos 146 cenários E2E aprovados**; os dois benchmarks abaixo continuam reprovados, inclusive na base. Não houve uma execução única totalmente verde.

- Regressões de navegação foram executadas antes das correções: quatro falharam pelos defeitos esperados.
- `pnpm test`: 140 testes passaram em 21 arquivos.
- `pnpm typecheck`: aprovado.
- Suíte completa inicial: 144 cenários, 138 aprovados. Os defeitos funcionais revelados foram corrigidos; o recorte final de Comunicador/navegação aprovou as seis regressões do chat, os dez casos de navegação e os dois fluxos offline. Os cinco casos de orçamento e cinco de seleção também passaram: **26 regressões novas aprovadas**.
- Dois limites de desempenho permanecem reprovados nesta máquina. Comparação sequencial contra `cf34e27`, em cópia isolada com as mesmas dependências e configuração Vite, reproduziu as mesmas falhas sem as correções de UI: feedback do Comunicador **112,87 ms** (workspace: 113,26 ms), leitura do Pipeline/kanban **251,22 ms** (workspace: 263,52 ms), ambos com limite de 100 ms. Isso demonstra que a reprovação também existe na base, sem atribuir sua causa à máquina ou ao SQL sem medição adicional. Os loaders/queries desses caminhos e os testes não foram alterados.
- Um teste existente de permissões disputava navegação de login com o redirect de logout (`ERR_ABORTED`); agora espera `/entrar` antes de iniciar login. Reteste final do arquivo de tarefas/permissões: **4/4 aprovados**.
- Harness de componentes React reais, com transportes controlados, validou reporte duplicado/retentativa, notificação negada/erro/retentativa e aviso de instalação com erro/retentativa; sem erros de navegador. Executar da raiz: `node .scratch/avaliacao-ui/evidencias/testar-controles-comunicador.mjs`. O harness depende da versão de esbuild instalada no lockfile; não substitui os E2E com servidor/banco reais.

O layout do Comunicador também foi corrigido: a navegação encolhia para zero e outro controle interceptava cliques. Um harness com CSS e componentes reais reproduziu a falha e aprovou clique normal após `flex-shrink: 0`; o compositor ganhou nome acessível explícito. Evidência: `node .scratch/avaliacao-ui/evidencias/testar-layout-comunicador.mjs`.

Nenhum teste teve limite de desempenho relaxado. Os E2E usam exclusivamente `corealux_test`; nenhum seed de produção foi executado.

## Aplicação do protocolo corrigido de autoridade e invariantes

A revisão mais recente é agnóstica de bibliotecas. Router loaders/actions/fetchers continuam responsáveis pelos ciclos remotos; reducers locais permanecem restritos às transições interdependentes. Formulários simples não foram convertidos mecanicamente.

- Filtros de Pipeline, Tarefas e Quadro usam controles explícitos com rascunho limitado à entrada do histórico. Navegação descarta o rascunho de filtros; revalidação da mesma entrada não apaga edição ainda não aplicada. A versão do aceite acompanha diretamente a URL.
- IDs, paginação, datas reais de calendário, JSON de mutação e conteúdo de orçamento são validados antes do uso. Valores inválidos não são silenciosamente descartados ou substituídos.
- Confirmações inválidas/ausentes do Comunicador conservam a saída e sua identidade. Leituras obsoletas são abortadas, mantendo também a correlação por contexto/tentativa. Mutações não são abortadas junto com a leitura da conversa.
- Anexos não removem texto novo digitado durante o envio; documentos validam o conteúdo recebido e invalidam a tentativa quando fechados. Alocações repetidas da mesma reserva são reconhecidas em transação no servidor.
- Preparação de pedido e Excel têm coordenação independente de salvamento; confirmação continua vinculada à revisão/snapshot. Cada envio de orçamento incrementa a revisão, inclusive reenvios, impedindo repetição com a mesma revisão.
- Geração de link e recebimento de anexos possuem recibo persistente por viagem, autor, operação e tentativa. O efeito e o recibo são gravados na mesma transação; conteúdo divergente com a mesma tentativa retorna conflito. Revogação encerra a tentativa anterior e replay de link revogado é recusado.
- A migração `0037_recibos_planejamento` inclui snapshot/journal do Drizzle e foi aplicada nas bases locais de desenvolvimento e teste, sem seed de produção.

A revisão independente dos recortes de filtros, aceite, alocações e validação não encontrou problemas importantes. Os benchmarks com reprovação já reproduzida na base não foram repetidos nesta revisão; os limites foram preservados.

Verificação final desta revisão:

- `pnpm test`: **187/187**, em 31 arquivos.
- `pnpm typecheck`: aprovado.
- Suíte E2E funcional completa, excluindo arquivos `velocidade`: **152/152**, em uma execução de 5,5 minutos.
- Após os últimos ajustes, novo build e reteste de aceite, contrato/reenvio de orçamento e revogação/recuperação de link: **3/3**. O caso de revogação é adicional aos 152; os outros dois ampliam/revalidam cenários já existentes.
- `git diff --check` dos arquivos de aplicação, testes e migrações: aprovado.

As verificações finais cobrem o estado atual por execução integral funcional mais retestes dos últimos ajustes; não constituem uma nova execução dos benchmarks.

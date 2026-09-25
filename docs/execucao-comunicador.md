# Comunicador

Implementação dos tickets independentes de `.scratch/comunicador/issues/`.
Os tickets 21 e 23 continuam bloqueados pela operação da viagem: não existem
os comandos de chegada/despedida nem o vínculo Usuário–Profissional exigidos
por Operação 08/22. Não foi criada uma mudança manual de Etapa para contornar
ADR-0007. O teste transversal completo só pode ser fechado após essas dependências.

## Executar

Aplicar as migrações com `pnpm db:migrate`. Não executar seed em produção.
O botão Comunicador abre o painel junto à tela atual; `/comunicador` é a entrada
instalável. Interface PT/KO, mensagens mantidas no idioma original.

Um processo Node atende os envios HTTP e o stream SSE. Cada evento verifica a
sessão e o acesso; a reconexão atualiza as mensagens a partir do banco. Grupos,
conversas diretas, histórico, reações, pontos de leitura e preferências ficam
no PostgreSQL. A busca usa `pg_trgm`; a migração requer permissão para instalar
a extensão no banco.

Arquivos ficam em `.data/comunicador` e seus metadados no banco. Ambos precisam
estar no backup. Downloads exigem sessão e acesso. Mover uma foto retira o
arquivo da conversa e o disponibiliza nos Documentos do Viajante para staff;
Guiamento não acessa esses documentos. Remoção pelo Admin torna o download
indisponível e apaga o arquivo do disco.

## Notificações e transcrição

Push reutiliza `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT`.
HTTPS é necessário no acesso externo. O usuário permite notificações em
Notificações; o primeiro acesso no celular mostra as instruções de instalação.
O aviso de supervisão do Admin é registrado uma vez por usuário.

Áudios são reproduzíveis independentemente da transcrição. Configurar
`GEMINI_API_KEY` e `GEMINI_TRANSCRIPTION_MODEL` com um modelo compatível com
áudio disponível na conta. O adaptador utiliza
[generateContent com áudio inline](https://ai.google.dev/gemini-api/docs/generate-content/audio).
Sem configuração ou com falha externa, a fila persistente tenta novamente com
intervalos crescentes, até uma hora. Os testes usam o adaptador de gravação;
não fazem chamadas reais ao Gemini ou aos serviços de push.

## Offline

Textos, fotos e áudios aguardam no IndexedDB, separados por usuário e enviados
em ordem. O identificador gerado no navegador impede duplicação após uma
resposta perdida. Uma falha recusada pelo servidor exige tentar novamente;
a fila não ultrapassa esse item. Sair limpa os dados locais. O service worker
mantém a tela `/comunicador` e os recursos da aplicação; os dados das conversas
abertas ficam no cache por usuário. A primeira abertura precisa ocorrer online.

## Verificação

Os testes `comunicador-parteN-*` exercitam as rotas e a interface com PostgreSQL
real. `comunicador-velocidade.spec.ts` usa 300 mil mensagens e verifica as
leituras de 100 ms e a entrega de 300 ms. O módulo puro `leitura.test.ts`
cobre os segmentos e a decisão de notificação, incluindo DND entre fusos.
As suítes de viagem/orçamento/login permanecem como regressão obrigatória.

Verificação da entrega em 2026-09-25: typecheck aprovado, 96 testes unitários
aprovados e 22 testes E2E do Comunicador aprovados na execução final, incluindo
300 mil mensagens. A suíte completa de 100 E2E foi executada; as nove falhas
por campos do painel fechado e rótulo do Viajante foram corrigidas, e os 15
testes dos arquivos afetados passaram na reexecução. Três cenários de regressão
adicionais cobrem reconexão/push/leitura, tarefa atômica/idempotente e concorrência
sem esgotamento do pool. Os tickets 01–20 e 22 estão concluídos; 21 e 23 permanecem
pendentes pelas dependências descritas acima.

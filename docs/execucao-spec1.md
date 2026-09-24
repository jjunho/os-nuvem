# Viagem, orçamento e proposta

Aplicar as migrações com `pnpm db:migrate`. Elas preservam viajantes, tarefas
anteriores, versões de referência e etapas encerradas. Os identificadores têm
sequências persistentes; o formato de cliente CLX + ano + 3 dígitos + Luhn
comporta 999 novos registros por ano e recusa esgotamento sem reutilizar números.

A proposta enviada guarda uma memória imutável usada pelo HTML, PDF e Excel.
Alterações comerciais posteriores começam outra versão. Custos desconhecidos
podem ser estimados no rascunho; o envio pede o custo real da linha cobrada.

O importador de pedidos é determinístico e local: não depende de serviço de IA.
Datas, cidades e quantidades são apresentadas para revisão; a confirmação é a
única etapa que grava. PDFs usam o Chromium instalado pelo Playwright.

Push usa `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT` (URI mailto ou
HTTPS), em ambiente HTTPS. Cada usuário habilita seu dispositivo em Notificações.
Sem essas variáveis, os avisos continuam registrados no sistema e aguardam envio.
O processo do servidor inicia reconciliação a cada minuto no primeiro acesso;
as chaves persistentes impedem tarefas/avisos duplicados. Uma reinicialização
reconcilia os prazos acumulados no próximo acesso. Em testes, o relógio controlado
reconcilia nas leituras e o adaptador registra os pushes sem envio externo.

Profissionais e alocações fornecem a disponibilidade necessária ao orçamento.
Idiomas de Jessica não foram inventados: o Admin deve registrar os idiomas
confirmados em Profissionais. Uma seleção não confirma uma alocação e avisos de
conflito nunca bloqueiam o orçamento.

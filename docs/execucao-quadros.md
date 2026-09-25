# Pipeline e Quadros

Implementação de `.scratch/quadros-e-kanban/spec.md`, tickets 01–18.

A migração `0036_quadros` cria Quadros pessoais para usuários existentes e
posiciona suas tarefas sem trocar identificadores ou histórico. Novos usuários,
tarefas de mensagens e tarefas automáticas seguem os mesmos vínculos. Aplicar
com `pnpm db:migrate`; não é necessário executar seed.

`/quadros` reúne Quadros pessoais e compartilhados. Listas e tarefas admitem
organização por arraste e teclado, conclusão, reabertura e arquivamento.
Pesquisa, filtros e calendário preservam a autorização do leitor. Quadros com
mais de mil tarefas têm navegação entre páginas. Etiquetas pertencem ao Quadro;
anexos permanecem na tarefa quando ela muda de lugar. Os arquivos ficam em
`.data/comunicador/tarefas` e precisam acompanhar o banco no backup.

Cada tarefa tem uma conversa única com responsável e cópias. Atividade é
mensagem de sistema, sem push nem não lidas. Comentários reutilizam menções,
fotos, áudio e cartões. Downloads e acesso ao Quadro conferem os direitos
atuais no servidor; Guiamento só vê tarefas próprias ou em cópia.

`/modelos-etapa`, exclusivo do Admin, versiona títulos, prazos, destinatários e
fatos conclusivos. Modelos editados valem para entradas futuras. O prazo inicial
de resposta conserva o padrão por canal. Correções reavaliam fatos sem apagar o
histórico. Depois dos três primeiros follow-ups, novas tarefas continuam a cada
três dias; não há perda automática. Invoice, sinal e voucher permanecem inativos
até a implementação de Operação, conforme o escopo da spec.

O Pipeline oferece lista e kanban com os mesmos filtros. As etapas vêm dos
fatos, sem arraste de Viagem. Mudanças aparecem por SSE, e preços usam a projeção
autorizada de Cartões. A interface é disponível em português e coreano.

Os testes `quadros-parte1` a `quadros-parte5` exercitam os fluxos pela aplicação
e banco reais. O transversal está em `quadros-parte4-etapas.spec.ts`.
`quadros-velocidade.spec.ts` usa 30 mil tarefas, 300 Quadros e 600 Viagens,
medindo leitura, navegação e movimento entre dois navegadores.

## Verificação

`pnpm typecheck` aprovado; 100 testes unitários aprovados. Os 120 testes E2E
foram aprovados, reaproveitando os resultados válidos e repetindo somente
os casos afetados pelas correções. O teste de 30 mil tarefas cumpriu os
limites de 100/300 ms sem relaxamento dos orçamentos.

A revisão verificou padrões e aderência à spec; os achados de atomicidade,
notificação, ordenação e correção de fatos foram resolvidos.

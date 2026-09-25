Status: ready-for-agent

# Spec: reconciliar os tickets com as decisões já registradas

## Problem Statement

Juliano precisa delegar os tickets do Corealux OS sem que o agente tenha de escolher entre requisitos incompatíveis, reabrir decisões aprovadas ou implementar funcionalidades fora da sequência prevista. A revisão dos 147 tickets encontrou decisões desatualizadas, dependências ausentes, critérios de aceite conflitantes e lacunas na integração financeira.

Parte dos problemas já tem resposta no domínio, nos ADRs, nas specs ou no acervo empresarial. Outra parte exige uma escolha que não foi feita. Tratar tudo como pendência trava trabalho autorizado; tratar tudo como resolvido inventa política comercial.

## Solution

Corrigir os tickets e as specs existentes para que expressem uma única orientação executável por assunto, acompanhada de critérios de aceite observáveis e dependências suficientes. Esta entrega é documental: prepara o backlog para implementação, sem desenvolver as funcionalidades.

Aplicar as decisões já registradas, preservar os padrões provisórios editáveis e explicitar a integração necessária entre os requisitos existentes. Separar, com escopo preciso, as decisões de produto ainda abertas. O status desta spec cobre a reconciliação documental definida aqui; não declara prontas as funcionalidades nem resolve os pontos excluídos.

## User Stories

1. As an implementer, I want each ticket to reflect the latest recorded decision, so that I can work without reopening an approved choice.
2. As an implementer, I want the Inferência de etapa ticket to state that it is built before its extension with Tarefas da etapa, so that its sequence is unambiguous.
3. As an implementer, I want stale claims that dependencies have not been ticketed removed, so that I can locate the existing work.
4. As an implementer, I want every acceptance criterion's prerequisites declared, so that I can complete a ticket without silently implementing another.
5. As an implementer, I want `/tarefa` in a Viagem conversation tested in the slice that introduces that integration, so that the two tickets do not depend on each other.
6. As an implementer, I want the `/bug` screenshot ticket to depend on existing media handling, so that it reuses file storage and authorization.
7. As an implementer, I want Tarefas to depend on the interface translation foundation, so that their Portuguese and Korean requirements are achievable.
8. As a Propostas e Orçamentos Usuário, I want the documented access tests to allow my Invoices, Pagamentos and Saldo, so that an outdated test does not remove authorized access.
9. As a Guiamento or Conteúdo Usuário, I want reference-price access to follow my Papel, so that a generic read permission does not expose restricted values.
10. As a salesperson, I want busy Guias shown with an availability warning where the quoting spec requires it, so that I can evaluate conflicts without losing the option.
11. As a salesperson, I want the Guia picker to distinguish language eligibility from advisory availability, so that its filtering and warning rules agree.
12. As a Responsável, I want the `responder` Tarefa to retain the first-response deadline for the Canal comercial, so that stage templates do not flatten the existing priorities.
13. As an operator, I want the first departure of a split group to leave the Viagem active, so that the remaining Viajantes keep operational support.
14. As an operator, I want the last applicable departure to conclude the Viagem, so that its Etapa and Equipe conversation remain coherent.
15. As a salesperson, I want an already sent Proposta to remain unchanged after confirmação, so that the commercial record remains reliable.
16. As a Cliente, I want the detailed Roteiro after confirmação without replacing the earlier commercial document, so that both outputs retain their meaning.
17. As a salesperson, I want Sky Capsule's documented additional price preserved alongside the city kit, so that the existing USD 180 example remains valid.
18. As a product person, I want individual ticket prices to have one authoritative cadastro on Atrações, so that editable prices do not diverge between modules.
19. As a salesperson, I want historical pinned prices preserved when the Catálogo arrives, so that reorganizing the cadastro cannot change sent Versões.
20. As Faturamento, I want an effective refund to reduce the Viagem's Resultado exactly once, so that money returned to the Cliente is not retained as income.
21. As Faturamento, I want a supplier deposit to leave the unpaid remainder visible, so that paying 30% does not mark the full obligation settled.
22. As an implementer, I want Bene's percentages identified as amounts refunded rather than penalties, so that cancellation fixtures cannot invert their meaning.
23. As an operator, I want the waiting surcharge to use the project's recorded provisional frequency, so that the ticket does not require inventing a recurring charge.
24. As a product person, I want the photo import to expect 387 images and report the five empty directories, so that its completion target matches the inventory.
25. As Juliano, I want business decisions still open distinguished from documentary corrections, so that the agent does not invent an approval gate, accounting policy or supplier deadline.
26. As Juliano, I want a final mapping from each review finding to its correction or explicit exclusion, so that I can verify the reconciliation is complete.

## Implementation Decisions

- **Natureza da entrega:** editar os tickets e specs afetados, incluindo critérios de aceite, referências a decisões e dependências. Não alterar código, banco, APIs, documentos comerciais reais ou o acervo empresarial. Preservar os números dos tickets. O relatório de revisão é evidência de origem, não uma nova fonte concorrente de regras operacionais.
- **Autoridade:** usar o vocabulário do domínio e os ADRs existentes. Uma decisão explícita posterior do projeto prevalece no seu escopo; um exemplo de fornecedor não vira regra universal. Flexibilidade comercial, valores a informar e padrões provisórios não são defeitos por si mesmos.
- **Inferência de etapa:** incorporar no ticket de origem a aprovação registrada em Quadros: Viagem constrói a inferência e Quadros a estende com Tarefas da etapa. Retirar o `needs-info` causado exclusivamente por essa escolha já resolvida. Preservar os demais pré-requisitos e não confundir pronto para agente com implementado.
- **Dependências do Comunicador:** Tarefas depende do catálogo PT/KO; reporte de bug com imagem depende de mídia; a conversa Interna depende do comando de criação de Tarefa para seu teste integrado. O ticket do comando permanece testável em conversas comuns; a associação automática à Viagem é verificada quando a conversa Interna existe. Não criar dependência recíproca.
- **Acesso:** atualizar a matriz de testes de Pagamentos conforme a autorização de Propostas e Orçamentos e superiores. Condicionar a leitura de Tabelas de referência ao Papel; a implantação posterior da matriz de acesso deve substituir os critérios provisórios de leitura irrestrita. Contas a pagar e Resultado continuam restritos a Faturamento e Admin.
- **Seletores:** idioma é filtro de elegibilidade no seletor de Guias; ocupação nas datas é aviso, mantendo o Guia visível conforme o ticket específico de cotação. Não generalizar essa exceção a todos os filtros do sistema.
- **Prazos:** os Modelos de etapa preservam a resolução de prazo por Canal comercial já adotada no primeiro contato. Os exemplos existentes de B2C em 2h e Agência em 8h permanecem. Não transformar esses exemplos em definição nova de calendário útil nem alterar o prazo de outros canais por inferência.
- **Encerramento:** a conclusão por Receptivo ocorre após a última despedida aplicável dos Viajantes. Uma saída anterior não conclui a Viagem nem arquiva sua conversa da Equipe. Preservar o encerramento ao fim do último Dia quando não há Receptivo de saída.
- **Proposta e Roteiro:** uma Versão enviada e sua Proposta mantêm o conteúdo congelado. A saída detalhada pós-confirmação pertence ao Roteiro/documento correspondente já previsto; não é uma renderização mutável da Proposta histórica. Corrigir as redações que condicionam o conteúdo histórico à Etapa atual. Não criar um novo fluxo de Aceite apenas para liberar descrições.
- **Sky Capsule e kit:** registrar a exceção nominal documentada: quatro kits de USD 30 mais uma cápsula de USD 60 totalizam USD 180. Manter os demais requisitos de quantidade e gratuidade. Não inventar uma regra de composição para outras atrações não documentadas.
- **Preços de ingressos:** distinguir os padrões de kit por cidade/categoria dos ingressos individuais. Estes pertencem à Atração conforme a decisão registrada. Qualquer cadastro provisório anterior deve ter transição explícita para esse proprietário, com reaproveitamento dos registros e preservação dos valores/versionamentos já fixados; não manter dois cadastros editáveis concorrentes. A implementação futura pode escolher a migração técnica compatível com o estado real do banco.
- **Reembolso efetivo no Resultado:** complementar o contrato do cálculo para considerar valores efetivamente devolvidos ao Cliente uma única vez, com moeda e conversão registradas. Uma sugestão de reembolso ainda não paga não é saída realizada. Registrar a dependência do fluxo de cancelamento/reembolso. O exemplo de USD 1.000 recebidos e USD 200 devolvidos deixa USD 800 líquidos antes dos demais custos. Essa correção não define o tratamento contábil de créditos concedidos ou sua futura utilização.
- **Sinal de fornecedor:** explicitar o comportamento externo já necessário para representar os 30% antecipados e os 70% restantes: pagamento parcial não liquida o total, o remanescente permanece em aberto e o calendário usa vencimentos informados para aquele caso. Não fixar a data do restante, não extrapolar condições de Bene para outros fornecedores e não escolher aqui um esquema de tabelas de parcelas ou baixas. A decisão técnica deve preservar esse contrato.
- **Percentuais de Bene:** rotular 100/50/30/0 como percentuais devolvidos nos marcos de 30/20/15/10 dias do caso documentado. Não tratá-los como percentuais de multa nem preencher automaticamente intervalos que a fonte não define.
- **Espera:** explicitar o padrão provisório do projeto de uma cobrança de 10% após 90 minutos, uma vez por ocorrência. Preservar sua editabilidade e a pendência empresarial sobre frequência definitiva.
- **Fotos:** ajustar o total para 387 imagens: 282 KTO e 105 próprias. Registrar as pastas vazias Busan, Ganghwa, Jeonju, novas fotos e Pocheon. Preservar as regras existentes de direitos e consentimento; estar no inventário não libera publicação.
- **Pontos sem decisão suficiente:** registrar o conflito e sua pergunta objetiva, sem implementar uma escolha, para aprovação de despesas, tratamento de créditos e fechamento com Resultado não verificável. Só o recorte que realmente exige a decisão fica pendente; correções independentes continuam executáveis. Não aplicar `needs-info` indiscriminadamente a todos os tickets de uma área.

## Testing Decisions

- **Validação desta entrega documental:** ler o conjunto alterado como um contrato executável. Para cada achado, conferir se ticket, spec, critério de aceite e decisão de referência concordam. Validar destinos e ausência de ciclos no grafo de dependências, inclusive a sequência do Comunicador. Não criar framework de testes de Markdown ou infraestrutura permanente para essa conferência.
- **Ponto de teste funcional preferencial, na implementação futura:** a aplicação por fora, usando o Playwright e o PostgreSQL reais já adotados. Rotas e documentos devem ser exercitados pelo que o Usuário observa ou consegue acessar, sem mocks dos módulos internos nem inspeção direta das tabelas pelo teste.
- **Cálculos puros:** usar a interface pública de cálculo já prevista e Vitest para os casos de Resultado, composição de preços e inferência. Não criar uma nova camada de teste só para espelhar a implementação.
- **Precedentes:** os testes verticais de primeiro contato já verificam os prazos distintos por canal; os testes de senha exemplificam a separação de regras puras; as specs existentes já prescrevem testes verticais por parte, relógio controlado e testes transversais ao final.
- **Critérios a incorporar aos tickets:** primeiro de dois Receptivos de saída mantém a Viagem ativa e último a conclui; confirmação não muda conteúdo da Proposta enviada; a saída detalhada apresenta os nomes reais sem sobrescrever a histórica; kit mais Sky Capsule preserva USD 180; preços antigos permanecem fixados após a transição de cadastro.
- **Critérios financeiros:** recebimento de USD 1.000 e devolução efetiva de USD 200 têm efeito líquido de USD 800 antes dos custos; reavaliar os mesmos fatos não deduz a devolução duas vezes; pagar 30% de uma obrigação mantém 70% em aberto; os marcos de Bene usam percentuais reembolsáveis. Não estabelecer expectativas para créditos ou intervalos sem fonte.
- **Critérios de autorização e integração:** Propostas e Orçamentos acessa Pagamentos, mas não Resultado; papéis sem acesso não recebem valores na resposta; Guia ocupado continua visível e sinalizado quando elegível; `/tarefa` preenche a Viagem no teste da conversa Interna; reporte de bug usa a infraestrutura de mídia; telas de Tarefas têm PT/KO.
- **Critérios de padrões e dados:** preservar os testes de prazo por canal; uma espera prolongada não repete automaticamente o adicional provisório; importação termina com 387 imagens e cinco diretórios vazios informados, sem considerar diretórios como fotos.
- **Execução nesta entrega:** não desenvolver funcionalidades apenas para executar testes de requisitos futuros. Juliano confirmou a validação documental e do grafo de dependências, mantendo os pontos de teste existentes e sem infraestrutura nova. Não é necessário executar a suíte funcional para esta entrega exclusivamente textual.

## Out of Scope

- Implementar as funcionalidades, alterar dados operacionais, executar migrações, publicar o sistema ou modificar o acervo.
- Decidir se crédito concedido reduz Resultado na emissão, no uso ou em outro momento; definir validade ou regras novas para esse crédito.
- Escolher se aprovação de Carlos é condição obrigatória para reembolsar despesas ou apenas registro informativo.
- Decidir se uma Viagem pode fechar financeiramente com Resultado não verificável.
- Inventar vencimento dos 70% restantes de Bene, intervalos de cancelamento ausentes ou condições universais de fornecedores.
- Encerrar questões empresariais abertas com Carlos, transformar preços ajustáveis em bloqueios ou criar uma matriz nova de permissões.
- Reorganizar toda a documentação, substituir o issue tracker, criar um novo sistema de testes ou comparar modelos de IA.

## Further Notes

Origem: [revisão documental dos 147 tickets](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/revisao-tickets/review.md). O relatório mantém as evidências por arquivo e linha; antes de editar, conferir os trechos atuais para não sobrescrever decisões posteriores.

Cobertura dos achados: 2–11, 14 e 15 têm correção documental respaldada; 1 permite corrigir a omissão de devoluções efetivas, mantendo créditos fora do escopo; 12 permite explicitar saldo parcial e os percentuais devolvidos, sem inventar condições do fornecedor; 13 permanece como decisão de produto, assim como a questão adicional de fechamento não verificável.

Ao executar esta spec, entregar um mapa curto entre os achados e os documentos corrigidos, com as decisões ainda abertas separadas. Não declarar todos os conflitos resolvidos enquanto os pontos explicitamente excluídos permanecerem sem decisão.

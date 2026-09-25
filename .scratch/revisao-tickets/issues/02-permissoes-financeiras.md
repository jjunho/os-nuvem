# 02: Permissões financeiras

**What to build:** A documentação de autorização e seus critérios de aceite concordam sobre quais Papéis veem Pagamentos, Resultado e Tabelas de referência. Reconciliar os achados 6 e 8 da revisão em Viagem 08, Catálogo 01, 02 e 16 e respectivas specs, usando as decisões já registradas, sem criar uma matriz nova.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A matriz de testes permite Invoices, Pagamentos e Saldo para Propostas e Orçamentos e superiores, removendo a restrição antiga a Faturamento e Admin nesses itens.
- [ ] Contas a pagar e Resultado permanecem restritos a Faturamento e Admin.
- [ ] A leitura das Tabelas de referência fica condicionada ao Papel; o critério genérico de que todos os demais Usuários podem ler não permanece como invariante após a introdução da matriz de acesso.
- [ ] Preservar as distinções existentes: Itinerários e Produtos pode ver preços unitários autorizados, sem totais ou Margem; Guiamento e Conteúdo não recebem os preços vedados. Não ampliar a regra para apagar exceções documentadas de valores próprios do Profissional.
- [ ] Os critérios preveem casos positivos e negativos por requisição, incluindo ausência de valores não autorizados na resposta, e não apenas botões ocultos.
- [ ] Explicitar a atualização dos critérios anteriores quando a matriz completa entrar, preservando a sequência de implementação existente.
- [ ] Conferir a concordância entre tickets, histórias e matriz de testes; alterar somente documentação, sem modificar a spec-mãe da reconciliação.

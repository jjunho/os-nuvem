# 08: Sinal e cancelamento de fornecedor

**What to build:** Os requisitos de Contas a pagar representam um adiantamento sem perder o saldo e os testes de cancelamento de Bene não confundem percentuais devolvidos com multas. Reconciliar Custos 01, 02 e 03, Operação 20 e as referências pertinentes de Catálogo e specs, cobrindo o achado 12 da revisão.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Os critérios mostram que pagar 30% de uma obrigação mantém 70% em aberto, sem marcar o valor total como quitado.
- [ ] O calendário e o cancelamento consideram o valor já pago e o remanescente, com vencimentos informados para o caso.
- [ ] Não inventar a data de vencimento dos 70% restantes, impor a condição de Bene a outros fornecedores ou escolher neste recorte o esquema técnico de parcelas/baixas.
- [ ] Os exemplos de Bene identificam 100%, 50%, 30% e 0% como percentuais devolvidos nos marcos de 30, 20, 15 e 10 dias, conforme o caso documentado no acervo.
- [ ] Não interpolar intervalos ausentes nem transformar esses percentuais em percentuais de multa.
- [ ] O teste de sinal pago seguido de cancelamento distingue o montante recuperável do valor ainda devido, sem presumir condições não documentadas.
- [ ] Tickets, specs e critérios de calendário e cancelamento concordam; alterar somente documentação, preservando a spec-mãe da reconciliação.

# 07: Reembolsos no Resultado

**What to build:** O contrato documentado do Resultado considera uma devolução efetivamente paga ao Cliente exatamente uma vez. Complementar Custos 10 e sua integração com Operação 20, com as respectivas specs, cobrindo a parte executável do achado 1 da revisão.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Distinguir Pagamentos recebidos de devoluções efetivamente realizadas e explicitar como estas entram no cálculo do Resultado, com moeda e conversão registradas.
- [ ] Uma sugestão de reembolso não paga não é considerada saída realizada.
- [ ] O critério de USD 1.000 recebidos e USD 200 devolvidos resulta em USD 800 líquidos antes dos demais custos.
- [ ] Reavaliar os mesmos fatos não deduz novamente uma devolução já considerada; preservar a prevenção de dupla contagem entre módulos.
- [ ] Custos 10 declara a dependência do fluxo de cancelamento e reembolso de Operação 20, e os destinos existem sem criar ciclo.
- [ ] Os critérios de cálculo usam a interface pura e os de apresentação usam a aplicação por fora, como já previsto; não criar ponto de teste novo.
- [ ] Registrar que crédito concedido não é automaticamente devolução em dinheiro e que seu tratamento no Resultado permanece fora deste recorte.
- [ ] Alterar somente requisitos e critérios documentais; não implementar política contábil, código ou mudanças na spec-mãe da reconciliação.

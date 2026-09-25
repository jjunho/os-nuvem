# 03: Disponibilidade de Guias

**What to build:** O contrato documentado do seletor permite cotar com Guias elegíveis ocupados, devidamente sinalizados, sem conflitar com a regra geral de filtros contextuais. Reconciliar Viagem 01 e 29 e suas referências na spec, cobrindo o achado 7 da revisão.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Distinguir explicitamente elegibilidade por Idioma de guiamento de disponibilidade nas datas.
- [ ] Um Guia que não atende ao idioma não aparece no seletor; um Guia elegível com Alocação conflitante continua visível com a indicação de ocupado.
- [ ] O aviso de disponibilidade não bloqueia o Orçamento, conforme o ticket específico já determina.
- [ ] O contrato geral de opções conhecidas admite essa distinção sem tornar consultivos todos os filtros de cidade, tipo ou outros campos.
- [ ] Incluir nos critérios os casos de Guia elegível livre, elegível ocupado e incompatível com o idioma.
- [ ] Alterar somente os requisitos e critérios documentais; não implementar o seletor nem modificar a spec-mãe da reconciliação.

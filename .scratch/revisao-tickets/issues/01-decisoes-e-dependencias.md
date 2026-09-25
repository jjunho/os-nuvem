# 01: Decisões aprovadas e dependências

**What to build:** Quem implementa encontra a decisão aprovada de Inferência de etapa no ticket de origem e uma sequência executável para Tarefas, conversa Interna e reporte de bug. Corrigir somente os documentos do backlog, conforme a spec de reconciliação. Abrange os achados 9 e 11 da revisão: Viagem 07 e 29, Quadros 11, Operação 22 e Comunicador 12, 13, 14, 17 e 21, além dos trechos correspondentes nas specs.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Viagem 07 registra que cria a Inferência de etapa, posteriormente estendida por Quadros com Tarefas da etapa, citando a aprovação já registrada em Quadros 11.
- [ ] Retirar o `needs-info` causado por essa decisão já resolvida e atualizar as referências ao estado antigo, preservando os demais pré-requisitos e sem declarar implementação concluída.
- [ ] Remover de Viagem 29 e Comunicador 21 as afirmações de que Profissionais e Alocações ainda não foram ticketados; manter as referências aos tickets existentes.
- [ ] Comunicador 12 declara a dependência do catálogo PT/KO de Comunicador 01; Comunicador 17 declara a dependência da infraestrutura de mídia de Comunicador 15.
- [ ] Comunicador 13 pode ser verificado com conversas comuns. O critério integrado de `/tarefa` preencher a Viagem fica em Comunicador 14, que passa a depender de 13, sem dependência recíproca.
- [ ] As specs e os critérios de aceite descrevem a mesma divisão, sem remover o comportamento integrado exigido.
- [ ] Conferir que os destinos das dependências existem e que as alterações não introduzem ciclos.
- [ ] Entregar apenas correções documentais; não modificar código, banco, acervo ou a spec-mãe da reconciliação.

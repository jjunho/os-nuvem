# Revisão documental dos tickets — 24/09/2026

Escopo: 147 tickets das sete áreas, suas specs, ADRs, definições relevantes do domínio e conferência dirigida das regras no acervo `../docs`. Revisão de requisitos e sequência de implementação; não é validação da implementação nem benchmark de modelos. Nenhum ticket foi alterado.

Foram conferidas 375 dependências declaradas: todos os destinos existem e não há ciclos nesse grafo. Isso não elimina dependências ausentes, descritas abaixo. Os arquivos registram 146 tickets `ready-for-agent` e um `needs-info`; esses rótulos não significam que os pré-requisitos já foram implementados.

Prioridades: P1 = risco de resultado financeiro incorreto, alteração de documento enviado ou encerramento indevido; P2 = conflito de requisito, modelagem ou sequência; P3 = erro documental localizado.

## 1. P1 — Resultado não incorpora explicitamente os reembolsos ao cliente

[Custos 10, linhas 3–4](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/custos-e-resultado/issues/10-resultado-da-viagem.md) calcula recebimentos menos custos e cortesias, mas não inclui os reembolsos pagos de [Operação 20, linha 3](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/operacao-e-pagamentos/issues/20-cancelamento-e-reembolso.md). `CONTEXT.md:255` define Pagamento como valor recebido; não há convenção documentada de lançamento negativo ou recebimento líquido de devoluções.

**Impacto:** receber USD 1.000 e devolver USD 200 pode manter USD 1.000 como entrada no Resultado.

**Correção proposta:** explicitar a entrada das devoluções efetivamente pagas no cálculo, incluir a dependência de Operação 20 e um caso de teste de recebimento seguido de devolução. Definir separadamente o tratamento do crédito concedido; ele não é automaticamente dinheiro devolvido.

## 2. P1 — Uma despedida pode concluir uma viagem com outros passageiros ainda em campo

[Operação 22, linhas 3 e 10](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/operacao-e-pagamentos/issues/22-inicio-e-fim-da-viagem.md) conclui a Viagem ao confirmar a despedida. [Operação 11, linhas 3 e 9](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/operacao-e-pagamentos/issues/11-receptivos.md) permite vários Receptivos por voos distintos. `CONTEXT.md:105` exige a **última** despedida.

**Impacto:** uma implementação literal encerra a Viagem e arquiva a conversa da Equipe quando sai o primeiro subgrupo.

**Correção proposta:** exigir a última despedida aplicável e testar duas saídas em horários/dias diferentes, mantendo a Viagem ativa após a primeira.

## 3. P1 — A Proposta deve ser imutável e mudar após confirmação

[Viagem 26, linhas 5 e 14](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/issues/26-proposta.md) exige o mesmo conteúdo para a mesma Versão. [Catálogo 08, linhas 3 e 9](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/catalogo-fornecedores-acesso/issues/08-proposta-com-catalogo.md) e [Viagem 27, linhas 8 e 20](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/issues/27-mais-saidas-da-proposta.md) mandam trocar nomes genéricos pelos reais após confirmação, sem definir outra emissão/versionamento. O ADR-0001 também preserva versões enviadas.

**Impacto:** renderizar novamente uma proposta enviada pode alterar o documento histórico.

O acervo `../docs/negocio/04-negocio-produto.md:80–83` distingue material genérico anterior ao fechamento de roteiro detalhado posterior; `05-negocio-precificacao.md:362–365` exige memória imutável. Isso sustenta separar as saídas, sem reescrever a proposta histórica.

**Correção proposta:** distinguir o documento comercial congelado da saída detalhada pós-confirmação, ou definir sua nova versão explicitamente. Testar que confirmar a viagem não altera o conteúdo anteriormente enviado.

## 4. P2 — Substituir sempre o kit por uma atração paga quebra o exemplo da Sky Capsule

[Catálogo 07, linhas 4 e 20](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/catalogo-fornecedores-acesso/issues/07-ingressos.md) determina que uma atração com preço positivo substitui o kit. [Viagem 14, linha 9](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/issues/14-ingressos-kit-transporte.md) exige quatro kits de USD 30 **mais** uma cápsula de USD 60, total USD 180. A fonte `../docs/negocio/05-negocio-precificacao.md:283–285` confirma a cobrança adicional da cápsula.

A consolidação do acervo também contém a regra geral de substituição em `05-negocio-precificacao.md:341–346`. Portanto, o conflito não se resolve apagando uma fonte: é preciso explicitar o alcance da exceção Sky Capsule frente à regra geral.

**Correção proposta:** explicitar a exceção ou a regra por atração de adicionar/substituir e manter esse exemplo no teste do Catálogo. Não remover silenciosamente um dos critérios.

## 5. P2 — Duas fontes de preços de ingressos sem transição definida

[Viagem 10, linhas 3 e 9–10](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/issues/10-tabelas-frota-e-demais.md) cria tabelas versionadas de preços de ingressos. [Catálogo 07, linhas 3 e 24](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/catalogo-fornecedores-acesso/issues/07-ingressos.md) coloca esses preços versionados na Atração, conforme a revisão da spec de Catálogo, linha 191.

**Impacto:** podem surgir dois cadastros editáveis com valores divergentes.

**Correção proposta:** separar os padrões de kit por cidade/categoria dos ingressos individuais e definir como o cadastro inicial é reutilizado ou migrado para Atrações, preservando versões históricas.

## 6. P2 — A matriz de testes ainda proíbe acesso a pagamentos já autorizado

[Spec de Catálogo, linha 153](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/catalogo-fornecedores-acesso/spec.md) diz que só Faturamento e Admin veem Pagamentos. A história revisada na linha 94 concede esse acesso a Propostas e Orçamentos e superiores; [Catálogo 16, linha 3](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/catalogo-fornecedores-acesso/issues/16-acesso-em-campo.md) acompanha a revisão.

**Correção proposta:** atualizar a matriz de testes com acesso positivo de Propostas e Orçamentos e negativas para os papéis inferiores, inclusive via requisição direta.

## 7. P2 — O seletor deve esconder guias indisponíveis e também mostrá-los

[Viagem 01, linhas 3 e 10](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/issues/01-opcoes-conhecidas.md) exige ocultar opções que não atendam ao contexto e cita guias filtrados por idioma e datas. [Viagem 29, linhas 11–14](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/issues/29-disponibilidade-na-cotacao.md) exige guias ocupados visíveis, sinalizados, com avisos que não bloqueiam.

**Correção proposta:** distinguir critérios de elegibilidade que filtram, como idioma, de disponibilidade consultiva, que sinaliza conflito sem retirar a opção.

## 8. P2 — Leitura de tabelas de preço é liberada a todos antes da restrição por papel

[Viagem 08, linha 14](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/issues/08-tabelas-versionadas.md) diz que apenas Admin edita, mas os demais leem. [Catálogo 01, linha 19](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/catalogo-fornecedores-acesso/issues/01-acesso-por-papel.md) condiciona a leitura ao papel; [Catálogo 02, linhas 3 e 11](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/catalogo-fornecedores-acesso/issues/02-dinheiro-por-papel.md) proíbe valores para Guiamento e Conteúdo.

**Correção proposta:** qualificar o critério inicial e declarar como os testes anteriores serão atualizados quando a autorização completa entrar. Não deixar a regra permissiva como invariante permanente.

## 9. P2 — A decisão aprovada de inferência continua marcada como pendente

[Quadros 11, linha 5](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/quadros-e-kanban/issues/11-tarefa-da-etapa-primeiro-contato.md) registra aprovação: Viagem 07 cria a inferência, Quadros a estende. [Viagem 07, linhas 5 e 9](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/issues/07-inferencia-de-etapa.md) ainda manda decidir antes de começar e permanece `needs-info`. [Operação 22, linha 5](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/operacao-e-pagamentos/issues/22-inicio-e-fim-da-viagem.md) repete esse estado antigo.

**Correção proposta:** sincronizar a decisão e o status no ticket de origem, preservando a referência à aprovação. Não é necessária uma nova decisão de produto sobre esse ponto.

Outros textos desatualizados: [Viagem 29, linha 5](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/issues/29-disponibilidade-na-cotacao.md) e [Comunicador 21, linha 5](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/comunicador/issues/21-conversa-equipe.md) dizem que dependências ainda não foram ticketadas, mas já apontam para os tickets existentes. Remover somente a afirmação obsoleta; não presumir implementação concluída.

## 10. P2 — O modelo de tarefas pode apagar os prazos diferentes por canal

[Quadros 12, linhas 9–11](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/quadros-e-kanban/issues/12-modelos-de-etapa.md) usa prazo relativo à entrada e os modelos da spec. [Spec de Quadros, linha 102](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/quadros-e-kanban/spec.md) dá a `responder` o padrão de mesmo dia útil. [Spec de Viagem, linha 118](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/viagem-orcamento-proposta/spec.md) exige prazo por canal. Os testes existentes em `tests/e2e/parte1-primeiro-contato.spec.ts:12–16,25–31` distinguem B2C (2h) de Agência (8h), e Quadros 11 exige preservá-los.

**Correção proposta:** explicitar a resolução de prazo por canal nos modelos iniciais e em seus critérios de aceite, em vez de trocar por um único prazo para todos.

## 11. P2 — Critérios de aceite precisam de dependências ainda não declaradas

- **Comunicador 13/14:** [13, linha 11](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/comunicador/issues/13-tarefas-no-chat.md) testa `/tarefa` numa conversa de Viagem, que só nasce no 14; [14, linha 12](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/comunicador/issues/14-conversa-interna.md) testa `/tarefa`, que nasce no 13. Nenhum declara o outro. Mover o teste integrado para 14 e fazê-lo depender de 13; manter 13 testável em conversas comuns. Adicionar dependências recíprocas criaria um ciclo.
- **Comunicador 17:** [linhas 5 e 10](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/comunicador/issues/17-bug.md) exigem captura como imagem anexada, mas falta a dependência de 15, que fornece armazenamento e autorização de mídia.
- **Comunicador 12:** [linhas 7 e 18](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/comunicador/issues/12-tarefas.md) exigem PT/KO, mas o ticket depende apenas de Login 01. Falta Comunicador 01, que estabelece o catálogo de tradução.

## 12. P2 — Sinal de fornecedor não tem saldo nem quitação parcial especificados

[Custos 01, linhas 3–5](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/custos-e-resultado/issues/01-contas-a-pagar-tracer.md) exige os 30% adiantados de Bene, mas descreve uma Conta pelo custo, com um vencimento e estados aberta/paga. [Custos 03, linha 11](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/custos-e-resultado/issues/03-reserva-cancelada-e-multa.md) já depende de um sinal pago. Falta definir como representar os 70% restantes e seus vencimentos.

O acervo (`../docs/negocio/hoteis-cotacoes-e-casos.md:102`) descreve os 30% no contexto específico Bene/JMJ de agosto de 2027; isso não define uma política geral de fornecedores nem a data dos 70% restantes.

**Correção proposta:** especificar parcelas ou baixas parciais, com um teste de 30% pago e 70% em aberto, incluindo calendário e cancelamento.

Ainda nesse caso, Operação 20:9 lista `100/50/30/0` junto de exemplos de multas sem rotular o significado. O acervo, linha 102, e a extração `cotacao-2027-08-jmj.md:46` identificam esses valores como **percentuais devolvidos**, não multas. Explicitar isso no teste e preservar os marcos de 30/20/15/10 dias sem inventar intervalos ausentes.

## 13. P2 — Aprovação de despesas está exigida e fora do escopo

[Operação 24, linhas 3 e 11](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/operacao-e-pagamentos/issues/24-despesas-de-campo.md) exige aprovação da conciliação por Carlos. [Spec de Custos, linha 124](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/custos-e-resultado/spec.md) exclui fluxos de aprovação de despesas. [Custos 07, linha 3](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/custos-e-resultado/issues/07-reembolso-de-despesas-de-campo.md) gera reembolso ao conciliar, sem esclarecer a relação com essa aprovação.

A fonte de despesas em `../docs/negocio/06-negocio-operacao.md:161–167` é uma prestação específica e explicitamente não comprova aprovação geral de reembolso. Logo, ela não resolve sozinha essa divergência entre specs.

**Correção proposta:** distinguir registro informativo de aprovação de uma condição que libera reembolso. Alinhar o escopo e o evento que gera a Conta; não inventar uma nova barreira de aprovação durante a implementação.

## 14. P2 — O adicional de espera omite um padrão provisório já definido

[Operação 23, linha 3](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/operacao-e-pagamentos/issues/23-ocorrencias.md) deixa a frequência da cobrança aberta. `docs/padroes-provisorios.md:34` e a spec de Operação, linha 221, já estabelecem **uma vez por ocorrência**, embora a decisão definitiva de Carlos permaneça pendente.

O acervo (`../docs/negocio/06-negocio-operacao.md:119–125` e `07-questoes-abertas.md:24`) mantém a decisão empresarial final aberta. O achado é apenas a falta de propagação do padrão provisório explicitamente adotado pelo projeto, não uma exigência de encerrar a questão com Carlos.

**Correção proposta:** trazer esse padrão editável para o ticket e testar uma espera longa o suficiente para diferenciar cobrança única de recorrente. A pendência definitiva não impede usar o padrão já aprovado como provisório.

## 15. P3 — Importação exige 392 fotos onde existem 387 imagens

[Catálogo 05, linhas 3 e 12](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/catalogo-fornecedores-acesso/issues/05-traducoes-e-fotos.md) fala em 392 fotos e menciona apenas duas pastas vazias. A fonte `../docs/negocio/03-negocio-empresa.md:135–139` identifica **387 JPEGs e cinco entradas de diretório**: 282 imagens KTO + 105 próprias. Busan, Ganghwa, Jeonju, novas fotos e Pocheon são as pastas vazias.

**Correção proposta:** ajustar o total esperado para 387 imagens e registrar as cinco pastas vazias no resultado da importação.

## Questão em aberto, separada dos conflitos confirmados

[Custos 13, linha 3](/Users/jjunho/Projetos/CoreaLux/os.corealux.com/.scratch/custos-e-resultado/issues/13-fechamento-financeiro.md) permite fechamento após quitar/cancelar obrigações existentes e conciliar despesas. Entretanto, uma Reserva sem custo real não cria Conta (Custos 01), e deixa o Resultado `não verificável` (Custos 10). Não está definido se esse resultado pode ser congelado no fechamento. É preciso registrar a política e um critério de aceite; esta revisão não presume qual resposta o negócio deseja.

## Limites da revisão

Não foram executados testes da aplicação, pois não houve alteração funcional. Os testes existentes foram lidos como evidência dos requisitos de prazo. As propostas de correção acima ainda não foram aplicadas e as prioridades são julgamento de revisão, não rótulos novos do issue tracker.

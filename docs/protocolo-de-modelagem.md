# Protocolo de Modelagem de UI e Invariantes de Estado

Protocolo arquitetural agnóstico para aplicações de interface fundamentadas em componentes, estado endereçável, formulários e operações assíncronas. Define regras de autoridade de dados, transições de estado válidas, encapsulamento operacional e integridade de interface sem exigir framework ou biblioteca específicos. O Apêndice A mostra um mapeamento de referência para React.

**Convenção normativa:** "deve" e "não deve" indicam obrigação. "Recomenda-se" indica prática preferencial que pode ser dispensada com justificativa. Condições introduzidas por "quando" delimitam a aplicabilidade da regra; fora delas, a regra não se aplica.

Cada seção termina com uma pergunta de **Verificação**, utilizável em revisão e como ponto de partida para testes.

## 1. Princípios de Autoridade e Responsabilidade

### 1.1. Invariante Fundamental: Uma Autoridade por Fato

Para cada fato representado pela interface, deve existir uma autoridade identificável.

Cópias podem existir apenas quando possuem finalidade e ciclo de vida próprios — por exemplo, um rascunho deliberadamente divergente de sua versão persistida.

Quando duas representações do mesmo fato puderem divergir sem uma regra explícita de sincronização ou reconciliação, o modelo de estado é inválido.

**Verificação:** cada fato da interface possui uma autoridade identificável, sem cópias concorrentes desprovidas de política de reconciliação?

### 1.2. Autoridade por Natureza do Estado

Cada dado deve residir na camada responsável por seu ciclo de vida:

| Natureza do dado                    | Autoridade                                                    |
| ----------------------------------- | ------------------------------------------------------------- |
| Dados remotos                       | Camada responsável por consulta, cache, invalidação e mutação |
| Estado navegacional ou endereçável  | Endereço (URL, rota ou equivalente)                           |
| Estado efêmero de interação         | Componente ou subsistema local                                |
| Rascunho divergente do servidor     | Modelo local explicitamente versionado                        |
| Estado transicional interdependente | Máquina explícita de estados/transições                       |

Filtros, paginação, ordenação, abas, buscas e identificadores devem pertencer ao endereço quando precisarem sobreviver a recarga, histórico, compartilhamento ou _deep linking_.

**Invariante:** não criar uma segunda fonte de verdade para um estado que já possui autoridade definida.

O ciclo de requisição remota (carregando, erro, dados) não deve ser espelhado em estado global ou de página quando a camada de dados remotos já o gerencia.

**Garantias da infraestrutura:** antes de implementar manualmente os mecanismos dos Padrões 6, 11 e 14 (descarte de respostas tardias, controle de reentrada, cancelamento), verifique quais garantias a camada de dados, navegação ou formulário já oferece. Garantias existentes devem ser usadas, não reimplementadas; os padrões aplicam-se integralmente apenas às operações que a infraestrutura não cobre.

**Verificação:** algum estado já governado pela camada remota, pelo endereço ou pela infraestrutura está sendo replicado ou recoordenado manualmente?

### 1.3. Autoridade do Estado Local

O estado local deve representar dados cujo ciclo de vida pertence efetivamente à interface, incluindo:

- rascunhos em edição ativa (_drafts_) com reconciliação assíncrona;
- seletores interativos ricos, incluindo cursor, foco e navegação por teclado;
- filas locais e subfluxos assíncronos com ciclo de vida concorrente;
- fases e transições da interação que não constituem estado remoto ou navegacional.

Estado local não deve ser usado como réplica de dados cuja autoridade já pertence ao endereço ou à camada remota.

**Verificação:** todo estado local tem ciclo de vida próprio da interface, e não é cópia de dado remoto ou endereçável?

### 1.4. Critério Estrutural: Fase Simples vs. Máquina de Transições

Estados de fase expressos por uniões discriminadas, como:

```ts
type Fase = "ocioso" | "enviando" | "sucesso" | "erro";
```

devem permanecer como um valor de estado simples quando as transições forem lineares, isoladas e possuírem poucas invariantes compartilhadas.

Uma máquina explícita de transições (reducer, statechart ou equivalente) é indicada quando diferentes eventos alteram estado interdependente sob o mesmo conjunto de invariantes, quando a próxima transição depende significativamente do estado anterior ou quando representar explicitamente eventos e transições reduz estados inválidos.

O objetivo da máquina de transições não é fornecer atomicidade transacional, mas centralizar transições relacionadas e preservar invariantes entre partes do estado.

**Verificação:** o modelo impede combinações de campos, fases ou identidades que não deveriam poder coexistir?

### 1.5. Princípio do Dado Derivado Puro

Valores puramente calculáveis a partir de entradas do componente, endereço, estado existente ou respostas remotas não devem ser materializados em estado local nem sincronizados por efeitos colaterais.

Cálculos, filtros, ordenações, permissões de exibição e outras projeções devem ser derivados durante a renderização, com memoização quando o custo justificar.

Um valor derivado pode tornar-se estado próprio apenas quando adquirir identidade, ciclo de vida ou divergência próprios — por exemplo, quando um valor remoto inicializa um rascunho que depois pode ser editado independentemente.

**Origem do valor.** Quando um campo é pré-preenchido a partir de outra fonte e pode ser editado, o modelo deve distinguir a origem de cada valor:

```ts
type Valor<T> =
  | { origem: "derivado"; valor: T } // ainda acompanha a fonte
  | { origem: "editado"; valor: T; baseDerivada: T }; // alterado pelo usuário
```

Quando a fonte mudar:

- valores de origem `derivado` devem ser recalculados;
- valores de origem `editado` devem ser preservados; se a nova fonte os tornar inválidos, ou se a política do campo exigir, o conflito deve ser sinalizado antes de qualquer substituição.

Essa distinção resolve a interação entre ações parciais (Padrão 5) e troca de identidade (Padrão 8): o que é recalculado e o que é preservado decorre da origem de cada valor, não da ação que a disparou.

**Verificação:** valores puramente calculáveis permanecem derivados? Campos pré-preenchidos e editáveis registram se foram alterados pelo usuário?

### 1.6. Encapsulamento do Ciclo de Operação

A complexidade necessária para preservar conjuntamente as invariantes de uma operação deve ficar concentrada atrás da fronteira que representa essa operação.

Quando uma operação exigir coordenação entre início, bloqueio de reentrada, identidade da tentativa, cancelamento, reconhecimento do resultado e recuperação de falhas, o consumidor não deve precisar montar esse protocolo manualmente.

**Regra:** encapsule o ciclo coerente da operação atrás de uma interface que expresse intenções e resultados. O consumidor deve saber **o que solicitar e quais estados observar**, sem precisar conhecer a ordem interna de atualização de referências, contadores, flags ou identificadores.

Essa fronteira pode ser implementada pela abstração mais simples adequada ao caso — função, componente, máquina de transições, objeto ou módulo — e pode compor mecanismos existentes do roteador, formulário ou camada remota. Não deve criar uma segunda autoridade sobre estados já gerenciados por essas camadas.

**Sinais observáveis de encapsulamento insuficiente:**

- dois ou mais consumidores repetem a mesma sequência de passos para usar a operação;
- um consumidor lê ou escreve contadores, identificadores de tentativa, referências ou flags internas da operação;
- corrigir uma falha de concorrência da operação exige alterar consumidores, e não apenas a operação.

**Verificação:** o consumidor consegue solicitar a operação e observar seu resultado sem coordenar manualmente seus mecanismos internos?

### 1.7. Princípios de Desenho

#### DRY: centralize conhecimento, não apenas trechos semelhantes

Quando uma mesma regra precisar mudar, deve existir uma fonte de conhecimento claramente responsável por essa regra.

Código visualmente semelhante não exige uma abstração compartilhada quando representa regras ou ciclos de vida diferentes. Compartilhe somente invariantes realmente comuns, preservando políticas específicas de cada fluxo.

#### KISS: minimize a complexidade total da solução completa

Escolha a organização menos complexa capaz de cumprir todos os requisitos, incluindo concorrência, falhas, recuperação e consistência.

Avalie a complexidade pela quantidade de conceitos, dependências e regras que precisam ser compreendidos simultaneamente — não apenas pelo número de linhas, arquivos ou funções.

Uma extração só representa melhoria quando reduz o conhecimento exigido dos consumidores e mantém as regras relacionadas sob coordenação explícita.

Evite:

- distribuir a mesma coordenação entre várias unidades sem encapsulá-la;
- criar um gerenciador universal com configurações e exceções para fluxos diferentes;
- remover proteções necessárias para tornar o código aparentemente simples;
- introduzir abstrações adicionais quando uma operação local simples já expressa completamente o comportamento.

**Verificação:** cada invariante tem uma fonte de conhecimento responsável? Os mecanismos compartilhados representam invariantes realmente comuns? A organização reduz o que precisa ser compreendido simultaneamente, preservando todos os comportamentos necessários?

---

## 2. Invariantes de Estado e Padrões de Prevenção de Falhas

**Autoridade de imposição:** o cliente detecta violações; quem persiste os dados as impede. Sempre que um padrão depender de revisão, identidade de prévia, idempotência ou permissão, a autoridade persistente deve verificar essa condição e recusar a operação que a viole, independentemente do comportamento do cliente.

### Padrão 1: Confirmação de Persistência

**Anti-padrão:** marcar o estado local como "salvo" ou limpar a flag de modificação pendente (`dirty = false`) no início da submissão.

**Regra:** o estado só transita para "persistido" após confirmação explícita de conclusão segundo o contrato da operação.

Respostas que representem apenas aceitação, enfileiramento ou processamento pendente devem produzir um estado intermediário correspondente, e não "persistido". Isso inclui operações retidas em fila local enquanto não há conexão.

Em caso de falha de rede, validação ou processamento, a flag de modificação e os dados necessários à nova tentativa devem ser preservados.

Ações que dependem da persistência efetivamente concluída devem permanecer bloqueadas enquanto essa condição não estiver confirmada. Exibir a mudança antes da confirmação é permitido nos termos do Padrão 2.

**Verificação:** a interface só considera o dado persistido após a confirmação definida pelo contrato? Operações aceitas, enfileiradas ou pendentes permanecem distintas das concluídas? Falhas preservam os dados necessários à nova tentativa?

### Padrão 2: Atualização Otimista Reversível

**Anti-padrão:** aplicar a mudança diretamente sobre o estado confirmado, perdendo o valor anterior, ou tratar a exibição imediata como persistência.

**Regra:** quando a interface exibir o efeito de uma operação antes da confirmação, o estado exibido deve ser uma projeção do estado confirmado mais as operações pendentes:

```text
exibido = confirmado + pendentes (em ordem de emissão)
```

- o estado confirmado continua sendo a autoridade e só muda com a confirmação (Padrão 1);
- cada operação pendente possui identidade própria (Padrão 11);
- recusa de uma operação remove apenas essa operação da projeção, preservando as demais pendentes e informando o usuário sobre a reversão;
- confirmação substitui a projeção pelo resultado autoritativo, que pode diferir do previsto;
- ações que exigem persistência confirmada continuam bloqueadas enquanto houver pendência relevante.

Quando operações pendentes sobre o mesmo dado puderem ser confirmadas fora de ordem, o resultado autoritativo deve prevalecer segundo a revisão ou sequência definida pela autoridade persistente, não pela ordem de chegada das respostas.

**Verificação:** a recusa de uma operação otimista restaura o estado correto sem desfazer outras pendentes? A interface distingue o que está exibido do que está confirmado?

### Padrão 3: Integridade de Snapshot e Rascunho Concorrente

**Anti-padrão:** mesclar cegamente atualizações remotas com um rascunho local em edição ou reutilizar a mesma instância de formulário para outra entidade sem reinicializar ou reconciliar seu rascunho.

**Regra:** todo rascunho que possa divergir da versão remota por mais do que uma interação isolada deve vincular explicitamente sua identidade e versão base:

```ts
type Rascunho<T> = { entidadeId: string; baseRevision: string; draft: T };
```

Revalidações remotas não devem sobrescrever campos editados sem uma política explícita de reconciliação.

Se a versão remota mudar enquanto houver edição local divergente, o sistema deve reconciliar as versões segundo uma regra definida ou sinalizar o conflito antes de substituir dados.

A submissão deve enviar a `baseRevision`, e a autoridade persistente deve recusar a gravação quando a revisão atual for diferente, devolvendo um conflito tratável (Padrão 13).

**Verificação:** rascunhos divergentes identificam entidade e revisão base? A persistência recusa gravações baseadas em revisão obsoleta?

### Padrão 4: Paridade Estrita entre Prévia e Submissão

**Anti-padrão:** permitir que o usuário altere os dados de entrada depois da geração de uma prévia e confirme a operação utilizando dados diferentes daqueles que foram revisados.

**Regra:** a submissão confirmada deve corresponder exatamente ao snapshot que produziu a prévia apresentada ao usuário.

Qualquer alteração material nos dados de entrada deve invalidar a prévia ou bloquear a confirmação até que uma nova prévia seja produzida.

Quando a prévia tiver consequência material (valores, documentos, envios, cobranças), ela deve possuir identidade, hash ou versão própria; a confirmação deve referenciá-la, e a autoridade persistente deve recusar a confirmação se os dados atuais não corresponderem a ela.

**Verificação:** é impossível confirmar dados diferentes daqueles usados para produzir a prévia apresentada, inclusive por requisição direta à autoridade persistente?

### Padrão 5: Contenção de Escopo em Ações Parciais

**Anti-padrão:** permitir que uma operação de preenchimento, geração ou substituição de um bloco descarte modificações locais pendentes em outros campos.

**Regra:** ações que modificam subpartes de uma entidade devem declarar e respeitar limites estritos de mutação.

Campos fora do escopo da ação devem conservar suas edições locais, salvo quando existir uma dependência explícita que torne esses valores inválidos. Dentro do escopo, a ação segue a regra de origem do valor (seção 1.5).

**Verificação:** ações parciais preservam dados fora de seu escopo, salvo dependência explicitamente definida?

### Padrão 6: Identidade de Contexto e Descarte de Respostas Tardias

**Anti-padrão:** assumir que o contexto ativo quando uma operação assíncrona termina é o mesmo contexto existente quando ela foi iniciada.

**Regra:** toda resposta assíncrona deve ser aplicada apenas se ainda pertencer ao contexto que a originou.

A validação deve considerar a identidade relevante da interface, como entidade, página, conversa ou canal.

Quando múltiplas operações para a mesma identidade puderem coexistir, a identidade da entidade isoladamente é insuficiente. Deve ser usada também uma geração, revisão, sequência ou identificação da tentativa.

Exemplo:

```text
entidade A → request #1
entidade A → request #2

#2 retorna
#1 retorna depois
```

A resposta de `#1` não pode sobrescrever o resultado mais recente apenas porque ambas pertencem à entidade A.

**Verificação:** respostas assíncronas verificam contexto e identidade da tentativa antes de alterar o estado? Uma resposta antiga pode sobrescrever uma mais nova para a mesma entidade?

### Padrão 7: Desacoplamento entre Efeito de Domínio e Navegação

**Anti-padrão:** permitir que a conclusão tardia de uma mutação altere automaticamente o foco ou a rota da interface, ignorando navegação ocorrida enquanto a operação estava pendente.

**Regra:** o efeito de domínio da operação e seu efeito de navegação são decisões independentes.

A conclusão da mutação deve atualizar, invalidar ou reconciliar o recurso persistido segundo a arquitetura da aplicação sem interferir automaticamente na navegação atual.

Navegação após uma mutação só deve ocorrer quando fizer parte explícita da interação solicitada, como "Salvar e voltar", e ainda assim apenas se o usuário permanecer no contexto que a solicitou (Padrão 6).

**Verificação:** a conclusão de uma operação altera a navegação atual apenas quando navegar faz parte explícita da ação e o contexto de origem ainda está ativo?

### Padrão 8: Atomicidade na Troca de Identidade

**Anti-padrão:** alterar a identidade principal de uma entidade e conservar dados secundários cuja validade dependia da identidade anterior.

**Regra:** uma mudança de identidade deve invalidar atomicamente todos os dados cuja validade dependia da identidade anterior.

Esses dados devem ser removidos, recalculados ou substituídos a partir da nova identidade antes que o estado possa ser considerado válido para submissão. Valores derivados da identidade seguem a regra de origem do valor (seção 1.5): os de origem `derivado` são recalculados; os de origem `editado` são preservados apenas se continuarem válidos sob a nova identidade, e sinalizados caso contrário.

Isso se aplica tanto a:

```text
entidade existente A → entidade existente B
```

quanto a:

```text
entidade existente → novo cadastro
novo cadastro → entidade existente
```

Estados híbridos compostos por identidade nova e metadados herdados da identidade anterior são inválidos.

**Verificação:** a troca de entidade invalida, substitui ou recalcula todos os dados dependentes da identidade anterior, sem descartar silenciosamente edições ainda válidas?

### Padrão 9: Validade de Seleção em Seletores Interativos

**Anti-padrão:** conservar um índice de navegação que passou a apontar para outra opção ou deixou de existir depois que a lista foi filtrada ou reordenada.

**Regra:** após qualquer alteração na coleção de opções, a seleção ativa deve continuar referenciando uma opção válida; caso contrário, deve ser recalculada ou resetada.

Quando as opções possuírem identidade estável, a seleção deve ser representada por identidade (`selectedId`) e não por posição (`selectedIndex`).

O evento de confirmação, como Enter, deve distinguir categoricamente:

- seleção de uma entidade existente;
- criação de uma nova entidade a partir de texto livre;
- ausência de seleção válida.

**Verificação:** filtragem ou reordenação de opções nunca deixa cursor ou seleção apontando para uma opção inválida? A confirmação distingue os três casos acima?

### Padrão 10: Sincronização de Controles com o Histórico de Navegação

**Anti-padrão:** utilizar controles que apenas leem seu valor inicial para representar valores cuja autoridade é o endereço e que podem mudar por Voltar, Avançar ou navegação programática.

**Regra:** controles cuja autoridade é o endereço devem refletir diretamente o valor atual do endereço.

Remontar o controle quando o valor do endereço mudar pode ser usado quando o componente não oferecer mecanismo adequado de sincronização e quando o reset integral de seu estado interno for desejado.

O histórico de navegação deve restaurar tanto a representação visual quanto os valores semanticamente governados pelo endereço.

**Verificação:** Voltar e Avançar restauram corretamente os controles cuja autoridade pertence ao endereço?

### Padrão 11: Controle de Reentrada e Identidade da Tentativa

**Anti-padrão:** confiar exclusivamente no estado visual desabilitado de um controle para impedir múltiplos disparos de uma operação assíncrona.

**Regra:** o manipulador da ação deve verificar se uma tentativa incompatível já está ativa antes de iniciar outra operação.

Cada tentativa relevante deve possuir identidade estável até sua conclusão, permitindo correlacionar a resposta com a operação que a originou.

Em caso de falha, os dados necessários à nova tentativa devem ser preservados.

Bloqueio de duplo clique no cliente não equivale a idempotência da operação.

Quando duplicações puderem produzir consequências materiais, a autoridade persistente deve oferecer semântica idempotente, chave de idempotência ou mecanismo equivalente para reconhecer tentativas repetidas, inclusive reenvios após falha de rede cuja resposta se perdeu.

**Verificação:** o manipulador impede disparos concorrentes incompatíveis independentemente do estado visual? Respostas são correlacionáveis com a tentativa que as originou? Operações com consequência material são protegidas também na autoridade persistente?

### Padrão 12: Associação Rígida de Feedback Transitório

**Anti-padrão:** utilizar flags booleanas isoladas, como:

```ts
success = true;
copied = true;
```

para governar feedback relacionado a um dado específico.

**Regra:** feedback transitório deve identificar o objeto, valor ou operação que o originou.

Exemplos:

```ts
copiedValue;
savedEntityId;
successfulAttemptId;
```

Se o dado exibido mudar antes da expiração do feedback, o indicador anterior deve deixar de ser apresentado.

Falhas de APIs da plataforma (área de transferência, armazenamento, permissões, compartilhamento) devem ser tratadas explicitamente e não podem produzir feedback falso de sucesso.

**Verificação:** indicadores temporários identificam especificamente o dado ou operação que os originou e desaparecem quando o dado muda? Falhas da plataforma deixam de produzir sucesso aparente?

### Padrão 13: Roteamento de Erros Recuperáveis

**Anti-padrão:** encaminhar erros recuperáveis de domínio ou validação diretamente para telas genéricas de erro, descartando contexto e dados necessários à correção.

**Regra:** erros recuperáveis devem retornar uma representação estruturada ao contexto que iniciou a operação.

O rascunho deve ser preservado e os erros devem ser associados aos campos, entidades ou ações correspondentes quando essa associação existir.

A classificação deve considerar o significado da falha, e não apenas sua categoria de protocolo. Em HTTP, por exemplo, respostas `4xx` podem representar validação, autenticação, autorização, conflito, recurso inexistente, precondição ou limitação de taxa, e devem seguir a política adequada ao seu significado.

Falhas não recuperáveis naquele contexto podem seguir o mecanismo global de erro da aplicação.

**Verificação:** erros corrigíveis voltam ao contexto de origem, associados ao que os causou, sem destruir o rascunho? O tratamento depende do significado da falha?

### Padrão 14: Cancelamento de Trabalho Obsoleto

**Anti-padrão:** manter operações assíncronas em andamento depois que seu resultado deixou de possuir consumidor válido, dependendo exclusivamente do descarte posterior da resposta.

**Regra:** quando a infraestrutura permitir, operações tornadas obsoletas por troca de contexto, nova consulta ou encerramento do consumidor devem ser canceladas, evitando processamento e tráfego desnecessários.

Cancelamento não substitui a validação de identidade da resposta: nem toda operação é cancelável e uma conclusão pode competir com o cancelamento.

Portanto:

```text
cancelamento + validação de identidade
```

e não:

```text
cancelamento OU validação de identidade
```

Operações de escrita já enviadas não devem ser consideradas desfeitas por cancelamento no cliente: o resultado na autoridade persistente é desconhecido até ser confirmado ou reconciliado.

**Verificação:** trabalho tornado obsoleto é cancelado quando a infraestrutura permite, sem dispensar a validação de identidade? Escritas canceladas no cliente são tratadas como de resultado desconhecido?

---

## 3. Matriz de Decisão Arquitetural

| Tipo de interação                       | Autoridade                         | Mecanismo                                                  | Justificativa                                                                        |
| --------------------------------------- | ---------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Dados remotos                           | Camada de dados remotos            | Carregamento por rota, cache de consultas ou equivalente   | Evita caches e ciclos remotos paralelos sem autoridade definida.                     |
| Filtros, paginação e estado endereçável | Endereço                           | Parâmetros de rota ou de consulta                          | Preserva recarga, histórico, compartilhamento e _deep linking_.                      |
| Mutação simples                         | Camada de mutação remota           | Ação de rota, mutação de formulário ou equivalente         | Mantém a operação próxima da autoridade responsável pela persistência e revalidação. |
| Mutação com exibição imediata           | Estado confirmado + pendentes      | Projeção otimista com reversão por operação                | Oferece resposta imediata sem confundir exibição com persistência.                   |
| UI efêmera isolada                      | Componente                         | Estado local simples                                       | Evita elevar estado sem necessidade.                                                 |
| Estado local interdependente            | Máquina local de transições        | Reducer, statechart ou equivalente                         | Centraliza eventos e preserva invariantes entre campos relacionados.                 |
| Autocomplete e seletores ricos          | Componente/subsistema do seletor   | Máquina de transições quando houver estado interdependente | Mantém texto, seleção, abertura e navegação sob regras comuns.                       |
| Formulário complexo com auto-save       | Modelo local versionado            | `{ entidadeId, baseRevision, draft, status }`              | Isola o rascunho de revalidações remotas e permite detectar conflitos.               |
| Campos pré-preenchidos editáveis        | Modelo local com origem do valor   | `{ origem: "derivado" \| "editado", valor }`               | Permite recalcular padrões sem descartar edições do usuário.                         |
| Operações concorrentes                  | Contexto + identidade da tentativa | Identificador de tentativa, geração, revisão, cancelamento | Impede que resultados obsoletos alterem o contexto atual.                            |
| Filas e mensagens concorrentes          | Contexto isolado por identidade    | Máquina de transições ou estrutura equivalente             | Previne vazamento de estado e aplicação de respostas fora de ordem.                  |

---

## Apêndice A: Mapeamento de Referência para React

Exemplos não normativos de como os conceitos deste protocolo se expressam em React e APIs web. Outros frameworks possuem equivalentes.

| Conceito do protocolo                          | Expressão em React / web                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| Estado local simples                           | `useState`                                                                              |
| Máquina local de transições                    | `useReducer`, ou biblioteca de statecharts                                              |
| Sincronização por efeitos colaterais (1.5)     | `useEffect` que copia valores derivados para estado — anti-padrão                       |
| Memoização de derivados                        | `useMemo`                                                                               |
| Entradas do componente                         | `props`                                                                                 |
| Fronteira de operação (1.6)                    | hook customizado, função de módulo ou componente                                        |
| Parâmetros de consulta do endereço             | `URLSearchParams`, `useSearchParams` do roteador                                        |
| Controle que só lê o valor inicial (Padrão 10) | `defaultValue` em controle não controlado                                               |
| Remontagem com reset (Padrão 10)               | atribuir `key` derivada do valor do endereço                                            |
| Projeção otimista (Padrão 2)                   | `useOptimistic`, estado pendente de fetchers/mutações do roteador ou da camada de dados |
| Cancelamento (Padrão 14)                       | `AbortController` / `AbortSignal` repassado ao `fetch`                                  |
| Área de transferência (Padrão 12)              | `navigator.clipboard.writeText`, cuja promessa pode ser rejeitada                       |

## Apêndice B: mapa de responsabilidades desta aplicação

Este mapa registra a aplicação do protocolo neste repositório; não acrescenta regras comerciais.

| Contexto | Decisão/estado local | Efeito e autoridade persistente | Apresentação |
| --- | --- | --- | --- |
| Orçamento | `orcamentos/editor.ts`, `em-voo.ts` e `editor-transicoes.ts` guardam revisão, slots por tentativa e transformações sem IO | `use-editor-orcamento.ts` coordena formulários/fetchers; `routes/orcamento.tsx` mantém loader/action; `orcamentos/*.server.ts` persistem | `EditorOrcamento.tsx` e folhas `*Editor.tsx` recebem ações e escritores do seu segmento |
| Comunicador | `estado-painel.ts`, `conteudo.ts`, `estado-ui.ts` e `use-maquina.ts` decidem seleção, conteúdo e compositor | `use-painel.ts` compõe `consultas.client.ts`, `caixa.client.ts`, `api.client.ts`, `presenca.client.ts` e `eventos.client.ts`; `api.server.ts` despacha sobre serviços server | `Painel.tsx` compõe as folhas `Lista*`, `Compositor`, `Midia`, `GrupoForm`, `Preferencias` e `PainelTarefa` |
| Regras operacionais | `quadros/decisoes.ts`, `tarefas/decisoes.ts`, `acesso/regras.ts`, `opcoes/normalizacao.ts`, `notificacoes/inscricao.ts` recebem dados e devolvem decisões | Os respectivos `*.server.ts` mantêm autenticação, locks, transações, SQL e publicação; consultas da rota foram movidas a `notificacoes/leituras.server.ts` e `documentos/proposta.server.ts` | Rotas adaptam HTTP e componentes exibem resultados; não executam SQL |
| Planejamento e shell | `viagens/tentativa-planejamento.ts` identifica tentativa; `idiomas/idioma.ts` usa DTO de root | `tentativa-planejamento.client.ts` assina/persiste tentativa; `comunicador/shell.client.ts` e `notificacoes/push.client.ts` detêm APIs do navegador | Formulário e layout apresentam erro recuperável e preservam idioma/estado |
| Ferramentas | `tests/e2e/ambiente.ts` define somente a URL do banco de teste | `scripts/db.sh` gerencia o cluster; configuração E2E inicia servidor de teste na porta 5179 | `.claude` aponta a `.agents`, sem elo circular de retorno |

### Registro de fechamento da separação de responsabilidades

Cada linha associa o achado ao seu dono e à verificação executada. A bateria completa E2E teve 167 aprovações e quatro falhas localizadas de sincronização/seletores nos testes; os quatro cenários corrigidos passaram em execução direcionada. `pnpm typecheck` passou, o caso unitário corrigido passou e `pnpm build` passou. A navegação real em 390 px confirmou `documentElement.scrollWidth === clientWidth === 390` após ajustar a quebra do cabeçalho.

| ID | Arquivo/símbolo e cenário | Resultado observado |
| --- | --- | --- |
| E01 | `routes/orcamento.tsx` / `EditorOrcamento.tsx` / `use-editor-orcamento.ts`; edição, salvamento, prévia e importação | Orçamento criado e copiado no navegador; edição persistiu após recarga; prévia do pedido e exportação/revisão/aplicação de Excel exercitadas; regressões unitárias do editor e fluxos E2E passaram. |
| E02 | `orcamentos/editor-transicoes.ts`; cópia de opção e identidade das linhas | Duas opções distintas e origem editada preservada após recarga; testes do editor passaram. |
| E03 | `comunicador/consultas.client.ts`, `caixa.client.ts`, `api.client.ts`; resultado tardio, fila offline e confirmação perdida | Cenários E2E do comunicador e os cenários offline direcionados passaram; conversa direta abriu no navegador. |
| E04 | `comunicador/tipos.ts`, `acesso.server.ts`, `preferencias.server.ts`, `presenca.server.ts`; acesso e presença | Imports migrados; `pnpm typecheck` e casos E2E de conversa passaram. |
| E05 | `notificacoes/eventos.server.ts`; publicação sem reexport do servidor de conversa | Compilação e cenários E2E de notificações/conversa passaram. |
| E06 | `idiomas/idioma.ts` / `routes/app-layout.tsx`; DTO e mudança de idioma | Orçamento renderizado em português e coreano no navegador; typecheck passou. |
| E07 | `notificacoes/leituras.server.ts`, `documentos/proposta.server.ts`, `comunicador/api.server.ts`; leitura e despacho | Rotas compiladas e bateria E2E de integrações passou. |
| E08 | `quadros/decisoes.ts` / `tarefas/decisoes.ts`; movimento e permissão | Casos de decisão e fluxos E2E de quadros/tarefas passaram. |
| E09 | `viagens/tentativa-planejamento.ts` / `.client.ts`; assinatura, storage e JSON malformado | Casos unitários de tentativa e fluxos E2E de planejamento passaram. |
| E10 | `.agents/.claude`; remoção do elo circular | Elo removido; link raiz `.claude -> .agents` preservado. |
| E11 | `.gitignore`; preferências locais e arquivos Finder | `git check-ignore` confirmou `.agents/settings.local.json` e `.DS_Store`; `.scratch` continua disponível. |
| E12 | `tests/e2e/ambiente.ts`; URL do teste | Configuração e sete consumidores usam `corealux_test`; E2E executou no banco isolado. |
| P01 | `interface/use-maquina.ts` e `orcamentos/em-voo.ts`; dois submits síncronos | Regressão E2E direcionada passou, sem duas tarefas criadas. |
| P02 | `orcamentos/*Editor.tsx` / `comunicador/ListaMensagens.tsx`; ações por segmento | Typecheck e fluxo real do orçamento renderizado passaram. |
| P03 | `comunicador/consultas.client.ts`; cursor, geração e sincronização durante abertura | Casos E2E do comunicador passaram. |
| P04 | `comunicador/api.client.ts`; status HTTP e perda de confirmação | Cenários E2E de fila/erro passaram. |
| P05 | `interface/Busca.tsx`; tipo vindo de `viagens.server.ts`, não da rota | Navegação real com busca vazia e setas/Enter conservou o diálogo; teste direcionado passou. |
| P06 | `quadros/decisoes.ts`; renomear e criar lista com autorização própria | Fluxos E2E de quadros passaram. |
| P07 | `comunicador/use-painel.ts` / `endereco.ts`; URL como entrada, seleção local | Conversa direta aberta no navegador; cenários de seleção E2E passaram. |
| P08 | `interface/Busca.tsx`; índice clampado na lista vazia | Setas/Enter não navegaram nem fecharam o diálogo; teste direcionado passou. |
| P09 | `tsconfig.json`; configuração existente | Nenhuma mudança de compilação necessária; `pnpm typecheck` passou. |
| P10 | Rotas adaptadoras e módulos de domínio citados acima; dependências orientadas | Checagens estruturais não acharam imports de rotas/root/+types em módulos nem SQL nas rotas extraídas. |
| P11 | `comunicador/use-painel.ts`, `presenca.client.ts`, `caixa.client.ts`; grupo/DND/interna/reconexão | Casos E2E de comunicador e offline direcionado passaram. |
| P12 | `opcoes/normalizacao.ts`, `tarefas/decisoes.ts`, `viagens/tentativa-planejamento.client.ts`; mesclagem/recusa/JSON | Testes de regras e fluxos E2E passaram. |

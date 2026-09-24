# Padrões provisórios

Resposta que o Corealux OS dá a cada questão ainda aberta em
`../docs/negocio/07-questoes-abertas.md`, até que Carlos decida. Tudo aqui é
**valor sugerido e editável por Orçamento** (ADR-0001), ou **a informar**
quando não há resposta do Carlos nem número de partida (hoje: IVA).

“Seguir correção recomendada” é lido como adoção da recomendação, com seus
números. As ressalvas “sem confirmação desses números” / “alternativa não
escolhida” que aparecem em `negocio/05`, `07` e na coluna “Contexto” de S152 são
síntese editorial posterior, não falas do Carlos; o texto original da auditoria
não está no acervo. O acervo foi corrigido nesse sentido (K891, K894, K916 e
K927 vigentes desde o commit `407ed21` de `../docs`).

Quando Carlos decidir, a decisão vai para o acervo (K-unit) e para a Tabela de
referência (ADR-0002), e a linha correspondente sai deste arquivo.

| Questão | Padrão provisório | Por quê (evidência) |
|---|---|---|
| **KTX — adicional** (K891) | +20% sobre o bilhete KTX quando o trecho cai em dia de feriado nacional coreano, por bilhete, para clientes e equipe; em feriado e véspera, alerta sobre falta de assento em executiva e sugere econômica. | Carlos: “seguir correção recomendada” (B13) para unificar o adicional; K465 (Carlos, 17/07: “adicionar 20% à tarifa se o trecho de KTX cair em dia de feriado”) e K543 e preferem econômica por falta de assento. |
| **Ônibus — empilhamento** (K894) | `KRW × fator de tamanho × max(temporada do ônibus, fds/feriado) × 1,15`, convertido com a taxa da data. Cotação real do fornecedor, quando existe, substitui a tabela. | Carlos: “seguir correção recomendada” (B16); a fórmula é a da recomendação da auditoria. |
| **IVA 10%** (K922, K933) | **A informar por Proposta**: não cobrado, sempre, ou conforme forma de pagamento. Quando cobrado, entra em linha própria sobre o total arredondado, antes de cartão/PIX. | Carlos: “Definir se vamos cobrar sempre ou somente a depender da forma de pagamento” (quadro inicial, S152); K933 aberta em `07`. |
| **Faixa entre meia e diária** (K927) | Até 4h: 0,60. Mais de 4h até 6h: 0,80. Mais de 6h: diária completa. Mesmo fator para guia, assistente e carro; não vale para transfer. | Carlos: “seguir correção recomendada com faixa intermediaria” (B49); 4–6h = 80% é a faixa da recomendação. |
| **Margem real mínima** (K920) | No Orçamento a margem é estimada e aparece como **“não verificável”** enquanto faltarem custos reais; o piso de 10% é conferido no Resultado da viagem. Abaixo de 10% (estimado ou real): alerta, motivo registrado e aviso ao Admin; nada impede enviar. Quem aprova exceções segue aberto. | Carlos: “Minimo de 10% de margem” (B42). `negocio/05`/K920: sem custos reais, não declarar o piso verificado; a expressão “margem não verificável” vem do prompt de 13/09. |
| **Reembolso — base comparável** (K916) | Converte o valor pago em BRL para USD pela taxa do dia do reembolso e devolve o menor entre esse valor e o valor reembolsável contratado em USD; a conversão fica registrada. | Carlos: “seguir correção recomendada” (B38): reembolso em USD ou BRL pela taxa do dia, o que for menor. Comparar exige converter para uma moeda; USD é a moeda do cálculo (K225). |
| **Multa × processamento** (K917) | Dedução de item de terceiro = multa do fornecedor + 10% de processamento sobre o valor do item. | Leitura direta de K917 (“taxa de cancelamento mais 10% de processamento”); a multa do fornecedor prevalece (K852). |
| **Capacidade de veículo** (K885–K887) | Cadastro guarda assentos físicos. Na alocação, o sistema desconta motorista e equipe sentada e mostra a capacidade líquida para clientes; o limite de conforto é alerta, não teto. | Guardar o número físico e descontar uma única vez elimina a dupla dedução que K887 aponta. |
| **Crianças e bebês** (K925) | Ingressos, hotel e voos usam as regras de idade de cada Fornecedor/Atração (Tarifário, tarifa infantil). Serviços próprios (guia, carro) contam crianças como pax. Bebê (< 2 anos) conta assento no veículo. | Carlos: “Buscar informação (ver referencias)” (B47): as referências são as regras de cada fornecedor (ex.: hotéis com faixas de 48 meses a 13 anos). |
| **Custo intermunicipal por API** (K930) | Sem API no primeiro momento: linha por trecho com custo digitado (e sua fonte) + 20%. | K930 define a regra de +20%, mas não identifica API; custo manual cumpre a regra hoje. |
| **Calendário de feriados** (K892–K893) | Tabela anual de feriados nacionais coreanos cadastrada por ano. Faixas de temporada são dia/mês e incluem 29/02 na faixa que contém fevereiro; temporada baixa do ônibus vai até o último dia de fevereiro. | Lista anual já é vigente; datas por dia/mês com fim “último dia do mês” resolvem o ano bissexto sem regra especial. |
| **Feriados estaduais/municipais** (K076) | Não aplicados automaticamente; podem ser marcados manualmente numa data do Orçamento. | K076 só considera feriados nacionais. |
| **Custo real do cartão** (K915) | Manter 5% como padrão; registrar a taxa efetiva cobrada em cada pagamento, para permitir revisar o padrão com dados. | Mantém a regra vigente e gera a evidência que falta. |
| **Gorjeta** (K026, K400, K553, K898) | Desligada por padrão (regra vigente). Um clique a mostra no Orçamento e na Proposta como valor **sugerido, não incluído**, com os valores de K898. Agência pode optar por pagar adiantado (vira Pagamento e Conta a pagar às equipes). Rateio proporcional aos dias trabalhados. | K553/K898 vigentes; Carlos (27/07) quer que a gorjeta seja “mencionada no orçamento… dizer que é sugerido” e que agências possam pagar adiantado. |
| **Adicional de espera** (K561, K114) | 10% após 90 min do pouso, cobrado uma vez por ocorrência. | Disposição provisória (CAMPO) registrada no acervo em K114; a questão segue aberta para Carlos em `07` (ele disse só “ignorar por enquanto”). |
| **Dia do transfer no roteiro** (K566, K142) | Transfer de chegada é Dia 1; contagem editável por Roteiro. | Disposição provisória (CAMPO) registrada no acervo em K142; segue aberta para Carlos em `07`, e a prática dele é “Dia 0 … Dia da Chegada”. Os documentos reais usam as duas convenções (Rachel 2025 começa em Dia 0; Interep/Leda e Turis VIP em Dia 1), por isso a contagem fica editável. |
| **Número de cliente** (K570) | `CLX` + ano (2) + sequência (3) + Luhn, padrão `^CLX\d{6}$`, exibição opcional `CLX26 0018`. Ao chegar perto de 999 no ano, o sistema avisa; a evolução do formato é decisão aberta. Nunca reutilizar. | Especificação de 25/08/2026; K570 deixa a evolução para decisão. |
| **Bebê em grupo Jeju Air após emissão** | Tratar como não garantido: o sistema alerta para incluir bebês antes da emissão do grupo. | Manuais S092 e S093 divergem; o caminho seguro é o que ambos permitem. |

Não entram aqui B02 (markup) e B03 (custos), que Carlos deixou sem resposta:
continuam como referências vigentes de `negocio/05`, editáveis por Orçamento.

## O que as planilhas reais mostram

Conferido nos orçamentos, propostas, voucher, roteiros e agenda extraídos em
`../docs/01-extracoes-do-conhecimento-bruto/`. Não muda a regra vigente; muda
o que o sistema precisa suportar.

- **O orçamento é montado por Dia.** Cada linha é uma data com cidade/trecho,
  período (dia completo, meio período, dia livre), programa manhã/tarde e o
  custo do dia somado (guia + carro + tickets + transfer + trem/avião).
  (Interep/Leda S033; modelo v4 S032.)
- **Um orçamento traz várias Opções lado a lado**: por número de pax (Marcelo
  Xtravel: 6, 7, 8, 9, 10 e 11 pax, com letras A–E), por hotel (colunas de
  hotel alternativas) e por datas (Leda: mesmo serviço com margem 10% numa
  data e 35% em pico). O pedido do Carlos para a IA já pede duas Opções
  (10 + 2 gratuidades e 12 + 2). Opção é conceito de primeira classe.
- **Hotel fica fora da margem, com conta própria em KRW** (tarifa + taxas +
  café, por quarto e noite), e entra no total depois. Na prática observada o
  câmbio foi fixo (÷1300) e a segurança variou entre ×1,02 e ×1,03; a regra
  vigente é Naver × 1,10 e hotel ×1,05, e é ela que vira Valor sugerido.
- **Valores praticados passam das tabelas** (guia USD350 e carro USD300–400
  em cotações de 2025/2026 contra 260–320 e 180–450 da tabela): confirma que
  tarifa é negociada e que o Ajuste manual será usado a todo momento, não como
  exceção.
- **Preço por pessoa** sai em quarto duplo e em quarto single, dividido pelos
  pagantes.
- **Cotação rápida existe**: Carlos cotou um bate-volta a Busan como lista
  simples de itens, total e por pessoa, sem dias nem margem explícita (S069).
  O sistema precisa aceitar um Orçamento de um Dia só, com linhas soltas.
- **Roteiro operacional mistura programa e pendências** (“comprar KTX OK”,
  “fazer K-ETA OK”) dentro de cada dia: Pendência pertence ao Dia.
- **Agenda de tours** é a visão por data de todas as Viagens em paralelo, com
  equipe, carro e checagens (carro? entradas? almoço? hotel?); cinza = a
  confirmar. É uma visão das Alocações, não um documento à parte.
- **Voucher** tem versão (“Versão 2”), código da viagem por data de chegada,
  contato de emergência e, por trecho, o profissional responsável com telefone.
- **Planilha de clientes** guarda negociação em texto livre na coluna do link
  (“Só DMZ 600 usd / … / usd 1600”): o histórico de negociação precisa de um
  lugar próprio na Viagem.

## Onde a prática diverge da regra vigente

Segunda leitura (orçamentos Beatriz, Carla Palermo, Flavia, Rebeca,
Embaixatriz, Rita, Camila/Alexandra/Julie, Marcelo; propostas; roteiro
Embarque 2026). Para cada divergência, o que o sistema sugere:

| Tema | Regra (`negocio/05`) | Prática observada | Valor sugerido no sistema |
|---|---|---|---|
| **Sinal e saldo** | Sinal 20% (referência), saldo até o 1º dia do tour (K572–K573) | 30% de sinal, 70% até 30 dias antes (roteiro Embarque 2026 e propostas reais) | **Segue a regra: 20% e saldo no 1º dia do tour**, editáveis. K572–K573 é regra vigente e não está em `07`, então só Carlos a muda. Para cumprir K917–K919 sem mudar a regra, o sistema **avisa** quando o sinal não cobre as penalidades já comprometidas e quando um item não reembolsável vai ser emitido sem cobertura paga. A prática 30%/D-30 fica registrada aqui como candidata a atualização para Carlos. |
| **Preço enviado** | Arredondar só o total, para cima, ao próximo USD 10 (K899) | Valor digitado à mão, arredondado para baixo ou para cima em centenas (9113,75 → 9100; 6590 → 7000 → 7100) | Sugere o arredondamento de K899; a pessoa define o Preço enviado livremente, e o sistema mostra a diferença para o Preço calculado. |
| **Validade** | 15 dias; aprovado no prazo, preço congelado (K093) | Nenhuma proposta real declara validade | Toda Proposta sai com a validade de 15 dias impressa nas Condições. |
| **Base da margem** | Hotel, KTX e voo fora da margem | KTX e voo somados dentro da margem (`SUM(M:S)`) | Segue a regra: trem e voo em linhas fora da margem. |
| **Hotel** | Segurança ×1,05; câmbio Naver × 1,10 | ×1,02, ×1,03 ou ×1,05; câmbio fixo ÷1300 ou ÷1500. Em conversa (Kakao 16–17/07/2026) Carlos disse cobrar do cliente o valor público do Booking e ficar com a diferença da tarifa negociada | Segue a regra (tarifa negociada ×1,05). O Orçamento guarda também o valor público de referência quando informado, e a fala de Carlos fica aqui como candidata a atualização, porque ainda não está em `negocio/03–07`. |
| **Preço por pessoa** | — | Fórmula com +2% (duplo) e +1% (single) e pax/quartos fixos na célula | Divide o Preço enviado pelos Pagantes, sem fator extra; ocupação vem dos quartos da Opção. |
| **BRL** | Fora do cálculo | Totais em reais aparecem em planilha | BRL só aparece como conversão de pagamento (PIX), nunca no cálculo. |

Outras decisões de modelo tiradas da mesma leitura:

- **Grupo dividido**: quando partes de um grupo têm preço ou voucher próprios
  (Camila/Alexandra/Julie virou três orçamentos e três vouchers), cada parte é
  uma Viagem, ligada às outras como Viagens relacionadas.
- **Viajantes diferentes dentro da mesma Viagem** (Rita: hotéis e transfers
  distintos por pessoa) ficam numa só Viagem; a Linha de custo indica a quais
  Viajantes se aplica.
- **Quantidade da linha é própria**: ingresso costuma contar o guia (2 pax →
  3 ingressos).
- **Proposta = apresentação do roteiro + parte comercial.** Hoje a parte
  comercial vive numa aba “Template” da planilha e o deck não tem preço; o
  sistema gera as duas partes a partir da mesma Versão de orçamento.
- **Opções no nível do Dia** também existem (“Dia 8: Jeju (Opção 1)”); no
  primeiro momento entram como Opções do Orçamento, não como alternativa
  dentro de um Dia.
- **Destinos fora da Coreia** (Japão, China, Espanha) aparecem em propostas;
  o modelo não pode supor que toda cidade é coreana.

## Atendimento: o que o Respond.io mostra

Leitura das 1.509 mensagens de 78 contatos (jun/2024–set/2026) em
`../docs/01-extracoes-do-conhecimento-bruto/respond.io/`. A maior causa de
perda evitável é **demora ou falta de resposta**: 30 dos 78 contatos nunca
receberam resposta humana nesse canal, inclusive casos de 2025–2026, e a
Luve Viagens, pronta para pagar, cobrou retorno cinco vezes em sete dias.

| Tema | Valor sugerido no sistema | Por quê |
|---|---|---|
| **Responsável desde o primeiro contato** | Toda Viagem nasce com Responsável; sem dono é o único estado que o painel destaca em vermelho. | 33 de 77 contatos sem dono no Respond.io; conta compartilhada esconde quem responde. |
| **Tempo de resposta** | Próxima ação “responder” criada no primeiro contato, com prazo no mesmo dia útil; alerta depois de 24h sem resposta humana. | A janela de 24h do WhatsApp fecha e obriga o template `continuar`; as perdas citadas são por demora. |
| **Proposta sem retorno** | Próxima ação de acompanhamento 3 dias após o envio; depois de 3 tentativas sem resposta, sugere encerrar como perdida (“sem resposta”). | O template de retomada chegou a ser enviado quatro vezes ao mesmo cliente. |
| **Formulário** | Pedir o Formulário de planejamento é Próxima ação, não Etapa; a Viagem fica em lead com “aguardando formulário”. | Frequentemente a primeira mensagem humana só pede o Typeform. |
| **Origem e indicação** | Campo obrigatório na criação da Viagem, com “indicado por” livre. | Hoje a pergunta “nos conheceu por indicação?” é feita e perdida no chat. |
| **Conflito de canal** | Ao criar uma Viagem, o sistema avisa se já existe Viagem aberta com o mesmo Viajante ou grupo por outra Agência/operadora. | Caso Isabelle: mesmo grupo chegou direto e via operadora parceira. |
| **Pagamento** | Cada Pagamento registrado com método, moeda e comprovante; Invoice emitida antes (pedido de pagamento) e Recibo gerado a partir de cada Pagamento. Sinal pode chegar depois da confirmação e saldo durante a viagem. | Sinais de 20%, 30% e 50% por PIX/Wise; saldo cobrado no meio da viagem (caso 493023214). |
| **Aviso do dia** | Na véspera de cada Dia com serviço, o sistema prepara o Aviso do dia (horário, ponto, Guia e telefone, o que levar) a partir da Alocação. | Hoje isso é digitado à mão toda noite, e o guia às vezes só é definido na véspera. |
| **Despedida** | O transfer de saída é o último item operacional; ao concluí-lo a Viagem passa a concluída e o sistema sugere a mensagem de despedida e o pedido de avaliação. | Não existe mensagem de despedida no canal; o único retorno pós-viagem veio espontâneo, oito dias depois. |

Fora do escopo inicial: integrar com o Respond.io/WhatsApp. O sistema registra
Meio de contato e resumo; a conversa continua no canal de origem.

## Moedas

| Tema | Valor sugerido no sistema | Por quê |
|---|---|---|
| **Moeda do cálculo** | Orçamento, Opções e Preço enviado sempre em USD. | Regra vigente K225. |
| **Moeda de cobrança e recebimento** | Invoice e Pagamento em USD, BRL, EUR, KRW ou JPY, convertidos do Preço enviado em USD pela taxa do dia, registrada. PIX em BRL ×1,035; cartão +5%. | Na prática a cobrança é em USD ou BRL e às vezes em EUR, KRW ou JPY (Juliano, 24/09/2026); os fatores de PIX e cartão são K915–K919. |
| **Custo de fornecedor em outra moeda** | KRW, JPY, EUR ou BRL convertidos para USD por `taxa × 1,10` (Naver para KRW), com taxa e data na Memória de cálculo. | A regra `× 1,10` está escrita só para KRW (K060); estendê-la a JPY/EUR/BRL mantém o mesmo colchão cambial para viagens ao Japão e fornecedores fora da Coreia. Padrão provisório. |
| **Saldo com moedas misturadas** | O saldo é sempre apurado em USD: cada Pagamento vale o que sua taxa registrada converte. | Evita que um sinal em BRL e um saldo em USD deixem diferença por variação cambial não registrada. |

## Varredura completa das fontes (reuniões, Kakao, manuscritos, áudios, documentos do Carlos)

Regras e comportamentos que entram como Valor sugerido, aviso ou campo. Os
valores com K-unit são vigentes; os demais vêm de falas do Carlos e ficam
editáveis.

| Tema | No sistema | Fonte |
|---|---|---|
| **Ordem do fator de duração** | `fator × (base + soma dos adicionais)`; duração não é adicional. | B01, K879 |
| **Transfer em dia com carro** | +15% no carro do dia e sem transfer separado; Gyeongju↔Busan separado só sem carro; temporada vale para transfer. | B31–B33, K909–K911 |
| **Nível de recepção** | Entre N2 e N3, sugere o maior (ICN: 150). Meet & greet em linha própria. | B19, K897 |
| **Passagem da equipe** | Linha própria por profissional que viaja o trecho, sempre econômica, +15% de segurança, fora da margem. | B18, K149, K883 |
| **Jeju** | Sempre + meia diária de serviço; USD 70 por pernoite com hospedagem e alimentação (+20% sex, dom e véspera de feriado); pernoite anterior só se o tour começa de manhã. | B27, K903–K906 |
| **Carro próprio em Busan** | Só sugerido em econômico/padrão e conforme disponibilidade; nunca VIP. | B35, K913 |
| **Capacidade por categoria** | Lotação sugerida do veículo varia pela Categoria de atendimento: econômico/padrão pode encher (Carnival 6, Solati 13 em transfer econômico); VIP usa menos gente por carro. Aviso, não teto. | Carlos 14–15/08/2026, K565 |
| **Mudanças e no-show** | No-show: transfer integral. Cancelamento de transfer: grátis até 2 dias, 50% na véspera. Troca de transfer no dia ou de voo: +20%. Troca de hotel em Seul mantém preço; fora de Seul, recotar. Mala que não cabe: táxi por conta do cliente. | K088–K091, K561, Carlos 27/07/2026 |
| **Atração sem preço** | Custo começa em zero; cobrança positiva exige custo real. USD 30 só como estimativa sinalizada, e a Versão não sai com estimativa. | B45, K924, K935 |
| **Ajuste geral de tabela** | Um percentual aplicado a toda a Tabela de referência cria nova versão (ex.: +3–4% após alta do câmbio). | Carlos 10/08/2026 |
| **Resposta por canal** | Prazo da primeira resposta: B2C mais curto, Operadora curto, Agência no mesmo dia útil. | Questionário B2B Q2; reunião 14/07 |
| **Mínimos de viagem** | Aviso quando Agência pede menos de 3 dias, ou Jeju com menos de 2 dias de guia; exceção possível com motivo. | Reunião 29/06 |
| **Paridade de preço** | Aviso quando o preço direto ao cliente fica abaixo do preço à Agência para o mesmo serviço. | Reunião 29/06 |
| **Mesmo guia na viagem** | Alocação sugere manter o mesmo Guia em todos os Dias e avisa ao trocar. | Reunião 29/06 |
| **Produto com especialista** | Tour ou Módulo pode exigir um Profissional específico (BTS → Jessica, arte → Lia); disponibilidade dele é conferida já na cotação. | Reunião 29/06 |
| **Disponibilidade na cotação** | Ao cotar, o sistema mostra se há Guia/Assistente livre nas datas (sem reservar). | Reunião 29/06 |
| **Janela de reserva** | Reserva tem data de abertura (KTX e experiências de cosméticos: 1 mês antes) e lista “reservar nesta semana”; Voucher pode sair com “horário a confirmar”. | Reunião 29/06; Lia (thread Explore Travel) |
| **Turismo médico** | Até 3 pessoas por clínica por turno; Guia + acompanhante; sem assistente livre, vai Guia. | Carlos 27/07/2026 |
| **Taxa de elaboração de roteiro** | Linha opcional desligada (USD 200 suspensa); se usada, é paga antes do Aceite, não reembolsável e descontada ao fechar. | B36, K914, Carlos 27/07/2026 |
| **Cotação de hotel** | Booking conta empresa, tarifa cancelável, café para dois, Deluxe ou Superior (evitar Standard); datas distantes: estimativa do hotel + margem de segurança. | Análise consolidada §13; Carlos 15/08/2026 |

# Padrões provisórios

Resposta padrão que o Corealux OS usa para cada questão ainda aberta em
`../docs/negocio/07-questoes-abertas.md`, até que Carlos decida. Tudo aqui é
**valor sugerido e editável por Orçamento** (ADR-0001): o sistema propõe, a
pessoa ajusta com motivo, e a Versão de orçamento registra ambos.

Quando Carlos decidir, a decisão vai para o acervo (K-unit) e para a Tabela de
referência (ADR-0002), e a linha correspondente sai deste arquivo.

| Questão | Padrão provisório | Por quê (evidência) |
|---|---|---|
| **KTX — adicional** (K891) | +20% sobre o bilhete KTX quando a data do trecho cai na janela de feriado nacional coreano (±2 dias), em qualquer classe, para clientes e equipe. Fora dessa janela, sem adicional. Cotação sugere classe econômica nessas datas. | K465/K543 já ligam o +20% ao feriado e preferem econômica por falta de assento; a equipe paga o mesmo bilhete, então o custo é real. Usa o mesmo calendário de feriados que já existe. |
| **Ônibus — empilhamento** (K894) | `tabela 45 lugares × fator de tamanho × max(temporada ônibus, fds/feriado)`, depois +15% de intermediação. Cotação real do fornecedor em KRW, quando existir, substitui a tabela. | Alta e fds/feriado valem ambos ×1,2; multiplicá-los (×1,44) cobraria duas vezes a mesma escassez. `max` é a opção citada na própria recomendação B16. |
| **IVA 10%** (K922, K933) | Desligado por padrão. Quando ligado: 10% sobre o total geral já arredondado, em linha própria, antes dos acréscimos de cartão/PIX. Marcar para confirmação contábil. | Nenhuma proposta real observada destaca IVA; ligar por padrão mudaria todos os preços praticados. A posição “após o total, antes do meio de pagamento” evita que margem e arredondamento incidam sobre imposto. |
| **Faixa entre meia e diária** (K927) | Até 4h: 0,60. Mais de 4h até 6h: 0,80. Mais de 6h: diária completa. Mesmo fator para guia, assistente e carro; não vale para transfer. | Carlos exigiu a faixa; 4–6h a 80% é o único parâmetro que aparece no acervo, e mantém o degrau proporcional (4h/9h ≈ 44% → 0,60; 6h/9h ≈ 67% → 0,80). |
| **Alçada da margem real mínima** (K920) | Margem real ≥ 10%: nada. Abaixo de 10%: alerta visível e o Responsável registra o motivo; Admin (Carlos) é notificado e pode dar o aprovo depois. Nada impede enviar a Proposta. | Piso de 10% é vigente, mas o preço é negociado; bloquear o envio travaria a negociação. Registro + aviso ao Admin torna o piso visível sem burocracia numa equipe pequena. |
| **Reembolso — base comparável** (K916) | Comparar em USD: converter o valor pago em BRL pela taxa do dia do reembolso e devolver o menor entre esse valor e o valor reembolsável contratado em USD. | K916 já manda “o que for menor”; USD é a moeda interna do cálculo (K225), então é a base natural de comparação. |
| **Multa × processamento** (K917) | Dedução de item de terceiro = multa do fornecedor + 10% de processamento sobre o valor do item. | Leitura direta de K917 (“taxa de cancelamento mais 10% de processamento”); a multa do fornecedor prevalece (K852). |
| **Capacidade de veículo** (K885–K887) | Cadastro guarda assentos físicos. Na alocação, o sistema desconta motorista e equipe sentada e mostra a capacidade líquida para clientes; o limite de conforto é alerta, não teto. | Guardar o número físico e descontar uma única vez elimina a dupla dedução que K887 aponta. |
| **Crianças e bebês** (K925) | Bebê (< 2 anos): não conta para itens por pessoa nem para a proporção de guias; conta como assento no veículo. Criança (2–11): conta como pax em tudo; ingressos usam a tarifa infantil real do fornecedor quando cadastrada. Sem desconto em guia/carro. | Guia e carro são custos fixos do grupo; só ingressos variam por idade na prática. Assento de bebê é exigência de segurança. Faixas iguais às usadas por companhias aéreas, o que evita duas convenções no mesmo Orçamento. |
| **Custo intermunicipal por API** (K930) | Sem API no primeiro momento: linha por trecho com custo digitado (e sua fonte) + 20%. | K930 define a regra de +20%, mas não identifica API; custo manual cumpre a regra hoje. |
| **Calendário de feriados** (K892–K893) | Tabela anual de feriados nacionais coreanos cadastrada por ano. Faixas de temporada são dia/mês e incluem 29/02 na faixa que contém fevereiro; temporada baixa do ônibus vai até o último dia de fevereiro. | Lista anual já é vigente; datas por dia/mês com fim “último dia do mês” resolvem o ano bissexto sem regra especial. |
| **Feriados estaduais/municipais** (K076) | Não aplicados automaticamente; podem ser marcados manualmente numa data do Orçamento. | K076 só considera feriados nacionais. |
| **Custo real do cartão** (K915) | Manter 5% como padrão; registrar a taxa efetiva cobrada em cada pagamento, para permitir revisar o padrão com dados. | Mantém a regra vigente e gera a evidência que falta. |
| **Gorjeta** (K026, K400, K553, K898) | Desligada por padrão. Ligada: valores de K898 (motorista 2, guia 4, assistente 2, fundo 5; +3 cada em Premium/VIP) por cliente por dia de trabalho, exibidos como sugestão **não incluída** no total. Sem divisão automática. | K898 fixa os valores; K553/K579 mostram que na prática a gorjeta aparece só como item não incluso. |
| **Adicional de espera** (K561, K114) | 10% após 90 min do pouso, cobrado uma vez por ocorrência. | Disposição já registrada por Juliano em K114. |
| **Dia do transfer no roteiro** (K566, K142) | Transfer de chegada é Dia 1; contagem editável por Roteiro. | Disposição já registrada por Juliano em K142. Os documentos reais usam as duas convenções (Rachel 2025 começa em Dia 0; Interep/Leda e Turis VIP em Dia 1), por isso a contagem fica editável. |
| **Número de cliente** (K570) | `CLX` + ano (2 dígitos) + sequência de 3 dígitos + dígito Luhn. Se o ano passar de 999, a sequência cresce para 4 dígitos sem mudar os números já emitidos. Nunca reutilizar. | Mantém o contrato vigente e só muda quando o volume exigir, sem migração. |
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
| **Sinal e saldo** | Sinal 20% (referência), saldo até o 1º dia do tour (K572–K573) | 30% de sinal, 70% até 30 dias antes (roteiro Embarque 2026 e propostas reais) | **30% e saldo em D-30**, marcado como padrão provisório para Carlos. A própria regra exige que o sinal cubra penalidades e que o saldo esteja pago antes de emitir itens não reembolsáveis (K917–K919); 20% com saldo no 1º dia não cumpre isso, 30%/D-30 cumpre. |
| **Preço enviado** | Arredondar só o total, para cima, ao próximo USD 10 (K899) | Valor digitado à mão, arredondado para baixo ou para cima em centenas (9113,75 → 9100; 6590 → 7000 → 7100) | Sugere o arredondamento de K899; a pessoa define o Preço enviado livremente, e o sistema mostra a diferença para o Preço calculado. |
| **Validade** | 15 dias; aprovado no prazo, preço congelado (K093) | Nenhuma proposta real declara validade | Toda Proposta sai com a validade de 15 dias impressa nas Condições. |
| **Base da margem** | Hotel, KTX e voo fora da margem | KTX e voo somados dentro da margem (`SUM(M:S)`) | Segue a regra: trem e voo em linhas fora da margem. |
| **Hotel** | Segurança ×1,05; câmbio Naver × 1,10 | ×1,02, ×1,03 ou ×1,05; câmbio fixo ÷1300 ou ÷1500 | Segue a regra; câmbio da data registrado na Memória de cálculo. |
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
| **Pagamento** | Cada Pagamento registrado com método, moeda e comprovante; recibo/invoice gerado a partir dele. Sinal pode chegar depois da confirmação e saldo durante a viagem. | Sinais de 20%, 30% e 50% por PIX/Wise; saldo cobrado no meio da viagem (caso 493023214). |
| **Aviso do dia** | Na véspera de cada Dia com serviço, o sistema prepara o Aviso do dia (horário, ponto, Guia e telefone, o que levar) a partir da Alocação. | Hoje isso é digitado à mão toda noite, e o guia às vezes só é definido na véspera. |
| **Despedida** | O transfer de saída é o último item operacional; ao concluí-lo a Viagem passa a concluída e o sistema sugere a mensagem de despedida e o pedido de avaliação. | Não existe mensagem de despedida no canal; o único retorno pós-viagem veio espontâneo, oito dias depois. |

Fora do escopo inicial: integrar com o Respond.io/WhatsApp. O sistema registra
Meio de contato e resumo; a conversa continua no canal de origem.

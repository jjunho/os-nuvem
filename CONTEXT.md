# Corealux OS

The internal system CoreaLux (the Tours & Experiências unit of Coreaníssima) uses to take a Viagem from first contact, whether through an Agência (B2B) or directly (B2C), to the last send-off at the airport: capturing the lead, pricing, proposing, confirming, booking, operating each Dia, and documenting it. It replaces the pipeline spreadsheet, the orçamento spreadsheets and the hand-made proposal and voucher files. The acervo (`../docs/negocio/`) records why each business rule exists; this glossary only names things.

## Pessoas e partes

**Cliente**:
Whoever pays CoreaLux for the Viagem: an Operadora, an Agência, or a person buying directly.
_Avoid_: Nome, conta

**Agência**:
A travel agency that sells trips to its own travellers and buys the Korean part from CoreaLux, directly or through an Operadora. It carries its usual Canal comercial and how it pays.
_Avoid_: Parceiro (loose)

**Cadeia comercial**:
The ordered chain of intermediaries between the Viajantes and CoreaLux (e.g. a Spanish company → a São Paulo agency → an Operadora → CoreaLux), with what each one specified (category, promises). The last link is the Cliente.

**Marca**:
The brand a Viagem is sold under: CoreaLux for B2B, Guia na Coreia for direct B2C sales. Documents carry the Marca; the Empresa emissora stays the legal issuer.

**Operadora**:
A tour operator between Agências and CoreaLux, for which CoreaLux acts as the local DMC (e.g. Interep). A Viagem can have a chain: the Agência that sold the trip, then the Operadora that buys from CoreaLux and is the Cliente. Operadora has its own price tier.
_Avoid_: Agência (they are different relationships)

**Perfil do cliente**:
What CoreaLux learns about a Cliente or Viajante across Viagens: past trips, preferences, restrictions, how they received past itineraries, birthday, language.

**Viajante**:
A person who actually travels on a Viagem. Headcount is expressed in pax. Ages (at least adult, child or infant, and children's ages) are known from the lead on, because they change the Roteiro and the price.
_Avoid_: Cliente (when the traveller is not the buyer), hóspede

**Dados de viagem**:
What CoreaLux must hold about a Viajante to operate: full name as in the passport, date of birth, passport number and validity, nationality, arrival, departure and internal flights, travel insurance (company and policy number), luggage (default two 23 kg bags plus hand luggage, reducible), dietary restrictions (asked as "what don't you eat"), accessibility needs, emergency contact. In B2B the traveller's phone may never be given to us.

**Observações para a Equipe**:
Private notes about a Viajante that help the Equipe handle them (sensitive topics to avoid, mistrust, mobility details, food), never shown to the Cliente.
_Avoid_: Cadastro, pax list (that is a document built from these)

**Pagante**:
A Viajante whose share of the price is charged. The per-person price divides by pagantes, not by all pax.

**Gratuidade**:
A Viajante who travels at no charge, usually granted to a group leader by an Agência ("10 pagantes + 2 gratuidades").
_Avoid_: Cortesia (that is a gift item, see below), free, FOC

**Contato**:
A person CoreaLux talks to, on any Meio de contato. One Contato can take part in several Viagens (an agent sending group after group), and one Viagem can have several Contatos.

**Solicitante**:
The Contato who brought the request for a Viagem. Not necessarily who pays (the Cliente) nor who travels (a Viajante): an agent, a secretary or a traveller whose company pays.

**Responsável**:
The one CoreaLux staff member who owns a Viagem at a given moment, from the first contact on. It can change hands; who held it and when is kept. Other staff can follow the Viagem as participants. The Guia of each Dia is a different role (see Alocação).
_Avoid_: Quem atendeu, dono, assignee

**Fornecedor**:
A third party CoreaLux buys services from: hotel, airline, bus company, driver, restaurant, attraction, clinic.

**Tarifário**:
A Fornecedor's rate card for a validity period: room or service categories, date bands (weekday, Friday, Saturday, special dates), currency, whether taxes are included, breakfast and extra-person prices, child age rules, group threshold and cancellation terms. It never carries over to another period.
_Avoid_: Tabela do hotel, tabela de preços

**Cotação de fornecedor**:
A price a Fornecedor gave for one specific request (dates, rooms, people), with its source (e-mail, Booking, phone), date and expiry. It overrides the Tarifário for that request.
_Avoid_: Orçamento (that is CoreaLux's own price)

**Profissional**:
A CoreaLux staff member who works on Viagens as Guia, Assistente or motorista, and does office work when there is no Viagem: languages, specialties, home city, contact, what they are paid, and availability.
_Avoid_: Freelancer, staff (loose)

**Guia**:
The role of a Profissional who leads a guided service. Has its own base rate; Guia A is the shopping/skincare specialist rate.

**Assistente**:
The role of a Profissional who supports a guided service, at a lower base rate than a Guia.

**Equipe**:
The Profissionais assigned to a given Dia of a Viagem.

**Veículo**:
A car, van or bus that can be allocated to a Dia: own or rented from a Fornecedor, model, seats, and whether the Guia may drive it.
_Avoid_: Carro (loose; the internal models and the public fleet names differ)

**Influenciador**:
A person who brings Viajantes through the Influencer Canal comercial and earns a Comissão, without handling the payment.

**Papel**:
The access level of a staff member: Admin, Faturamento, Propostas e Orçamentos, Itinerários e Produtos, Atendimento, Guiamento, Conteúdo. Money is visible only from Propostas e Orçamentos up (Itinerários sees single prices, never totals or Margem). Atendimento handles leads and conversations without any price. Guiamento sees only its own Dias, with Incluso / Não incluso but no values.
_Avoid_: Cargo, perfil, permissão (for the level itself)

**Usuário**:
A person who signs in to Corealux OS, with a login, a password and one Papel. It may be linked to a Profissional; it must be when its Papel is Guiamento, so that "its own Dias" means the Alocações of that Profissional. A Usuário is deactivated, never deleted, because Viagens and their history point to it.
_Avoid_: Conta, login (for the person)

## Comercial

**Viagem**:
One trip CoreaLux is selling or delivering for a Cliente; the central record everything else hangs off. The team also calls it a caso. It exists from the first contact about the trip, before any price, and replaces one row of today's pipeline spreadsheet. One Viagem has one price and one Voucher: when part of a group needs its own price or Voucher, that part is a separate Viagem, linked to the others as Viagens relacionadas.
_Avoid_: Tour (for the whole trip), lead, cliente (for the row), caso (use Viagem in the system; "código do caso" is the Código da viagem)

**Viagens relacionadas**:
Viagens that travel together or came from the same request but are priced and vouchered separately (e.g. one 7-pax group split into 2 pax, 4 pax and 1 pax).

**Etapa**:
Where a Viagem stands in its life: lead (first contact), em orçamento, proposta enviada, em negociação (the Cliente answered and asks for changes), confirmada, em viagem (from the arrival pickup), concluída (after the last send-off at the airport, or the end of the last Dia when there is no send-off). "Pago" is not an Etapa; it is the Situação de pagamento. It can also end as perdida (never confirmed), cancelada (confirmed, then called off) or descartada (not a trip request at all: press, spam, partnership offers).
_Avoid_: Andamento, status (as free text)

**Motivo de perda**:
Why a Viagem ended as perdida or cancelada (e.g. achou caro, demora na resposta, só queria um dia, fechou com outro guia, sem resposta).

**Origem**:
How the Viagem reached CoreaLux: Instagram, site, indicação (with who referred it), Agência, Operadora, Influenciador.
_Avoid_: Canal (alone), referência

**Tarefa**:
A concrete thing one Usuário must do, with a Prazo, people in copy, a column (Novo, Em foco, Aguardando, Concluído) and a code (TAR-…) to mention it; it may belong to a Viagem. The team's board of Tarefas is called Trelelê.
_Avoid_: To do, task, card

**Próxima ação**:
The open Tarefa of a Viagem with the earliest Prazo, shown beside its Etapa in the pipeline.
_Avoid_: Putting actions into the Etapa ("preparar orçamento")

**Canal comercial**:
The price tier a Viagem is sold under: Interep/Operadora, Agência, Cliente final, Influencer.
_Avoid_: Canal (alone)

**Meio de contato**:
The medium a conversation happened through: WhatsApp (business or personal), Respond.io, e-mail, Instagram, phone or audio, video call, formulário. A Viagem can use several.
_Avoid_: Canal (alone)

**Categoria de atendimento**:
The service level of a Viagem: econômico, padrão, premium, VIP. Independent of the Canal comercial.
_Avoid_: 급, classe, estrelas, categoria de serviço, nível de serviço (the rules use "nível de serviço" for the Nível de recepção of transfers)

**Idioma da interface**:
The language a Usuário sees the system in: português or coreano. Separate from the Idioma do cliente and the Idioma de guiamento.

**Idioma do cliente**:
The language the client-facing documents and messages are written in: português, espanhol, inglês or francês. Separate from the Idioma de guiamento.

**Formulário de planejamento**:
The intake questionnaire a Cliente fills in describing the trip they want.
_Avoid_: Briefing, Typeform

**Número de cliente**:
The identifier of a Cliente: `CLX` + two-digit year + three-digit yearly sequence + Luhn digit (`CLX260018`), displayed optionally as `CLX26 0018`.
_Avoid_: Código da viagem (a different identifier)

## Preço

**Orçamento**:
The priced calculation of a Viagem, built Dia by Dia: Linhas de custo, Margem and total in USD. A Viagem can have several.
_Avoid_: Cotação (alone; the rules say "cotação" for it, and Cotação de fornecedor is the supplier's price)

**Opção**:
One priced alternative inside an Orçamento, differing in group size, hotels, dates or Categoria de atendimento ("7 pax A", "10 pax D1", "hotel 4 estrelas"). The Cliente chooses one.
_Avoid_: Cenário, versão (a Versão is a frozen snapshot, not an alternative)

**Preço calculado**:
The total of an Opção as the system computes it from its Linhas de custo, Margem and hotels.

**Preço enviado**:
The total actually offered to the Cliente for an Opção, set by a person. It usually rounds or negotiates the Preço calculado and is the price the Cliente accepts.
_Avoid_: Valor final, preço de venda

**Preço por pessoa**:
The Opção's price divided among Pagantes, stated per room occupancy (em quarto duplo, em quarto single).

**Versão de orçamento**:
A frozen snapshot of an Orçamento. Once sent to a Cliente it never changes; a change makes a new Versão.

**Linha de custo**:
One priced item inside an Orçamento (a Diária de guia, a transfer, a ticket, a hotel night, miudezas, internet, lodging for the Equipe). Its quantity is its own, not the pax count: tickets usually include the Guia, and a line can apply to only some Viajantes.

**Margem**:
The percentage added over the eligible subtotal of an Orçamento. Negotiated per Orçamento, like every other value. At quote time it is an estimate; the real margin exists only once real costs are known (Resultado da viagem), and until then it is "não verificável".
_Avoid_: Lucro; markup (the rules use "markup geral" as a synonym)

**Desconto**:
A reduction on the Preço enviado or on a Linha de custo, with its reason. Never copied to another Viagem.

**Taxa de elaboração de roteiro**:
An optional fee for designing a custom B2C Roteiro before the trip is bought, credited back as a Desconto if the Cliente books. Currently suspended; available as an off-by-default line.

**Taxa de alteração**:
A charge for customising a pacote fechado or changing a confirmed Viagem, as a percentage or a fixed amount, starting at 0.

**Kit do dia**:
The per-person bundle a Dia carries by Categoria de atendimento: tickets, water and Cortesia, charged once per Dia.

**Pernoite fora da base**:
A night a Profissional spends away from their home city for a Viagem, with its lodging cost (USD 70 by reference; in Jeju it also covers meals).

**Valor sugerido**:
The value the system proposes for a Linha de custo from the Tabelas de referência, before any Ajuste manual.
_Avoid_: Regra, valor fixo

**Tabela de referência**:
A versioned table of suggested rates and factors (guide rates, fleet and capacity by Categoria de atendimento, seasons, holidays, transfers, payment factors) that Orçamentos draw Valores sugeridos from. A general adjustment (e.g. +3% on everything after an exchange-rate move) creates a new version.
_Avoid_: Tabela de preços (implies fixed prices)

**Padrão provisório**:
A Valor sugerido for a question the business has not decided yet, used until Carlos decides.

**A informar**:
The state of a value the system must not guess: a real cost not yet known. The person enters it; a Versão cannot be sent while a charged value is still "a informar".

**Ajuste manual**:
A negotiated change to a Valor sugerido (a rate, a percentage, a count, a condition), recorded with who, when and why. It never blocks.

**Memória de cálculo**:
The record of everything a Versão de orçamento was calculated with: tables, exchange rate, Margem, adjustments.

**Diária**:
A full service day (9h reference) of a Guia, Assistente or vehicle.

**Meia-diária**:
A service of up to 4h, priced as a fraction of a Diária.

**Hora extra**:
Each full hour of service beyond a Diária.

**Cortesia**:
Something CoreaLux gives at no charge to the Cliente while still bearing its cost: the small gift item per Viajante per day by Categoria de atendimento (water, snacks), or an extra service offered free ("será cortesia nossa").
_Avoid_: Cortesia meaning a free traveller (that is a Gratuidade)

**Temporada**:
The season bucket of a date (alta, média, baixa, base) that adjusts base rates. There are three separate calendars: the CoreaLux one (Guia, car, transfer, with the Korean holiday window), the Jeju flight one, and the bus supplier's.

**Pagamento**:
One amount received for a Viagem, with its date, method (PIX, Wise, cartão, espécie), currency (usually USD or BRL; also EUR, KRW, JPY), the exchange rate that counts it against the USD Preço enviado, and proof. Receipts and invoices are issued against Pagamentos.

**Invoice**:
The request for payment CoreaLux issues to the Cliente before paying: Empresa emissora, the Cliente's Dados de faturamento, the items (as one package or broken down by Dia), the amount due in the Cliente's currency (usually USD or BRL; also EUR, KRW, JPY) and due date (for the Sinal, the Saldo or the whole), payment methods and bank details, and the Condições. Clients treat it as the contract. It has its own number and is reissued as a new version when anything changes.
_Avoid_: Fatura, cobrança, recibo (that comes after payment)

**Recibo**:
The acknowledgement CoreaLux issues after a Pagamento is received, stating what was paid, when, how, and what remains.
_Avoid_: Invoice (that comes before payment), comprovante (that is the Cliente's proof of transfer)

**Dados de faturamento**:
Who the Invoice is addressed to: full legal name, tax ID (CPF or CNPJ in Brazil, or the foreign equivalent), and address. For an Agência, the agency's company data.

**Situação de pagamento**:
How much of the Preço enviado is paid: sem sinal, sinal recebido, pago. Tracked apart from the Etapa, because a confirmada Viagem can still be waiting for its Sinal, and the Saldo is sometimes collected during the trip.
_Avoid_: PGTO

**Aceite**:
The Cliente's acceptance of one Opção of a Proposta, with its date and evidence (message, e-mail, signed document). It makes the Viagem confirmada.

**Conta a pagar**:
An amount CoreaLux owes for a Viagem: a Reserva with a Fornecedor, the fee of an external Profissional, a Comissão, a Despesa de campo to reimburse. It has a due date and is paid or open.
_Avoid_: Custo (the estimate in the Orçamento), payable

**Comissão**:
The share of what the Cliente paid that goes to an Influenciador (5% by reference), owed once the payment is received.

**Gorjeta**:
An optional suggested amount per Viajante per day for each kind of Profissional, plus a share for the back-office fund split at year end. Off by default, and never inside the Preço enviado.

**Resultado da viagem**:
What a Viagem actually earned: Pagamentos received minus Contas a pagar. The real Margem is measured on it, not on the Orçamento.
_Avoid_: Lucro, margem (for the realized figure)

**Sinal**:
The first payment of a Viagem, due after the Aceite. It should cover the penalties CoreaLux would bear if the Viagem is cancelled. The Viagem is confirmada by the Aceite, even before the Sinal arrives.

**Saldo**:
What remains to be paid after the Sinal.

## Produto e documentos

**Tour**:
A catalogue product: a published guided day with its region, Atrações, duration, group size, languages, days of operation, meeting point, transport and Incluso / Não incluso (e.g. Seul Histórica, Coreia do Norte de Perto). The catalogue has 22.
_Avoid_: Tour meaning the whole Viagem, passeio (loose)

**Atração**:
A place or experience a Dia can visit: palace, museum, observatory, shop, market, clinic, restaurant, cable car. It has an official name, a display name and a generic name ("mercado de peixe"), a client-facing description per Idioma do cliente, an internal note, photos with their source, city, closing days and reference ticket prices.
_Avoid_: Ponto turístico, lugar

**Módulo**:
A reusable block of a Dia or of several Dias, built from Atrações and Linhas de custo, that can be dropped into any Roteiro (e.g. "Dia de autocuidados"). Its lines carry Valores sugeridos only, never a Viagem's negotiated values.
_Avoid_: Bloco, pacote (a Pacote is a whole trip)

**Roteiro-modelo**:
A ready-made Roteiro to start from (Seul 3 dias; Seul–Busan–Jeju; Seul com criança; the 10-day standard), copied into a Viagem and then adapted. It carries no prices, Descontos or Ajustes manuais from the Viagem it came from.
_Avoid_: Template, pacote fechado (unless sold as-is)

**Roteiro**:
The day-by-day programme of a Viagem. Before confirmação it names places generically ("mercado de peixe"); the detailed version follows after.
_Avoid_: Itinerário (the team says it; in the system it is the Roteiro; "Itinerários e Produtos" survives only as a Papel name)

**Dia**:
One date of a Roteiro: its city or route, its Período, its programme (manhã, almoço, tarde), which Viajantes take part (not always all of them), and the Linhas de custo it generates. The building block of the Orçamento, the Voucher and the Alocação.

**Aviso do dia**:
The message sent the evening before a Dia to whoever the Viagem talks to (the Viajantes, or the Agência in B2B, where direct contact with the traveller is rare): meeting time and place, who the Guia is and their phone, and what to bring (e.g. passport for the DMZ).

**Idioma de guiamento**:
The language the Equipe must speak: set for the Viagem (português by default, espanhol or inglês when asked) and changeable per Dia.

**Período**:
How much guided service a Dia has: dia completo, meio período, dia livre (no service), or deslocamento only.
_Avoid_: Dia sem guia, buffer day (use dia livre)

**Pendência**:
Something that must be booked, bought or sent before a Dia can happen (buy KTX, send train tickets, K-ETA, receive hotel voucher), with whether it is done.
_Avoid_: To do, checklist (as loose text)

**Alocação**:
The assignment of Equipe and vehicle to a Dia of a Viagem. The tour agenda is the view of all Alocações by date.
_Avoid_: Escala, agenda (for the assignment itself)

**Receptivo**:
A pickup or drop-off of the Viajantes at an airport, station, bus terminal, cruise port or hotel, with time, place, flight, Nível de recepção and who does it (Guia, Assistente or only the driver). The arrival Receptivo starts the trip; the departure one (the send-off) ends it. The Voucher's "Receptivos & Deslocamentos" table lists them.
_Avoid_: Transfer (a transfer is the priced ride; the Receptivo is the operational meeting)

**Nível de recepção**:
How much service a Receptivo includes: só deixar/pegar, motorista com placa, funcionário recepciona/despede (meet & greet), ajuda no check-in de saída internacional. Each level has its own price.
_Avoid_: Nível de serviço (that phrase is taken by Categoria de atendimento in speech)

**Passeio sem guia**:
A Dia with car and English-speaking driver but no Guia, priced as the car +20%.

**Alteração**:
A change the Cliente asks for after confirmação. It produces a new Versão de orçamento and, when it changes the price, a difference to be paid or refunded.
_Avoid_: Revisão, mudança (loose)

**Ocorrência**:
Something that happened during the trip and needs a record or a charge: delayed flight, waiting beyond 90 minutes, no-show, a change on the day, an incident with a Fornecedor.

**Despesa de campo**:
An amount the Equipe spends during a Dia (taxi, parking, tolls, fuel, tickets, meals), paid with the company card or a personal one, with its receipt, to be reconciled after the Viagem.
_Avoid_: Gasto, prestação de contas (that is the reconciliation)

**Roteiro operacional**:
The internal version of the Roteiro, with times, checklists and pending bookings, for the Equipe.

**Proposta**:
What is sent to the Cliente for one Versão de orçamento: the Roteiro presentation plus the commercial part (Preço enviado per Opção, Preço por pessoa, Incluso / Não incluso, Condições). Identified by its Número da proposta.
_Avoid_: Orçamento (for the document sent)

**Condições**:
The commercial terms stated on a Proposta: Sinal and Saldo due dates, accepted payment methods and bank details, cancellation terms, and validity.

**Empresa emissora**:
The legal entity that issues Propostas, Vouchers, receipts and invoices, with its registration numbers and bank details (today COREANISSIMA CO., LTD).

**Número da proposta**:
The identifier of one Proposta as sent (e.g. `260903-1324-2`).
_Avoid_: Código da viagem, Número de cliente

**Reserva**:
A booking CoreaLux holds with a Fornecedor for a Viagem (hotel, KTX, flight, ticket), with its booking window (when it can open, e.g. KTX one month before) and deadline, codes, seats and requests.
_Avoid_: Reserva meaning the Cliente's confirmation

**Item de terceiros**:
A hotel, flight or transfer that the Agência or the Viajante booked themselves. CoreaLux records it because operations need it (hotel address for a Receptivo, flight for the pickup), but it is not a Reserva, has no cost, and CoreaLux is not responsible for it.
_Avoid_: Reserva (for something we did not book)

**Despesa a repassar**:
An amount CoreaLux pays on behalf of an Agência or Cliente during the trip (tickets, extras) to be billed back to them afterwards.
_Avoid_: Despesa de campo (that is CoreaLux's own cost)

**Envio**:
A record that a document version (Proposta, Invoice, Voucher, Recibo, Sugestões) was sent: to whom, when and on which Meio de contato. The dated trail used in disputes.

**Voucher**:
The document handed to the Cliente after confirmation, listing transfers, lodging and guided days, with the Equipe contact for each. Reissued as a new version when anything changes.

**Código da viagem**:
The identifier of a Viagem from the first contact on (the team's "código do caso"), used to mention and search it everywhere and printed on every document.

## Comunicação interna

**Comunicador**:
Corealux OS's own chat for the staff, replacing the internal KakaoTalk and WhatsApp groups.
_Avoid_: Chat (loose), Canal

**Grupo**:
A named conversation among Usuários in the Comunicador, public (any Usuário but Guiamento can join) or private (by invitation).
_Avoid_: Canal, sala

**Conversa da viagem**:
One of the two conversations a Viagem has in the Comunicador: the Interna, for staff only, and the Equipe, with the Profissionais of its Dias and its Responsável, so that guides never read the commercial talk.
_Avoid_: Grupo da viagem

**Conversa direta**:
A conversation between two Usuários in the Comunicador.
_Avoid_: DM, privado

**Mensagem**:
One message posted in a Grupo or Conversa direta. It can mention a Usuário and link to anything in the system as a card, and can carry a photo or a voice note; a mention shows each reader only what their Papel lets them see.

# Corealux OS

The internal system CoreaLux (the Tours & Experiências unit of Coreaníssima) uses to take a Viagem from first contact, whether through an Agência (B2B) or directly (B2C), to the last send-off at the airport: capturing the lead, pricing, proposing, confirming, booking, operating each Dia, and documenting it. It replaces the pipeline spreadsheet, the orçamento spreadsheets and the hand-made proposal and voucher files. The acervo (`../docs/negocio/`) records why each business rule exists; this glossary only names things.

## Pessoas e partes

**Cliente**:
Whoever buys the Viagem from CoreaLux: either an Agência or a person buying directly.
_Avoid_: Nome, conta

**Agência**:
A B2B intermediary (agency or operator) that resells CoreaLux services to its own travellers. It carries its usual Canal comercial (Interep is its own tier) and how it pays CoreaLux.
_Avoid_: Parceiro, operadora (as a party; "Interep/operadora" survives only as a Canal comercial)

**Viajante**:
A person who actually travels on a Viagem. Headcount is expressed in pax.
_Avoid_: Cliente (when the traveller is not the buyer), hóspede

**Dados de viagem**:
What CoreaLux must hold about a Viajante to operate: full name as in the passport, date of birth, passport number and validity, flights, dietary restrictions, accessibility needs, emergency contact.
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
The one CoreaLux staff member who owns a Viagem at a given moment, from the first contact on. It can change hands; who held it and when is kept. The Guia of each Dia is a different role (see Alocação).
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
A person who works on Viagens as Guia, Assistente or motorista, internal staff or external: languages, specialties, home city, contact, what they are paid, and availability.
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
The access level of a staff member, from highest to lowest: Admin, Faturamento, Propostas e Orçamentos, Itinerários e Produtos, Guiamento, Conteúdo. Each Papel sees what the ones below it see.
_Avoid_: Cargo, perfil, permissão (for the level itself)

## Comercial

**Viagem**:
One trip CoreaLux is selling or delivering for a Cliente; the central record everything else hangs off. It exists from the first contact about the trip, before any price, and replaces one row of today's pipeline spreadsheet. One Viagem has one price and one Voucher: when part of a group needs its own price or Voucher, that part is a separate Viagem, linked to the others as Viagens relacionadas.
_Avoid_: Tour (for the whole trip), lead, cliente (for the row)

**Viagens relacionadas**:
Viagens that travel together or came from the same request but are priced and vouchered separately (e.g. one 7-pax group split into 2 pax, 4 pax and 1 pax).

**Etapa**:
Where a Viagem stands in its life: lead (first contact), em orçamento, proposta enviada, confirmada, em viagem (from the arrival pickup), concluída (after the last send-off at the airport). It can also end as perdida (never confirmed), cancelada (confirmed, then called off) or descartada (not a trip request at all: press, spam, partnership offers).
_Avoid_: Andamento, status (as free text)

**Motivo de perda**:
Why a Viagem ended as perdida or cancelada (e.g. achou caro, demora na resposta, só queria um dia, fechou com outro guia, sem resposta).

**Origem**:
How the Viagem reached CoreaLux: Instagram, site, indicação (with who referred it), Agência, operadora parceira.
_Avoid_: Canal (alone), referência

**Próxima ação**:
The next concrete thing someone must do on a Viagem, separate from its Etapa.
_Avoid_: To do, putting actions into the Etapa ("preparar orçamento")

**Canal comercial**:
The price tier a Viagem is sold under: Interep/operadora, Agência, Cliente final, Influencer.
_Avoid_: Canal (alone)

**Meio de contato**:
The medium a conversation happened through: WhatsApp, e-mail, Respond.io, formulário.
_Avoid_: Canal (alone)

**Categoria de serviço**:
The service level of a Viagem: econômico, padrão, premium, VIP.
_Avoid_: 급, nível, classe, estrelas

**Formulário de planejamento**:
The intake questionnaire a Cliente fills in describing the trip they want.
_Avoid_: Briefing, Typeform

**Número de cliente**:
The `CLX`-prefixed identifier of a Cliente.
_Avoid_: Código da viagem (a different identifier)

## Preço

**Orçamento**:
The priced calculation of a Viagem, built Dia by Dia: Linhas de custo, Margem and total in USD. A Viagem can have several.
_Avoid_: Cotação

**Opção**:
One priced alternative inside an Orçamento, differing in group size, hotels, dates or Categoria de serviço ("7 pax A", "10 pax D1", "hotel 4 estrelas"). The Cliente chooses one.
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
The percentage added over the eligible subtotal of an Orçamento. Negotiated per Orçamento, like every other value.
_Avoid_: Markup, lucro

**Valor sugerido**:
The value the system proposes for a Linha de custo from the Tabelas de referência, before any Ajuste manual.
_Avoid_: Regra, valor fixo

**Tabela de referência**:
A versioned table of suggested rates and factors (guide rates, fleet, seasons, holidays, transfers, payment factors) that Orçamentos draw Valores sugeridos from.
_Avoid_: Tabela de preços (implies fixed prices)

**Padrão provisório**:
A Valor sugerido for a question the business has not decided yet, used until Carlos decides.

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
A small gift item priced per Viajante per day by Categoria de serviço (water, snacks).
_Avoid_: Cortesia meaning a free traveller (that is a Gratuidade)

**Temporada**:
The season bucket of a date (alta, média, baixa) that adjusts base rates.

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
The first payment that confirms a Viagem.

**Saldo**:
What remains to be paid after the Sinal.

## Produto e documentos

**Tour**:
A catalogue product: a published guided day with its region, Atrações, duration, group size, languages, days of operation, meeting point, transport and Incluso / Não incluso (e.g. Seul Histórica, Coreia do Norte de Perto). The catalogue has 22.
_Avoid_: Tour meaning the whole Viagem, passeio (loose)

**Atração**:
A place or experience a Dia can visit: palace, museum, observatory, shop, market, clinic, restaurant, cable car. It has a client-facing description, an internal note, photos with their source, city, closing days and reference ticket prices.
_Avoid_: Ponto turístico, lugar

**Módulo**:
A reusable block of a Dia or of several Dias, built from Atrações and Linhas de custo, that can be dropped into any Roteiro (e.g. "Dia de autocuidados").
_Avoid_: Bloco, pacote (a Pacote is a whole trip)

**Roteiro-modelo**:
A ready-made Roteiro to start from (Seul 3 dias; Seul–Busan–Jeju; Seul com criança; the 10-day standard), copied into a Viagem and then adapted.
_Avoid_: Template, pacote fechado (unless sold as-is)

**Roteiro**:
The day-by-day programme of a Viagem.
_Avoid_: Itinerário

**Dia**:
One date of a Roteiro: its city or route, its Período, its programme (manhã, almoço, tarde), which Viajantes take part (not always all of them), and the Linhas de custo it generates. The building block of the Orçamento, the Voucher and the Alocação.

**Aviso do dia**:
The message sent to the Viajantes the evening before a Dia: meeting time and place, who the Guia is and their phone, and what to bring (e.g. passport for the DMZ).

**Idioma de guiamento**:
The language the Equipe must speak on a Viagem: português by default, espanhol or inglês when asked.

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
A meeting or pickup the Equipe does with the Viajantes at an airport, station or hotel, with time, place and responsible person. The arrival Receptivo starts the trip; the departure one (the send-off) ends it.
_Avoid_: Transfer (a transfer is the priced ride; the Receptivo is the operational meeting)

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
A booking CoreaLux holds with a Fornecedor for a Viagem (hotel, KTX, flight, ticket).
_Avoid_: Reserva meaning the Cliente's confirmation

**Voucher**:
The document handed to the Cliente after confirmation, listing transfers, lodging and guided days, with the Equipe contact for each. Reissued as a new version when anything changes.

**Código da viagem**:
The identifier printed on the Voucher that names one Viagem: arrival date plus a sequence number (`20250902-1`).

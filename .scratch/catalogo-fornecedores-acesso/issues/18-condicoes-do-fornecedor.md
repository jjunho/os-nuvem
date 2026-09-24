# 18: Fornecedor conditions and contract restrictions

**What to build:** Each Fornecedor records how CoreaLux works with it:
- payment terms, which the Custos spec's Contas a pagar read: deposit before arrival (Hidden Cliff), card charged 24h before (Park Hyatt), 30% up front (Bene), card charged on registration (Lotte City), pay at the hotel (Paradise), late interest (Maison Glad 18% a year), and bank details. Card numbers are never stored (HC:17);
- a partner discount (Nostalgia 12%);
- booking notes: "sem tarifa inbound" (Rolling Hills), inbound rate only from 5 rooms (Ibis Ambassador), "não reservamos, cliente reserva" (Four Seasons), "sem desconto" (JW Marriott Jeju);
- **contract restrictions:** no publication, no resale, only approved partners (Park Hyatt K767, Homm Marina K664, Seaes K649, Hidden Cliff). A restricted Fornecedor's rates stay confidential (ticket 02), and using it for an Agência not approved warns.

Spec: stories 19, 28.

**Blocked by:** 17 (Fornecedores tracer).

**Status:** ready-for-agent

- [ ] Park Hyatt's restriction shows on the Fornecedor, and adding it to an Agência's Orçamento warns.
- [ ] A field for a card number doesn't exist. Bank details do.
- [ ] "Não reservamos" on Four Seasons shows on any hotel line using it.
- [ ] Payment terms are readable by the Custos spec's Contas a pagar.

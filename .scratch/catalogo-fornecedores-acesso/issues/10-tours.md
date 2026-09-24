# 10: Tours

**What to build:** Each Tour holds its published data, and adding it to a Dia brings its Atrações, programme and suggested Linhas de custo. Tours have no fixed price: they follow the general rule of distance, accompaniment and Atrações (Carlos, K723). The data:
- region (Japan allowed), Atrações, duration kept apart from the 9h working-day reference, min 2 / max 15 with VVIP private on request (K346), languages including JP, meeting point, transport (private, car or public, walking, KTX, "only within Jeju"), Incluso and Não incluso;
- theme: História, Modernidade, Tecnologia, Arte e Arquitetura, Natureza, K-Beauty, Trendy, Outros (K345), which the Operação spec matches Profissionais against;
- days of operation ("exceto feriados", "fim de semana sob consulta", the Tuesday palace swap of Seul Histórica, K480), with a warning when the Tour lands on a day it doesn't run, using the holiday calendar (Viagem 09);
- the published page sections "Sobre o tour", "O que você irá experienciar", "Detalhes do pacote" and "Observações importantes", with the standard notes (K347, K479);
- status active, hidden or beta: Sokcho is beta and visible (K139), Suwon-Sutja and Teshima are hidden (K137, K138); whether Suwon-Sutja is the Suwon Tour is "a confirmar";
- a "subject to confirmation" mark on an item (Samsung museum, K356).

The Gyeongju long day from Seoul (7h–23h, Bulguksa and Seokguram kept, long-day add-ons, optional night visit, K140) is seeded as a Tour. Spec: stories 12–14, 42.

**Blocked by:** 07 (Ticket prices and suggestions).

**Status:** ready-for-agent

- [ ] Seed: the 22 Tours of `04-negocio-produto.md`, with their "?" fields as "a confirmar", plus the hidden ones.
- [ ] Adding Seul Histórica to a Tuesday Dia brings the replacement palace. Adding a Tour "exceto feriados" to a holiday warns.
- [ ] A hidden Tour doesn't appear in the picker or the B2B catalogue. A beta Tour appears marked beta.
- [ ] The Tour's duration never changes the 9h pricing reference.

# 06: Preços de ingressos e kit

**What to build:** Quem implementa encontra uma única responsabilidade para preços individuais de ingressos e uma regra de composição que preserva o exemplo documentado de Sky Capsule. Reconciliar Viagem 10 e 14, Catálogo 07 e respectivas specs, cobrindo os achados 4 e 5 da revisão.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Distinguir padrões de kit por cidade/categoria de preços individuais de ingresso; estes pertencem à Atração conforme a decisão registrada.
- [ ] Qualquer cadastro provisório anterior tem transição documental explícita para a Atração, reaproveitando os registros e preservando preços e versões históricas fixadas.
- [ ] Não deixar dois cadastros editáveis concorrentes nem exigir uma migração técnica específica sem conferir o estado real da implementação.
- [ ] Registrar a exceção nominal Sky Capsule: quatro kits de USD 30 mais uma cápsula de USD 60 totalizam USD 180, com o kit cobrado uma vez.
- [ ] Preservar o critério de duas cápsulas para cinco Viajantes e as demais regras existentes de gratuidade, quantidade e Guia, sem inferir exceções novas para outras atrações.
- [ ] Os critérios verificam composição de preço e preservação de valores históricos após a transição de cadastro.
- [ ] Conferir as regras no acervo e manter referências à exceção e à regra geral; alterar somente documentação, sem modificar o acervo ou a spec-mãe da reconciliação.

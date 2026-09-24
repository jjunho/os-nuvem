import type { MemoriaOrcamento } from "~/modules/orcamentos/versoes";
import { precoPagamento } from "~/modules/orcamentos/pagamento";
import { valorReferencia } from "~/modules/orcamentos/sugestoes";
const textos = {
  pt: {
    titulo: "Proposta",
    dia: "Dia",
    cliente: "Cliente",
    validade: "Válida até",
    opcao: "Opção",
    preco: "Preço",
    pessoa: "Por pessoa pagante",
    incluso: "Incluso",
    naoIncluso: "Não incluso",
    condicoes: "Condições",
    sinal: "Sinal",
    saldo: "Saldo",
    diasAntes: "dias antes da viagem",
    cancelamento: "Cancelamento",
    pagamento: "Formas de pagamento",
    banco: "Dados bancários",
    hotel: "Hotéis sujeitos à disponibilidade",
    pdf: "Baixar PDF",
    generica: "Proposta genérica — requer adaptação",
    notas: "Notas para a agência",
    desconto: "Desconto incluído",
    iva: "IVA",
    cartao: "Total no cartão",
    gorjeta: "Gorjeta sugerida, não incluída",
    manha: "Manhã",
    almoco: "Almoço",
    tarde: "Tarde",
  },
  es: {
    titulo: "Propuesta",
    dia: "Día",
    cliente: "Cliente",
    validade: "Válida hasta",
    opcao: "Opción",
    preco: "Precio",
    pessoa: "Por persona de pago",
    incluso: "Incluido",
    naoIncluso: "No incluido",
    condicoes: "Condiciones",
    sinal: "Anticipo",
    saldo: "Saldo",
    diasAntes: "días antes del viaje",
    cancelamento: "Cancelación",
    pagamento: "Formas de pago",
    banco: "Datos bancarios",
    hotel: "Hoteles sujetos a disponibilidad",
    pdf: "Descargar PDF",
    generica: "Propuesta genérica — requiere adaptación",
    notas: "Notas para la agencia",
    desconto: "Descuento incluido",
    iva: "IVA",
    cartao: "Total con tarjeta",
    gorjeta: "Propina sugerida, no incluida",
    manha: "Mañana",
    almoco: "Almuerzo",
    tarde: "Tarde",
  },
  en: {
    titulo: "Proposal",
    dia: "Day",
    cliente: "Client",
    validade: "Valid until",
    opcao: "Option",
    preco: "Price",
    pessoa: "Per paying traveller",
    incluso: "Included",
    naoIncluso: "Not included",
    condicoes: "Terms",
    sinal: "Deposit",
    saldo: "Balance",
    diasAntes: "days before travel",
    cancelamento: "Cancellation",
    pagamento: "Payment methods",
    banco: "Bank details",
    hotel: "Hotels subject to availability",
    pdf: "Download PDF",
    generica: "Generic proposal — requires adaptation",
    notas: "Notes for the agency",
    desconto: "Discount included",
    iva: "VAT",
    cartao: "Total by card",
    gorjeta: "Suggested gratuity, not included",
    manha: "Morning",
    almoco: "Lunch",
    tarde: "Afternoon",
  },
  fr: {
    titulo: "Proposition",
    dia: "Jour",
    cliente: "Client",
    validade: "Valable jusqu’au",
    opcao: "Option",
    preco: "Prix",
    pessoa: "Par voyageur payant",
    incluso: "Inclus",
    naoIncluso: "Non inclus",
    condicoes: "Conditions",
    sinal: "Acompte",
    saldo: "Solde",
    diasAntes: "jours avant le voyage",
    cancelamento: "Annulation",
    pagamento: "Modes de paiement",
    banco: "Coordonnées bancaires",
    hotel: "Hôtels sous réserve de disponibilité",
    pdf: "Télécharger le PDF",
    generica: "Proposition générique — à adapter",
    notas: "Notes pour l’agence",
    desconto: "Remise incluse",
    iva: "TVA",
    cartao: "Total par carte",
    gorjeta: "Pourboire suggéré, non inclus",
    manha: "Matin",
    almoco: "Déjeuner",
    tarde: "Après-midi",
  },
};
function idioma(m: MemoriaOrcamento) {
  return Object.hasOwn(textos, m.idioma)
    ? (m.idioma as keyof typeof textos)
    : "pt";
}
function distribuir(total: number, pesos: number[]) {
  const soma = pesos.reduce((a, b) => a + b, 0);
  let acumulado = 0,
    anterior = 0;
  return pesos.map((peso, i) => {
    acumulado += soma > 0 ? peso : 1;
    const alvo =
      i === pesos.length - 1
        ? total
        : Math.round((total * acumulado) / (soma || pesos.length));
    const valor = alvo - anterior;
    anterior = alvo;
    return valor;
  });
}
export function Proposta({
  memoria: m,
  pdfHref,
}: {
  memoria: MemoriaOrcamento;
  pdfHref?: string;
}) {
  const lang = idioma(m),
    t = textos[lang];
  const dinheiro = (n: number) =>
    new Intl.NumberFormat(lang, { style: "currency", currency: "USD" }).format(
      n / 100,
    );
  const data = (d: string) =>
    new Date(d).toLocaleDateString(lang, { timeZone: "UTC" });
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <title>
          {t.titulo} {m.cliente} · {m.numero}
        </title>
        <style>{`body{font:15px/1.5 system-ui;color:#17252c;margin:30px auto;max-width:1000px;padding:0 24px}h1{font-size:32px}h2{border-bottom:1px solid #999;padding-bottom:6px}section{margin:24px 0}article{break-inside:avoid}p{white-space:pre-wrap}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #ddd;text-align:left}.nota{padding:12px;background:#f5f5f5}.opcoes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}@page{size:A4;margin:16mm}@media print{body{margin:0;padding:0;font-size:11px}.download{display:none}}`}</style>
      </head>
      <body>
        {pdfHref && (
          <a className="download" href={pdfHref}>
            {t.pdf}
          </a>
        )}
        <main>
          <header>
            <p>
              {m.marca === "corealux"
                ? "CoreaLux"
                : m.marca === "guia_na_coreia"
                  ? "Guia na Coreia"
                  : m.marca}
            </p>
            <h1>{t.titulo}</h1>
            <p>
              {m.numero} · v{m.versao}
            </p>
            <p>
              {t.cliente}: {m.cliente}
            </p>
            <p>
              {t.validade}: {data(m.validadeAte)}
            </p>
            {m.condicoes.generica && <p className="nota">{t.generica}</p>}
          </header>
          <p>
            {m.pessoas
              .filter((p) => p.nome)
              .map((p) => `${p.nome}${p.idade === null ? "" : ` (${p.idade})`}`)
              .join(" · ")}
          </p>
          <div className="opcoes">
            {m.dados.opcoes.map((o, i) => {
              const c = m.calculos[i];
              const iva = Math.round(c.enviado * m.condicoes.iva),
                total = c.enviado + iva;
              return (
                <section key={o.id}>
                  <h2>{o.nome}</h2>
                  <p>
                    {t.preco}: <strong>{dinheiro(total)}</strong>
                  </p>
                  <p>
                    {t.pessoa}:{" "}
                    {o.pagantes
                      ? dinheiro(Math.round(total / o.pagantes))
                      : "—"}
                  </p>
                  {iva > 0 && (
                    <p>
                      {t.iva}: {dinheiro(iva)}
                    </p>
                  )}
                  {c.diferenca < 0 && (
                    <p>
                      {t.desconto}: {dinheiro(-c.diferenca)}
                    </p>
                  )}
                  <p>
                    {t.cartao}:{" "}
                    {dinheiro(
                      precoPagamento(
                        total,
                        "cartao",
                        1,
                        valorReferencia(
                          m.referencias,
                          "pagamentos",
                          "cartao",
                        ) ?? 1.05,
                      ).valor,
                    )}
                  </p>
                  {c.gorjeta !== null && (
                    <p>
                      {t.gorjeta}: {dinheiro(c.gorjeta)}
                    </p>
                  )}
                </section>
              );
            })}
          </div>
          {m.dados.opcoes.map((o, oi) => {
            const c = m.calculos[oi];
            const precosDia = distribuir(
              c.enviado,
              o.dias.map((d) =>
                d.linhas.reduce((s, l) => {
                  const linha = c.linhas.find((v) => v.id === l.id);
                  return (
                    s +
                    (linha?.total ?? 0) *
                      (linha?.grupo === "servicos" ? 1 + o.margem : 1)
                  );
                }, 0),
              ),
            );
            return (
              <section key={o.id}>
                <h2>{o.nome}</h2>
                {o.dias.map((d, i) => (
                  <article key={d.id}>
                    <h3>
                      {t.dia} {i + m.dados.diaInicial} · {data(d.data)} ·{" "}
                      {d.cidade}
                    </h3>
                    {d.manha && (
                      <p>
                        {t.manha}: {d.manha}
                      </p>
                    )}
                    {d.almoco && (
                      <p>
                        {t.almoco}: {d.almoco}
                      </p>
                    )}
                    {d.tarde && (
                      <p>
                        {t.tarde}: {d.tarde}
                      </p>
                    )}
                    {d.linhas
                      .filter((l) => l.hotel)
                      .map((l) => (
                        <p key={l.id}>
                          {l.hotel!.nome} · {l.hotel!.endereco} ·{" "}
                          {l.hotel!.quartos} × {l.hotel!.noites}
                        </p>
                      ))}
                    {m.condicoes.detalhe !== "nenhum" && (
                      <p data-dia-preco={precosDia[i]}>
                        {t.preco}: {dinheiro(precosDia[i])}
                      </p>
                    )}
                    {m.condicoes.detalhe === "servico" && (
                      <ul>
                        {distribuir(
                          precosDia[i],
                          d.linhas.map(
                            (l) =>
                              c.linhas.find((v) => v.id === l.id)?.total ?? 0,
                          ),
                        ).map((valor, j) => (
                          <li key={d.linhas[j].id}>
                            {d.linhas[j].nome}: {dinheiro(valor)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </section>
            );
          })}
          <section>
            <h2>{t.incluso}</h2>
            <p>{m.condicoes.incluso}</p>
            <h2>{t.naoIncluso}</h2>
            <p>{m.condicoes.naoIncluso}</p>
            <p>{t.hotel}</p>
          </section>
          {m.dados.taxaElaboracao?.ativa && (
            <p>
              {
                {
                  pt: "Taxa de elaboração — paga antes do aceite e abatida na contratação",
                  es: "Elaboración del itinerario — pago previo y descuento al contratar",
                  en: "Itinerary planning fee — paid before acceptance and credited on booking",
                  fr: "Frais de création — payés avant acceptation et déduits à la réservation",
                }[lang]
              }
              : {dinheiro(m.dados.taxaElaboracao.valor)}
            </p>
          )}
          <section>
            <h2>{t.condicoes}</h2>
            <p>
              {t.sinal}: {m.condicoes.sinal}%
            </p>
            <p>
              {t.saldo}: {m.condicoes.saldoDias} {t.diasAntes}
            </p>
            <h3>{t.cancelamento}</h3>
            <p>{m.condicoes.cancelamento}</p>
            <h3>{t.pagamento}</h3>
            <p>{m.condicoes.formasPagamento}</p>
            <h3>{t.banco}</h3>
            <p>{m.condicoes.dadosBancarios}</p>
          </section>
          {["agencia", "operadora"].includes(m.dados.canal) &&
            m.condicoes.notasB2B && (
              <section>
                <h2>{t.notas}</h2>
                <p>{m.condicoes.notasB2B}</p>
              </section>
            )}
        </main>
      </body>
    </html>
  );
}
export function resumoProposta(m: MemoriaOrcamento) {
  const t = textos[idioma(m)];
  return [
    `${t.titulo} ${m.numero} — ${m.cliente}`,
    m.condicoes.generica ? t.generica : "",
    ...m.dados.opcoes.flatMap((o, i) => [
      `${o.nome}: USD ${(m.calculos[i].enviado / 100).toFixed(2)} (${o.pagantes} + ${o.gratuidades})`,
      ...o.dias.map(
        (d, n) =>
          `${t.dia} ${n + m.dados.diaInicial}: ${d.data} · ${d.cidade} · ${[d.manha, d.almoco, d.tarde].filter(Boolean).join("; ")}`,
      ),
    ]),
    `${t.incluso}: ${m.condicoes.incluso}`,
    `${t.naoIncluso}: ${m.condicoes.naoIncluso}`,
    m.condicoes.notasB2B && ["agencia", "operadora"].includes(m.dados.canal)
      ? `${t.notas}: ${m.condicoes.notasB2B}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

import { useFetcher } from "react-router";
import type { Route } from "./+types/viagem";
import { now } from "~/clock.server";
import { exigirUsuario } from "~/session.server";
import {
  RegraViolada,
  adicionarNota,
  descartar,
  detalhe,
  listarUsuarios,
  registrarResposta,
  trocarResponsavel,
} from "~/modules/viagens/viagens.server";
import { semRespostaHumana, type Etapa } from "~/modules/viagens/regras";
import { rotuloCanal, rotuloCategoria, rotuloEtapa, rotuloIdioma, rotuloMarca, rotuloOrigem } from "~/modules/viagens/rotulos";

export async function loader({ request, params }: Route.LoaderArgs) {
  await exigirUsuario(request);
  const [d, usuarios] = await Promise.all([detalhe(Number(params.id)), listarUsuarios()]);
  if (!d) throw new Response("Viagem não encontrada", { status: 404 });
  const agora = now(request);
  return {
    ...d,
    usuarios,
    semResposta24h: semRespostaHumana(
      { etapa: d.viagem.etapa as Etapa, criadaEm: d.viagem.criadaEm, primeiraRespostaEm: d.viagem.primeiraRespostaEm },
      agora,
    ),
    agora: agora.toISOString(),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const usuario = await exigirUsuario(request);
  const id = Number(params.id);
  const agora = now(request);
  const f = await request.formData();
  try {
    switch (f.get("intent")) {
      case "responder":
        await registrarResposta(id, agora);
        break;
      case "trocar-responsavel":
        await trocarResponsavel(id, Number(f.get("usuarioId")), agora);
        break;
      case "descartar":
        await descartar(id, String(f.get("motivo") ?? ""), agora);
        break;
      case "nota":
        await adicionarNota(id, usuario.id, String(f.get("texto") ?? ""), agora);
        break;
    }
    return { ok: true as const };
  } catch (e) {
    if (e instanceof RegraViolada) return { erro: e.message };
    throw e;
  }
}

const quando = (d: Date | string | null) =>
  d ? new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

export default function Viagem({ loaderData }: Route.ComponentProps) {
  const { viagem: v, pessoas, cadeia, historico, acoes, notas, conflitos, usuarios } = loaderData;
  const resposta = useFetcher<typeof action>();
  const troca = useFetcher<typeof action>();
  const descarte = useFetcher<typeof action>();
  const nota = useFetcher<typeof action>();

  // Optimistic state: reflect the change before the server answers.
  const respondida = !!v.primeiraRespostaEm || resposta.state !== "idle";
  const responsavelAtual = historico.find((h) => !h.ate);
  const responsavelId = troca.formData ? Number(troca.formData.get("usuarioId")) : responsavelAtual?.usuarioId;
  const etapa = descarte.formData && !descarte.data?.erro ? "descartada" : v.etapa;
  const notaPendente = nota.formData?.get("texto");

  return (
    <>
      <div className="cabecalho">
        <h1>{v.codigo}</h1>
        <span className="etapa grande" data-testid="etapa">
          {rotuloEtapa[etapa]}
        </span>
      </div>

      {loaderData.semResposta24h && !respondida && (
        <p className="alerta" role="alert">
          Sem resposta há mais de 24h
        </p>
      )}
      {conflitos.length > 0 && (
        <p className="aviso" role="status">
          Atenção: {conflitos.map((c) => c.codigo).join(", ")} já está aberta com o mesmo contato por outra cadeia comercial.
        </p>
      )}

      <section className="grade">
        <div>
          <h2>Contatos</h2>
          <ul>
            {pessoas.map((p) => (
              <li key={`${p.id}-${p.papel}`}>
                {p.nome} <span className="rotulo">{p.papel}</span> {p.telefone} {p.email}
              </li>
            ))}
          </ul>
          {cadeia.length > 0 && (
            <>
              <h2>Cadeia comercial</h2>
              <ol>
                {cadeia.map((c) => (
                  <li key={c.ordem}>
                    {c.nome} ({c.tipo}){c.especificou ? ` — ${c.especificou}` : ""}
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
        <dl>
          <dt>Canal comercial</dt>
          <dd>{rotuloCanal[v.canalComercial]}</dd>
          <dt>Marca</dt>
          <dd>{rotuloMarca[v.marca]}</dd>
          <dt>Origem</dt>
          <dd>
            {rotuloOrigem[v.origem]}
            {v.indicadoPor ? ` — ${v.indicadoPor}` : ""}
          </dd>
          <dt>Categoria</dt>
          <dd>{rotuloCategoria[v.categoria]}</dd>
          <dt>Idiomas</dt>
          <dd>
            Cliente: {rotuloIdioma[v.idiomaCliente]} · Guiamento: {rotuloIdioma[v.idiomaGuiamento]}
          </dd>
          <dt>Datas</dt>
          <dd>
            {v.dataInicio ?? "?"} → {v.dataFim ?? "?"}
          </dd>
          <dt>Pessoas</dt>
          <dd>
            {v.pagantes ?? "?"} pagantes, {v.gratuidades} gratuidades · {v.adultos ?? "?"} adultos
            {v.idadesCriancas.length ? `, crianças de ${v.idadesCriancas.join(", ")} anos` : ""}
            {v.bebes ? `, ${v.bebes} bebê(s)` : ""}
          </dd>
          <dt>Meios de contato</dt>
          <dd>{v.meiosContato.join(", ") || "—"}</dd>
        </dl>
      </section>

      <section>
        <h2>Próximas ações</h2>
        <ul className="acoes">
          {acoes.map((a) => {
            const feita = !!a.concluidaEm || (respondida && a.descricao.startsWith("Responder"));
            return (
              <li key={a.id} className={feita ? "feita" : ""}>
                {a.descricao} — {a.responsavel} — prazo {quando(a.prazo)}
                {feita ? " ✓" : ""}
              </li>
            );
          })}
        </ul>
        {!respondida && etapa === "lead" && (
          <resposta.Form method="post">
            <button name="intent" value="responder">
              Respondi o contato
            </button>
          </resposta.Form>
        )}
      </section>

      <section className="grade">
        <div>
          <h2>Responsável</h2>
          <troca.Form method="post" className="linha">
            <input type="hidden" name="intent" value="trocar-responsavel" />
            <select
              name="usuarioId"
              aria-label="Responsável"
              value={responsavelId}
              onChange={(e) => troca.submit(e.currentTarget.form)}
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </troca.Form>
          <ul className="historico">
            {historico.map((h, i) => (
              <li key={i}>
                {h.nome}: {quando(h.desde)} → {h.ate ? quando(h.ate) : "agora"}
              </li>
            ))}
          </ul>
        </div>
        {etapa === "lead" && (
          <div>
            <h2>Descartar</h2>
            <descarte.Form method="post" className="linha">
              <input type="hidden" name="intent" value="descartar" />
              <input name="motivo" placeholder="Imprensa, spam, parceria…" aria-label="Motivo do descarte" required />
              <button className="secundario">Descartar</button>
            </descarte.Form>
            {descarte.data?.erro && <p className="alerta">{descarte.data.erro}</p>}
          </div>
        )}
      </section>

      <section>
        <h2>Notas</h2>
        <nota.Form
          method="post"
          className="linha"
          onSubmit={(e) => {
            const form = e.currentTarget;
            requestAnimationFrame(() => form.reset());
          }}
        >
          <input type="hidden" name="intent" value="nota" />
          <input name="texto" className="larga" aria-label="Nova nota" placeholder="Negociação, pedidos, valores falados…" />
          <button>Adicionar</button>
        </nota.Form>
        <ul className="notas">
          {notaPendente && <li className="pendente">{String(notaPendente)}</li>}
          {notas.map((n, i) => (
            <li key={i}>
              <span className="rotulo">
                {n.autor} · {quando(n.criadaEm)}
              </span>{" "}
              {n.texto}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

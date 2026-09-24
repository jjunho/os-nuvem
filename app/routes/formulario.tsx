import { Form, redirect } from "react-router";
import type { Route } from "./+types/formulario";
import {
  lerFormulario,
  receberFormulario,
} from "~/modules/viagens/formulario.server";
import { Seletor } from "~/modules/opcoes/Seletor";
const textos = {
  pt: {
    titulo: "Formulário de planejamento",
    chegada: "Chegada",
    partida: "Partida",
    hotel: "Hotel",
    endereco: "Endereço do hotel",
    nivelRestaurante: "Nível de restaurante",
    ritmo: "Ritmo",
    interesses: "Interesses",
    pontosDesejados: "Pontos que gostaria",
    nome: "Nome",
    idade: "Idade",
    mobilidade: "Mobilidade",
    alimentacao: "O que você não come",
    viajante: "Viajante",
    pagantes: "Pagantes",
    gratuidades: "Gratuidades",
    enviar: "Enviar respostas",
    recebido: "Respostas recebidas",
    outro: "Outro…",
  },
  es: {
    titulo: "Formulario de planificación",
    chegada: "Llegada",
    partida: "Salida",
    hotel: "Hotel",
    endereco: "Dirección del hotel",
    nivelRestaurante: "Nivel de restaurantes",
    ritmo: "Ritmo",
    interesses: "Intereses",
    pontosDesejados: "Lugares que le gustaría visitar",
    nome: "Nombre",
    idade: "Edad",
    mobilidade: "Movilidad",
    alimentacao: "Qué no come",
    viajante: "Viajero",
    pagantes: "Personas de pago",
    gratuidades: "Gratuidades",
    enviar: "Enviar respuestas",
    recebido: "Respuestas recibidas",
    outro: "Otro…",
  },
  en: {
    titulo: "Travel planning form",
    chegada: "Arrival",
    partida: "Departure",
    hotel: "Hotel",
    endereco: "Hotel address",
    nivelRestaurante: "Restaurant level",
    ritmo: "Pace",
    interesses: "Interests",
    pontosDesejados: "Places you would like to visit",
    nome: "Name",
    idade: "Age",
    mobilidade: "Mobility",
    alimentacao: "What you do not eat",
    viajante: "Traveller",
    pagantes: "Paying travellers",
    gratuidades: "Complimentary travellers",
    enviar: "Send answers",
    recebido: "Answers received",
    outro: "Other…",
  },
  fr: {
    titulo: "Formulaire de préparation du voyage",
    chegada: "Arrivée",
    partida: "Départ",
    hotel: "Hôtel",
    endereco: "Adresse de l’hôtel",
    nivelRestaurante: "Gamme de restaurants",
    ritmo: "Rythme",
    interesses: "Centres d’intérêt",
    pontosDesejados: "Lieux que vous souhaitez visiter",
    nome: "Nom",
    idade: "Âge",
    mobilidade: "Mobilité",
    alimentacao: "Ce que vous ne mangez pas",
    viajante: "Voyageur",
    pagantes: "Voyageurs payants",
    gratuidades: "Gratuités",
    enviar: "Envoyer les réponses",
    recebido: "Réponses reçues",
    outro: "Autre…",
  },
};
export async function loader({ params, request }: Route.LoaderArgs) {
  return {
    ...(await lerFormulario(params.token)),
    recebido: new URL(request.url).searchParams.has("recebido"),
  };
}
export async function action({ params, request }: Route.ActionArgs) {
  await receberFormulario(params.token, await request.formData());
  return redirect(`/planejamento/${params.token}?recebido=1`);
}
export const meta: Route.MetaFunction = ({ loaderData }) => [
  {
    title:
      textos[loaderData?.idioma as keyof typeof textos]?.titulo ?? "Formulário",
  },
];
export default function Formulario({
  loaderData: { viagem: v, pessoas, idioma, hoteis, recebido },
}: Route.ComponentProps) {
  const t = textos[idioma as keyof typeof textos] ?? textos.pt;
  return (
    <main className="pagina">
      <h1>{t.titulo}</h1>
      {recebido && <p role="status">{t.recebido}</p>}
      <Form method="post" className="lista-botoes">
        {!v.dataInicio && (
          <label>
            {t.chegada}
            <input type="date" name="dataInicio" />
          </label>
        )}
        {!v.dataFim && (
          <label>
            {t.partida}
            <input type="date" name="dataFim" />
          </label>
        )}
        {!v.hotelNome && (
          <Seletor
            nome="hotelNome"
            rotulo={t.hotel}
            opcoes={hoteis}
            outroLabel={t.outro}
          />
        )}
        {!v.hotelEndereco && (
          <label>
            {t.endereco}
            <input name="hotelEndereco" />
          </label>
        )}
        {(
          [
            "nivelRestaurante",
            "ritmo",
            "interesses",
            "pontosDesejados",
          ] as const
        ).map(
          (campo) =>
            !v[campo] && (
              <label key={campo}>
                {t[campo]}
                <input name={campo} />
              </label>
            ),
        )}
        {!pessoas.length && (
          <fieldset>
            <label>
              {t.pagantes}
              <input type="number" min="0" name="pagantes" />
            </label>
            <label>
              {t.gratuidades}
              <input type="number" min="0" name="gratuidades" />
            </label>
          </fieldset>
        )}
        {pessoas.map((p, i) => (
          <fieldset key={p.id}>
            <legend>{p.nome || `${t.viajante} ${i + 1}`}</legend>
            {(["nome", "idade", "mobilidade", "alimentacao"] as const).map(
              (campo) =>
                (p[campo] === null || p[campo] === "") && (
                  <label key={campo}>
                    {t[campo]}
                    <input
                      name={`pessoas.${p.id}.${campo}`}
                      type={campo === "idade" ? "number" : "text"}
                      min={campo === "idade" ? 0 : undefined}
                      max={campo === "idade" ? 120 : undefined}
                    />
                  </label>
                ),
            )}
          </fieldset>
        ))}
        <button>{t.enviar}</button>
      </Form>
    </main>
  );
}

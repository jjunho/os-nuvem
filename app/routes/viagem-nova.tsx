import { useState } from "react";
import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/viagem-nova";
import { now } from "~/clock.server";
import { exigirUsuario } from "~/session.server";
import {
  RegraViolada,
  criarViagem,
  listarIntermediarios,
  listarUsuarios,
  type ContatoInput,
  type NovaViagem,
} from "~/modules/viagens/viagens.server";
import { marcaSugerida, type CanalComercial } from "~/modules/viagens/regras";
import {
  MEIOS_DE_CONTATO,
  rotuloCanal,
  rotuloCategoria,
  rotuloIdioma,
  rotuloMarca,
  rotuloOrigem,
} from "~/modules/viagens/rotulos";

export async function loader({ request }: Route.LoaderArgs) {
  const usuario = await exigirUsuario(request);
  const [usuarios, intermediarios] = await Promise.all([listarUsuarios(), listarIntermediarios()]);
  return { usuario, usuarios, intermediarios };
}

const numero = (v: FormDataEntryValue | null) => (v === null || v === "" ? null : Number(v));
const lista = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export async function action({ request }: Route.ActionArgs) {
  const usuario = await exigirUsuario(request);
  const f = await request.formData();

  const contatos: ContatoInput[] = [];
  for (let i = 0; f.has(`contatos.${i}.nome`); i++) {
    const nome = String(f.get(`contatos.${i}.nome`) ?? "").trim();
    if (!nome) continue;
    const papeis: ContatoInput["papeis"] = [];
    if (f.get(`contatos.${i}.solicitante`)) papeis.push("solicitante");
    if (f.get(`contatos.${i}.viajante`)) papeis.push("viajante");
    contatos.push({
      nome,
      telefone: String(f.get(`contatos.${i}.telefone`) ?? ""),
      email: String(f.get(`contatos.${i}.email`) ?? ""),
      papeis: papeis.length ? papeis : ["solicitante"],
    });
  }

  const cadeia: NovaViagem["cadeia"] = [];
  for (let i = 0; i < 3; i++) {
    const id = numero(f.get(`cadeia.${i}.intermediarioId`));
    if (id) cadeia.push({ intermediarioId: id, especificou: String(f.get(`cadeia.${i}.especificou`) ?? "") });
  }

  const input: NovaViagem = {
    responsavelId: Number(f.get("responsavelId")),
    canalComercial: f.get("canalComercial") as CanalComercial,
    categoria: f.get("categoria") as NovaViagem["categoria"],
    marca: f.get("marca") as NovaViagem["marca"],
    origem: f.get("origem") as NovaViagem["origem"],
    indicadoPor: String(f.get("indicadoPor") ?? ""),
    idiomaCliente: f.get("idiomaCliente") as NovaViagem["idiomaCliente"],
    idiomaGuiamento: f.get("idiomaGuiamento") as NovaViagem["idiomaGuiamento"],
    meiosContato: f.getAll("meiosContato").map(String),
    dataInicio: String(f.get("dataInicio") ?? ""),
    dataFim: String(f.get("dataFim") ?? ""),
    pagantes: numero(f.get("pagantes")),
    gratuidades: numero(f.get("gratuidades")) ?? 0,
    adultos: numero(f.get("adultos")),
    idadesCriancas: lista(f.get("idadesCriancas")).map(Number).filter((n) => !Number.isNaN(n)),
    bebes: numero(f.get("bebes")) ?? 0,
    cidades: lista(f.get("cidades")),
    cadeia,
    contatos,
    nota: String(f.get("nota") ?? ""),
  };

  try {
    const { id } = await criarViagem(input, usuario.id, now(request));
    return redirect(`/viagens/${id}`);
  } catch (e) {
    if (e instanceof RegraViolada) return { erro: e.message };
    throw e;
  }
}

export default function ViagemNova({ loaderData, actionData }: Route.ComponentProps) {
  const { usuario, usuarios, intermediarios } = loaderData;
  const [canal, setCanal] = useState<CanalComercial>("cliente_final");
  const [marca, setMarca] = useState(marcaSugerida("cliente_final"));
  const [nContatos, setNContatos] = useState(1);
  const enviando = useNavigation().state === "submitting";

  return (
    <>
      <h1>Nova viagem</h1>
      {actionData?.erro && (
        <p className="alerta" role="alert">
          {actionData.erro}
        </p>
      )}
      <Form method="post" className="formulario">
        <fieldset>
          <legend>Quem</legend>
          {Array.from({ length: nContatos }, (_, i) => (
            <div className="linha" key={i}>
              <label>
                Nome do contato
                <input name={`contatos.${i}.nome`} required={i === 0} autoFocus={i === 0} />
              </label>
              <label>
                Telefone
                <input name={`contatos.${i}.telefone`} inputMode="tel" />
              </label>
              <label>
                E-mail
                <input name={`contatos.${i}.email`} type="email" />
              </label>
              <label className="check">
                <input type="checkbox" name={`contatos.${i}.solicitante`} defaultChecked={i === 0} /> Solicitante
              </label>
              <label className="check">
                <input type="checkbox" name={`contatos.${i}.viajante`} /> Viajante
              </label>
            </div>
          ))}
          <button type="button" className="secundario" onClick={() => setNContatos((n) => n + 1)}>
            + Contato
          </button>
        </fieldset>

        <fieldset>
          <legend>Canal e origem</legend>
          <div className="linha">
            <label>
              Canal comercial
              <select
                name="canalComercial"
                value={canal}
                onChange={(e) => {
                  const c = e.target.value as CanalComercial;
                  setCanal(c);
                  setMarca(marcaSugerida(c));
                }}
              >
                {Object.entries(rotuloCanal).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Marca
              <select name="marca" value={marca} onChange={(e) => setMarca(e.target.value as typeof marca)}>
                {Object.entries(rotuloMarca).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Origem
              <select name="origem" defaultValue="site">
                {Object.entries(rotuloOrigem).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Indicado por
              <input name="indicadoPor" />
            </label>
          </div>
          {(canal === "agencia" || canal === "operadora") &&
            [0, 1, 2].map((i) => (
              <div className="linha" key={i}>
                <label>
                  Cadeia comercial {i + 1}
                  <select name={`cadeia.${i}.intermediarioId`} defaultValue="">
                    <option value="">—</option>
                    {intermediarios.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.nome} ({it.tipo})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="larga">
                  O que especificou
                  <input name={`cadeia.${i}.especificou`} />
                </label>
              </div>
            ))}
          <div className="linha">
            {MEIOS_DE_CONTATO.map((m) => (
              <label className="check" key={m}>
                <input type="checkbox" name="meiosContato" value={m} /> {m}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Viagem</legend>
          <div className="linha">
            <label>
              Chegada
              <input type="date" name="dataInicio" />
            </label>
            <label>
              Partida
              <input type="date" name="dataFim" />
            </label>
            <label>
              Cidades
              <input name="cidades" placeholder="Seul, Busan, Jeju" />
            </label>
          </div>
          <div className="linha">
            <label>
              Pagantes
              <input type="number" min={0} name="pagantes" />
            </label>
            <label>
              Gratuidades
              <input type="number" min={0} name="gratuidades" defaultValue={0} />
            </label>
            <label>
              Adultos
              <input type="number" min={0} name="adultos" />
            </label>
            <label>
              Idades das crianças
              <input name="idadesCriancas" placeholder="8, 11" />
            </label>
            <label>
              Bebês
              <input type="number" min={0} name="bebes" defaultValue={0} />
            </label>
          </div>
          <div className="linha">
            <label>
              Categoria de atendimento
              <select name="categoria" defaultValue="padrao">
                {Object.entries(rotuloCategoria).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Idioma do cliente
              <select name="idiomaCliente" defaultValue="pt">
                {Object.entries(rotuloIdioma).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Idioma de guiamento
              <select name="idiomaGuiamento" defaultValue="pt">
                {Object.entries(rotuloIdioma).map(([v, r]) => (
                  <option key={v} value={v}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Responsável</legend>
          <div className="linha">
            <label>
              Responsável
              <select name="responsavelId" defaultValue={usuario.id} required>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="larga">
              Nota
              <input name="nota" placeholder="O que foi pedido, valores falados…" />
            </label>
          </div>
        </fieldset>

        <button type="submit" disabled={enviando}>
          {enviando ? "Criando…" : "Criar viagem"}
        </button>
      </Form>
    </>
  );
}

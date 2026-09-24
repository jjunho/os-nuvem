import { ContatoCampos } from "~/modules/viagens/ContatoCampos";
import { filtrarIntermediario } from "~/modules/opcoes/contexto";
import { Seletor } from "~/modules/opcoes/Seletor";
import {
  listarCatalogo,
  registrarOpcao,
  registrarIntermediario,
} from "~/modules/opcoes/opcoes.server";
import { useIdioma } from "~/modules/idiomas/idioma";
import { useState } from "react";
import { Form, redirect, useNavigation } from "react-router";
import type { Route } from "./+types/viagem-nova";
import { now } from "~/clock.server";
import { exigirUsuario } from "~/session.server";
import {
  RegraViolada,
  criarViagem,
  listarIntermediarios,
  listarContatos,
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
  const [usuarios, intermediarios] = await Promise.all([
    listarUsuarios(),
    listarIntermediarios(),
  ]);
  return {
    usuario,
    usuarios,
    intermediarios,
    contatos: await listarContatos(),
    opcoes: await listarCatalogo(usuario.idiomaInterface),
  };
}

const numero = (v: FormDataEntryValue | null) =>
  v === null || v === "" ? null : Number(v);
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
      contatoId: Number(f.get(`contatos.${i}.contatoId`)) || undefined,
      nome,
      telefone: String(f.get(`contatos.${i}.telefone`) ?? ""),
      email: String(f.get(`contatos.${i}.email`) ?? ""),
      papeis: papeis.length ? papeis : ["solicitante"],
    });
  }

  const cadeia: NovaViagem["cadeia"] = [];
  for (let i = 0; i < 3; i++) {
    const valor = String(f.get(`cadeia.${i}.intermediarioId`) ?? "").trim();
    const id = valor
      ? await registrarIntermediario(valor, String(f.get("canalComercial")))
      : null;
    if (id)
      cadeia.push({
        intermediarioId: id,
        especificou: String(f.get(`cadeia.${i}.especificou`) ?? ""),
      });
  }

  const input: NovaViagem = {
    responsavelId: Number(f.get("responsavelId")),
    canalComercial: await registrarOpcao(
      "canalComercial",
      String(f.get("canalComercial") ?? ""),
    ),
    categoria: await registrarOpcao(
      "categoria",
      String(f.get("categoria") ?? ""),
    ),
    marca: await registrarOpcao("marca", String(f.get("marca") ?? "")),
    origem: await registrarOpcao("origem", String(f.get("origem") ?? "")),
    indicadoPor: String(f.get("indicadoPor") ?? ""),
    idiomaCliente: await registrarOpcao(
      "idiomaCliente",
      String(f.get("idiomaCliente") ?? ""),
    ),
    idiomaGuiamento: await registrarOpcao(
      "idiomaGuiamento",
      String(f.get("idiomaGuiamento") ?? ""),
    ),
    meiosContato: await Promise.all(
      f
        .getAll("meiosContato")
        .map(String)
        .filter(Boolean)
        .map((v) => registrarOpcao("meiosContato", v)),
    ),
    dataInicio: String(f.get("dataInicio") ?? ""),
    dataFim: String(f.get("dataFim") ?? ""),
    pagantes: numero(f.get("pagantes")),
    gratuidades: numero(f.get("gratuidades")) ?? 0,
    adultos: numero(f.get("adultos")),
    idadesCriancas: lista(f.get("idadesCriancas"))
      .map(Number)
      .filter((n) => !Number.isNaN(n)),
    bebes: numero(f.get("bebes")) ?? 0,
    cidades: await Promise.all(
      f
        .getAll("cidades")
        .flatMap((v) => lista(v))
        .map((v) => registrarOpcao("cidades", v)),
    ),
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

export default function ViagemNova({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { idioma, t, mensagem } = useIdioma();
  const { usuario, usuarios, intermediarios } = loaderData;
  const [canal, setCanal] = useState<CanalComercial>("cliente_final");
  const [marca, setMarca] = useState<string>(marcaSugerida("cliente_final"));
  const [nContatos, setNContatos] = useState(1);
  const enviando = useNavigation().state === "submitting";

  return (
    <>
      <h1>{t("Nova viagem")}</h1>
      {actionData?.erro && (
        <p className="alerta" role="alert">
          {mensagem(actionData.erro)}
        </p>
      )}
      <Form method="post" className="formulario">
        <fieldset>
          <legend>{t("Quem")}</legend>
          {Array.from({ length: nContatos }, (_, i) => (
            <ContatoCampos key={i} indice={i} contatos={loaderData.contatos} />
          ))}
          <button
            type="button"
            className="secundario"
            onClick={() => setNContatos((n) => n + 1)}
          >
            {t("+ Contato")}
          </button>
        </fieldset>

        <fieldset>
          <legend>{t("Canal e origem")}</legend>
          <div className="linha">
            <Seletor
              nome="canalComercial"
              rotulo={t("Canal comercial")}
              opcoes={loaderData.opcoes.canalComercial}
              valorInicial="cliente_final"
              onChange={(c) => {
                setCanal(c);
                setMarca(marcaSugerida(c));
              }}
            />
            <Seletor
              nome="marca"
              rotulo={t("Marca")}
              opcoes={loaderData.opcoes.marca}
              valorInicial={marca}
              key={`${idioma}-${marca}`}
              onChange={setMarca}
            />
            <Seletor
              nome="origem"
              rotulo={t("Origem")}
              opcoes={loaderData.opcoes.origem}
              valorInicial="site"
            />
            <label>
              {t("Indicado por")}
              <input name="indicadoPor" />
            </label>
          </div>
          {(canal === "agencia" || canal === "operadora") &&
            [0, 1, 2].map((i) => (
              <div className="linha" key={i}>
                <Seletor
                  nome={`cadeia.${i}.intermediarioId`}
                  rotulo={`${t("Cadeia comercial")} ${i + 1}`}
                  contexto={{ canalComercial: canal }}
                  filtro={filtrarIntermediario}
                  opcoes={intermediarios.map((it) => ({
                    valor: String(it.id),
                    nome: `${it.nome} (${t(it.tipo)})`,
                    contexto: { tipo: it.tipo },
                  }))}
                />
                <label className="larga">
                  {t("O que especificou")}
                  <input name={`cadeia.${i}.especificou`} />
                </label>
              </div>
            ))}
          <div className="linha">
            <Seletor
              nome="meiosContato"
              rotulo={t("Meios de contato")}
              opcoes={loaderData.opcoes.meiosContato}
              multiplo
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>{t("Viagem")}</legend>
          <div className="linha">
            <label>
              {t("Chegada")}
              <input type="date" name="dataInicio" />
            </label>
            <label>
              {t("Partida")}
              <input type="date" name="dataFim" />
            </label>
            <Seletor
              nome="cidades"
              rotulo={t("Cidades")}
              opcoes={loaderData.opcoes.cidades}
              valorInicial={""}
              multiplo
            />
          </div>
          <div className="linha">
            <label>
              {t("Pagantes")}
              <input type="number" min={0} name="pagantes" />
            </label>
            <label>
              {t("Gratuidades")}
              <input
                type="number"
                min={0}
                name="gratuidades"
                defaultValue={0}
              />
            </label>
            <label>
              {t("Adultos")}
              <input type="number" min={0} name="adultos" />
            </label>
            <label>
              {t("Idades das crianças")}
              <input name="idadesCriancas" placeholder="8, 11" />
            </label>
            <label>
              {t("Bebês")}
              <input type="number" min={0} name="bebes" defaultValue={0} />
            </label>
          </div>
          <div className="linha">
            <Seletor
              nome="categoria"
              rotulo={t("Categoria de atendimento")}
              opcoes={loaderData.opcoes.categoria}
              valorInicial={"padrao"}
            />
            <Seletor
              nome="idiomaCliente"
              rotulo={t("Idioma do cliente")}
              opcoes={loaderData.opcoes.idiomaCliente}
              valorInicial={"pt"}
            />
            <Seletor
              nome="idiomaGuiamento"
              rotulo={t("Idioma de guiamento")}
              opcoes={loaderData.opcoes.idiomaGuiamento}
              valorInicial={"pt"}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>{t("Responsável")}</legend>
          <div className="linha">
            <label>
              {t("Responsável")}
              <select
                aria-label={t("Responsável")}
                name="responsavelId"
                defaultValue={usuario.id}
                required
              >
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="larga">
              {t("Nota")}
              <input
                name="nota"
                placeholder={t("O que foi pedido, valores falados…")}
              />
            </label>
          </div>
        </fieldset>

        <button type="submit" disabled={enviando}>
          {t(enviando ? "Criando…" : "Criar viagem")}
        </button>
      </Form>
    </>
  );
}

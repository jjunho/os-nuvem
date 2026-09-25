import type { TradutorComunicador } from "./textos";
import { useState } from "react";
import type { GruposPainel } from "./use-painel";

type GrupoFormProps = {
  conversa: GruposPainel["conversas"]["lista"][number];
  pessoas: GruposPainel["conversas"]["pessoas"];
  podeGerenciar: boolean;
  t: TradutorComunicador;
} & Pick<
  GruposPainel["preferencias"],
  "definirModo" | "editarGrupo" | "sair" | "convidar" | "remover"
>;

export function GrupoForm({
  conversa,
  pessoas,
  podeGerenciar,
  sair,
  editarGrupo,
  convidar,
  remover,
  definirModo,
  t,
}: GrupoFormProps) {
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("");

  return (
    <>
      <label>
        {t("Notificações do grupo")}
        <select
          onChange={(evento) => {
            const modo = evento.target.value;
            if (modo === "todas" || modo === "mencoes" || modo === "mudo") {
              definirModo(conversa.id, modo);
            }
          }}
          key={conversa.id}
          defaultValue={conversa.notificacao ?? "mencoes"}
        >
          <option value="todas">{t("Todas")}</option>
          <option value="mencoes">{t("Somente menções")}</option>
          <option value="mudo">{t("Silenciar")}</option>
        </select>
      </label>
      <details key={conversa.id}>
        <summary>{t("Gerenciar grupo")}</summary>
        <button onClick={() => sair(conversa.id)}>{t("Sair do grupo")}</button>
        {podeGerenciar && (
          <>
        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            const formulario = new FormData(evento.currentTarget);
            const nome = formulario.get("nome");
            const descricao = formulario.get("descricao");
            if (typeof nome !== "string" || typeof descricao !== "string") return;
            editarGrupo(conversa.id, {
              nome,
              descricao,
              privada: formulario.has("privada"),
              arquivada: formulario.has("arquivada"),
            });
          }}
        >
          <label>
            {t("Nome")}
            <input name="nome" defaultValue={conversa.nome} required />
          </label>
          <label>
            {t("Descrição")}
            <input name="descricao" defaultValue={conversa.descricao} />
          </label>
          <label>
            <input type="checkbox" name="privada" defaultChecked={conversa.privada} />
            {t("Privado")}
          </label>
          <label>
            <input type="checkbox" name="arquivada" defaultChecked={conversa.arquivada} />
            {t("Arquivada")}
          </label>
          <button>{t("Salvar")}</button>
        </form>
        <select
          aria-label={t("Convidar")}
          value={usuarioSelecionado}
          onChange={(evento) => setUsuarioSelecionado(evento.target.value)}
        >
          <option value="">{t("Escolher usuário")}</option>
          {pessoas.map((pessoa) => (
            <option key={pessoa.id} value={pessoa.id}>
              {pessoa.nome}
            </option>
          ))}
        </select>
        <button onClick={() => convidar(conversa.id, Number(usuarioSelecionado))}>
          {t("Convidar")}
        </button>
        <button onClick={() => remover(conversa.id, Number(usuarioSelecionado))}>
          {t("Remover membro")}
        </button>
          </>
        )}
      </details>
    </>
  );
}

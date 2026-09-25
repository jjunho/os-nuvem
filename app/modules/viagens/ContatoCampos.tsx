import { useReducer } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
import { Seletor } from "~/modules/opcoes/Seletor";
import { iniciarPessoa, reduzirPessoa } from "./pessoa-draft";
type Contato = {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
};
export function ContatoCampos({
  indice: i,
  contatos,
}: {
  indice: number;
  contatos: Contato[];
}) {
  const { t } = useIdioma();
  const [draft, dispatch] = useReducer(reduzirPessoa, undefined, () =>
    iniciarPessoa({ email: "", telefone: "" }),
  );
  return (
    <div className="linha">
      <Seletor
        nome={`contatos.${i}.nome`}
        rotulo={t("Nome do contato")}
        opcoes={contatos.map((c) => ({
          valor: `contato:${c.id}`,
          nome: `${c.nome}${c.email || c.telefone ? ` — ${c.email || c.telefone}` : ""}`,
        }))}
        onEditar={() => dispatch({ tipo: "editouNome" })}
        onChange={(valor) => {
          const c = contatos.find((c) => `contato:${c.id}` === valor) ?? null;
          if (c)
            dispatch({
              tipo: "selecionou",
              id: c.id,
              campos: { email: c.email, telefone: c.telefone },
            });
          else dispatch({ tipo: "editouNome" });
        }}
      />
      <input
        type="hidden"
        name={`contatos.${i}.contatoId`}
        value={draft.identidade.tipo === "conhecido" ? draft.identidade.id : ""}
      />
      <label>
        {t("Telefone")}
        <input
          name={`contatos.${i}.telefone`}
          inputMode="tel"
          value={draft.campos.telefone.valor}
          onChange={(e) =>
            dispatch({
              tipo: "editouCampo",
              campo: "telefone",
              valor: e.target.value,
            })
          }
        />
      </label>
      <label>
        {t("E-mail")}
        <input
          name={`contatos.${i}.email`}
          type="email"
          value={draft.campos.email.valor}
          onChange={(e) =>
            dispatch({
              tipo: "editouCampo",
              campo: "email",
              valor: e.target.value,
            })
          }
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          name={`contatos.${i}.solicitante`}
          defaultChecked={i === 0}
        />
        {t("Solicitante")}
      </label>
      <label className="check">
        <input type="checkbox" name={`contatos.${i}.viajante`} />
        {t("Viajante")}
      </label>
    </div>
  );
}

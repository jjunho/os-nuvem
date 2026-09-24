import { useState } from "react";
import { useIdioma } from "~/modules/idiomas/idioma";
import { Seletor } from "~/modules/opcoes/Seletor";
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
  const [contato, setContato] = useState<Contato | null>(null);
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  return (
    <div className="linha">
      <Seletor
        nome={`contatos.${i}.nome`}
        rotulo={t("Nome do contato")}
        opcoes={contatos.map((c) => ({
          valor: `contato:${c.id}`,
          nome: `${c.nome}${c.email || c.telefone ? ` — ${c.email || c.telefone}` : ""}`,
        }))}
        onEditar={() => setContato(null)}
        onChange={(valor) => {
          const c = contatos.find((c) => `contato:${c.id}` === valor) ?? null;
          setContato(c);
          if (c) {
            setEmail(c.email ?? "");
            setTelefone(c.telefone ?? "");
          }
        }}
      />
      <input
        type="hidden"
        name={`contatos.${i}.contatoId`}
        value={contato?.id ?? ""}
      />
      <label>
        {t("Telefone")}
        <input
          name={`contatos.${i}.telefone`}
          inputMode="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
      </label>
      <label>
        {t("E-mail")}
        <input
          name={`contatos.${i}.email`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

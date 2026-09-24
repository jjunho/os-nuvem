import { useState } from "react";
import { Form } from "react-router";
import { useIdioma } from "~/modules/idiomas/idioma";
import { Seletor } from "~/modules/opcoes/Seletor";
import type { listarViajantes } from "./viajantes.server";
export function Viajantes({
  lista,
  contatos,
  impactos,
}: {
  impactos: Record<number, string[]>;
  lista: Awaited<ReturnType<typeof listarViajantes>>;
  contatos: {
    id: number;
    nome: string;
    mobilidade: string | null;
    alimentacao: string | null;
  }[];
}) {
  const { idioma, t } = useIdioma();
  const [selecionados, setSelecionados] = useState<Record<number, number>>({});
  const [removendo, setRemovendo] = useState<number | null>(null);
  return (
    <section>
      <h2>{t("Viajantes")}</h2>
      <table className="tabela" aria-label={t("Viajantes")}>
        <thead>
          <tr>
            <th>{t("Viajante")}</th>
            <th>{t("Alterar")}</th>
          </tr>
        </thead>
        <tbody>
          {lista.map((v, i) => (
            <tr key={v.id}>
              <td>
                {v.nome ??
                  `${t(v.faixa === "crianca" ? "Criança" : v.faixa === "bebe" ? "Bebê" : "Adulto")} ${i + 1}`}
              </td>
              <td>
                <span data-testid="bagagem-salva">
                  {v.malas} · {v.bagagemMao}
                </span>
                <Form method="post" className="linha">
                  <input type="hidden" name="viajanteId" value={v.id} />
                  <Seletor
                    key={`${idioma}-${v.contatoId}`}
                    nome="contato"
                    rotulo={t("Nome")}
                    valorInicial={
                      v.nome && v.contatoId ? `contato:${v.contatoId}` : ""
                    }
                    onChange={(valor) =>
                      setSelecionados((atual) => ({
                        ...atual,
                        [v.id]: Number(valor.replace("contato:", "")),
                      }))
                    }
                    opcoes={contatos.map((c) => ({
                      valor: `contato:${c.id}`,
                      nome: c.nome,
                    }))}
                  />
                  <label>
                    {t("Pagamento")}
                    <select
                      name="pagamento"
                      defaultValue={v.pagante ? "pagante" : "gratuidade"}
                    >
                      <option value="pagante">{t("Pagante")}</option>
                      <option value="gratuidade">{t("Gratuidade")}</option>
                    </select>
                  </label>
                  <label>
                    {t("Faixa etária")}
                    <select name="faixa" defaultValue={v.faixa}>
                      <option value="adulto">{t("Adulto")}</option>
                      <option value="crianca">{t("Criança")}</option>
                      <option value="bebe">{t("Bebê")}</option>
                    </select>
                  </label>
                  <label>
                    {t("Idade")}
                    <input
                      type="number"
                      min="0"
                      max="120"
                      name="idade"
                      defaultValue={v.idade ?? ""}
                    />
                  </label>
                  <label>
                    {t("Malas de 23 kg")}
                    <input
                      type="number"
                      name="malas"
                      min="0"
                      max="20"
                      defaultValue={v.malas}
                    />
                  </label>
                  <label>
                    {t("Bagagem de mão")}
                    <input
                      type="number"
                      name="bagagemMao"
                      min="0"
                      max="20"
                      defaultValue={v.bagagemMao}
                    />
                  </label>
                  <label>
                    {t("Mobilidade")}
                    <input
                      name="mobilidade"
                      key={`${selecionados[v.id] ?? v.contatoId}-${v.mobilidade}`}
                      defaultValue={
                        (contatos.find((c) => c.id === selecionados[v.id]) ?? v)
                          .mobilidade ?? ""
                      }
                    />
                  </label>
                  <label>
                    {t("O que você não come")}
                    <input
                      name="alimentacao"
                      key={`${selecionados[v.id] ?? v.contatoId}-${v.alimentacao}`}
                      defaultValue={
                        (contatos.find((c) => c.id === selecionados[v.id]) ?? v)
                          .alimentacao ?? ""
                      }
                    />
                  </label>
                  <button name="intent" value="viajante-salvar">
                    {t("Salvar")}
                  </button>
                  {impactos[v.id]?.length ? (
                    <>
                      <button type="button" onClick={() => setRemovendo(v.id)}>
                        {t("Remover")}
                      </button>
                      {removendo === v.id && (
                        <div
                          role="alertdialog"
                          aria-label={t("Confirmar remoção")}
                        >
                          <p>{t("Dias e linhas afetados")}</p>
                          <ul>
                            {impactos[v.id].map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                          <input
                            type="hidden"
                            name="confirmarRemocao"
                            value="1"
                          />
                          <button name="intent" value="viajante-remover">
                            {t("Confirmar remoção")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRemovendo(null)}
                          >
                            {t("Cancelar")}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <button name="intent" value="viajante-remover">
                      {t("Remover")}
                    </button>
                  )}
                </Form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Form method="post">
        <button name="intent" value="viajante-adicionar">
          {t("Adicionar viajante")}
        </button>
      </Form>
    </section>
  );
}

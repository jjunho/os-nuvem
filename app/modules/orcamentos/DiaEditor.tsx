import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Seletor } from "~/modules/opcoes/Seletor";
import { disponibilidade } from "~/modules/profissionais/disponibilidade";
import { sugerirEquipe } from "./sugestoes";
import { sugerirVeiculo, avaliarVeiculo } from "./transportes";
import { alternativasTransporte } from "./calculo";
import type { CalculoOpcao, DiaOrcamento, OpcaoOrcamento } from "./calculo";
import type { Carregados, CriarLinha, MudarDia } from "./editor-tipos";
import { LinhaEditor } from "./LinhaEditor";
import type { ChaveTraducao } from "~/modules/idiomas/catalogo";

type Props = {
  opcao: OpcaoOrcamento;
  dia: DiaOrcamento;
  calculo: CalculoOpcao;
  numero: number;
  podeMoverParaCima: boolean;
  totalDias: number;
  pax: number;
  categoria: string;
  canal: string;
  malasPorPessoa: number;
  dados: Carregados;
  t: (chave: ChaveTraducao) => string;
  mensagem: (texto: string) => string;
  moeda: (valor: number | null) => string;
  conhecidas: (
    campo: string,
    base: { valor: string; nome: string }[],
  ) => { valor: string; nome: string }[];
  mudar: MudarDia;
  criarLinha: (entrada: CriarLinha) => void;
  removerLinha: (indice: number) => void;
  inserirDia: () => void;
  moverDia: (direcao: -1 | 1) => void;
  removerDia: () => void;
};

export type DiaEditorProps = Props;

export function DiaEditor({
  opcao,
  dia,
  calculo,
  numero,
  podeMoverParaCima,
  totalDias,
  pax,
  categoria,
  dados,
  canal,
  malasPorPessoa,
  t,
  mensagem,
  moeda,
  conhecidas,
  mudar,
  criarLinha,
  removerLinha,
  inserirDia,
  moverDia,
  removerDia,
}: DiaEditorProps) {
  const [item, setItem] = useState("sky_capsule");
  const equipe = sugerirEquipe(categoria, pax);
  const qtdEquipe = equipe.guias + equipe.assistentes;
  const veiculo = sugerirVeiculo(
    pax,
    qtdEquipe,
    pax * malasPorPessoa,
    categoria,
    dados.referencias,
  );
  const modelo = dia.veiculo || veiculo.modelo;
  const capacidade = avaliarVeiculo(
    modelo,
    pax,
    qtdEquipe,
    pax * malasPorPessoa,
    dados.referencias,
  );
  const staff = disponibilidade(
    dados.profissionais,
    dados.alocacoes,
    dia,
    dados.viagem.idiomaGuiamento,
    dados.viagem.id,
  );
  const necessario = staff.find((p) => p.id === dia.profissionalNecessarioId);
  const autores = dados.autores;
  const linhasCarregadas = useMemo(
    () => dados.orcamento.dados.opcoes.flatMap((opcao) =>
      opcao.dias.flatMap((d) => d.linhas),
    ),
    [dados.orcamento.dados],
  );

  return (
    <section className="dia-orcamento">
      <h3>
        {t("Dia")} {numero}
      </h3>
      <div className="linha">
        <label>
          {t("Data")}
          <input
            type="date"
            value={dia.data}
            onChange={(e) =>
              mudar((d) => {
                d.data = e.target.value;
              })
            }
          />
        </label>
        <label>
          {t("Profissional necessário")}
          <select
            aria-label={t("Profissional necessário")}
            value={dia.profissionalNecessarioId ?? ""}
            onChange={(e) =>
              mudar((d) => {
                d.profissionalNecessarioId = Number(e.target.value) || undefined;
              })
            }
          >
            <option value="">{t("Nenhum")}</option>
            {staff.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        {(["guia", "assistente"] as const).map((papel) => (
          <label key={papel}>
            {t(papel === "guia" ? "Guia do dia" : "Assistente do dia")}
            <select
              aria-label={t(papel === "guia" ? "Guia do dia" : "Assistente do dia")}
              value={dia[papel === "guia" ? "guiaId" : "assistenteId"] ?? ""}
              onChange={(e) =>
                mudar((d) => {
                  d[papel === "guia" ? "guiaId" : "assistenteId"] =
                    Number(e.target.value) || undefined;
                })
              }
            >
              <option value="">{t("A informar")}</option>
              {staff
                .filter((p) => p.papel === papel && p.falaIdioma)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}{p.ocupado ? ` — ${t("ocupada")}` : ""}
                  </option>
                ))}
            </select>
          </label>
        ))}
        {necessario?.ocupado && (
          <p role="alert">
            {necessario.nome} {t("está ocupada")}
          </p>
        )}
        {necessario && !necessario.falaIdioma && (
          <p role="alert">
            {necessario.nome} {t("não fala o idioma de guiamento")}
          </p>
        )}
        <Link to="/profissionais">{t("Profissionais e disponibilidade")}</Link>
        <Seletor
          nome={`cidade-${dia.id}`}
          rotulo={t("Cidade ou trecho")}
          opcoes={conhecidas("cidades", [])}
          valorInicial={dia.cidade}
          onChange={(valor) =>
            mudar((d) => {
              d.cidade = valor;
            })
          }
        />
        <Seletor
          nome={`periodo-${dia.id}`}
          rotulo={t("Período")}
          opcoes={conhecidas(
            "periodo",
            Object.entries({
              completo: "Dia completo",
              meio: "Meio período",
              livre: "Dia livre",
              deslocamento: "Deslocamento",
            }).map(([valor, nome]) => ({ valor, nome })),
          )}
          valorInicial={dia.periodo}
          onChange={(valor) =>
            mudar((d) => {
              d.periodo = valor;
            })
          }
        />
        <label>
          {t("Início do serviço")}
          <input
            type="time"
            value={dia.horaInicio ?? ""}
            onChange={(e) =>
              mudar((d) => {
                d.horaInicio = e.target.value;
              })
            }
          />
        </label>
        <label>
          {t("Fim do serviço")}
          <input
            type="time"
            value={dia.horaFim ?? ""}
            onChange={(e) =>
              mudar((d) => {
                d.horaFim = e.target.value;
              })
            }
          />
        </label>
      </div>
      <div className="linha">
        {(["manha", "almoco", "tarde"] as const).map((campo, i) => (
          <label key={campo}>
            {t((["Manhã", "Almoço", "Tarde"] as const)[i])}
            <input
              value={dia[campo]}
              onChange={(e) =>
                mudar((d) => {
                  d[campo] = e.target.value;
                })
              }
            />
          </label>
        ))}
      </div>
      <fieldset>
        <legend>{t("Viajantes do dia")}</legend>
        {dados.pessoas.map((p, i) => (
          <label key={p.id}>
            <input
              type="checkbox"
              checked={!dia.viajanteIds || dia.viajanteIds.includes(p.id)}
              onChange={(e) =>
                mudar((d) => {
                  const ids = d.viajanteIds ?? dados.pessoas.map((p) => p.id);
                  d.viajanteIds = e.target.checked
                    ? [...ids, p.id]
                    : ids.filter((id) => id !== p.id);
                })
              }
            />
            {p.nome ?? `${t("Viajante")} ${i + 1}`}
          </label>
        ))}
      </fieldset>
      {pax > 8 && (
        <ul aria-label={t("Alternativas de transporte")}>
          {alternativasTransporte(opcao, dia, {
            canal,
            categoria,
            referencias: dados.referencias,
            malasPorPessoa,
            viajantes: dados.pessoas,
          }).map((a) => (
            <li key={a.modelo}>
              {a.modelo} × {a.quantidade}: {moeda(a.total)}
            </li>
          ))}
        </ul>
      )}
      <p data-testid="sugestao-veiculo">
        {t("Veículo sugerido")}: {" "}
        {dados.referencias.frota.linhas.find((v) => v.id === veiculo.modelo)?.nome ?? t("Ônibus")} × {veiculo.quantidade}
      </p>
      <Seletor
        nome={`veiculo-${dia.id}`}
        rotulo={t("Veículo do dia")}
        opcoes={conhecidas("veiculo", [
          ...dados.referencias.frota.linhas.map((v) => ({ valor: v.id, nome: v.nome })),
          { valor: "onibus", nome: t("Ônibus") },
        ])}
        valorInicial={dia.veiculo ?? veiculo.modelo}
        onChange={(valor) =>
          mudar((d) => {
            d.veiculo = valor;
          })
        }
      />
      {modelo === "onibus" && (
        <>
          <label>
            {t("Distância contratada km")}
            <input type="number" min="1" value={dia.distanciaOnibus ?? 200} onChange={(e) => mudar((d) => { d.distanciaOnibus = Number(e.target.value); })} />
          </label>
          <label>
            {t("Duração contratada dias")}
            <input type="number" min="1" max="4" value={dia.duracaoOnibus ?? 1} onChange={(e) => mudar((d) => { d.duracaoOnibus = Number(e.target.value); })} />
          </label>
          <p>{t("Registre a contratação contínua uma vez; nos demais dias zere a quantidade do ônibus.")}</p>
        </>
      )}
      {modelo === "onibus" && (
        <label>
          {t("Porte do ônibus")}
          <select value={dia.porteOnibus ?? "45"} onChange={(e) => mudar((d) => { d.porteOnibus = e.target.value; })}>
            {dados.referencias.porte_onibus.linhas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </label>
      )}
      {capacidade.confortoExcedido && <p role="alert">{t("Capacidade de conforto excedida")}: {" "}{capacidade.conforto}</p>}
      {capacidade.assentosInsuficientes && <p className="alerta" data-testid="alerta-assentos">{t("Assentos insuficientes")}: {capacidade.capacidade} · {t("Veículo maior ou segundo veículo")}</p>}
      {!capacidade.assentosInsuficientes && capacidade.bagagemExcedente && <p className="alerta">{t("Bagagem excede a referência de conforto; confirme veículo maior ou caminhão de bagagem")}</p>}
      <label>
        {t("Transporte autorizado pelo cliente")}
        <select aria-label={t("Transporte autorizado pelo cliente")} value={dia.autorizacaoTransporte ?? ""} onChange={(e) => mudar((d) => { d.autorizacaoTransporte = e.target.value; })}>
          <option value="">{t("A informar")}</option>
          {["Veículo maior", "Segundo veículo", "Caminhão de bagagem", "Transporte público"].map((v) => <option key={v} value={v}>{mensagem(v)}</option>)}
        </select>
      </label>
      <table>
        <thead>
          <tr>
            {["Descrição da linha", "Quantidade", "Valor unitário USD", "Grupo", "Total"].map((n) => <th key={n}>{mensagem(n)}</th>)}
            <th />
          </tr>
        </thead>
        <tbody>
          {dia.linhas.map((linha, indice) => {
            const calculada = calculo.linhas.find((l) => l.id === linha.id);
            if (!calculada) return null;
            const autorId = linhasCarregadas.find((l) => l.id === linha.id)?.autorAjuste;
            const autorAjuste = autorId === undefined
              ? undefined
              : autores.find((autor) => autor.id === autorId)?.nome;
            return (
              <LinhaEditor
                key={linha.id}
                linha={linha}
                calculada={calculada}
                dia={dia}
                hoteis={dados.hoteis}
                pessoas={dados.pessoas}
                autorAjuste={autorAjuste}
                t={t}
                moeda={moeda}
                conhecidas={conhecidas}
                mudar={(editar) =>
                  mudar((diaAtual) => {
                    const linhaAtual = diaAtual.linhas[indice];
                    if (linhaAtual) editar(linhaAtual);
                  })
                }
                remover={() => removerLinha(indice)}
              />
            );
          })}
        </tbody>
      </table>
      <div className="linha">
        <label>
          {t("Item de referência")}
          <select aria-label={t("Item de referência")} value={item} onChange={(e) => setItem(e.target.value)}>
            {dados.referencias.tickets.linhas.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            {Object.entries({ voo_jeju: "Voo Jeju", voo_equipe: "Voo da equipe", ktx_guia: "KTX do guia" }).map(([id, nome]) => <option key={id} value={id}>{mensagem(nome)}</option>)}
          </select>
        </label>
        <button onClick={() => criarLinha({ tipo: "item", item })}>{t("Adicionar item")}</button>
      </div>
      <label>
        {t("Adicionar transfer")}
        <select aria-label={t("Adicionar transfer")} value="" onChange={(evento) => {
          const [trecho, nivel] = evento.target.value.split(":");
          if (trecho && nivel) criarLinha({ tipo: "transfer", trecho, nivel });
        }}>
          <option value="">{t("Selecionar")}</option>
          {dados.referencias.transfers.linhas.flatMap((l) => ["simples", "recepcao", "placa", "checkin", "onibus"].map((nivel) => <option key={`${l.id}:${nivel}`} value={`${l.id}:${nivel}`}>{l.nome} · {nivel}</option>))}
        </select>
      </label>
      <button onClick={() => criarLinha({ tipo: "hotel" })}>{t("Adicionar hotel")}</button>
      <div className="linha">
        <button onClick={() => criarLinha({ tipo: "vazia" })}>{t("Adicionar linha")}</button>
        <button onClick={inserirDia}>{t("Inserir dia após este")}</button>
        {podeMoverParaCima && <button onClick={() => moverDia(-1)}>{t("Mover dia para cima")}</button>}
        {totalDias > 1 && <button onClick={removerDia}>{t("Remover dia")}</button>}
      </div>
    </section>
  );
}

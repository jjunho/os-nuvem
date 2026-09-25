import { Seletor } from "~/modules/opcoes/Seletor";
import type { ChaveTraducao } from "~/modules/idiomas/catalogo";
import type { CalculoOpcao, OpcaoOrcamento } from "./calculo";
import { ResumoOpcao } from "./ResumoOpcao";
import { DiaEditor } from "./DiaEditor";
import type { Carregados, CriarLinha, MudarOpcao } from "./editor-tipos";

type Texto = (chave: ChaveTraducao) => string;
type Mensagem = (texto: string) => string;
type Moeda = (valor: number | null) => string;
type Conhecidas = (
  campo: string,
  base: { valor: string; nome: string }[],
) => { valor: string; nome: string }[];

export type OpcaoEditorProps = {
  opcao: OpcaoOrcamento;
  calculo: CalculoOpcao;
  dados: Carregados;
  canal: string;
  categoria: string;
  diaInicial: number;
  malasPorPessoa: number;
  t: Texto;
  mensagem: Mensagem;
  moeda: Moeda;
  conhecidas: Conhecidas;
  mudar: MudarOpcao;
  copiar: () => void;
  criarLinha: (diaIndice: number, entrada: CriarLinha) => void;
  removerLinha: (diaIndice: number, linhaIndice: number) => void;
  inserirDia: (diaIndice: number) => void;
  moverDia: (diaIndice: number, direcao: -1 | 1) => void;
  removerDia: (diaIndice: number) => void;
};

export function OpcaoEditor({
  opcao,
  calculo,
  dados,
  canal,
  categoria,
  diaInicial,
  malasPorPessoa,
  t,
  mensagem,
  moeda,
  conhecidas,
  mudar,
  copiar,
  criarLinha,
  removerLinha,
  inserirDia,
  moverDia,
  removerDia,
}: OpcaoEditorProps) {
  const categoriaOpcao = opcao.categoria ?? categoria;
  const pax = opcao.pagantes + opcao.gratuidades;

  return (
    <section
      aria-label={opcao.nome}
      className="opcao-orcamento"
    >
      <h2>{opcao.nome}</h2>
      <button onClick={copiar}>{t("Copiar opção")}</button>
      <Seletor
        nome={`categoria-${opcao.id}`}
        rotulo={t("Categoria da opção")}
        opcoes={conhecidas("categoria", [])}
        valorInicial={categoriaOpcao}
        onChange={(valor) => mudar((o) => { o.categoria = valor; })}
      />
      <div className="linha">
        <label>
          {t("Pagantes")}
          <input
            type="number"
            min="0"
            value={opcao.pagantes}
            onChange={(e) => mudar((o) => { o.pagantes = Number(e.target.value); })}
          />
        </label>
        <label>
          {t("Gratuidades")}
          <input
            type="number"
            min="0"
            value={opcao.gratuidades}
            onChange={(e) => mudar((o) => { o.gratuidades = Number(e.target.value); })}
          />
        </label>
        <label>
          {t("Margem (%)")}
          <input
            type="number"
            list={`margens-${opcao.id}`}
            value={opcao.margem * 100}
            onChange={(e) => mudar((o) => { o.margem = Number(e.target.value) / 100; })}
          />
          <datalist id={`margens-${opcao.id}`}>
            {( ["agencia", "operadora"].includes(canal)
              ? [10, 20, 30, 40]
              : [20, 30, 40, 50]
            ).map((m) => <option key={m} value={m} />)}
          </datalist>
        </label>
      </div>
      {opcao.dias.map((dia, di) => (
        <DiaEditor
          key={dia.id}
          dia={dia}
          calculo={calculo}
          opcao={opcao}
          canal={canal}
          malasPorPessoa={malasPorPessoa}
          numero={di + diaInicial}
          podeMoverParaCima={di > 0}
          totalDias={opcao.dias.length}
          pax={pax}
          categoria={categoriaOpcao}
          dados={dados}
          t={t}
          mensagem={mensagem}
          moeda={moeda}
          conhecidas={conhecidas}
          mudar={(fn) =>
            mudar((o) => {
              const diaAtual = o.dias[di];
              if (diaAtual) fn(diaAtual);
            })
          }
          criarLinha={(entrada) => criarLinha(di, entrada)}
          removerLinha={(indice) => removerLinha(di, indice)}
          inserirDia={() => inserirDia(di)}
          moverDia={(direcao) => moverDia(di, direcao)}
          removerDia={() => removerDia(di)}
        />
      ))}
      <ResumoOpcao calculo={calculo} moeda={moeda} />
      {["duplo", "single"].map((ocupacao) => {
        const hoteis = calculo.linhas.filter(
          (linha) => linha.hotel && !linha.terceiro && linha.hotel.ocupacao === ocupacao,
        );
        if (!hoteis.length) return null;
        const incompleto = hoteis.some((linha) => linha.total === null);
        const valor = incompleto
          ? null
          : (calculo.servicos + calculo.margem + calculo.terceiros) /
              Math.max(1, opcao.pagantes) +
            hoteis.reduce((soma, linha) => {
              if (linha.total === null || !linha.hotel) return soma;
              return soma + linha.total / (linha.hotel.quartos * (ocupacao === "duplo" ? 2 : 1));
            }, 0);
        return (
          <p key={ocupacao}>
            {t(ocupacao === "duplo" ? "Duplo" : "Single")} · {t("Por pessoa pagante")}: {moeda(valor)}
          </p>
        );
      })}
      <details>
        <summary>{t("Linhas com padrões provisórios")}</summary>
        <ul>
          {calculo.linhas.filter((linha) => linha.provisorio).map((linha) => (
            <li key={linha.id}>{linha.nome} · {moeda(linha.total)}</li>
          ))}
        </ul>
      </details>
      <label>
        <input
          type="checkbox"
          checked={!!opcao.mostrarGorjeta}
          onChange={(e) => mudar((o) => { o.mostrarGorjeta = e.target.checked; })}
        />
        {t("Mostrar gorjeta sugerida")}
      </label>
      {calculo.gorjeta !== null && (
        <p data-testid="gorjeta-sugerida">
          {t("Gorjeta sugerida, não incluída")}: {moeda(calculo.gorjeta)}
        </p>
      )}
      <label>
        {t("Preço enviado USD")}
        <input
          type="number"
          step=".01"
          min="0"
          placeholder={String(calculo.sugerido / 100)}
          value={opcao.precoEnviado === undefined ? "" : opcao.precoEnviado / 100}
          onChange={(e) => mudar((o) => {
            o.precoEnviado = e.target.value === ""
              ? undefined
              : Math.round(Number(e.target.value) * 100);
          })}
        />
      </label>
      <p data-testid="margem-real">
        {t("Margem estimada")}: {calculo.margemReal === null
          ? t("não verificável")
          : `${Number((calculo.margemReal * 100).toFixed(2))}%`}
      </p>
      {calculo.margemReal !== null && calculo.margemReal < 0.1 && (
        <label>
          {t("Motivo da margem")}
          <input
            value={opcao.motivoMargem ?? ""}
            onChange={(e) => mudar((o) => { o.motivoMargem = e.target.value; })}
          />
        </label>
      )}
      {calculo.comissaoInfluencer > 0 && (
        <p>{t("Comissão Influencer")}: {moeda(calculo.comissaoInfluencer)}</p>
      )}
      {calculo.avisos.map((aviso) => (
        <p className="alerta" key={aviso}>{mensagem(aviso)}</p>
      ))}
    </section>
  );
}

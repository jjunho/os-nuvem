import { sql } from "drizzle-orm";
import {
  pgTable,
  jsonb,
  customType,
  pgEnum,
  serial,
  integer,
  text,
  timestamp,
  date,
  primaryKey,
  uniqueIndex,
  index,
  boolean,
} from "drizzle-orm/pg-core";

export const papel = pgEnum("papel", [
  "admin",
  "faturamento",
  "propostas",
  "itinerarios",
  "guiamento",
  "conteudo",
]);

export const etapa = pgEnum("etapa", [
  "lead",
  "em_orcamento",
  "proposta_enviada",
  "em_negociacao",
  "confirmada",
  "em_viagem",
  "concluida",
  "perdida",
  "cancelada",
  "descartada",
]);

export const canalComercial = pgEnum("canal_comercial", [
  "operadora",
  "agencia",
  "cliente_final",
  "influencer",
]);

export const categoriaAtendimento = pgEnum("categoria_atendimento", [
  "economico",
  "padrao",
  "premium",
  "vip",
]);

export const idioma = pgEnum("idioma", ["pt", "es", "en", "fr"]);

export const marca = pgEnum("marca", ["corealux", "guia_na_coreia"]);

export const origem = pgEnum("origem", [
  "instagram",
  "site",
  "indicacao",
  "agencia",
  "operadora",
  "influenciador",
  "outra",
]);

export const papelNaViagem = pgEnum("papel_na_viagem", [
  "solicitante",
  "viajante",
]);

export const tipoIntermediario = pgEnum("tipo_intermediario", [
  "agencia",
  "operadora",
]);

export const usuarios = pgTable(
  "usuarios",
  {
    id: serial("id").primaryKey(),
    nome: text("nome").notNull(),
    idiomaInterface: text("idioma_interface")
      .$type<"pt" | "ko">()
      .notNull()
      .default("pt"),
    email: text("email").notNull(),
    senhaHash: text("senha_hash").notNull(),
    papel: papel("papel").notNull(),
    deveTrocarSenha: boolean("deve_trocar_senha").notNull().default(false),
    ativo: boolean("ativo").notNull().default(true),
  },
  (t) => [uniqueIndex("usuarios_email_idx").on(t.email)],
);

export const sessoes = pgTable("sessoes", {
  token: text("token").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
});

export const tentativasEntrada = pgTable("tentativas_entrada", {
  email: text("email").primaryKey(),
  falhas: integer("falhas").notNull(),
  bloqueadoAte: timestamp("bloqueado_ate", { withTimezone: true }),
});

export const contatos = pgTable(
  "contatos",
  {
    numero: text("numero")
      .notNull()
      .unique()
      .default(sql`numero_cliente()`),
    id: serial("id").primaryKey(),
    nome: text("nome").notNull(),
    telefone: text("telefone"),
    email: text("email"),
    nascimento: date("nascimento"),
    preferencias: text("preferencias"),
    mobilidade: text("mobilidade"),
    alimentacao: text("alimentacao"),
    criadoEm: timestamp("criado_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("contatos_telefone_idx").on(t.telefone),
    index("contatos_email_idx").on(t.email),
  ],
);

export const intermediarios = pgTable("intermediarios", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  tipo: tipoIntermediario("tipo").notNull(),
  canalComercial: text("canal_comercial").notNull(),
});

export const viagens = pgTable(
  "viagens",
  {
    id: serial("id").primaryKey(),
    codigo: text("codigo").notNull(),
    etapa: etapa("etapa").notNull().default("lead"),
    canalComercial: text("canal_comercial").notNull(),
    categoria: text("categoria").notNull().default("padrao"),
    idiomaCliente: text("idioma_cliente").notNull().default("pt"),
    idiomaGuiamento: text("idioma_guiamento").notNull().default("pt"),
    marca: text("marca").notNull(),
    origem: text("origem").notNull(),
    indicadoPor: text("indicado_por"),
    meiosContato: text("meios_contato").array().notNull().default([]),
    hotelNome: text("hotel_nome"),
    hotelEndereco: text("hotel_endereco"),
    nivelRestaurante: text("nivel_restaurante"),
    ritmo: text("ritmo"),
    interesses: text("interesses"),
    pontosDesejados: text("pontos_desejados"),
    dataInicio: date("data_inicio"),
    dataFim: date("data_fim"),
    cidades: text("cidades").array().notNull().default([]),
    motivoEncerramento: text("motivo_encerramento"),
    semRespostaDesde: timestamp("sem_resposta_desde", { withTimezone: true }),
    primeiraRespostaEm: timestamp("primeira_resposta_em", {
      withTimezone: true,
    }),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull(),
  },
  (t) => [
    uniqueIndex("viagens_codigo_idx").on(t.codigo),
    index("viagens_etapa_idx").on(t.etapa),
  ],
);

export const viagemContatos = pgTable(
  "viagem_contatos",
  {
    viagemId: integer("viagem_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    contatoId: integer("contato_id")
      .notNull()
      .references(() => contatos.id),
    papel: papelNaViagem("papel").notNull(),
  },
  (t) => [primaryKey({ columns: [t.viagemId, t.contatoId, t.papel] })],
);

export const cadeiaComercial = pgTable(
  "cadeia_comercial",
  {
    viagemId: integer("viagem_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    ordem: integer("ordem").notNull(),
    intermediarioId: integer("intermediario_id")
      .notNull()
      .references(() => intermediarios.id),
    especificou: text("especificou"),
  },
  (t) => [primaryKey({ columns: [t.viagemId, t.ordem] })],
);

export const responsaveis = pgTable(
  "responsaveis",
  {
    id: serial("id").primaryKey(),
    viagemId: integer("viagem_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    desde: timestamp("desde", { withTimezone: true }).notNull(),
    ate: timestamp("ate", { withTimezone: true }),
  },
  (t) => [index("responsaveis_viagem_idx").on(t.viagemId)],
);

export const notas = pgTable("notas", {
  contatoId: integer("contato_id").references(() => contatos.id),
  tipo: text("tipo").notNull().default("negociacao"),
  id: serial("id").primaryKey(),
  viagemId: integer("viagem_id")
    .notNull()
    .references(() => viagens.id, { onDelete: "cascade" }),
  autorId: integer("autor_id")
    .notNull()
    .references(() => usuarios.id),
  texto: text("texto").notNull(),
  criadaEm: timestamp("criada_em", { withTimezone: true }).notNull(),
});

export const opcoesConhecidas = pgTable(
  "opcoes_conhecidas",
  {
    id: serial("id").primaryKey(),
    campo: text("campo").notNull(),
    valor: text("valor").notNull(),
    normalizado: text("normalizado").notNull(),
    nomePt: text("nome_pt").notNull(),
    nomeKo: text("nome_ko").notNull(),
    regular: boolean("regular").notNull().default(false),
    contexto: jsonb("contexto")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
  },
  (t) => [
    uniqueIndex("opcoes_campo_valor_idx").on(t.campo, t.valor),
    uniqueIndex("opcoes_campo_nome_idx").on(t.campo, t.normalizado),
  ],
);

export const viajantes = pgTable(
  "viajantes",
  {
    id: serial("id").primaryKey(),
    viagemId: integer("viagem_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    contatoId: integer("contato_id").references(() => contatos.id),
    pagante: boolean("pagante").notNull().default(true),
    faixa: text("faixa").notNull().default("adulto"),
    idade: integer("idade"),
    malas: integer("malas").notNull().default(2),
    bagagemMao: integer("bagagem_mao").notNull().default(1),
  },
  (t) => [
    index("viajantes_viagem_idx").on(t.viagemId),
    uniqueIndex("viajantes_pessoa_idx").on(t.viagemId, t.contatoId),
  ],
);

export const modelosResposta = pgTable("modelos_resposta", {
  idioma: text("idioma").primaryKey(),
  texto: text("texto").notNull(),
});

export const formulariosPlanejamento = pgTable("formularios_planejamento", {
  id: serial("id").primaryKey(),
  viagemId: integer("viagem_id")
    .notNull()
    .references(() => viagens.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull(),
  revogadoEm: timestamp("revogado_em", { withTimezone: true }),
});

export const respostasConflitantes = pgTable("respostas_conflitantes", {
  id: serial("id").primaryKey(),
  viagemId: integer("viagem_id")
    .notNull()
    .references(() => viagens.id, { onDelete: "cascade" }),
  viajanteId: integer("viajante_id").references(() => viajantes.id, {
    onDelete: "cascade",
  }),
  campo: text("campo").notNull(),
  anterior: text("anterior").notNull(),
  recebido: text("recebido").notNull(),
  resolvidaEm: timestamp("resolvida_em", { withTimezone: true }),
});

const bytea = customType<{ data: Buffer }>({ dataType: () => "bytea" });
export const anexosPlanejamento = pgTable("anexos_planejamento", {
  id: serial("id").primaryKey(),
  viagemId: integer("viagem_id")
    .notNull()
    .references(() => viagens.id, { onDelete: "cascade" }),
  autorId: integer("autor_id")
    .notNull()
    .references(() => usuarios.id),
  nome: text("nome").notNull(),
  tipo: text("tipo").notNull(),
  conteudo: bytea("conteudo").notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull(),
});

export const participantesViagem = pgTable(
  "participantes_viagem",
  {
    id: serial("id").primaryKey(),
    viagemId: integer("viagem_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    adicionadoPor: integer("adicionado_por")
      .notNull()
      .references(() => usuarios.id),
    desde: timestamp("desde", { withTimezone: true }).notNull(),
    removidoEm: timestamp("removido_em", { withTimezone: true }),
    removidoPor: integer("removido_por").references(() => usuarios.id),
  },
  (t) => [
    uniqueIndex("participantes_ativos_idx")
      .on(t.viagemId, t.usuarioId)
      .where(sql`${t.removidoEm} is null`),
  ],
);
export const viagensRelacionadas = pgTable(
  "viagens_relacionadas",
  {
    menorId: integer("menor_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    maiorId: integer("maior_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.menorId, t.maiorId] })],
);
export const desejosViagem = pgTable("desejos_viagem", {
  id: serial("id").primaryKey(),
  viagemId: integer("viagem_id")
    .notNull()
    .references(() => viagens.id, { onDelete: "cascade" }),
  texto: text("texto").notNull(),
  criadoPor: integer("criado_por")
    .notNull()
    .references(() => usuarios.id),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull(),
  aprovadoPor: integer("aprovado_por").references(() => usuarios.id),
  aprovadoEm: timestamp("aprovado_em", { withTimezone: true }),
  descartadoPor: integer("descartado_por").references(() => usuarios.id),
  descartadoEm: timestamp("descartado_em", { withTimezone: true }),
});

export const tarefas = pgTable(
  "tarefas",
  {
    id: serial("id").primaryKey(),
    codigo: text("codigo")
      .generatedAlwaysAs(sql`'TAR-' || lpad("id"::text, 6, '0')`)
      .notNull()
      .unique(),
    titulo: text("titulo").notNull(),
    descricao: text("descricao").notNull().default(""),
    tipo: text("tipo").notNull().default("manual"),
    responsavelId: integer("responsavel_id")
      .notNull()
      .references(() => usuarios.id),
    viagemId: integer("viagem_id").references(() => viagens.id, {
      onDelete: "cascade",
    }),
    prazo: timestamp("prazo", { withTimezone: true }).notNull(),
    estado: text("estado")
      .$type<"aberta" | "concluida" | "cancelada">()
      .notNull()
      .default("aberta"),
    criadaEm: timestamp("criada_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
    criadaPor: integer("criada_por").references(() => usuarios.id),
    concluidaEm: timestamp("concluida_em", { withTimezone: true }),
    canceladaEm: timestamp("cancelada_em", { withTimezone: true }),
    motivoCancelamento: text("motivo_cancelamento"),
    chaveAutomatica: text("chave_automatica").unique(),
  },
  (t) => [
    index("tarefas_viagem_idx").on(t.viagemId),
    index("tarefas_responsavel_prazo_idx").on(t.responsavelId, t.prazo),
  ],
);
export const tarefasCopias = pgTable(
  "tarefas_copias",
  {
    tarefaId: integer("tarefa_id")
      .notNull()
      .references(() => tarefas.id, { onDelete: "cascade" }),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
  },
  (t) => [primaryKey({ columns: [t.tarefaId, t.usuarioId] })],
);
export const tarefasHistorico = pgTable("tarefas_historico", {
  id: serial("id").primaryKey(),
  tarefaId: integer("tarefa_id")
    .notNull()
    .references(() => tarefas.id, { onDelete: "cascade" }),
  tipo: text("tipo").notNull(),
  autorId: integer("autor_id").references(() => usuarios.id),
  motivo: text("motivo"),
  criadaEm: timestamp("criada_em", { withTimezone: true }).notNull(),
});

export const fatosEtapa = pgTable(
  "fatos_etapa",
  {
    id: serial("id").primaryKey(),
    viagemId: integer("viagem_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    tipo: text("tipo")
      .$type<import("~/modules/viagens/etapas").TipoFatoEtapa>()
      .notNull(),
    em: timestamp("em", { withTimezone: true }).notNull(),
    autorId: integer("autor_id").references(() => usuarios.id),
    motivo: text("motivo").notNull().default(""),
    corrigeId: integer("corrige_id"),
    etapaAnterior: text("etapa_anterior").notNull(),
    etapaResultante: text("etapa_resultante").notNull(),
  },
  (t) => [index("fatos_etapa_viagem_idx").on(t.viagemId)],
);

export const tabelasReferencia = pgTable("tabelas_referencia", {
  codigo: text("codigo").primaryKey(),
  titulo: text("titulo").notNull(),
});
export const versoesReferencia = pgTable(
  "versoes_referencia",
  {
    id: serial("id").primaryKey(),
    tabela: text("tabela")
      .notNull()
      .references(() => tabelasReferencia.codigo),
    versao: integer("versao").notNull(),
    dados: jsonb("dados")
      .$type<import("~/modules/tabelas/referencias").DadosReferencia>()
      .notNull(),
    autorId: integer("autor_id").references(() => usuarios.id),
    criadaEm: timestamp("criada_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("versoes_referencia_tabela_versao_idx").on(t.tabela, t.versao),
  ],
);

export const orcamentos = pgTable(
  "orcamentos",
  {
    id: serial("id").primaryKey(),
    viagemId: integer("viagem_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    versao: integer("versao").notNull().default(1),
    revisao: integer("revisao").notNull().default(1),
    estado: text("estado")
      .$type<"rascunho" | "enviado" | "aceito">()
      .notNull()
      .default("rascunho"),
    dados: jsonb("dados")
      .$type<import("~/modules/orcamentos/calculo").RascunhoOrcamento>()
      .notNull(),
    referencias: jsonb("referencias").$type<Record<string, number>>().notNull(),
    memoria:
      jsonb("memoria").$type<
        import("~/modules/orcamentos/versoes").MemoriaOrcamento
      >(),
    criadaPor: integer("criada_por")
      .notNull()
      .references(() => usuarios.id),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull(),
  },
  (t) => [uniqueIndex("orcamentos_viagem_versao_idx").on(t.viagemId, t.versao)],
);

export const notificacoes = pgTable(
  "notificacoes",
  {
    id: serial("id").primaryKey(),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id, { onDelete: "cascade" }),
    titulo: text("titulo").notNull(),
    texto: text("texto").notNull(),
    url: text("url").notNull(),
    chave: text("chave").notNull(),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull(),
    enviadaEm: timestamp("enviada_em", { withTimezone: true }),
    lidaEm: timestamp("lida_em", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("notificacoes_usuario_chave_idx").on(t.usuarioId, t.chave),
  ],
);
export const inscricoesPush = pgTable("inscricoes_push", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  chaves: jsonb("chaves").$type<{ p256dh: string; auth: string }>().notNull(),
});

export const enviosProposta = pgTable(
  "envios_proposta",
  {
    id: serial("id").primaryKey(),
    orcamentoId: integer("orcamento_id")
      .notNull()
      .references(() => orcamentos.id, { onDelete: "cascade" }),
    destinatario: text("destinatario").notNull(),
    canal: text("canal").notNull(),
    enviadoEm: timestamp("enviado_em", { withTimezone: true }).notNull(),
    autorId: integer("autor_id")
      .notNull()
      .references(() => usuarios.id),
  },
  (t) => [index("envios_orcamento_idx").on(t.orcamentoId)],
);

export const aceites = pgTable(
  "aceites",
  {
    id: serial("id").primaryKey(),
    viagemId: integer("viagem_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    orcamentoId: integer("orcamento_id")
      .notNull()
      .references(() => orcamentos.id),
    opcaoId: text("opcao_id").notNull(),
    descontoElaboracao: integer("desconto_elaboracao").notNull().default(0),
    precoAcordado: integer("preco_acordado").notNull(),
    moeda: text("moeda").notNull().default("USD"),
    aceitoEm: timestamp("aceito_em", { withTimezone: true }).notNull(),
    autorId: integer("autor_id")
      .notNull()
      .references(() => usuarios.id),
    fatoId: integer("fato_id")
      .notNull()
      .references(() => fatosEtapa.id),
    anuladoEm: timestamp("anulado_em", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("aceites_viagem_aberto_idx")
      .on(t.viagemId)
      .where(sql`${t.anuladoEm} is null`),
  ],
);

export const taxasElaboracao = pgTable("taxas_elaboracao", {
  id: serial("id").primaryKey(),
  viagemId: integer("viagem_id")
    .notNull()
    .unique()
    .references(() => viagens.id, { onDelete: "cascade" }),
  valor: integer("valor").notNull(),
  pagaEm: timestamp("paga_em", { withTimezone: true }).notNull(),
  autorId: integer("autor_id")
    .notNull()
    .references(() => usuarios.id),
});

export const profissionais = pgTable("profissionais", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull().unique(),
  papel: text("papel").$type<"guia" | "assistente">().notNull(),
  idiomas: jsonb("idiomas").$type<string[]>().notNull(),
  especialidades: jsonb("especialidades").$type<string[]>().notNull(),
});
export const alocacoes = pgTable(
  "alocacoes",
  {
    id: serial("id").primaryKey(),
    profissionalId: integer("profissional_id")
      .notNull()
      .references(() => profissionais.id),
    viagemId: integer("viagem_id")
      .notNull()
      .references(() => viagens.id, { onDelete: "cascade" }),
    inicio: date("inicio").notNull(),
    fim: date("fim").notNull(),
    periodo: text("periodo").notNull().default("inteiro"),
    confirmada: boolean("confirmada").notNull().default(true),
    autorId: integer("autor_id")
      .notNull()
      .references(() => usuarios.id),
  },
  (t) => [
    index("alocacoes_profissional_datas_idx").on(
      t.profissionalId,
      t.inicio,
      t.fim,
    ),
  ],
);

export const sequenciasIdentificador = pgTable("sequencias_identificador", {
  chave: text("chave").primaryKey(),
  valor: integer("valor").notNull(),
});

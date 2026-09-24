import {
  pgTable,
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

export const papelNaViagem = pgEnum("papel_na_viagem", ["solicitante", "viajante"]);

export const tipoIntermediario = pgEnum("tipo_intermediario", ["agencia", "operadora"]);

export const usuarios = pgTable(
  "usuarios",
  {
    id: serial("id").primaryKey(),
    nome: text("nome").notNull(),
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
  usuarioId: integer("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }),
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
    id: serial("id").primaryKey(),
    nome: text("nome").notNull(),
    telefone: text("telefone"),
    email: text("email"),
    criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("contatos_telefone_idx").on(t.telefone), index("contatos_email_idx").on(t.email)],
);

export const intermediarios = pgTable("intermediarios", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  tipo: tipoIntermediario("tipo").notNull(),
  canalComercial: canalComercial("canal_comercial").notNull(),
});

export const viagens = pgTable(
  "viagens",
  {
    id: serial("id").primaryKey(),
    codigo: text("codigo").notNull(),
    etapa: etapa("etapa").notNull().default("lead"),
    canalComercial: canalComercial("canal_comercial").notNull(),
    categoria: categoriaAtendimento("categoria").notNull().default("padrao"),
    idiomaCliente: idioma("idioma_cliente").notNull().default("pt"),
    idiomaGuiamento: idioma("idioma_guiamento").notNull().default("pt"),
    marca: marca("marca").notNull(),
    origem: origem("origem").notNull(),
    indicadoPor: text("indicado_por"),
    meiosContato: text("meios_contato").array().notNull().default([]),
    dataInicio: date("data_inicio"),
    dataFim: date("data_fim"),
    pagantes: integer("pagantes"),
    gratuidades: integer("gratuidades").notNull().default(0),
    adultos: integer("adultos"),
    idadesCriancas: integer("idades_criancas").array().notNull().default([]),
    bebes: integer("bebes").notNull().default(0),
    cidades: text("cidades").array().notNull().default([]),
    motivoEncerramento: text("motivo_encerramento"),
    primeiraRespostaEm: timestamp("primeira_resposta_em", { withTimezone: true }),
    criadaEm: timestamp("criada_em", { withTimezone: true }).notNull(),
  },
  (t) => [uniqueIndex("viagens_codigo_idx").on(t.codigo), index("viagens_etapa_idx").on(t.etapa)],
);

export const viagemContatos = pgTable(
  "viagem_contatos",
  {
    viagemId: integer("viagem_id").notNull().references(() => viagens.id, { onDelete: "cascade" }),
    contatoId: integer("contato_id").notNull().references(() => contatos.id),
    papel: papelNaViagem("papel").notNull(),
  },
  (t) => [primaryKey({ columns: [t.viagemId, t.contatoId, t.papel] })],
);

export const cadeiaComercial = pgTable(
  "cadeia_comercial",
  {
    viagemId: integer("viagem_id").notNull().references(() => viagens.id, { onDelete: "cascade" }),
    ordem: integer("ordem").notNull(),
    intermediarioId: integer("intermediario_id").notNull().references(() => intermediarios.id),
    especificou: text("especificou"),
  },
  (t) => [primaryKey({ columns: [t.viagemId, t.ordem] })],
);

export const responsaveis = pgTable(
  "responsaveis",
  {
    id: serial("id").primaryKey(),
    viagemId: integer("viagem_id").notNull().references(() => viagens.id, { onDelete: "cascade" }),
    usuarioId: integer("usuario_id").notNull().references(() => usuarios.id),
    desde: timestamp("desde", { withTimezone: true }).notNull(),
    ate: timestamp("ate", { withTimezone: true }),
  },
  (t) => [index("responsaveis_viagem_idx").on(t.viagemId)],
);

export const proximasAcoes = pgTable(
  "proximas_acoes",
  {
    id: serial("id").primaryKey(),
    viagemId: integer("viagem_id").notNull().references(() => viagens.id, { onDelete: "cascade" }),
    tipo: text("tipo").notNull(),
    descricao: text("descricao").notNull(),
    responsavelId: integer("responsavel_id").notNull().references(() => usuarios.id),
    prazo: timestamp("prazo", { withTimezone: true }).notNull(),
    concluidaEm: timestamp("concluida_em", { withTimezone: true }),
  },
  (t) => [index("proximas_acoes_viagem_idx").on(t.viagemId), index("proximas_acoes_prazo_idx").on(t.prazo)],
);

export const notas = pgTable("notas", {
  id: serial("id").primaryKey(),
  viagemId: integer("viagem_id").notNull().references(() => viagens.id, { onDelete: "cascade" }),
  autorId: integer("autor_id").notNull().references(() => usuarios.id),
  texto: text("texto").notNull(),
  criadaEm: timestamp("criada_em", { withTimezone: true }).notNull(),
});

import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  numeric,
  uuid,
  timestamp,
  primaryKey,
  uniqueIndex,
  unique,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";
import { usuarios, tarefas } from "./schema";
export const quadros = pgTable(
  "quadros",
  {
    id: serial("id").primaryKey(),
    nome: text("nome").notNull(),
    criadorId: integer("criador_id")
      .notNull()
      .references(() => usuarios.id),
    pessoal: boolean("pessoal").notNull().default(false),
    arquivado: boolean("arquivado").notNull().default(false),
  },
  (t) => [
    uniqueIndex("quadro_pessoal_unico")
      .on(t.criadorId)
      .where(sql`${t.pessoal}`),
  ],
);
export const quadrosMembros = pgTable(
  "quadros_membros",
  {
    quadroId: integer("quadro_id").references(() => quadros.id, {
      onDelete: "cascade",
    }),
    usuarioId: integer("usuario_id").references(() => usuarios.id),
  },
  (t) => [primaryKey({ columns: [t.quadroId, t.usuarioId] })],
);
export const quadrosListas = pgTable(
  "quadros_listas",
  {
    id: serial("id").primaryKey(),
    quadroId: integer("quadro_id")
      .notNull()
      .references(() => quadros.id),
    nome: text("nome").notNull(),
    posicao: numeric("posicao").notNull(),
    conclusao: boolean("conclusao").notNull().default(false),
    arquivada: boolean("arquivada").notNull().default(false),
  },
  (t) => [
    unique("quadros_listas_id_quadro_id_key").on(t.id, t.quadroId),
    uniqueIndex("quadro_conclusao_unica")
      .on(t.quadroId)
      .where(sql`${t.conclusao}`),
    index("listas_quadro").on(t.quadroId, t.posicao),
  ],
);
export const tarefasPosicoes = pgTable(
  "tarefas_posicoes",
  {
    tarefaId: integer("tarefa_id")
      .primaryKey()
      .references(() => tarefas.id, { onDelete: "cascade" }),
    quadroId: integer("quadro_id")
      .notNull()
      .references(() => quadros.id),
    listaId: integer("lista_id").notNull(),
    posicao: numeric("posicao").notNull(),
    listaAnteriorId: integer("lista_anterior_id").references(
      () => quadrosListas.id,
    ),
    arquivada: boolean("arquivada").notNull().default(false),
  },
  (t) => [
    foreignKey({
      columns: [t.listaId, t.quadroId],
      foreignColumns: [quadrosListas.id, quadrosListas.quadroId],
    }),
    index("posicoes_quadro").on(t.quadroId, t.listaId, t.posicao),
  ],
);
export const tarefasChecklist = pgTable("tarefas_checklist", {
  id: serial("id").primaryKey(),
  tarefaId: integer("tarefa_id")
    .notNull()
    .references(() => tarefas.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  concluido: boolean("concluido").notNull().default(false),
  promovidaId: integer("promovida_id").references(() => tarefas.id),
});
export const quadrosEtiquetas = pgTable(
  "quadros_etiquetas",
  {
    id: serial("id").primaryKey(),
    quadroId: integer("quadro_id")
      .notNull()
      .references(() => quadros.id),
    nome: text("nome").notNull(),
  },
  (t) => [
    unique("quadros_etiquetas_quadro_id_nome_key").on(t.quadroId, t.nome),
  ],
);
export const tarefasEtiquetas = pgTable(
  "tarefas_etiquetas",
  {
    tarefaId: integer("tarefa_id").references(() => tarefas.id, {
      onDelete: "cascade",
    }),
    etiquetaId: integer("etiqueta_id").references(() => quadrosEtiquetas.id),
  },
  (t) => [primaryKey({ columns: [t.tarefaId, t.etiquetaId] })],
);
export const tarefasAnexos = pgTable(
  "tarefas_anexos",
  {
    id: uuid("id").primaryKey(),
    tarefaId: integer("tarefa_id")
      .notNull()
      .references(() => tarefas.id, { onDelete: "cascade" }),
    nome: text("nome").notNull(),
    mime: text("mime").notNull(),
    tamanho: integer("tamanho").notNull(),
    capa: boolean("capa").notNull().default(false),
    criadaEm: timestamp("criada_em", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("tarefa_capa_unica")
      .on(t.tarefaId)
      .where(sql`${t.capa}`),
  ],
);

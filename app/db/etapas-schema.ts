import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  boolean,
  unique,
} from "drizzle-orm/pg-core";
import { tarefas, usuarios, fatosEtapa } from "./schema";
export const modelosEtapa = pgTable("modelos_etapa", {
  id: serial("id").primaryKey(),
  item: text("item").notNull(),
  etapa: text("etapa").notNull(),
  titulo: text("titulo").notNull(),
  horas: integer("horas"),
  destinatario: text("destinatario").notNull().default("responsavel"),
  usuarioId: integer("usuario_id").references(() => usuarios.id),
  fato: text("fato").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  vigenteDesde: timestamp("vigente_desde", { withTimezone: true }).notNull(),
});
export const tarefasEtapa = pgTable(
  "tarefas_etapa",
  {
    tarefaId: integer("tarefa_id")
      .primaryKey()
      .references(() => tarefas.id, { onDelete: "cascade" }),
    modeloItemId: integer("modelo_item_id")
      .notNull()
      .references(() => modelosEtapa.id),
    entradaChave: text("entrada_chave").notNull(),
    etapa: text("etapa").notNull(),
    destinatario: text("destinatario").notNull(),
    fatoConclusivoId: integer("fato_conclusivo_id").references(
      () => fatosEtapa.id,
    ),
  },
  (t) => [
    unique("tarefas_etapa_origem").on(
      t.tarefaId,
      t.entradaChave,
      t.modeloItemId,
    ),
  ],
);

CREATE TABLE "tarefas" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text GENERATED ALWAYS AS ('TAR-' || lpad("id"::text, 6, '0')) STORED NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"tipo" text DEFAULT 'manual' NOT NULL,
	"responsavel_id" integer NOT NULL,
	"viagem_id" integer,
	"prazo" timestamp with time zone NOT NULL,
	"estado" text DEFAULT 'aberta' NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"criada_por" integer,
	"concluida_em" timestamp with time zone,
	"cancelada_em" timestamp with time zone,
	"motivo_cancelamento" text,
	"chave_automatica" text,
	CONSTRAINT "tarefas_codigo_unique" UNIQUE("codigo"),
	CONSTRAINT "tarefas_chave_automatica_unique" UNIQUE("chave_automatica")
);
--> statement-breakpoint
CREATE TABLE "tarefas_copias" (
	"tarefa_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	CONSTRAINT "tarefas_copias_tarefa_id_usuario_id_pk" PRIMARY KEY("tarefa_id","usuario_id")
);
--> statement-breakpoint
CREATE TABLE "tarefas_historico" (
	"id" serial PRIMARY KEY NOT NULL,
	"tarefa_id" integer NOT NULL,
	"tipo" text NOT NULL,
	"autor_id" integer,
	"motivo" text,
	"criada_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
INSERT INTO tarefas (id, titulo, tipo, responsavel_id, viagem_id, prazo, estado, concluida_em, chave_automatica)
SELECT id, descricao, tipo, responsavel_id, viagem_id, prazo,
       CASE WHEN concluida_em IS NULL THEN 'aberta' ELSE 'concluida' END,
       concluida_em, 'legado:' || id::text FROM proximas_acoes;
--> statement-breakpoint
SELECT setval(pg_get_serial_sequence('tarefas', 'id'), COALESCE(max(id), 1), count(*) > 0) FROM tarefas;
--> statement-breakpoint
INSERT INTO tarefas_historico (tarefa_id, tipo, motivo, criada_em)
SELECT id, 'criada', 'Migrada de Próxima ação', criada_em FROM tarefas;
--> statement-breakpoint
DROP TABLE "proximas_acoes";--> statement-breakpoint
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_responsavel_id_usuarios_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_criada_por_usuarios_id_fk" FOREIGN KEY ("criada_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas_copias" ADD CONSTRAINT "tarefas_copias_tarefa_id_tarefas_id_fk" FOREIGN KEY ("tarefa_id") REFERENCES "public"."tarefas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas_copias" ADD CONSTRAINT "tarefas_copias_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas_historico" ADD CONSTRAINT "tarefas_historico_tarefa_id_tarefas_id_fk" FOREIGN KEY ("tarefa_id") REFERENCES "public"."tarefas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefas_historico" ADD CONSTRAINT "tarefas_historico_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tarefas_viagem_idx" ON "tarefas" USING btree ("viagem_id");--> statement-breakpoint
CREATE INDEX "tarefas_responsavel_prazo_idx" ON "tarefas" USING btree ("responsavel_id","prazo");
CREATE TABLE "envios_proposta" (
	"id" serial PRIMARY KEY NOT NULL,
	"orcamento_id" integer NOT NULL,
	"destinatario" text NOT NULL,
	"canal" text NOT NULL,
	"enviado_em" timestamp with time zone NOT NULL,
	"autor_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inscricoes_push" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"endpoint" text NOT NULL,
	"chaves" jsonb NOT NULL,
	CONSTRAINT "inscricoes_push_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "notificacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"titulo" text NOT NULL,
	"texto" text NOT NULL,
	"url" text NOT NULL,
	"chave" text NOT NULL,
	"criada_em" timestamp with time zone NOT NULL,
	"enviada_em" timestamp with time zone,
	"lida_em" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "orcamentos" ADD COLUMN "memoria" jsonb;--> statement-breakpoint
ALTER TABLE "envios_proposta" ADD CONSTRAINT "envios_proposta_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "envios_proposta" ADD CONSTRAINT "envios_proposta_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inscricoes_push" ADD CONSTRAINT "inscricoes_push_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "envios_orcamento_idx" ON "envios_proposta" USING btree ("orcamento_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notificacoes_usuario_chave_idx" ON "notificacoes" USING btree ("usuario_id","chave");
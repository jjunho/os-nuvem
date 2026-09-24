CREATE TABLE "orcamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"versao" integer DEFAULT 1 NOT NULL,
	"revisao" integer DEFAULT 1 NOT NULL,
	"estado" text DEFAULT 'rascunho' NOT NULL,
	"dados" jsonb NOT NULL,
	"referencias" jsonb NOT NULL,
	"criada_por" integer NOT NULL,
	"criada_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_criada_por_usuarios_id_fk" FOREIGN KEY ("criada_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "orcamentos_viagem_versao_idx" ON "orcamentos" USING btree ("viagem_id","versao");
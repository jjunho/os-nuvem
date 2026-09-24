CREATE TABLE "formularios_planejamento" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"criado_em" timestamp with time zone NOT NULL,
	"revogado_em" timestamp with time zone,
	CONSTRAINT "formularios_planejamento_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "formularios_planejamento" ADD CONSTRAINT "formularios_planejamento_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;
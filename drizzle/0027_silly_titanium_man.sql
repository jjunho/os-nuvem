CREATE TABLE "taxas_elaboracao" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"valor" integer NOT NULL,
	"paga_em" timestamp with time zone NOT NULL,
	"autor_id" integer NOT NULL,
	CONSTRAINT "taxas_elaboracao_viagem_id_unique" UNIQUE("viagem_id")
);
--> statement-breakpoint
ALTER TABLE "aceites" ADD COLUMN "desconto_elaboracao" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "taxas_elaboracao" ADD CONSTRAINT "taxas_elaboracao_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taxas_elaboracao" ADD CONSTRAINT "taxas_elaboracao_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
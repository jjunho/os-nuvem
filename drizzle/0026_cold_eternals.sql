CREATE TABLE "aceites" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"orcamento_id" integer NOT NULL,
	"opcao_id" text NOT NULL,
	"preco_acordado" integer NOT NULL,
	"moeda" text DEFAULT 'USD' NOT NULL,
	"aceito_em" timestamp with time zone NOT NULL,
	"autor_id" integer NOT NULL,
	"fato_id" integer NOT NULL,
	"anulado_em" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "aceites" ADD CONSTRAINT "aceites_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aceites" ADD CONSTRAINT "aceites_orcamento_id_orcamentos_id_fk" FOREIGN KEY ("orcamento_id") REFERENCES "public"."orcamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aceites" ADD CONSTRAINT "aceites_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aceites" ADD CONSTRAINT "aceites_fato_id_fatos_etapa_id_fk" FOREIGN KEY ("fato_id") REFERENCES "public"."fatos_etapa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "aceites_viagem_aberto_idx" ON "aceites" USING btree ("viagem_id") WHERE "aceites"."anulado_em" is null;
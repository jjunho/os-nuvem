CREATE TABLE "alocacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"profissional_id" integer NOT NULL,
	"viagem_id" integer NOT NULL,
	"inicio" date NOT NULL,
	"fim" date NOT NULL,
	"periodo" text DEFAULT 'inteiro' NOT NULL,
	"confirmada" boolean DEFAULT true NOT NULL,
	"autor_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profissionais" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"papel" text NOT NULL,
	"idiomas" jsonb NOT NULL,
	"especialidades" jsonb NOT NULL,
	CONSTRAINT "profissionais_nome_unique" UNIQUE("nome")
);
--> statement-breakpoint
ALTER TABLE "alocacoes" ADD CONSTRAINT "alocacoes_profissional_id_profissionais_id_fk" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alocacoes" ADD CONSTRAINT "alocacoes_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alocacoes" ADD CONSTRAINT "alocacoes_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alocacoes_profissional_datas_idx" ON "alocacoes" USING btree ("profissional_id","inicio","fim");
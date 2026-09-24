CREATE TABLE "fatos_etapa" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"tipo" text NOT NULL,
	"em" timestamp with time zone NOT NULL,
	"autor_id" integer,
	"motivo" text DEFAULT '' NOT NULL,
	"corrige_id" integer,
	"etapa_anterior" text NOT NULL,
	"etapa_resultante" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "fatos_etapa" ADD CONSTRAINT "fatos_etapa_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fatos_etapa" ADD CONSTRAINT "fatos_etapa_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fatos_etapa_viagem_idx" ON "fatos_etapa" USING btree ("viagem_id");
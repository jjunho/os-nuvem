CREATE TABLE "respostas_conflitantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"viajante_id" integer,
	"campo" text NOT NULL,
	"anterior" text NOT NULL,
	"recebido" text NOT NULL,
	"resolvida_em" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "respostas_conflitantes" ADD CONSTRAINT "respostas_conflitantes_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "respostas_conflitantes" ADD CONSTRAINT "respostas_conflitantes_viajante_id_viajantes_id_fk" FOREIGN KEY ("viajante_id") REFERENCES "public"."viajantes"("id") ON DELETE cascade ON UPDATE no action;
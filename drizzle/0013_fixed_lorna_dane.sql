CREATE TABLE "anexos_planejamento" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"autor_id" integer NOT NULL,
	"nome" text NOT NULL,
	"tipo" text NOT NULL,
	"conteudo" "bytea" NOT NULL,
	"criado_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anexos_planejamento" ADD CONSTRAINT "anexos_planejamento_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anexos_planejamento" ADD CONSTRAINT "anexos_planejamento_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
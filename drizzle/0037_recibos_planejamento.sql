CREATE TABLE "recibos_planejamento" (
	"viagem_id" integer NOT NULL,
	"autor_id" integer NOT NULL,
	"operacao" text NOT NULL,
	"tentativa_id" text NOT NULL,
	"payload_hash" text NOT NULL,
	"resultado" jsonb NOT NULL,
	"criado_em" timestamp with time zone NOT NULL,
	CONSTRAINT "recibos_planejamento_viagem_id_autor_id_operacao_tentativa_id_pk" PRIMARY KEY("viagem_id","autor_id","operacao","tentativa_id")
);
--> statement-breakpoint
ALTER TABLE "recibos_planejamento" ADD CONSTRAINT "recibos_planejamento_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recibos_planejamento" ADD CONSTRAINT "recibos_planejamento_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;
CREATE TABLE "midias_comunicador" (
	"id" text PRIMARY KEY NOT NULL,
	"mensagem_id" integer NOT NULL,
	"caminho" text NOT NULL,
	"mime" text NOT NULL,
	"tamanho" integer NOT NULL,
	"removida" boolean DEFAULT false NOT NULL,
	"viajante_id" integer,
	"tentativas" integer DEFAULT 0 NOT NULL,
	"proxima_transcricao" timestamp with time zone,
	"transcrita" boolean DEFAULT false NOT NULL,
	CONSTRAINT "midias_comunicador_mensagem_id_unique" UNIQUE("mensagem_id")
);
--> statement-breakpoint
ALTER TABLE "midias_comunicador" ADD CONSTRAINT "midias_comunicador_mensagem_id_mensagens_id_fk" FOREIGN KEY ("mensagem_id") REFERENCES "public"."mensagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midias_comunicador" ADD CONSTRAINT "midias_comunicador_viajante_id_viajantes_id_fk" FOREIGN KEY ("viajante_id") REFERENCES "public"."viajantes"("id") ON DELETE no action ON UPDATE no action;
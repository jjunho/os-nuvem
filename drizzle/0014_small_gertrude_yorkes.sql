ALTER TABLE "contatos" ADD COLUMN "nascimento" date;--> statement-breakpoint
ALTER TABLE "contatos" ADD COLUMN "preferencias" text;--> statement-breakpoint
ALTER TABLE "notas" ADD COLUMN "contato_id" integer;--> statement-breakpoint
ALTER TABLE "notas" ADD COLUMN "tipo" text DEFAULT 'negociacao' NOT NULL;--> statement-breakpoint
ALTER TABLE "notas" ADD CONSTRAINT "notas_contato_id_contatos_id_fk" FOREIGN KEY ("contato_id") REFERENCES "public"."contatos"("id") ON DELETE no action ON UPDATE no action;
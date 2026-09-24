CREATE TABLE "desejos_viagem" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"texto" text NOT NULL,
	"criado_por" integer NOT NULL,
	"criado_em" timestamp with time zone NOT NULL,
	"aprovado_por" integer,
	"aprovado_em" timestamp with time zone,
	"descartado_por" integer,
	"descartado_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "participantes_viagem" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"adicionado_por" integer NOT NULL,
	"desde" timestamp with time zone NOT NULL,
	"removido_em" timestamp with time zone,
	"removido_por" integer
);
--> statement-breakpoint
CREATE TABLE "viagens_relacionadas" (
	"menor_id" integer NOT NULL,
	"maior_id" integer NOT NULL,
	CONSTRAINT "viagens_relacionadas_menor_id_maior_id_pk" PRIMARY KEY("menor_id","maior_id")
);
--> statement-breakpoint
ALTER TABLE "desejos_viagem" ADD CONSTRAINT "desejos_viagem_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desejos_viagem" ADD CONSTRAINT "desejos_viagem_criado_por_usuarios_id_fk" FOREIGN KEY ("criado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desejos_viagem" ADD CONSTRAINT "desejos_viagem_aprovado_por_usuarios_id_fk" FOREIGN KEY ("aprovado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desejos_viagem" ADD CONSTRAINT "desejos_viagem_descartado_por_usuarios_id_fk" FOREIGN KEY ("descartado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes_viagem" ADD CONSTRAINT "participantes_viagem_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes_viagem" ADD CONSTRAINT "participantes_viagem_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes_viagem" ADD CONSTRAINT "participantes_viagem_adicionado_por_usuarios_id_fk" FOREIGN KEY ("adicionado_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participantes_viagem" ADD CONSTRAINT "participantes_viagem_removido_por_usuarios_id_fk" FOREIGN KEY ("removido_por") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viagens_relacionadas" ADD CONSTRAINT "viagens_relacionadas_menor_id_viagens_id_fk" FOREIGN KEY ("menor_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viagens_relacionadas" ADD CONSTRAINT "viagens_relacionadas_maior_id_viagens_id_fk" FOREIGN KEY ("maior_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "participantes_ativos_idx" ON "participantes_viagem" USING btree ("viagem_id","usuario_id") WHERE "participantes_viagem"."removido_em" is null;
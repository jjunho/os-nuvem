CREATE TABLE "conversas" (
	"id" serial PRIMARY KEY NOT NULL,
	"chave" text NOT NULL,
	"tipo" text NOT NULL,
	"nome" text NOT NULL,
	"descricao" text DEFAULT '' NOT NULL,
	"privada" boolean DEFAULT true NOT NULL,
	"arquivada" boolean DEFAULT false NOT NULL,
	"criador_id" integer NOT NULL,
	"viagem_id" integer,
	"atualizada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversas_chave_unique" UNIQUE("chave")
);
--> statement-breakpoint
CREATE TABLE "membros_conversa" (
	"conversa_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"lida_ate" integer DEFAULT 0 NOT NULL,
	"notificacao" text DEFAULT 'mencoes' NOT NULL,
	CONSTRAINT "membros_conversa_conversa_id_usuario_id_pk" PRIMARY KEY("conversa_id","usuario_id")
);
--> statement-breakpoint
CREATE TABLE "mensagens" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"conversa_id" integer NOT NULL,
	"autor_id" integer NOT NULL,
	"texto" text NOT NULL,
	"segmentos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"citada_id" integer,
	"versoes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"apagada" boolean DEFAULT false NOT NULL,
	"urgente" boolean DEFAULT false NOT NULL,
	"transcricao" text DEFAULT '' NOT NULL,
	CONSTRAINT "mensagens_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
CREATE TABLE "preferencias_comunicador" (
	"usuario_id" integer PRIMARY KEY NOT NULL,
	"aviso_visto" boolean DEFAULT false NOT NULL,
	"dnd_inicio" text DEFAULT '' NOT NULL,
	"dnd_fim" text DEFAULT '' NOT NULL,
	"fuso" text DEFAULT 'Asia/Seoul' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reacoes_mensagem" (
	"mensagem_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"emoji" text NOT NULL,
	CONSTRAINT "reacoes_mensagem_mensagem_id_usuario_id_emoji_pk" PRIMARY KEY("mensagem_id","usuario_id","emoji")
);
--> statement-breakpoint
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_criador_id_usuarios_id_fk" FOREIGN KEY ("criador_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membros_conversa" ADD CONSTRAINT "membros_conversa_conversa_id_conversas_id_fk" FOREIGN KEY ("conversa_id") REFERENCES "public"."conversas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membros_conversa" ADD CONSTRAINT "membros_conversa_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversa_id_conversas_id_fk" FOREIGN KEY ("conversa_id") REFERENCES "public"."conversas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "preferencias_comunicador" ADD CONSTRAINT "preferencias_comunicador_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reacoes_mensagem" ADD CONSTRAINT "reacoes_mensagem_mensagem_id_mensagens_id_fk" FOREIGN KEY ("mensagem_id") REFERENCES "public"."mensagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reacoes_mensagem" ADD CONSTRAINT "reacoes_mensagem_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "membros_usuario_idx" ON "membros_conversa" USING btree ("usuario_id","conversa_id");--> statement-breakpoint
CREATE INDEX "mensagens_conversa_id_idx" ON "mensagens" USING btree ("conversa_id","id");
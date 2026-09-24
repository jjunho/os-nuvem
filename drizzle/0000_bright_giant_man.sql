CREATE TYPE "public"."canal_comercial" AS ENUM('operadora', 'agencia', 'cliente_final', 'influencer');--> statement-breakpoint
CREATE TYPE "public"."categoria_atendimento" AS ENUM('economico', 'padrao', 'premium', 'vip');--> statement-breakpoint
CREATE TYPE "public"."etapa" AS ENUM('lead', 'em_orcamento', 'proposta_enviada', 'em_negociacao', 'confirmada', 'em_viagem', 'concluida', 'perdida', 'cancelada', 'descartada');--> statement-breakpoint
CREATE TYPE "public"."idioma" AS ENUM('pt', 'es', 'en', 'fr');--> statement-breakpoint
CREATE TYPE "public"."marca" AS ENUM('corealux', 'guia_na_coreia');--> statement-breakpoint
CREATE TYPE "public"."origem" AS ENUM('instagram', 'site', 'indicacao', 'agencia', 'operadora', 'influenciador', 'outra');--> statement-breakpoint
CREATE TYPE "public"."papel" AS ENUM('admin', 'faturamento', 'propostas', 'itinerarios', 'atendimento', 'guiamento', 'conteudo');--> statement-breakpoint
CREATE TYPE "public"."papel_na_viagem" AS ENUM('solicitante', 'viajante');--> statement-breakpoint
CREATE TYPE "public"."tipo_intermediario" AS ENUM('agencia', 'operadora');--> statement-breakpoint
CREATE TABLE "cadeia_comercial" (
	"viagem_id" integer NOT NULL,
	"ordem" integer NOT NULL,
	"intermediario_id" integer NOT NULL,
	"especificou" text,
	CONSTRAINT "cadeia_comercial_viagem_id_ordem_pk" PRIMARY KEY("viagem_id","ordem")
);
--> statement-breakpoint
CREATE TABLE "contatos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"telefone" text,
	"email" text,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intermediarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tipo_intermediario" NOT NULL,
	"canal_comercial" "canal_comercial" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notas" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"autor_id" integer NOT NULL,
	"texto" text NOT NULL,
	"criada_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proximas_acoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"tipo" text NOT NULL,
	"descricao" text NOT NULL,
	"responsavel_id" integer NOT NULL,
	"prazo" timestamp with time zone NOT NULL,
	"concluida_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "responsaveis" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"desde" timestamp with time zone NOT NULL,
	"ate" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessoes" (
	"token" text PRIMARY KEY NOT NULL,
	"usuario_id" integer NOT NULL,
	"expira_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"login" text NOT NULL,
	"senha_hash" text NOT NULL,
	"papel" "papel" NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "viagem_contatos" (
	"viagem_id" integer NOT NULL,
	"contato_id" integer NOT NULL,
	"papel" "papel_na_viagem" NOT NULL,
	CONSTRAINT "viagem_contatos_viagem_id_contato_id_papel_pk" PRIMARY KEY("viagem_id","contato_id","papel")
);
--> statement-breakpoint
CREATE TABLE "viagens" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"etapa" "etapa" DEFAULT 'lead' NOT NULL,
	"canal_comercial" "canal_comercial" NOT NULL,
	"categoria" "categoria_atendimento" DEFAULT 'padrao' NOT NULL,
	"idioma_cliente" "idioma" DEFAULT 'pt' NOT NULL,
	"idioma_guiamento" "idioma" DEFAULT 'pt' NOT NULL,
	"marca" "marca" NOT NULL,
	"origem" "origem" NOT NULL,
	"indicado_por" text,
	"meios_contato" text[] DEFAULT '{}' NOT NULL,
	"data_inicio" date,
	"data_fim" date,
	"pagantes" integer,
	"gratuidades" integer DEFAULT 0 NOT NULL,
	"adultos" integer,
	"idades_criancas" integer[] DEFAULT '{}' NOT NULL,
	"bebes" integer DEFAULT 0 NOT NULL,
	"cidades" text[] DEFAULT '{}' NOT NULL,
	"motivo_encerramento" text,
	"primeira_resposta_em" timestamp with time zone,
	"criada_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cadeia_comercial" ADD CONSTRAINT "cadeia_comercial_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cadeia_comercial" ADD CONSTRAINT "cadeia_comercial_intermediario_id_intermediarios_id_fk" FOREIGN KEY ("intermediario_id") REFERENCES "public"."intermediarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notas" ADD CONSTRAINT "notas_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notas" ADD CONSTRAINT "notas_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proximas_acoes" ADD CONSTRAINT "proximas_acoes_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proximas_acoes" ADD CONSTRAINT "proximas_acoes_responsavel_id_usuarios_id_fk" FOREIGN KEY ("responsavel_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsaveis" ADD CONSTRAINT "responsaveis_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responsaveis" ADD CONSTRAINT "responsaveis_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viagem_contatos" ADD CONSTRAINT "viagem_contatos_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viagem_contatos" ADD CONSTRAINT "viagem_contatos_contato_id_contatos_id_fk" FOREIGN KEY ("contato_id") REFERENCES "public"."contatos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contatos_telefone_idx" ON "contatos" USING btree ("telefone");--> statement-breakpoint
CREATE INDEX "contatos_email_idx" ON "contatos" USING btree ("email");--> statement-breakpoint
CREATE INDEX "proximas_acoes_viagem_idx" ON "proximas_acoes" USING btree ("viagem_id");--> statement-breakpoint
CREATE INDEX "proximas_acoes_prazo_idx" ON "proximas_acoes" USING btree ("prazo");--> statement-breakpoint
CREATE INDEX "responsaveis_viagem_idx" ON "responsaveis" USING btree ("viagem_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_login_idx" ON "usuarios" USING btree ("login");--> statement-breakpoint
CREATE UNIQUE INDEX "viagens_codigo_idx" ON "viagens" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "viagens_etapa_idx" ON "viagens" USING btree ("etapa");
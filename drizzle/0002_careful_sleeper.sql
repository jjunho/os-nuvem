ALTER TABLE "usuarios" RENAME COLUMN "login" TO "email";--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "papel" SET DATA TYPE text;--> statement-breakpoint
UPDATE "usuarios" SET "papel" = 'propostas' WHERE "papel" = 'atendimento';--> statement-breakpoint
UPDATE "usuarios" SET "email" = lower(btrim("email"));--> statement-breakpoint
DROP TYPE "public"."papel";--> statement-breakpoint
CREATE TYPE "public"."papel" AS ENUM('admin', 'faturamento', 'propostas', 'itinerarios', 'guiamento', 'conteudo');--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "papel" SET DATA TYPE "public"."papel" USING "papel"::"public"."papel";--> statement-breakpoint
DROP INDEX "usuarios_login_idx";--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "deve_trocar_senha" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");
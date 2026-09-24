-- Supports the original name-picker database and the in-progress auth schema.
-- Legacy users have no credentials: keep their history, but disable sign-in.
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "login" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "senha_hash" text;--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "ativo" boolean DEFAULT true NOT NULL;--> statement-breakpoint
UPDATE "usuarios" SET "login" = 'usuario-' || "id" || '@legacy.invalid', "senha_hash" = 'sem-credencial', "ativo" = false WHERE "login" IS NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "login" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "usuarios" ALTER COLUMN "senha_hash" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "usuarios_login_idx" ON "usuarios" ("login");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessoes" (
  "token" text PRIMARY KEY NOT NULL,
  "usuario_id" integer NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "expira_em" timestamp with time zone NOT NULL
);

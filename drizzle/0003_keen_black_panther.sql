CREATE TABLE "tentativas_entrada" (
	"email" text PRIMARY KEY NOT NULL,
	"falhas" integer NOT NULL,
	"bloqueado_ate" timestamp with time zone
);

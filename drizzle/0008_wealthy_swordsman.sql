CREATE TABLE "viajantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"viagem_id" integer NOT NULL,
	"contato_id" integer,
	"pagante" boolean DEFAULT true NOT NULL,
	"faixa" text DEFAULT 'adulto' NOT NULL,
	"idade" integer
);
--> statement-breakpoint
ALTER TABLE "viajantes" ADD CONSTRAINT "viajantes_viagem_id_viagens_id_fk" FOREIGN KEY ("viagem_id") REFERENCES "public"."viagens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "viajantes" ADD CONSTRAINT "viajantes_contato_id_contatos_id_fk" FOREIGN KEY ("contato_id") REFERENCES "public"."contatos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "viajantes_viagem_idx" ON "viajantes" USING btree ("viagem_id");--> statement-breakpoint
CREATE UNIQUE INDEX "viajantes_pessoa_idx" ON "viajantes" USING btree ("viagem_id","contato_id");--> statement-breakpoint
WITH base AS (
  SELECT v.*, ARRAY(SELECT vc.contato_id FROM viagem_contatos vc WHERE vc.viagem_id = v.id AND vc.papel = 'viajante' ORDER BY vc.contato_id) AS nomeados
  FROM viagens v
), quantidades AS (
  SELECT *, GREATEST(COALESCE(pagantes, 0) + gratuidades,
    COALESCE(adultos, 0) + cardinality(idades_criancas) + bebes, cardinality(nomeados)) AS total
  FROM base
)
INSERT INTO viajantes (viagem_id, contato_id, pagante, faixa, idade)
SELECT q.id, q.nomeados[n], n <= q.total - q.gratuidades,
  CASE WHEN n <= q.total - cardinality(q.idades_criancas) - q.bebes THEN 'adulto'
       WHEN n <= q.total - q.bebes THEN 'crianca' ELSE 'bebe' END,
  CASE WHEN n > q.total - cardinality(q.idades_criancas) - q.bebes AND n <= q.total - q.bebes
       THEN q.idades_criancas[n - (q.total - cardinality(q.idades_criancas) - q.bebes)] ELSE NULL END
FROM quantidades q CROSS JOIN LATERAL generate_series(1, q.total) AS n;
--> statement-breakpoint
ALTER TABLE "viagens" DROP COLUMN "pagantes";--> statement-breakpoint
ALTER TABLE "viagens" DROP COLUMN "gratuidades";--> statement-breakpoint
ALTER TABLE "viagens" DROP COLUMN "adultos";--> statement-breakpoint
ALTER TABLE "viagens" DROP COLUMN "idades_criancas";--> statement-breakpoint
ALTER TABLE "viagens" DROP COLUMN "bebes";
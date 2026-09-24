CREATE TABLE "opcoes_conhecidas" (
	"id" serial PRIMARY KEY NOT NULL,
	"campo" text NOT NULL,
	"valor" text NOT NULL,
	"normalizado" text NOT NULL,
	"nome_pt" text NOT NULL,
	"nome_ko" text NOT NULL,
	"regular" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "viagens" ALTER COLUMN "origem" SET DATA TYPE text;--> statement-breakpoint
CREATE UNIQUE INDEX "opcoes_campo_valor_idx" ON "opcoes_conhecidas" USING btree ("campo","valor");--> statement-breakpoint
CREATE UNIQUE INDEX "opcoes_campo_nome_idx" ON "opcoes_conhecidas" USING btree ("campo","normalizado");--> statement-breakpoint
INSERT INTO opcoes_conhecidas (campo, valor, normalizado, nome_pt, nome_ko, regular) VALUES
('origem','instagram','instagram','Instagram','인스타그램',true),
('origem','site','site','Site','웹사이트',true),
('origem','indicacao','indicacao','Indicação','소개',true),
('origem','agencia','agencia','Agência','여행사',true),
('origem','operadora','operadora','Operadora','여행 도매사',true),
('origem','influenciador','influenciador','Influenciador','인플루언서',true),
('origem','outra','outra','Outra','기타',true);

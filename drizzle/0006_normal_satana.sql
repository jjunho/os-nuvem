ALTER TABLE "intermediarios" ALTER COLUMN "canal_comercial" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "viagens" ALTER COLUMN "canal_comercial" SET DATA TYPE text;--> statement-breakpoint
INSERT INTO opcoes_conhecidas (campo, valor, normalizado, nome_pt, nome_ko, regular) VALUES
('canalComercial','operadora','interep/operadora','Interep/Operadora','Interep/여행 도매사',true),
('canalComercial','agencia','agencia','Agência','여행사',true),
('canalComercial','cliente_final','cliente final','Cliente final','직접 고객',true),
('canalComercial','influencer','influencer','Influencer','인플루언서',true);

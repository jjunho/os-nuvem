ALTER TABLE "viagens" ALTER COLUMN "categoria" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "viagens" ALTER COLUMN "categoria" SET DEFAULT 'padrao';--> statement-breakpoint
ALTER TABLE "viagens" ALTER COLUMN "idioma_cliente" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "viagens" ALTER COLUMN "idioma_cliente" SET DEFAULT 'pt';--> statement-breakpoint
ALTER TABLE "viagens" ALTER COLUMN "idioma_guiamento" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "viagens" ALTER COLUMN "idioma_guiamento" SET DEFAULT 'pt';--> statement-breakpoint
ALTER TABLE "viagens" ALTER COLUMN "marca" SET DATA TYPE text;
--> statement-breakpoint
INSERT INTO opcoes_conhecidas (campo,valor,normalizado,nome_pt,nome_ko,regular) VALUES
('categoria','economico','economico','Econômico','이코노미',true),
('categoria','padrao','padrao','Padrão','스탠다드',true),
('categoria','premium','premium','Premium','프리미엄',true),
('categoria','vip','vip','VIP','VIP',true),
('marca','corealux','corealux (b2b)','CoreaLux (B2B)','CoreaLux (B2B)',true),
('marca','guia_na_coreia','guia na coreia (b2c)','Guia na Coreia (B2C)','Guia na Coreia (B2C)',true),
('idiomaCliente','pt','portugues','Português','포르투갈어',true),
('idiomaCliente','es','espanhol','Espanhol','스페인어',true),
('idiomaCliente','en','ingles','Inglês','영어',true),
('idiomaCliente','fr','frances','Francês','프랑스어',true),
('idiomaGuiamento','pt','portugues','Português','포르투갈어',true),
('idiomaGuiamento','es','espanhol','Espanhol','스페인어',true),
('idiomaGuiamento','en','ingles','Inglês','영어',true),
('idiomaGuiamento','fr','frances','Francês','프랑스어',true),
('cidades','Seul','seul','Seul','서울',true),
('cidades','Busan','busan','Busan','부산',true),
('cidades','Jeju','jeju','Jeju','제주',true),
('meiosContato','WhatsApp','whatsapp','WhatsApp','WhatsApp',true),
('meiosContato','WhatsApp pessoal','whatsapp pessoal','WhatsApp pessoal','개인 WhatsApp',true),
('meiosContato','Respond.io','respond.io','Respond.io','Respond.io',true),
('meiosContato','E-mail','e-mail','E-mail','이메일',true),
('meiosContato','Instagram','instagram','Instagram','인스타그램',true),
('meiosContato','Telefone/áudio','telefone/audio','Telefone/áudio','전화/음성',true),
('meiosContato','Videochamada','videochamada','Videochamada','영상 통화',true),
('meiosContato','Formulário','formulario','Formulário','양식',true);

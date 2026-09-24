-- Custom SQL migration file, put your code below! --
--> statement-breakpoint
INSERT INTO tabelas_referencia (codigo,titulo) VALUES ('jornada','Jornada e horas extras');
--> statement-breakpoint
INSERT INTO versoes_referencia (tabela,versao,dados) VALUES ('jornada',1,'{"colunas":[{"chave":"valor","nome":"Valor","tipo":"numero"},{"chave":"unidade","nome":"Unidade","tipo":"texto"}],"linhas":[{"id":"extra_carro","nome":"Hora extra carro","valor":0.08,"unidade":"adicional"},{"id":"extra_equipe","nome":"Hora extra guia/assistente","valor":0.07,"unidade":"adicional"},{"id":"noturno","nome":"Noturno após 21h","valor":0.15,"unidade":"adicional"}]}'::jsonb);

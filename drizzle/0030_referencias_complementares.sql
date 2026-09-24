CREATE FUNCTION numero_cliente(ano integer) RETURNS text LANGUAGE plpgsql AS $$
DECLARE base text; sequencia integer; soma integer := 0; digito integer; pos integer;
BEGIN
 sequencia := proximo_identificador('cliente:'||ano);
 IF sequencia>999 THEN RAISE EXCEPTION 'Sequência anual de clientes esgotada'; END IF;
 base := lpad((ano%100)::text,2,'0')||lpad(sequencia::text,3,'0');
 FOR pos IN 1..5 LOOP
  digito := substring(base,pos,1)::integer;
  IF pos%2=1 THEN digito:=digito*2; IF digito>9 THEN digito:=digito-9; END IF; END IF;
  soma:=soma+digito;
 END LOOP;
 RETURN 'CLX'||base||((10-soma%10)%10)::text;
END $$;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION numero_cliente() RETURNS text LANGUAGE sql AS $$ SELECT numero_cliente(extract(year from current_date)::integer) $$;
--> statement-breakpoint
INSERT INTO profissionais(nome,papel,idiomas,especialidades) VALUES
 ('Carlos','guia','["pt","ko","en","es","fr"]','["história","cultura","política"]'),
 ('Lia','guia','["pt","ko","en","libras"]','["arte","cultura","história"]'),
 ('Jessica','guia','[]','["BTS","K-beauty"]') ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO versoes_referencia(tabela,versao,dados)
 SELECT tabela,versao+1,jsonb_set(dados,'{linhas}',dados->'linhas'||'[ {"id":"kit_busan","nome":"Kit Busan","valor":30} ]'::jsonb)
 FROM (SELECT DISTINCT ON(tabela) * FROM versoes_referencia WHERE tabela='tickets' ORDER BY tabela,versao DESC) atual
 WHERE NOT EXISTS (SELECT 1 FROM jsonb_array_elements(atual.dados->'linhas') l WHERE l->>'id'='kit_busan');

--> statement-breakpoint
INSERT INTO fatos_etapa(viagem_id,tipo,em,motivo,etapa_anterior,etapa_resultante)
 SELECT id,case etapa when 'descartada' then 'descarte' when 'perdida' then 'perda' else 'cancelamento' end,criada_em,coalesce(motivo_encerramento,'Migrada do histórico anterior'),'lead',etapa
 FROM viagens v WHERE etapa in ('descartada','perdida','cancelada') AND NOT EXISTS(SELECT 1 FROM fatos_etapa f WHERE f.viagem_id=v.id);

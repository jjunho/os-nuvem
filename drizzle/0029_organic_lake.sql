CREATE TABLE "sequencias_identificador" (
	"chave" text PRIMARY KEY NOT NULL,
	"valor" integer NOT NULL
);
--> statement-breakpoint
CREATE FUNCTION proximo_identificador(chave_in text) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE proximo integer;
BEGIN
 INSERT INTO sequencias_identificador(chave,valor) VALUES(chave_in,1)
 ON CONFLICT(chave) DO UPDATE SET valor=sequencias_identificador.valor+1 RETURNING valor INTO proximo;
 RETURN proximo;
END $$;
--> statement-breakpoint
CREATE FUNCTION numero_cliente() RETURNS text LANGUAGE plpgsql AS $$
DECLARE base text; sequencia integer; soma integer := 0; digito integer; pos integer;
BEGIN
 sequencia := proximo_identificador('cliente:'||extract(year from current_date)::integer);
 IF sequencia>999 THEN RAISE EXCEPTION 'Sequência anual de clientes esgotada'; END IF;
 base := to_char(current_date,'YY')||lpad(sequencia::text,3,'0');
 FOR pos IN 1..5 LOOP
  digito := substring(base,pos,1)::integer;
  IF pos%2=1 THEN digito:=digito*2; IF digito>9 THEN digito:=digito-9; END IF; END IF;
  soma:=soma+digito;
 END LOOP;
 RETURN 'CLX'||base||((10-soma%10)%10)::text;
END $$;
--> statement-breakpoint
INSERT INTO sequencias_identificador(chave,valor)
 SELECT 'viagem:'||(2000+substring(codigo,2,2)::integer),max(substring(codigo,5)::integer)
 FROM viagens WHERE codigo ~ '^V[0-9]{2}-[0-9]+$' GROUP BY substring(codigo,2,2);
--> statement-breakpoint
ALTER TABLE "contatos" ADD COLUMN "numero" text DEFAULT numero_cliente() NOT NULL;--> statement-breakpoint
ALTER TABLE "contatos" ADD CONSTRAINT "contatos_numero_unique" UNIQUE("numero");
INSERT INTO versoes_referencia(tabela,versao,dados)
SELECT tabela,versao+1,jsonb_set(dados,'{linhas}',
 (SELECT jsonb_agg(l||jsonb_build_object('provisorio','Fórmula provisória — docs/padroes-provisorios.md')) FROM jsonb_array_elements(dados->'linhas') l))
FROM (SELECT DISTINCT ON(tabela) * FROM versoes_referencia WHERE tabela='onibus_distancia' ORDER BY tabela,versao DESC) atual;

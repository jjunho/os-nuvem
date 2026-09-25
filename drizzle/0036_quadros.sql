CREATE TABLE quadros (
 id serial PRIMARY KEY, nome text NOT NULL, criador_id integer NOT NULL REFERENCES usuarios(id),
 pessoal boolean NOT NULL DEFAULT false, arquivado boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX quadro_pessoal_unico ON quadros(criador_id) WHERE pessoal;
CREATE TABLE quadros_membros (quadro_id integer REFERENCES quadros(id) ON DELETE CASCADE, usuario_id integer REFERENCES usuarios(id), PRIMARY KEY(quadro_id,usuario_id));
CREATE TABLE quadros_listas (
 id serial PRIMARY KEY, quadro_id integer NOT NULL REFERENCES quadros(id), nome text NOT NULL,
 posicao numeric NOT NULL, conclusao boolean NOT NULL DEFAULT false, arquivada boolean NOT NULL DEFAULT false,
 UNIQUE(id,quadro_id)
);
CREATE UNIQUE INDEX quadro_conclusao_unica ON quadros_listas(quadro_id) WHERE conclusao;
CREATE INDEX listas_quadro ON quadros_listas(quadro_id,posicao);
CREATE TABLE tarefas_posicoes (
 tarefa_id integer PRIMARY KEY REFERENCES tarefas(id) ON DELETE CASCADE,
 quadro_id integer NOT NULL REFERENCES quadros(id), lista_id integer NOT NULL,
 posicao numeric NOT NULL, lista_anterior_id integer REFERENCES quadros_listas(id), arquivada boolean NOT NULL DEFAULT false,
 FOREIGN KEY(lista_id,quadro_id) REFERENCES quadros_listas(id,quadro_id)
);
CREATE INDEX posicoes_quadro ON tarefas_posicoes(quadro_id,lista_id,posicao);
CREATE TABLE tarefas_checklist (
 id serial PRIMARY KEY, tarefa_id integer NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
 titulo text NOT NULL, concluido boolean NOT NULL DEFAULT false, promovida_id integer REFERENCES tarefas(id)
);
CREATE TABLE quadros_etiquetas (id serial PRIMARY KEY, quadro_id integer NOT NULL REFERENCES quadros(id), nome text NOT NULL, UNIQUE(quadro_id,nome));
CREATE TABLE tarefas_etiquetas (tarefa_id integer REFERENCES tarefas(id) ON DELETE CASCADE, etiqueta_id integer REFERENCES quadros_etiquetas(id), PRIMARY KEY(tarefa_id,etiqueta_id));
CREATE TABLE tarefas_anexos (
 id uuid PRIMARY KEY, tarefa_id integer NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
 nome text NOT NULL, mime text NOT NULL, tamanho integer NOT NULL, capa boolean NOT NULL DEFAULT false,
 criada_em timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX tarefa_capa_unica ON tarefas_anexos(tarefa_id) WHERE capa;
ALTER TABLE tarefas ALTER COLUMN prazo DROP NOT NULL;
CREATE FUNCTION garantir_quadro_pessoal(uid integer) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE qid integer;
BEGIN
 INSERT INTO quadros(nome,criador_id,pessoal) VALUES('Meu Quadro',uid,true) ON CONFLICT DO NOTHING RETURNING id INTO qid;
 IF qid IS NOT NULL THEN
  INSERT INTO quadros_listas(quadro_id,nome,posicao,conclusao) VALUES(qid,'Novo',1,false),(qid,'Em foco',2,false),(qid,'Aguardando',3,false),(qid,'Concluído',4,true);
 ELSE SELECT id INTO qid FROM quadros WHERE criador_id=uid AND pessoal; END IF;
 RETURN qid;
END $$;
CREATE FUNCTION criar_quadro_usuario() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN PERFORM garantir_quadro_pessoal(NEW.id); RETURN NEW; END $$;
CREATE TRIGGER usuario_quadro AFTER INSERT ON usuarios FOR EACH ROW EXECUTE FUNCTION criar_quadro_usuario();
SELECT garantir_quadro_pessoal(id) FROM usuarios;
CREATE FUNCTION posicionar_tarefa() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE qid integer; lid integer; atual tarefas_posicoes%ROWTYPE; anterior integer;
BEGIN
 IF TG_OP='INSERT' THEN
  qid:=garantir_quadro_pessoal(NEW.responsavel_id);
  SELECT id INTO lid FROM quadros_listas WHERE quadro_id=qid ORDER BY posicao LIMIT 1;
  INSERT INTO tarefas_posicoes(tarefa_id,quadro_id,lista_id,posicao) VALUES(NEW.id,qid,lid,NEW.id);
 ELSE
  SELECT * INTO atual FROM tarefas_posicoes WHERE tarefa_id=NEW.id FOR UPDATE;
  IF NEW.responsavel_id<>OLD.responsavel_id THEN
   IF NEW.tipo<>'manual' THEN INSERT INTO tarefas_copias(tarefa_id,usuario_id) VALUES(NEW.id,OLD.responsavel_id) ON CONFLICT DO NOTHING; END IF;
   IF NOT EXISTS(SELECT 1 FROM quadros q WHERE q.id=atual.quadro_id AND NOT q.pessoal AND NOT q.arquivado AND (q.criador_id=NEW.responsavel_id OR EXISTS(SELECT 1 FROM quadros_membros m WHERE m.quadro_id=q.id AND m.usuario_id=NEW.responsavel_id))) THEN
    qid:=garantir_quadro_pessoal(NEW.responsavel_id);
    SELECT id INTO lid FROM quadros_listas WHERE quadro_id=qid AND NOT arquivada ORDER BY posicao LIMIT 1;
    UPDATE tarefas_posicoes SET quadro_id=qid,lista_id=lid,lista_anterior_id=NULL,posicao=NEW.id WHERE tarefa_id=NEW.id;
   END IF;
  END IF;
  SELECT * INTO atual FROM tarefas_posicoes WHERE tarefa_id=NEW.id;
  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
   IF NEW.estado='concluida' THEN
    SELECT id INTO lid FROM quadros_listas WHERE quadro_id=atual.quadro_id AND conclusao AND NOT arquivada;
    IF lid IS NOT NULL AND lid<>atual.lista_id THEN
     UPDATE tarefas_posicoes SET lista_anterior_id=lista_id,lista_id=lid,posicao=NEW.id WHERE tarefa_id=NEW.id;
    END IF;
   ELSIF NEW.estado='aberta' AND OLD.estado='concluida' THEN
    SELECT id INTO lid FROM quadros_listas WHERE id=atual.lista_anterior_id AND quadro_id=atual.quadro_id AND NOT arquivada AND NOT conclusao;
    IF lid IS NULL THEN SELECT id INTO lid FROM quadros_listas WHERE quadro_id=atual.quadro_id AND NOT arquivada AND NOT conclusao ORDER BY posicao LIMIT 1; END IF;
    IF lid IS NOT NULL THEN UPDATE tarefas_posicoes SET lista_id=lid,posicao=NEW.id WHERE tarefa_id=NEW.id; END IF;
   END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER tarefa_posicao AFTER INSERT OR UPDATE OF estado,responsavel_id ON tarefas FOR EACH ROW EXECUTE FUNCTION posicionar_tarefa();
INSERT INTO tarefas_posicoes(tarefa_id,quadro_id,lista_id,posicao)
SELECT t.id,q.id,l.id,t.id FROM tarefas t JOIN quadros q ON q.pessoal AND q.criador_id=t.responsavel_id JOIN LATERAL (SELECT id FROM quadros_listas WHERE quadro_id=q.id ORDER BY (conclusao=(t.estado='concluida')) DESC,posicao LIMIT 1) l ON true;
CREATE FUNCTION quadro_visivel(qid integer,uid integer,papel text) RETURNS boolean LANGUAGE sql STABLE AS $$
 SELECT EXISTS(SELECT 1 FROM quadros q WHERE q.id=qid AND (papel='admin' OR q.criador_id=uid OR (NOT q.pessoal AND EXISTS(SELECT 1 FROM quadros_membros m WHERE m.quadro_id=q.id AND m.usuario_id=uid))))
$$;
CREATE FUNCTION tarefa_visivel(tid integer,uid integer,papel text) RETURNS boolean LANGUAGE sql STABLE AS $$
 SELECT EXISTS(SELECT 1 FROM tarefas t JOIN tarefas_posicoes p ON p.tarefa_id=t.id WHERE t.id=tid AND (
 papel='admin' OR t.responsavel_id=uid OR EXISTS(SELECT 1 FROM tarefas_copias c WHERE c.tarefa_id=t.id AND c.usuario_id=uid)
 OR (papel<>'guiamento' AND EXISTS(SELECT 1 FROM quadros q WHERE q.id=p.quadro_id AND NOT q.pessoal AND quadro_visivel(q.id,uid,papel)))))
$$;

ALTER TABLE mensagens ADD COLUMN sistema boolean NOT NULL DEFAULT false;
--> statement-breakpoint
CREATE FUNCTION sincronizar_conversa_tarefa(tarefa integer) RETURNS integer LANGUAGE plpgsql AS $$
DECLARE t tarefas%ROWTYPE; conversa integer;
BEGIN
  SELECT * INTO t FROM tarefas WHERE id=tarefa;
  IF NOT FOUND THEN RETURN NULL; END IF;
  INSERT INTO conversas(chave,tipo,nome,criador_id,viagem_id,atualizada_em)
  VALUES('tarefa:' || t.id,'tarefa',t.codigo || ' · ' || t.titulo,coalesce(t.criada_por,t.responsavel_id),t.viagem_id,t.criada_em)
  ON CONFLICT(chave) DO UPDATE SET nome=excluded.nome
  RETURNING id INTO conversa;
  DELETE FROM membros_conversa m WHERE m.conversa_id=conversa
    AND m.usuario_id<>t.responsavel_id
    AND NOT EXISTS(SELECT 1 FROM tarefas_copias cp WHERE cp.tarefa_id=t.id AND cp.usuario_id=m.usuario_id);
  INSERT INTO membros_conversa(conversa_id,usuario_id)
  SELECT conversa,t.responsavel_id UNION SELECT conversa,usuario_id FROM tarefas_copias WHERE tarefa_id=t.id
  ON CONFLICT DO NOTHING;
  RETURN conversa;
END $$;
--> statement-breakpoint
CREATE FUNCTION tarefa_conversa_participantes() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME='tarefas' THEN
    PERFORM sincronizar_conversa_tarefa(NEW.id);
  ELSE
    PERFORM sincronizar_conversa_tarefa(coalesce(NEW.tarefa_id,OLD.tarefa_id));
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER tarefa_conversa AFTER INSERT OR UPDATE OF responsavel_id,titulo ON tarefas FOR EACH ROW EXECUTE FUNCTION tarefa_conversa_participantes();
--> statement-breakpoint
CREATE TRIGGER tarefa_copias_conversa AFTER INSERT OR DELETE OR UPDATE ON tarefas_copias FOR EACH ROW EXECUTE FUNCTION tarefa_conversa_participantes();
--> statement-breakpoint
SELECT sincronizar_conversa_tarefa(id) FROM tarefas;
--> statement-breakpoint
CREATE FUNCTION tarefa_atividade_conversa() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE conversa integer;
BEGIN
  SELECT id INTO conversa FROM conversas WHERE chave='tarefa:' || NEW.tarefa_id;
  INSERT INTO mensagens(client_id,conversa_id,autor_id,texto,criada_em,sistema)
  SELECT 'historico:tarefa:' || NEW.id,conversa,coalesce(NEW.autor_id,t.responsavel_id),NEW.tipo || coalesce(': ' || NEW.motivo,''),NEW.criada_em,true
  FROM tarefas t WHERE t.id=NEW.tarefa_id
  ON CONFLICT(client_id) DO NOTHING;
  UPDATE conversas SET atualizada_em=greatest(atualizada_em,NEW.criada_em) WHERE id=conversa;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER tarefa_atividade AFTER INSERT ON tarefas_historico FOR EACH ROW EXECUTE FUNCTION tarefa_atividade_conversa();
--> statement-breakpoint
INSERT INTO mensagens(client_id,conversa_id,autor_id,texto,criada_em,sistema)
SELECT 'historico:tarefa:' || h.id,c.id,coalesce(h.autor_id,t.responsavel_id),h.tipo || coalesce(': ' || h.motivo,''),h.criada_em,true
FROM tarefas_historico h JOIN tarefas t ON t.id=h.tarefa_id JOIN conversas c ON c.chave='tarefa:' || t.id
ORDER BY h.criada_em,h.id
ON CONFLICT(client_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS modelos_etapa (
 id serial PRIMARY KEY, item text NOT NULL, etapa text NOT NULL, titulo text NOT NULL,
 horas integer, destinatario text NOT NULL DEFAULT 'responsavel', usuario_id integer REFERENCES usuarios(id),
 fato text NOT NULL, ativo boolean NOT NULL DEFAULT true, vigente_desde timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS tarefas_etapa (
 tarefa_id integer PRIMARY KEY REFERENCES tarefas(id) ON DELETE CASCADE,
 modelo_item_id integer NOT NULL REFERENCES modelos_etapa(id), entrada_chave text NOT NULL,
 etapa text NOT NULL, destinatario text NOT NULL, fato_conclusivo_id integer REFERENCES fatos_etapa(id),
 CONSTRAINT tarefas_etapa_origem UNIQUE(tarefa_id, entrada_chave, modelo_item_id)
);
INSERT INTO modelos_etapa(item,etapa,titulo,horas,fato,ativo,vigente_desde)
SELECT item,etapa,titulo,horas,fato,ativo,'1970-01-01'::timestamptz FROM (VALUES
 ('responder','lead','Responder o primeiro contato',NULL::integer,'contato',true),
 ('cotacoes','em_orcamento','Pedir cotações',24,'cotacao',true),
 ('proposta','em_orcamento','Enviar proposta',48,'envio',true),
 ('followup','proposta_enviada','Retomar proposta com o cliente',72,'contato',true),
 ('nova-versao','em_negociacao','Enviar nova versão',48,'envio',true),
 ('invoice','confirmada','Enviar invoice',24,'invoice',false),
 ('sinal','confirmada','Receber sinal',72,'pagamento',false),
 ('voucher','confirmada','Enviar voucher',120,'voucher',false)
) AS d(item,etapa,titulo,horas,fato,ativo)
WHERE NOT EXISTS (SELECT 1 FROM modelos_etapa m WHERE m.item=d.item);

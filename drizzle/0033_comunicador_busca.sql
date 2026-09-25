CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE INDEX mensagens_busca_idx ON mensagens USING gin ((texto || ' ' || transcricao) gin_trgm_ops);

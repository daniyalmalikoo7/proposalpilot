-- IVFFlat index on KbChunk.embedding for fast approximate nearest-neighbour search.
--
-- Why IVFFlat:
--   Without this index, pgvector performs an exact sequential scan over all rows.
--   IVFFlat partitions vectors into `lists` clusters at build time; at query time
--   only `probes` clusters are searched, giving sub-linear retrieval.
--
-- Tuning (current dataset):
--   lists = 20  — recommended starting point for < 100k rows (sqrt of row count).
--               Increase to 100 when row count exceeds 1M.
--   probes = 1  — default; raise to 3-5 in SET ivfflat.probes if recall is low.
--
-- Apply:
--   psql $DATABASE_URL -f prisma/manual-migrations/001_ivfflat_kbchunk_embedding.sql
--   OR:
--   npx prisma db execute --file prisma/manual-migrations/001_ivfflat_kbchunk_embedding.sql --schema prisma/schema.prisma
--
-- Note: index build is CONCURRENT-safe on Postgres 14+; on older versions it
-- briefly takes an AccessShareLock. Build time scales with row count.

CREATE INDEX IF NOT EXISTS "KbChunk_embedding_ivfflat_idx"
  ON "KbChunk"
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 20);

-- Migration: create notes table with tsvector + GIN + updated_at trigger
-- Generated manually for Phase 4 — run via psql or drizzle-kit when available

CREATE TABLE IF NOT EXISTS "notes" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL CHECK (char_length("title") > 0),
  "content" TEXT NOT NULL,
  "search_vector" TSVECTOR,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GIN index for full-text search (PRD 9, TASK Phase 4)
CREATE INDEX IF NOT EXISTS "notes_search_idx" ON "notes" USING GIN ("search_vector");

-- Function to update search_vector from title + content (strip HTML tags naively)
CREATE OR REPLACE FUNCTION notes_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(regexp_replace(NEW.content, '<[^>]+>', ' ', 'g'), '')), 'B');
  NEW.updated_at := NOW();
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notes_search_vector_trigger ON "notes";
CREATE TRIGGER notes_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, content ON "notes"
  FOR EACH ROW EXECUTE FUNCTION notes_search_vector_update();

-- Backfill existing rows (if any)
-- UPDATE "notes" SET title = title WHERE search_vector IS NULL;

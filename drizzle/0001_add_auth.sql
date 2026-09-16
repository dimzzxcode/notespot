-- Migration: add auth (users + notes.user_id), hapus data lama sesuai request
-- Hapus notes lama (public notes tanpa owner)
DELETE FROM notes;

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(100) NOT NULL,
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add user_id to notes
ALTER TABLE "notes" ADD COLUMN IF NOT EXISTS "user_id" INTEGER;
-- Backfill not needed karena sudah DELETE, langsung set NOT NULL + FK
ALTER TABLE "notes" ALTER COLUMN "user_id" SET NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notes_user_id_users_id_fk') THEN
    ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "notes_user_idx" ON "notes" ("user_id");

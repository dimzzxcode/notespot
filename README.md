# Notespot

Web-based note-taking application dengan rich text editing, autosave, dan full-text search.

**Tentang:** Notespot adalah portfolio project untuk menyimpan, mengedit, dan mencari catatan pribadi dengan cepat. Fokusnya simple product, solid engineering — bukan fitur banyak, tapi implementasi rapi: CRUD terisolasi per user (login/register), editor Tiptap, debounce autosave 3 detik, PostgreSQL full-text search (GIN), validasi Zod, dan UI responsive light.

## Tech Stack

**Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Tiptap, TanStack Query, React Hook Form + Zod, Lucide React

**Backend:** Next.js Route Handlers, Zod, Jose (JWT), bcryptjs

**Database:** PostgreSQL, Drizzle ORM, postgres.js, Full-Text Search (tsvector/tsquery + GIN index)

## Cara Menjalankan

**1. Clone & install**
```bash
git clone <repo-url>
cd notespot-app
npm install
```

**2. Environment**
```bash
cp .env.example .env
# isi:
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/notespot
# AUTH_SECRET=generate-dengan-openssl-rand-base64-32
```

**3. Database (local Postgres)**
```bash
# buat DB jika belum ada (atau via psql CREATE DATABASE notespot)
# jalankan migrasi
# pakai psql atau via node:
node -e "import postgres from 'postgres'; import fs from 'fs'; const sql=postgres(process.env.DATABASE_URL); await sql.unsafe(fs.readFileSync('drizzle/0000_create_notes.sql','utf8')); await sql.unsafe(fs.readFileSync('drizzle/0001_add_auth.sql','utf8')); await sql.end()"
```

**4. Seed (opsional)**
```bash
npm run db:seed
# buat demo user: demo@notespot.app / Demo12345 + 12 notes (user baru register start kosong)
```

**5. Dev**
```bash
npm run dev
# buka http://localhost:3000
# register di /register, login di /login (public), atau pakai demo@notespot.app
```

**Build & lint**
```bash
npm run build
npm run lint
```

## Screenshot

![Login](screenshot/login.png)
![Register](screenshot/register.png)
![Notes List](screenshot/note-list.png)

---

Created by **dimzzxcode**

#!/usr/bin/env node
// Run: node scripts/seed.mjs  (or: npm run db:seed)
// Requires DATABASE_URL — uses postgres package (already in dependencies, no new install).

import postgres from "postgres";
import fs from "fs";
import bcrypt from "bcryptjs";

// Simple .env loader (no dotenv dependency) — Next.js loads .env automatically, but `node scripts/seed.mjs` does not.
function loadEnv() {
  for (const file of [".env", ".env.local"]) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = val;
    }
  }
}
loadEnv();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Set it in .env or .env.local");
  console.error("   Example (local): DATABASE_URL=postgres://postgres:postgres@localhost:5432/notespot");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

const SAMPLE_NOTES = [
  {
    title: "Building My Next.js Note App",
    content: `<h2>Project Overview</h2><p>This project is a note-taking application built with <strong>Next.js</strong> and <strong>PostgreSQL</strong>. The goal is to create a simple, fast, and reliable place to capture ideas.</p><h3>Core Features</h3><ul><li>Create, edit, and delete notes</li><li>Full-text search across all notes</li><li>Autosave while typing</li></ul><blockquote>Keep the interface calm.</blockquote>`,
  },
  { title: "Project Ideas", content: `<h2>Portfolio Ideas</h2><p>Notespot, Budget Tracker, Habit Tracker. Prioritaskan <strong>solid engineering</strong>.</p><ol><li>Notespot</li><li>Expense Tracker</li><li>Habit Tracker</li></ol>` },
  { title: "Weekly Grocery List", content: `<p>Eggs, spinach, oats, chicken breast, coffee beans, olive oil.</p><ul><li>Check fridge</li><li>Buy in bulk</li></ul>` },
  { title: "Meeting Notes — Design Review", content: `<h2>Design Review</h2><p>Updated color tokens to <strong>accent #0e7490</strong> and <strong>ink #0f172a</strong>.</p><ul><li>Reduce hero height</li><li>Warmer CTA</li></ul>` },
  { title: "Books to Read in 2026", content: `<p>Deep Work, Designing Data-Intensive Applications, Atomic Habits.</p>` },
  { title: "API Route Structure", content: `<pre><code>GET /api/notes\nPOST /api/notes\nPATCH /api/notes/:id</code></pre><p>All handlers use <strong>Zod</strong>.</p>` },
  { title: "Trip Planning — Bandung", content: `<p>Check train tickets, book homestay, list cafes. Whoosh or Argo Parahyangan.</p>` },
  { title: "Database Schema Draft", content: `<pre><code>CREATE INDEX notes_search_idx ON notes USING GIN(search_vector);</code></pre><p>Trigger updates <code>search_vector</code> from title+content.</p>` },
  { title: "Workout Log", content: `<p>Push day: bench press 60kg x8, incline dumbbell 22kg.</p>` },
  { title: "Client Feedback — Landing Page", content: `<p>Wants hero shorter, CTA warmer.</p><blockquote>Make CTA pop.</blockquote>` },
  { title: "Recipe — Nasi Goreng Kampung", content: `<p>Anchovies, terasi, chili, kaffir lime, day-old rice.</p>` },
  { title: "Learning Notes — TypeScript Generics", content: `<h2>Generics</h2><pre><code>type ApiResponse<T> = { data: T }</code></pre><p>Prefer <code>unknown</code> over <code>any</code>.</p>` },
];

async function main() {
  console.log(`🌱 Seeding ${SAMPLE_NOTES.length} notes...`);
  try {
    // Ensure demo user exists (for local testing)
    let demoUserId;
    const existingUser = await sql`SELECT id FROM users WHERE email = 'demo@notespot.app' LIMIT 1`;
    if (existingUser.length > 0) {
      demoUserId = existingUser[0].id;
      console.log(`ℹ️  Demo user exists #${demoUserId} demo@notespot.app / Demo12345`);
    } else {
      const hash = await bcrypt.hash("Demo12345", 10);
      const [u] = await sql`INSERT INTO users (name, email, password_hash) VALUES ('Demo User', 'demo@notespot.app', ${hash}) RETURNING id`;
      demoUserId = u.id;
      console.log(`✅ Created demo user #${demoUserId} demo@notespot.app / Demo12345`);
    }

    const [{ count }] = await sql`SELECT count(*)::int as count FROM notes WHERE user_id = ${demoUserId}`;
    if (count > 0) {
      console.log(`ℹ️  Deleting ${count} existing notes for demo user...`);
      await sql`DELETE FROM notes WHERE user_id = ${demoUserId}`;
    }
    for (const n of SAMPLE_NOTES) {
      const [row] = await sql`INSERT INTO notes (user_id, title, content) VALUES (${demoUserId}, ${n.title}, ${n.content}) RETURNING id, title`;
      console.log(`  - #${row.id} ${row.title}`);
    }
    const [{ count: total }] = await sql`SELECT count(*)::int as count FROM notes WHERE user_id = ${demoUserId}`;
    console.log(`📊 Total notes for demo user: ${total}`);
    console.log("🎉 Seeding complete. GIN + trigger populated.");
    console.log("ℹ️  Public registration tetap aktif — user baru akan start kosong.");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    console.error(err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

main();

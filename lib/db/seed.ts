import { db } from "./index";
import { notes, users } from "./schema";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const SAMPLE_NOTES: { title: string; content: string }[] = [
  {
    title: "Building My Next.js Note App",
    content: `<h2>Project Overview</h2><p>This project is a note-taking application built with <strong>Next.js</strong> and <strong>PostgreSQL</strong>. The goal is to create a simple, fast, and reliable place to capture ideas, meeting notes, and daily tasks without unnecessary distractions.</p><p>The core experience is split into three parts: a sidebar for navigation, a note list for browsing, and an editor for writing.</p><h3>Core Features</h3><ul><li>Create, edit, and delete notes</li><li>Organize notes with tags and favorites</li><li>Full-text search across all notes</li><li>Autosave while typing, with a subtle status indicator</li></ul><blockquote>Keep the interface calm. The writing should be the loudest thing on the screen, not the UI around it.</blockquote>`,
  },
  {
    title: "Project Ideas",
    content: `<h2>Portfolio Ideas</h2><p>Ideas I want to build this quarter: <em>Notespot</em>, <em>Budget Tracker</em>, and a <u>habit tracker</u> with charts.</p><ol><li>Notespot — note app with Tiptap + FTS</li><li>Expense Tracker — charts + CSV import</li><li>Habit Tracker — streaks + reminders</li></ol><p>Prioritaskan yang paling menunjukkan <strong>solid engineering</strong>.</p>`,
  },
  {
    title: "Weekly Grocery List",
    content: `<p>Eggs, spinach, oats, chicken breast, coffee beans, olive oil, tomatoes, garlic, yogurt.</p><ul><li>Check fridge before buying</li><li>Buy in bulk for oats &amp; coffee</li></ul><blockquote>Shop on Sunday morning when it's less crowded.</blockquote>`,
  },
  {
    title: "Meeting Notes — Design Review",
    content: `<h2>Design Review 2026-09-10</h2><p>Discussed the new onboarding flow and updated color tokens to <strong>accent #0e7490</strong> and <strong>ink #0f172a</strong>.</p><ul><li>Reduce hero height by 20%</li><li>Use warmer CTA color</li><li>Improve focus-visible outline</li></ul><p>Next step: <a href="https://example.com">Figma file</a></p>`,
  },
  {
    title: "Books to Read in 2026",
    content: `<p>Deep Work, Designing Data-Intensive Applications, Atomic Habits, Clean Code, The Pragmatic Programmer.</p><ol><li>Deep Work — focus</li><li>DDIA — databases</li><li>Atomic Habits — habits</li></ol><blockquote>Read 30 minutes every morning.</blockquote>`,
  },
  {
    title: "API Route Structure",
    content: `<p>Draft structure for <code>/api/notes</code>, <code>/api/tags</code>, and auth middleware.</p><pre><code>GET    /api/notes
GET    /api/notes/:id
POST   /api/notes
PATCH  /api/notes/:id
DELETE /api/notes/:id
GET    /api/notes/search?q=</code></pre><p>All handlers use <strong>Zod</strong> validation and consistent <code>{data}/{error}</code> envelope.</p>`,
  },
  {
    title: "Trip Planning — Bandung",
    content: `<h2>Bandung Trip</h2><p>Check train tickets, book homestay, list of cafes to visit, and hiking preparation.</p><ul><li>Tickets: Whoosh or Argo Parahyangan</li><li>Homestay near Dago</li><li>Cafes: Kopi Toko Djawa, Two Hands Full</li></ul>`,
  },
  {
    title: "Database Schema Draft",
    content: `<p>Tables: <code>notes</code> with <strong>id, title, content, search_vector, created_at, updated_at</strong>.</p><pre><code>CREATE INDEX notes_search_idx ON notes USING GIN(search_vector);</code></pre><p>Trigger updates <code>search_vector</code> from <code>title + content</code> via <code>to_tsvector('english', ...)</code>.</p>`,
  },
  {
    title: "Workout Log",
    content: `<p>Push day: bench press 60kg x8, incline dumbbell 22kg x10, cable fly, triceps pushdown.</p><ul><li>Warmup 10 min treadmill</li><li>Stretch after workout</li></ul>`,
  },
  {
    title: "Client Feedback — Landing Page",
    content: `<p>Wants hero section shorter, CTA button color changed to warmer tone, and testimonials more prominent.</p><blockquote>Make the CTA pop without being too aggressive.</blockquote><p>Follow up on Friday.</p>`,
  },
  {
    title: "Recipe — Nasi Goreng Kampung",
    content: `<h2>Nasi Goreng Kampung</h2><p>Anchovies, terasi, bird's eye chili, kaffir lime leaves, day-old rice, sweet soy sauce.</p><ol><li>Fry anchovies until crispy</li><li>Stir fry chili + terasi</li><li>Add rice + seasonings</li></ol>`,
  },
  {
    title: "Learning Notes — TypeScript Generics",
    content: `<h2>TypeScript Generics</h2><p>Generic constraints, conditional types, and utility type patterns.</p><pre><code>type ApiResponse&lt;T&gt; = { data: T } | { error: { code: string } }</code></pre><ul><li>Prefer <code>unknown</code> over <code>any</code></li><li>Use <code>zod</code> for runtime validation</li></ul>`,
  },
];

export async function seed() {
  console.log(`🌱 Seeding ${SAMPLE_NOTES.length} notes...`);

  // Ensure demo user
  let demoUser = await db.select().from(users).where(eq(users.email, "demo@notespot.app")).then((r) => r[0]);
  if (!demoUser) {
    const hash = await bcrypt.hash("Demo12345", 10);
    const [u] = await db.insert(users).values({ name: "Demo User", email: "demo@notespot.app", passwordHash: hash }).returning({ id: users.id });
    demoUser = { id: u.id } as typeof demoUser;
    console.log(`✅ Created demo user #${u.id} demo@notespot.app / Demo12345`);
  } else {
    console.log(`ℹ️  Demo user exists #${demoUser.id}`);
  }

  const existing = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notes)
    .where(eq(notes.userId, demoUser.id));
  const count = existing[0]?.count ?? 0;
  if (count > 0) {
    console.log(`ℹ️  Deleting ${count} notes for demo user before seed...`);
    await db.delete(notes).where(eq(notes.userId, demoUser.id));
  }

  const withUser = SAMPLE_NOTES.map((n) => ({ ...n, userId: demoUser.id }));
  const inserted = await db.insert(notes).values(withUser).returning({ id: notes.id, title: notes.title });
  console.log(`✅ Inserted ${inserted.length} notes for demo user:`);
  inserted.forEach((n) => console.log(`  - #${n.id} ${n.title}`));

  const verify = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notes)
    .where(eq(notes.userId, demoUser.id));
  console.log(`📊 Total notes for demo user: ${verify[0]?.count}`);
  console.log("🎉 Seeding complete. Public registration tetap kosong untuk user baru.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}

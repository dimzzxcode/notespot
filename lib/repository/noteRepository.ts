import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes, type Note, type NewNote } from "@/lib/db/schema";

export type PaginationParams = {
  userId: number;
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
};

export type SearchParams = PaginationParams & {
  query?: string;
};

function getPagination(p: PaginationParams) {
  const page = Math.max(1, p.page ?? 1);
  const limit = Math.min(100, Math.max(1, p.limit ?? 20));
  const offset = (page - 1) * limit;
  const order = p.sort === "asc" ? asc(notes.updatedAt) : desc(notes.updatedAt);
  return { page, limit, offset, order };
}

export async function createNote(data: { userId: number; title: string; content: string }): Promise<Note> {
  const [row] = await db
    .insert(notes)
    .values({ userId: data.userId, title: data.title, content: data.content })
    .returning();
  return row;
}

export async function getNotes(params: PaginationParams): Promise<Note[]> {
  const { limit, offset, order } = getPagination(params);
  return db.select().from(notes).where(eq(notes.userId, params.userId)).orderBy(order).limit(limit).offset(offset);
}

export async function getNoteById(id: number, userId: number): Promise<Note | null> {
  const [row] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function updateNote(
  id: number,
  userId: number,
  data: Partial<{ title: string; content: string }>,
): Promise<Note | null> {
  if (!data.title && !data.content) return getNoteById(id, userId);
  const [row] = await db
    .update(notes)
    .set({ ...(data.title !== undefined && { title: data.title }), ...(data.content !== undefined && { content: data.content }) })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();
  return row ?? null;
}

export async function deleteNote(id: number, userId: number): Promise<Note | null> {
  const [row] = await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId))).returning();
  return row ?? null;
}

export async function searchNotes(params: SearchParams): Promise<Note[]> {
  const query = params.query?.trim();
  if (!query) return getNotes(params);

  const { limit, offset } = getPagination(params);

  const sanitized = query.replace(/['\\]/g, " ").slice(0, 200);
  const tsQuery = sql`plainto_tsquery('english', ${sanitized})`;

  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, params.userId), sql`${notes.searchVector} @@ ${tsQuery}`))
    .orderBy(sql`ts_rank(${notes.searchVector}, ${tsQuery}) DESC`, desc(notes.updatedAt))
    .limit(limit)
    .offset(offset);
}

export async function countNotes(userId: number): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(notes).where(eq(notes.userId, userId));
  return row?.count ?? 0;
}

export type { Note, NewNote };

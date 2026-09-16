import * as noteRepository from "@/lib/repository/noteRepository";
import { sanitizeHtml, sanitizeTitle } from "@/lib/security/sanitize";

export type PaginationParams = {
  userId: number;
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
};

export async function listNotes(params: PaginationParams) {
  return noteRepository.getNotes(params);
}

export async function getNote(id: number, userId: number) {
  return noteRepository.getNoteById(id, userId);
}

export async function createNote(userId: number, data: { title: string; content: string }) {
  return noteRepository.createNote({
    userId,
    title: sanitizeTitle(data.title),
    content: sanitizeHtml(data.content),
  });
}

export async function updateNote(id: number, userId: number, data: { title?: string; content?: string }) {
  return noteRepository.updateNote(id, userId, {
    ...(data.title !== undefined && { title: sanitizeTitle(data.title) }),
    ...(data.content !== undefined && { content: sanitizeHtml(data.content) }),
  });
}

export async function deleteNote(id: number, userId: number) {
  return noteRepository.deleteNote(id, userId);
}

export async function searchNotes(params: { userId: number; query: string; page?: number; limit?: number }) {
  return noteRepository.searchNotes({ userId: params.userId, query: params.query, page: params.page, limit: params.limit });
}

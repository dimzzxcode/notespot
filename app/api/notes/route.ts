import { createNoteSchema, paginationSchema } from "@/lib/validation/note";
import * as noteService from "@/lib/service/noteService";
import { errorResponse, successResponse, toNoteResponse } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    const url = new URL(request.url);
    const parsed = paginationSchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      sort: url.searchParams.get("sort") ?? undefined,
    });
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid pagination parameters", 400, parsed.error.flatten());
    }
    const notes = await noteService.listNotes({ userId: session.userId, ...parsed.data });
    return successResponse(notes.map(toNoteResponse));
  } catch (err) {
    console.error("GET /api/notes failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch notes", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    const body = await request.json().catch(() => null);
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid request", 400, parsed.error.flatten());
    }
    const note = await noteService.createNote(session.userId, parsed.data);
    return successResponse(toNoteResponse(note), 201);
  } catch (err) {
    console.error("POST /api/notes failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to create note", 500);
  }
}

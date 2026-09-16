import { noteIdSchema, updateNoteSchema } from "@/lib/validation/note";
import * as noteService from "@/lib/service/noteService";
import { errorResponse, successResponse, toNoteResponse } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getCurrentUser();
    if (!session) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    const { id: rawId } = await params;
    const parsedId = noteIdSchema.safeParse(rawId);
    if (!parsedId.success) return errorResponse("VALIDATION_ERROR", "Invalid note ID", 400, parsedId.error.flatten());
    const note = await noteService.getNote(parsedId.data, session.userId);
    if (!note) return errorResponse("NOTE_NOT_FOUND", "Note not found", 404);
    return successResponse(toNoteResponse(note));
  } catch (err) {
    console.error("GET /api/notes/[id] failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch note", 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getCurrentUser();
    if (!session) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    const { id: rawId } = await params;
    const parsedId = noteIdSchema.safeParse(rawId);
    if (!parsedId.success) return errorResponse("VALIDATION_ERROR", "Invalid note ID", 400, parsedId.error.flatten());
    const body = await request.json().catch(() => null);
    const parsed = updateNoteSchema.safeParse(body);
    if (!parsed.success) return errorResponse("VALIDATION_ERROR", "Invalid request", 400, parsed.error.flatten());
    const note = await noteService.updateNote(parsedId.data, session.userId, parsed.data);
    if (!note) return errorResponse("NOTE_NOT_FOUND", "Note not found", 404);
    return successResponse(toNoteResponse(note));
  } catch (err) {
    console.error("PATCH /api/notes/[id] failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to update note", 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getCurrentUser();
    if (!session) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    const { id: rawId } = await params;
    const parsedId = noteIdSchema.safeParse(rawId);
    if (!parsedId.success) return errorResponse("VALIDATION_ERROR", "Invalid note ID", 400, parsedId.error.flatten());
    const note = await noteService.deleteNote(parsedId.data, session.userId);
    if (!note) return errorResponse("NOTE_NOT_FOUND", "Note not found", 404);
    return successResponse(toNoteResponse(note));
  } catch (err) {
    console.error("DELETE /api/notes/[id] failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to delete note", 500);
  }
}

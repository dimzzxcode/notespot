import { searchQuerySchema } from "@/lib/validation/note";
import * as noteService from "@/lib/service/noteService";
import { errorResponse, successResponse, toNoteResponse } from "@/lib/api/response";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) return errorResponse("UNAUTHORIZED", "Not authenticated", 401);
    const url = new URL(request.url);
    const parsed = searchQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });
    if (!parsed.success) {
      return errorResponse("VALIDATION_ERROR", "Invalid search parameters", 400, parsed.error.flatten());
    }
    const notes = await noteService.searchNotes({ userId: session.userId, query: parsed.data.q, page: parsed.data.page, limit: parsed.data.limit });
    return successResponse(notes.map(toNoteResponse));
  } catch (err) {
    console.error("GET /api/notes/search failed:", err);
    return errorResponse("INTERNAL_ERROR", "Failed to search notes", 500);
  }
}

export type ApiSuccess<T> = { data: T };
export type ApiError = { error: { code: string; message: string; details?: unknown } };

export function successResponse<T>(data: T, init?: number | ResponseInit) {
  const status = typeof init === "number" ? init : (init as ResponseInit)?.status ?? 200;
  const rest = typeof init === "number" ? {} : (init as ResponseInit);
  return Response.json({ data } as ApiSuccess<T>, { status, ...rest });
}

export function errorResponse(code: string, message: string, status: number, details?: unknown) {
  return Response.json({ error: { code, message, ...(details ? { details } : {}) } } as ApiError, { status });
}

export function toNoteResponse(note: { id: number; title: string; content: string; createdAt: Date; updatedAt: Date }) {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    updatedAt: note.updatedAt.toISOString(),
  };
}

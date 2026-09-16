export type NoteDto = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

async function handle<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.message || `Request failed ${res.status}`);
  return (json.data as T) ?? (json as T);
}

export async function fetchNotes(params?: { page?: number; limit?: number; sort?: string }): Promise<NoteDto[]> {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.sort) sp.set("sort", params.sort);
  const res = await fetch(`/api/notes?${sp.toString()}`, { cache: "no-store" });
  return handle<NoteDto[]>(res);
}

export async function fetchNote(id: number | string): Promise<NoteDto> {
  const res = await fetch(`/api/notes/${id}`, { cache: "no-store" });
  return handle<NoteDto>(res);
}

export async function createNote(data: { title: string; content: string }): Promise<NoteDto> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handle<NoteDto>(res);
}

export async function updateNote(id: number | string, data: { title?: string; content?: string }): Promise<NoteDto> {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handle<NoteDto>(res);
}

export async function deleteNote(id: number | string): Promise<NoteDto> {
  const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  return handle<NoteDto>(res);
}

export async function searchNotes(q: string): Promise<NoteDto[]> {
  const res = await fetch(`/api/notes/search?q=${encodeURIComponent(q)}`, { cache: "no-store" });
  return handle<NoteDto[]>(res);
}

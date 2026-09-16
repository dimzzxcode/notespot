"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/notes";

export function useNotes(params?: { page?: number; limit?: number; sort?: string }) {
  return useQuery({
    queryKey: ["notes", params],
    queryFn: () => api.fetchNotes(params),
  });
}

export function useNote(id: string | number | null) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => api.fetchNote(id as string),
    enabled: !!id,
  });
}

export function useSearchNotes(query: string) {
  return useQuery({
    queryKey: ["notes", "search", query],
    queryFn: () => (query.trim() ? api.searchNotes(query.trim()) : api.fetchNotes({ sort: "desc", limit: 50 })),
    enabled: true,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string }) => api.createNote(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: { title?: string; content?: string } }) => api.updateNote(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["note", String(vars.id)] });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => api.deleteNote(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

"use client";

import { useRef, useState, useMemo } from "react";
import { Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SearchInput } from "./SearchInput";
import { NoteListItem, type NoteListItemData } from "./NoteListItem";
import { useDebounce } from "@/hooks/useDebounce";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { fetchNotes, searchNotes, type NoteDto } from "@/lib/api/notes";
import { EmptyState, ErrorState, LoadingState, SearchEmptyState } from "@/components/ui/State";

const MOCK_FALLBACK: NoteListItemData[] = [
  { id: "1", title: "Building My Next.js Note App", preview: "This project is a note-taking application built with Next.js and PostgreSQL...", updatedLabel: "Today · 10:24 AM", favorite: true },
  { id: "2", title: "Project Ideas", preview: "Portfolio project ideas and things I want to build this quarter...", updatedLabel: "Today · 9:02 AM" },
  { id: "3", title: "Weekly Grocery List", preview: "Eggs, spinach, oats, chicken breast, coffee beans, olive oil...", updatedLabel: "Yesterday · 7:40 PM" },
  { id: "4", title: "Meeting Notes — Design Review", preview: "Discussed the new onboarding flow and updated color tokens...", updatedLabel: "Yesterday · 3:15 PM", favorite: true },
  { id: "5", title: "Books to Read in 2026", preview: "Deep Work, Designing Data-Intensive Applications, Atomic Habits...", updatedLabel: "Mon · 11:05 AM" },
  { id: "6", title: "API Route Structure", preview: "Draft structure for /api/notes, /api/tags, and auth middleware...", updatedLabel: "Mon · 8:30 AM" },
];

function toListItem(dto: NoteDto): NoteListItemData {
  const plain = dto.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const preview = plain.slice(0, 80) + (plain.length > 80 ? "..." : "");
  const updated = new Date(dto.updatedAt);
  const updatedLabel = updated.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) + " · " + updated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return { id: String(dto.id), title: dto.title, preview: preview || dto.title, updatedLabel };
}

type NoteListProps = {
  onOpenSidebar: () => void;
  onSelectNote: (id: string) => void;
  selectedId: string | null;
  isMobileEditorOpen: boolean;
};

export function NoteList({ onOpenSidebar, onSelectNote, selectedId, isMobileEditorOpen }: NoteListProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["notes", debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.trim()) {
        return await searchNotes(debouncedQuery.trim());
      }
      return await fetchNotes({ sort: "desc", limit: 50 });
    },
  });

  const isSearchMode = debouncedQuery.trim().length > 0;
  const hasRealData = data !== undefined;

  const notes: NoteListItemData[] = useMemo(() => {
    if (data) return data.map(toListItem);
    if (hasRealData && data === null) return [];
    if (!hasRealData) {
      return MOCK_FALLBACK.filter((n) => {
        const q = debouncedQuery.trim().toLowerCase();
        if (!q) return true;
        return (n.title + " " + n.preview).toLowerCase().includes(q);
      });
    }
    return [];
  }, [data, debouncedQuery, hasRealData]);

  useKeyboardShortcuts({
    onSearchFocus: () => inputRef.current?.focus(),
    enabled: !isMobileEditorOpen,
  });

  if (isMobileEditorOpen) return null;

  return (
    <section
      className="flex h-full w-full shrink-0 flex-col border-r border-ink-200 bg-ink-50 sm:w-80 lg:w-80 xl:w-96"
      aria-label="Note list"
    >
      <div className="flex h-16 shrink-0 items-center gap-2 px-4 lg:hidden">
        <button type="button" onClick={onOpenSidebar} className="rounded-md p-2 -ml-2 text-ink-600 hover:bg-ink-100" aria-label="Open sidebar">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="text-[15px] font-semibold text-ink-900">All Notes</h1>
      </div>

      <div className="px-4 pb-3 pt-2 lg:pt-5">
        <SearchInput ref={inputRef} value={query} onChange={setQuery} />
      </div>

      <div className="flex items-center justify-between px-4 pb-2">
        <p className="text-xs font-medium text-ink-400" aria-live="polite">{notes.length} note{notes.length === 1 ? "" : "s"}</p>
      </div>

      {isLoading ? (
        <LoadingState label="Loading notes..." />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      ) : notes.length === 0 ? (
        isSearchMode ? (
          <SearchEmptyState query={debouncedQuery} />
        ) : (
          <EmptyState />
        )
      ) : (
        <ul className="thin-scroll flex flex-1 flex-col gap-1 overflow-y-auto px-2 pb-4" role="listbox" aria-label="Notes">
          {notes.map((note) => (
            <NoteListItem key={note.id} note={note} active={selectedId === note.id} onSelect={onSelectNote} />
          ))}
        </ul>
      )}
    </section>
  );
}

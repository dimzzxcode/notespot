"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./Sidebar";
import { NoteList } from "../notes/NoteList";
import { NoteEditor } from "../editor/NoteEditor";
import { useCreateNote } from "@/hooks/useNotes";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const createNote = useCreateNote();
  const { data: user } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data as { name: string; email: string };
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    if (window.innerWidth < 640) setMobileEditorOpen(true);
  }, []);

  const handleNewNote = useCallback(async () => {
    try {
      const note = await createNote.mutateAsync({ title: "Untitled", content: "<p></p>" });
      handleSelect(String(note.id));
    } catch {
      handleSelect("1");
    }
  }, [createNote, handleSelect]);

  const handleBack = useCallback(() => setMobileEditorOpen(false), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);
  const handleOpenSidebar = useCallback(() => setSidebarOpen(true), []);
  const handleDelete = useCallback(() => setSelectedId(null), []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) {
        setMobileEditorOpen(false);
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={handleCloseSidebar} onNewNote={handleNewNote} user={user} />
      <NoteList
        onOpenSidebar={handleOpenSidebar}
        onSelectNote={handleSelect}
        selectedId={selectedId}
        isMobileEditorOpen={mobileEditorOpen}
      />
      <div className={`${mobileEditorOpen ? "flex" : "hidden"} min-w-0 flex-1 sm:flex`}>
        <NoteEditor selectedId={selectedId} onBack={handleBack} onDelete={handleDelete} />
      </div>
    </div>
  );
}

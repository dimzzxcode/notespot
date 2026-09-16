"use client";

import { useState, useCallback, useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { EditorHeader } from "./EditorHeader";
import { EditorToolbar } from "./EditorToolbar";
import { RichTextEditor } from "./RichTextEditor";
import { useAutosave } from "@/hooks/useAutosave";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useNote, useDeleteNote } from "@/hooks/useNotes";
import { LoadingState, ErrorState } from "@/components/ui/State";

type NoteEditorProps = {
  selectedId: string | null;
  onBack: () => void;
  onDelete?: () => void;
};

export function NoteEditor({ selectedId, onBack, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const { data: note, isLoading, isError, error, refetch } = useNote(selectedId);
  const deleteNote = useDeleteNote();

  const { status, triggerImmediateSave } = useAutosave({
    id: selectedId,
    payload: { title, content },
    delay: 3000,
    enabled: !!selectedId && !isLoading,
  });

  const handleEditorReady = useCallback((e: Editor) => {
    setEditor(e);
    setContent(e.getHTML());
  }, []);

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
  }, []);

  useKeyboardShortcuts({
    onSave: triggerImmediateSave,
    enabled: !!selectedId,
  });

  useEffect(() => {
    if (note) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(note.title);
      setContent(note.content || "");
    } else if (!selectedId) {
      setTitle("");
      setContent("");
    }
  }, [note, selectedId]);

  const isEmpty = !selectedId;

  if (isEmpty) {
    return (
      <main className="hidden min-w-0 flex-1 flex-col bg-white sm:flex" aria-label="Editor">
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-medium text-ink-900">No note selected.</p>
          <p className="mt-1 max-w-sm text-sm leading-6 text-ink-400">Select a note from the list or create a new one to start writing.</p>
          <p className="mt-2 text-sm text-ink-400">No notes yet.</p>
          <p className="mt-1 text-xs text-ink-400">Create your first note.</p>
          <p className="mt-4 text-xs text-ink-400">Tip: Press ⌘K to search, ⌘S to save.</p>
        </div>
      </main>
    );
  }

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm("Delete this note?")) return;
    await deleteNote.mutateAsync(selectedId);
    onDelete?.();
    onBack();
  };

  if (isLoading && selectedId) {
    return (
      <main className="flex min-w-0 flex-1 flex-col bg-white sm:flex" aria-label="Editor">
        <LoadingState label="Loading note..." />
      </main>
    );
  }

  if (isError && selectedId) {
    return (
      <main className="flex min-w-0 flex-1 flex-col bg-white sm:flex" aria-label="Editor">
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white sm:flex" aria-label="Editor">
      <EditorHeader status={status} onBack={onBack} onDelete={handleDelete} isDeleting={deleteNote.isPending} />
      <EditorToolbar editor={editor} />

      <div className="thin-scroll flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-10 sm:px-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Note title"
            className="mb-6 w-full bg-transparent text-2xl font-semibold text-ink-900 placeholder:text-ink-300 focus:outline-none sm:text-3xl"
            placeholder="Untitled"
          />

          <RichTextEditor content={content} onChange={handleContentChange} onEditorReady={handleEditorReady} />
        </div>
      </div>
    </main>
  );
}

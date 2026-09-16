"use client";

import { useEffect } from "react";

type ShortcutHandler = () => void;

type UseKeyboardShortcutsOptions = {
  onSave?: ShortcutHandler;
  onSearchFocus?: ShortcutHandler;
  enabled?: boolean;
};

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({ onSave, onSearchFocus, enabled = true }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;

      const key = e.key.toLowerCase();

      if (key === "s" && onSave) {
        e.preventDefault();
        onSave();
        return;
      }

      if (key === "k" && onSearchFocus) {
        const target = e.target;
        if (isEditableTarget(target) && (target as HTMLElement).id === "note-search") return;
        e.preventDefault();
        onSearchFocus();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave, onSearchFocus, enabled]);
}

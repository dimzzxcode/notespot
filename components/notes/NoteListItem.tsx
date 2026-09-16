"use client";

import { memo } from "react";
import { Star } from "lucide-react";

export type NoteListItemData = {
  id: string;
  title: string;
  preview: string;
  updatedLabel: string;
  favorite?: boolean;
};

type NoteListItemProps = {
  note: NoteListItemData;
  active?: boolean;
  onSelect?: (id: string) => void;
};

export const NoteListItem = memo(function NoteListItem({ note, active, onSelect }: NoteListItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(note.id)}
        className={`relative w-full rounded-lg border px-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 ${
          active
            ? "border-accent-200 bg-accent-50"
            : "border-transparent hover:border-ink-200 hover:bg-white"
        }`}
        role="option"
        aria-selected={active}
        aria-label={`${note.title}, ${note.updatedLabel}`}
      >
        {active && (
          <span className="absolute bottom-2.5 left-0 top-2.5 w-[3px] rounded-full bg-accent-500" aria-hidden="true" />
        )}
        <div className="flex items-start justify-between gap-2 pl-2">
          <p className={`truncate text-sm ${active ? "font-semibold" : "font-medium"} text-ink-900`}>
            {note.title}
          </p>
          {note.favorite && <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-500" aria-hidden="true" />}
        </div>
        <p className="mt-1 line-clamp-2 pl-2 text-xs text-ink-500">{note.preview}</p>
        <p className="mt-2 pl-2 text-[11px] text-ink-400">{note.updatedLabel}</p>
      </button>
    </li>
  );
});

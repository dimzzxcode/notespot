"use client";

import { ArrowLeft, Trash2 } from "lucide-react";
import { SaveStatus, type SaveStatusType } from "./SaveStatus";

type EditorHeaderProps = {
  status: SaveStatusType;
  onBack: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
};

export function EditorHeader({ status, onBack, onDelete, isDeleting }: EditorHeaderProps) {
  return (
    <header className="shrink-0 border-b border-ink-200">
      <div className="flex h-16 items-center justify-between px-6 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md p-2 -ml-2 text-ink-500 hover:bg-ink-100 sm:hidden"
            aria-label="Back to note list"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <SaveStatus status={status} />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              aria-label="Delete note"
              className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

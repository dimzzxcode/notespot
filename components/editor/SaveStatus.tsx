"use client";

import { Check, Loader2, TriangleAlert } from "lucide-react";

export type SaveStatusType = "saved" | "saving" | "error";

type SaveStatusProps = {
  status: SaveStatusType;
};

export function SaveStatus({ status }: SaveStatusProps) {
  if (status === "saving") {
    return (
      <span aria-live="polite" className="flex items-center gap-1.5 text-xs font-medium text-ink-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Saving...
      </span>
    );
  }
  if (status === "error") {
    return (
      <span aria-live="assertive" className="flex items-center gap-1.5 text-xs font-medium text-red-500">
        <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
        Save failed
      </span>
    );
  }
  return (
    <span aria-live="polite" className="flex items-center gap-1.5 text-xs font-medium text-ink-400">
      <Check className="h-3.5 w-3.5 text-accent-500" aria-hidden="true" />
      Saved just now
    </span>
  );
}

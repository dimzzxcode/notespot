"use client";

import { TriangleAlert, FileSearch, FileText, Loader2 } from "lucide-react";

type StateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
};

function StateWrapper({ title, description, action, icon }: StateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      {icon && <div className="mb-3 text-ink-300">{icon}</div>}
      <p className="text-sm font-medium text-ink-900">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm leading-6 text-ink-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading notes..." }: { label?: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center" aria-live="polite" aria-busy="true">
      <Loader2 className="mb-3 h-5 w-5 animate-spin text-ink-400" aria-hidden="true" />
      <p className="text-sm text-ink-400">{label}</p>
    </div>
  );
}

export function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <StateWrapper
      icon={<FileText className="h-8 w-8" aria-hidden="true" />}
      title="No notes yet."
      description="Create your first note to get started."
      action={
        onCreate ? (
          <button
            type="button"
            onClick={onCreate}
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white hover:bg-accent-600"
          >
            Create your first note
          </button>
        ) : undefined
      }
    />
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <StateWrapper
      icon={<FileSearch className="h-8 w-8" aria-hidden="true" />}
      title="No notes found."
      description={query ? `No results for "${query}". Try a different keyword.` : "Try a different keyword."}
    />
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <StateWrapper
      icon={<TriangleAlert className="h-8 w-8 text-amber-500" aria-hidden="true" />}
      title="Something went wrong."
      description={message || "Please try again."}
      action={
        onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Try again
          </button>
        ) : undefined
      }
    />
  );
}

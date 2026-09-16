"use client";

import { Search } from "lucide-react";
import { forwardRef } from "react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { value, onChange, placeholder = "Search notes..." },
  ref,
) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
      <label htmlFor="note-search" className="sr-only">
        Search notes
      </label>
      <input
        ref={ref}
        id="note-search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-9 pr-14 text-sm text-ink-900 placeholder:text-ink-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
      />
      <kbd className="absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[11px] font-medium text-ink-400 md:flex">
        ⌘K
      </kbd>
    </div>
  );
});

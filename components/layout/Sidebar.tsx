"use client";

import { FileText, NotebookPen, Plus, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onNewNote?: () => void;
  user?: { name: string; email: string } | null;
};

export function Sidebar({ open, onClose, onNewNote, user }: SidebarProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    qc.clear();
    router.push("/login");
    router.refresh();
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "RA";

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 bg-ink-900/30 lg:hidden ${open ? "block" : "hidden"}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-ink-200 bg-white transition-transform duration-200 ease-out lg:static lg:w-64 lg:shrink-0 lg:translate-x-0 xl:w-72 ${
          open ? "!translate-x-0" : ""
        }`}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500">
              <NotebookPen className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-[15px] font-semibold text-ink-900">Notespot</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2.5 text-ink-500 hover:bg-ink-100 lg:hidden min-h-10 min-w-10 flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* New Note */}
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={onNewNote}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-500 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Note
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 px-3" aria-label="Note collections">
          <a
            href="#"
            aria-current="page"
            className="flex items-center gap-3 rounded-lg bg-accent-50 px-3 py-2 text-sm font-medium text-accent-700"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            All Notes
          </a>
        </nav>

        <div className="flex-1" />

        {/* Bottom */}
        <div className="border-t border-ink-200 p-3">
          <div className="mt-1 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-200 text-xs font-semibold text-ink-600">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink-900">{user?.name ?? "Raka Anggara"}</p>
              <p className="truncate text-xs text-ink-400">{user?.email ?? "raka@email.com"}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="rounded-md p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

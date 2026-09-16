"use client";

import type { Editor } from "@tiptap/react";
import { Bold, Code, Heading2, Italic, Link as LinkIcon, List, ListOrdered, Quote, Underline } from "lucide-react";

type EditorToolbarProps = {
  editor: Editor | null;
};

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) {
    return (
      <div className="thin-scroll overflow-x-auto px-4 pb-3 sm:px-8">
        <div className="flex w-max items-center gap-1 rounded-lg border border-ink-200 bg-ink-50 p-1 opacity-50">
          <span className="px-2 text-xs text-ink-400">Loading editor...</span>
        </div>
      </div>
    );
  }

  const btnBase = "rounded-md p-2.5 hover:bg-white hover:text-ink-900 min-h-9 min-w-9 flex items-center justify-center sm:p-2";
  const activeCls = "bg-white text-ink-900 shadow-sm";
  const idleCls = "text-ink-600";

  const isActive = (name: string, attrs?: Record<string, unknown>) => editor.isActive(name, attrs);

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="thin-scroll overflow-x-auto px-4 pb-3 sm:px-8">
      <div role="toolbar" aria-label="Formatting" className="flex w-max items-center gap-1 rounded-lg border border-ink-200 bg-ink-50 p-1">
        <button
          type="button"
          aria-label="Bold"
          aria-pressed={isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnBase} ${isActive("bold") ? activeCls : idleCls}`}
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Italic"
          aria-pressed={isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnBase} ${isActive("italic") ? activeCls : idleCls}`}
        >
          <Italic className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Underline"
          aria-pressed={isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${btnBase} ${isActive("underline") ? activeCls : idleCls}`}
        >
          <Underline className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="mx-1 h-5 w-px bg-ink-200" aria-hidden="true" />
        <button
          type="button"
          aria-label="Heading"
          aria-pressed={isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${btnBase} ${isActive("heading", { level: 2 }) ? activeCls : idleCls}`}
        >
          <Heading2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Bullet list"
          aria-pressed={isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnBase} ${isActive("bulletList") ? activeCls : idleCls}`}
        >
          <List className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Numbered list"
          aria-pressed={isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnBase} ${isActive("orderedList") ? activeCls : idleCls}`}
        >
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="mx-1 h-5 w-px bg-ink-200" aria-hidden="true" />
        <button
          type="button"
          aria-label="Quote"
          aria-pressed={isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${btnBase} ${isActive("blockquote") ? activeCls : idleCls}`}
        >
          <Quote className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Code block"
          aria-pressed={isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`${btnBase} ${isActive("codeBlock") ? activeCls : idleCls}`}
        >
          <Code className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Insert link"
          aria-pressed={isActive("link")}
          onClick={setLink}
          className={`${btnBase} ${isActive("link") ? activeCls : idleCls}`}
        >
          <LinkIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

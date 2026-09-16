"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

type RichTextEditorProps = {
  content: string;
  onChange?: (html: string) => void;
  onEditorReady?: (editor: Editor) => void;
};

const DEFAULT_CONTENT = `
<h2>Project Overview</h2>
<p>This project is a note-taking application built with Next.js and PostgreSQL. The goal is to create a simple, fast, and reliable place to capture ideas, meeting notes, and daily tasks without unnecessary distractions.</p>
<p>The core experience is split into three parts: a sidebar for navigation, a note list for browsing, and an editor for writing. Below are some planning notes for the build.</p>
<h3>Core Features</h3>
<ul>
  <li>Create, edit, and delete notes</li>
  <li>Organize notes with tags and favorites</li>
  <li>Full-text search across all notes</li>
  <li>Autosave while typing, with a subtle status indicator</li>
</ul>
<h3>Build Order</h3>
<ol>
  <li>Set up Next.js project and database schema</li>
  <li>Build the note list and editor UI</li>
  <li>Connect autosave and search to the API</li>
  <li>Polish responsive layout and accessibility</li>
</ol>
<blockquote>Keep the interface calm. The writing should be the loudest thing on the screen, not the UI around it.</blockquote>
<p>A minimal API route for fetching notes might look like this:</p>
<pre><code>export async function GET() {
  const notes = await db.note.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return Response.json(notes);
}</code></pre>
<p>Next step is wiring up the <a href="#">Prisma schema</a> and testing the search endpoint with sample data.</p>
`;

export function RichTextEditor({ content, onChange, onEditorReady }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: { HTMLAttributes: { class: "rounded bg-ink-100 px-1 py-0.5 text-[13px] font-mono text-ink-700" } },
        codeBlock: { HTMLAttributes: { class: "rounded-lg bg-ink-900 p-4 text-[13px] leading-6 text-ink-100" } },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-accent-600 underline underline-offset-2 hover:text-accent-700" },
      }),
    ],
    content: content || DEFAULT_CONTENT,
    editorProps: {
      attributes: {
        class: "tiptap min-h-[280px] max-w-none text-[15px] leading-7 text-ink-700 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    if (content === undefined) return;
    const current = editor.getHTML();
    if (content !== current) {
      editor.commands.setContent(content || DEFAULT_CONTENT);
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="min-h-70 animate-pulse rounded bg-ink-50" aria-hidden="true" />;
  }

  return (
    <>
      <EditorContent editor={editor} className="tiptap-content" />
      <style>{`
        .tiptap h2 { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin-top: 0.5rem; }
        .tiptap h3 { font-size: 1rem; font-weight: 600; color: #0f172a; margin-top: 0.5rem; }
        .tiptap p { margin: 0; }
        .tiptap ul { list-style: disc; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.375rem; }
        .tiptap ul li::marker { color: #94a3b8; }
        .tiptap ol { list-style: decimal; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.375rem; }
        .tiptap ol li::marker { color: #94a3b8; font-weight: 500; }
        .tiptap blockquote { border-left: 2px solid #0e7490; padding-left: 1rem; font-style: italic; color: #64748b; }
        .tiptap pre { background: #0f172a; color: #f1f5f9; border-radius: 0.5rem; padding: 1rem; overflow-x: auto; font-size: 13px; line-height: 1.5rem; }
        .tiptap pre code { background: transparent; padding: 0; color: inherit; }
        .tiptap a { color: #0e7490; text-decoration: underline; text-underline-offset: 2px; }
        .tiptap a:hover { color: #0c6580; }
        .tiptap p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #94a3b8; pointer-events: none; height: 0; }
      `}</style>
    </>
  );
}

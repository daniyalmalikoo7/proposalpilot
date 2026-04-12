"use client";

import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";

interface ToolbarButtonProps {
  label: string;
  title: string;
  isActive: boolean;
  onClick: () => void;
}

function ToolbarButton({ label, title, isActive, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={isActive}
      aria-label={title}
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor focus loss
        onClick();
      }}
      className={cn(
        "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded px-2 py-1 text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-1",
        "active:scale-[0.97]",
        isActive
          ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
          : "text-foreground-muted hover:bg-background-subtle hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

interface EditorToolbarProps {
  readonly editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-background-subtle/50 px-2 py-1">
      <ToolbarButton
        label="B"
        title="Bold"
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="I"
        title="Italic"
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="H2"
        title="Heading 2"
        isActive={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label="H3"
        title="Heading 3"
        isActive={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <ToolbarButton
        label="UL"
        title="Bullet list"
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="OL"
        title="Numbered list"
        isActive={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolbarButton
        label="Undo"
        title="Undo"
        isActive={false}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        label="Redo"
        title="Redo"
        isActive={false}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}

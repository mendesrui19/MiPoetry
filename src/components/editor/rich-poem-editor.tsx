"use client";

import { FontSize } from "@/components/editor/extensions/font-size";
import {
  FONT_SIZE_VALUES,
  HIGHLIGHT_COLORS,
  POEM_FONTS,
  TEXT_COLORS,
  getFontFamily,
} from "@/lib/poem-fonts";
import { cn } from "@/lib/cn";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useEffect } from "react";
import type { Editor } from "@tiptap/react";
import { plainTextToHtml, emptyPoemHtml } from "@/lib/rich-text";

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "h-8 w-8 shrink-0 flex items-center justify-center rounded-lg border transition-colors",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-border text-ink-muted hover:bg-surface-up"
      )}
    >
      {children}
    </button>
  );
}

export function RichFormatToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="border-b border-border-faint bg-surface/95 backdrop-blur-xl px-2 py-2 space-y-2">
      <div className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ToolbarButton
          title="Negrito"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Itálico"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Sublinhado"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Riscado"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <span className="w-px h-6 bg-border shrink-0 mx-0.5" />

        <ToolbarButton
          title="Alinhar à esquerda"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Centrar"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Alinhar à direita"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-dim shrink-0">
          Fontes
        </span>
        {POEM_FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            title={f.label}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setFontFamily(getFontFamily(f.id)).run();
            }}
            className={cn(
              "shrink-0 rounded-lg border px-2 py-1 text-xs font-medium transition-colors",
              editor.isActive("textStyle", { fontFamily: getFontFamily(f.id) })
                ? "border-accent bg-accent-soft text-accent"
                : "border-border hover:bg-surface-up"
            )}
            style={{ fontFamily: getFontFamily(f.id) }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-dim shrink-0">
          Tam.
        </span>
        {FONT_SIZE_VALUES.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.label}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setFontSize(s.value).run();
            }}
            className={cn(
              "h-7 min-w-7 shrink-0 rounded-lg border px-1.5 text-[10px] font-bold transition-colors",
              editor.isActive("textStyle", { fontSize: s.value })
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-ink-muted hover:bg-surface-up"
            )}
          >
            {s.label}
          </button>
        ))}

        <span className="w-px h-6 bg-border shrink-0 mx-1" />

        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-dim shrink-0">
          Cor
        </span>
        {TEXT_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.label}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setColor(c.value).run();
            }}
            className={cn(
              "h-7 w-7 shrink-0 rounded-full border-2 transition-transform active:scale-95",
              editor.isActive("textStyle", { color: c.value })
                ? "border-accent scale-110"
                : "border-stone-300/60"
            )}
            style={{ backgroundColor: c.value }}
          />
        ))}

        <span className="w-px h-6 bg-border shrink-0 mx-1" />

        <Highlighter className="h-3.5 w-3.5 text-ink-dim shrink-0" />
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.label}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleHighlight({ color: c.value }).run();
            }}
            className={cn(
              "h-7 w-7 shrink-0 rounded-lg border-2 transition-transform active:scale-95",
              editor.isActive("highlight", { color: c.value })
                ? "border-accent scale-110"
                : "border-stone-300/60"
            )}
            style={{ backgroundColor: c.value }}
          />
        ))}
      </div>
    </div>
  );
}

export function createPoemEditorExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: false,
      bulletList: false,
      orderedList: false,
      blockquote: false,
      codeBlock: false,
      horizontalRule: false,
    }),
    Underline,
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ["paragraph"] }),
    Placeholder.configure({ placeholder }),
  ];
}

interface RichPoemBodyEditorProps {
  content: string;
  onChange: (html: string) => void;
  defaultColor: string;
  defaultFontFamily: string;
  defaultFontSize: string;
  className?: string;
  editorRef?: React.MutableRefObject<Editor | null>;
  onEditorReady?: (editor: Editor | null) => void;
}

export function RichPoemBodyEditor({
  content,
  onChange,
  defaultColor,
  defaultFontFamily,
  defaultFontSize,
  className,
  editorRef,
  onEditorReady,
}: RichPoemBodyEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: createPoemEditorExtensions(""),
    content: content ? plainTextToHtml(content) : emptyPoemHtml(),
    editorProps: {
      attributes: {
        class: cn("poem-rich-editor outline-none min-h-[36dvh]", className),
        style: `color: ${defaultColor}; font-family: ${defaultFontFamily}; font-size: ${defaultFontSize};`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editorRef) editorRef.current = editor;
    onEditorReady?.(editor);
  }, [editor, editorRef, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          class: cn("poem-rich-editor outline-none min-h-[36dvh]", className),
          style: `color: ${defaultColor}; font-family: ${defaultFontFamily}; font-size: ${defaultFontSize};`,
        },
      },
    });
  }, [editor, defaultColor, defaultFontFamily, defaultFontSize, className]);

  return (
    <>
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "top" }}
          className="flex items-center gap-0.5 rounded-xl border border-border bg-surface shadow-md p-1"
        >
          <ToolbarButton
            title="Negrito"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Itálico"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Sublinhado"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          {TEXT_COLORS.slice(0, 6).map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().setColor(c.value).run();
              }}
              className="h-6 w-6 shrink-0 rounded-full border border-stone-300/60"
              style={{ backgroundColor: c.value }}
            />
          ))}
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </>
  );
}

export type { Editor };

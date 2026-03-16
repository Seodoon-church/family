"use client";

import { useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  ImagePlus,
  Loader2,
} from "lucide-react";
import { useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** 이미지 업로드 콜백 — File을 받아 URL을 반환 */
  onImageUpload?: (file: File) => Promise<string | null>;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "가족의 이야기를 자유롭게 적어보세요...",
  onImageUpload,
}: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor font-story",
      },
    },
  });

  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length || !editor || !onImageUpload) return;

      const file = e.target.files[0];
      e.target.value = "";

      if (!file.type.startsWith("image/")) return;

      setUploading(true);
      try {
        const url = await onImageUpload(file);
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      } finally {
        setUploading(false);
      }
    },
    [editor, onImageUpload]
  );

  if (!editor) return null;

  return (
    <div className="rich-text-wrapper">
      {/* Toolbar */}
      <div className="tiptap-toolbar">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Text formatting */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="굵게 (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="기울임 (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="밑줄 (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="제목 (큰)"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="제목 (작은)"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Lists */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="목록"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="번호 목록"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarDivider />

          {/* Block elements */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="인용구"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="구분선"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          {/* Image */}
          {onImageUpload && (
            <>
              <ToolbarDivider />
              <ToolbarButton
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                title="사진 삽입"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ImagePlus className="w-4 h-4" />
                )}
              </ToolbarButton>
            </>
          )}

          <ToolbarDivider />

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="되돌리기 (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="다시 실행 (Ctrl+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

/** 에디터가 비어있는지 확인하는 헬퍼 */
export function isEditorEmpty(html: string): boolean {
  if (!html) return true;
  // 이미지가 있으면 비어있지 않음
  if (/<img\s/i.test(html)) return false;
  const stripped = html.replace(/<[^>]*>/g, "").trim();
  return stripped.length === 0;
}

/* ─── 내부 컴포넌트 ─── */

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        active
          ? "bg-primary/15 text-primary"
          : disabled
            ? "text-foreground/25 cursor-not-allowed"
            : "text-foreground/60 hover:bg-warm-hover hover:text-foreground/80"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

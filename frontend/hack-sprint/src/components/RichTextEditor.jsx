import { askText } from "../utils/dialogs.js";
import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
  Link2,
  Link2Off,
  Minus,
  Heading2,
  Heading3,
} from "lucide-react";
import "./RichTextEditor.css";
import "../pages/Styles/AllHackathons.css";

const ToolBtn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`rte-tool-btn ${active ? "rte-tool-btn--active" : ""}`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "rte-content",
        "data-placeholder": placeholder || "",
      },
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const setLink = async () => {
    const prev = editor.getAttributes("link").href;
    const url = await askText({ title: "Add a link", label: "URL", initial: prev || "https://", placeholder: "https://", confirmLabel: "Apply" });
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="rte-root">
      <div className="rte-toolbar">
        <ToolBtn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={13} />
        </ToolBtn>
        <ToolBtn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={13} />
        </ToolBtn>
        <ToolBtn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={13} />
        </ToolBtn>
        <span className="rte-divider" />
        <ToolBtn title="Heading" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={13} />
        </ToolBtn>
        <ToolBtn title="Subheading" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={13} />
        </ToolBtn>
        <span className="rte-divider" />
        <ToolBtn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={13} />
        </ToolBtn>
        <ToolBtn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={13} />
        </ToolBtn>
        <ToolBtn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={13} />
        </ToolBtn>
        <ToolBtn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus size={13} />
        </ToolBtn>
        <span className="rte-divider" />
        <ToolBtn title="Add link" active={editor.isActive("link")} onClick={setLink}>
          <Link2 size={13} />
        </ToolBtn>
        <ToolBtn title="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}>
          <Link2Off size={13} />
        </ToolBtn>
        <span className="rte-divider" />
        <ToolBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 size={13} />
        </ToolBtn>
        <ToolBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 size={13} />
        </ToolBtn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

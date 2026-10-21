import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Undo,
  Redo
} from 'lucide-react';

const RichTextEditor = ({ value, onChange, placeholder = 'Write confidential session notes...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder
      })
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  if (!editor) return null;

  return (
    <div className="border border-brand-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-400 bg-white">
      {/* Mini Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-[#F2EFE9] border-b border-[#E8E4DC] text-[#6B6860]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[#E8E4DC] transition-colors ${
            editor.isActive('bold') ? 'bg-[#E8E4DC] text-[#1C1C1A] font-bold' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[#E8E4DC] transition-colors ${
            editor.isActive('italic') ? 'bg-[#E8E4DC] text-[#1C1C1A]' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-[#E8E4DC] transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-[#E8E4DC] text-[#1C1C1A]' : ''
          }`}
          title="Heading"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-[#E8E4DC] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[#E8E4DC] transition-colors ${
            editor.isActive('bulletList') ? 'bg-[#E8E4DC] text-[#1C1C1A]' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[#E8E4DC] transition-colors ${
            editor.isActive('orderedList') ? 'bg-[#E8E4DC] text-[#1C1C1A]' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-[#E8E4DC] transition-colors ${
            editor.isActive('blockquote') ? 'bg-[#E8E4DC] text-[#1C1C1A]' : ''
          }`}
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-[#E8E4DC] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-[#E8E4DC] disabled:opacity-30 transition-colors"
          title="Undo"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-[#E8E4DC] disabled:opacity-30 transition-colors"
          title="Redo"
        >
          <Redo className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Content Area */}
      <div className="p-3 text-xs leading-relaxed min-h-[140px] prose prose-sm max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;

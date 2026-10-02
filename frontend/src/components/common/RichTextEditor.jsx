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
    <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 bg-white">
      {/* Mini Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 border-b border-slate-200 text-slate-600">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('bold') ? 'bg-slate-200 text-slate-900 font-bold' : ''
          }`}
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : ''
          }`}
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-slate-900' : ''
          }`}
          title="Heading"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-slate-200 transition-colors ${
            editor.isActive('blockquote') ? 'bg-slate-200 text-slate-900' : ''
          }`}
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="w-px h-4 bg-slate-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors"
          title="Undo"
        >
          <Undo className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-30 transition-colors"
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


import React, { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Start typing...',
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none',
      },
    },
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className={`border rounded-md overflow-hidden ${className}`}>
      <div className="bg-white px-3 py-2 min-h-[150px]">
        <EditorContent editor={editor} className="outline-none" />
      </div>
      <div className="flex items-center px-3 py-1.5 bg-gray-50 border-t">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor || disabled}
            className={`p-1 rounded hover:bg-gray-200 ${
              editor?.isActive('bold') ? 'bg-gray-200' : ''
            }`}
          >
            <span className="font-bold">B</span>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor || disabled}
            className={`p-1 rounded hover:bg-gray-200 ${
              editor?.isActive('italic') ? 'bg-gray-200' : ''
            }`}
          >
            <span className="italic">I</span>
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={!editor || disabled}
            className={`p-1 rounded hover:bg-gray-200 ${
              editor?.isActive('bulletList') ? 'bg-gray-200' : ''
            }`}
          >
            • List
          </button>
        </div>
      </div>
    </div>
  );
}

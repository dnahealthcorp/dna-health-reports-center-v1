
import React, { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ExportToPdf } from './export-to-pdf';
import { Button } from './button';
import { Bold, Italic, List, FileDown } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showExportToPdf?: boolean;
  pdfFileName?: string;
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Start typing...',
  className = '',
  showExportToPdf = false,
  pdfFileName = 'document.pdf'
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
      <div className="bg-white px-3 py-2 min-h-[150px] relative">
        <EditorContent editor={editor} className="outline-none" />
        {!value && !editor?.isFocused && (
          <div className="absolute top-2 left-3 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-t">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor || disabled}
            className={`p-1 rounded hover:bg-gray-200 ${
              editor?.isActive('bold') ? 'bg-gray-200' : ''
            }`}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor || disabled}
            className={`p-1 rounded hover:bg-gray-200 ${
              editor?.isActive('italic') ? 'bg-gray-200' : ''
            }`}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            disabled={!editor || disabled}
            className={`p-1 rounded hover:bg-gray-200 ${
              editor?.isActive('bulletList') ? 'bg-gray-200' : ''
            }`}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        
        {showExportToPdf && (
          <ExportToPdf 
            html={value} 
            fileName={pdfFileName}
            buttonText="Export"
            css={`
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
              }
              h1, h2, h3 {
                color: #333;
              }
              ul, ol {
                padding-left: 20px;
              }
            `}
          />
        )}
      </div>
    </div>
  );
}

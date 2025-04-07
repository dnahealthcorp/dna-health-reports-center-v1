
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import sanitizeHtml from 'sanitize-html';
import { Button } from "@/components/ui/button";
import { Bold as BoldIcon, Italic as ItalicIcon, List, ListOrdered } from 'lucide-react';

// Sanitize HTML to prevent XSS attacks
export const sanitizeContent = (content: string): string => {
  return sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class']
    }
  });
};

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const RichTextEditor = ({ 
  content, 
  onChange, 
  disabled = false,
  placeholder = 'Enter content here...'
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder
      }),
      Bold,
      Italic,
      BulletList,
      OrderedList,
      ListItem,
    ],
    content: content || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(sanitizeContent(html));
    }
  });

  // Update editor content when content prop changes
  // Only update if the editor exists AND the content is different
  // This preserves cursor position during editing
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Store current selection
      const { from, to } = editor.state.selection;
      
      // Only update content if it differs from current editor content
      // This is crucial to prevent cursor jumping
      editor.commands.setContent(content || '');
      
      // Try to restore selection if possible
      if (from !== undefined && to !== undefined) {
        try {
          // Restore selection only if the position is still valid
          const docSize = editor.state.doc.content.size;
          const validFrom = Math.min(from, docSize);
          const validTo = Math.min(to, docSize);
          editor.commands.setTextSelection({ from: validFrom, to: validTo });
        } catch (e) {
          console.log("Couldn't restore selection:", e);
        }
      }
    }
  }, [content, editor]);

  if (!editor) {
    return <div className="border rounded p-4">Loading editor...</div>;
  }

  return (
    <div className={`border rounded-md ${disabled ? 'bg-gray-50 opacity-70' : ''}`}>
      {!disabled && (
        <div className="flex items-center p-2 gap-1 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="p-3 min-h-[100px]">
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />
      </div>
    </div>
  );
};

export default RichTextEditor;


import React, { useCallback } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import { Button } from './button';
import { Toggle } from './toggle';
import { cn } from '@/lib/utils';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered
} from 'lucide-react';

export interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable?: boolean;
  className?: string;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  editable = true,
  className,
  placeholder = 'Write something...'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        bold: false,
        italic: false,
      }),
      Underline,
      TextStyle,
      BulletList,
      OrderedList,
      Bold,
      Italic,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[100px] max-w-none',
        placeholder,
      },
    },
  });

  const toggleBold = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleBold().run();
  }, [editor]);

  const toggleItalic = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleItalic().run();
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleUnderline().run();
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleBulletList().run();
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleOrderedList().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md", className)}>
      {editable && (
        <div className="flex items-center border-b p-2 gap-1 bg-gray-50">
          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onClick={toggleBold}
            aria-label="Bold"
          >
            <BoldIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onClick={toggleItalic}
            aria-label="Italic"
          >
            <ItalicIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onClick={toggleUnderline}
            aria-label="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onClick={toggleBulletList}
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onClick={toggleOrderedList}
            aria-label="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className={cn(
          "p-3 overflow-auto", 
          !editable && "bg-gray-50", 
          editable && "min-h-[120px]"
        )}
      />
    </div>
  );
}

// A viewer component for read-only HTML content
export function RichTextViewer({ content, className }: { content: string, className?: string }) {
  return (
    <div 
      className={cn("prose prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

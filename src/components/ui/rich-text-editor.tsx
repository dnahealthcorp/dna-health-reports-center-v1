
import { 
  useEditor, 
  EditorContent,
  Extension,
  HTMLContent 
} from '@tiptap/react';
import { useState, useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Button } from './button';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  List as ListIcon, 
  ListOrdered as ListOrderedIcon,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  className
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Set the initial content when the component mounts
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);
  
  // Handle SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="border rounded-md p-4 bg-gray-50">Loading editor...</div>;
  }

  return (
    <div className={cn("border rounded-md", className)}>
      {!disabled && (
        <div className="border-b p-2 flex gap-1 flex-wrap">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={cn(
              editor?.isActive('bold') ? 'bg-muted' : 'bg-transparent'
            )}
            disabled={disabled}
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={cn(
              editor?.isActive('italic') ? 'bg-muted' : 'bg-transparent'
            )}
            disabled={disabled}
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={cn(
              editor?.isActive('underline') ? 'bg-muted' : 'bg-transparent'
            )}
            disabled={disabled}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={cn(
              editor?.isActive('bulletList') ? 'bg-muted' : 'bg-transparent'
            )}
            disabled={disabled}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={cn(
              editor?.isActive('orderedList') ? 'bg-muted' : 'bg-transparent'
            )}
            disabled={disabled}
          >
            <ListOrderedIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <EditorContent 
        editor={editor} 
        className={cn(
          "prose prose-sm max-w-none w-full p-3 focus:outline-none min-h-[60px]",
          disabled ? "bg-gray-50 text-gray-500" : ""
        )} 
      />
    </div>
  );
}

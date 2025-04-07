
import { useState } from 'react';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text here...',
  disabled = false,
  className,
  minHeight = '150px'
}: RichTextEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  // Parse the HTML content or return the raw text if it doesn't contain HTML tags
  const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(value);

  const handleFormat = (format: string) => {
    if (disabled) return;
    
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let formattedText = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        cursorOffset = 8; // Length of "<strong>"
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        cursorOffset = 4; // Length of "<em>"
        break;
      case 'ul':
        formattedText = `<ul>\n  <li>${selectedText}</li>\n</ul>`;
        cursorOffset = 9; // Position after "<li>"
        break;
      case 'ol':
        formattedText = `<ol>\n  <li>${selectedText}</li>\n</ol>`;
        cursorOffset = 9; // Position after "<li>"
        break;
      default:
        return;
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);

    // Set focus back to the textarea and position cursor
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + cursorOffset + selectedText.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const toggleEdit = () => {
    if (disabled) return;
    setIsEditing(!isEditing);
  };

  return (
    <div className={cn("border rounded-md", className)}>
      <div className="flex items-center gap-1 p-1 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('bold')}
          disabled={disabled || !isEditing}
          className={cn("px-2", !isEditing && "opacity-50")}
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('italic')}
          disabled={disabled || !isEditing}
          className={cn("px-2", !isEditing && "opacity-50")}
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('ul')}
          disabled={disabled || !isEditing}
          className={cn("px-2", !isEditing && "opacity-50")}
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleFormat('ol')}
          disabled={disabled || !isEditing}
          className={cn("px-2", !isEditing && "opacity-50")}
        >
          <ListOrdered size={16} />
        </Button>

        <div className="ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleEdit}
            disabled={disabled}
          >
            {isEditing ? "Preview" : "Edit"}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <Textarea
          id="rich-text-editor"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="border-0 rounded-t-none min-h-[120px]"
          style={{ minHeight }}
        />
      ) : (
        <div 
          className="p-3 prose max-w-none" 
          style={{ minHeight }}
          onClick={toggleEdit}
          dangerouslySetInnerHTML={{ __html: isHtmlContent ? value : value.replace(/\n/g, '<br>') }}
        />
      )}
    </div>
  );
}

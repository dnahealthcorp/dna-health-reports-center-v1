
import { cn } from '@/lib/utils';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export function RichTextDisplay({ content, className }: RichTextDisplayProps) {
  // Check if the content has HTML tags
  const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(content);
  
  // If it's not HTML content, treat newlines as line breaks
  const displayContent = isHtmlContent ? content : content.replace(/\n/g, '<br>');

  return (
    <div 
      className={cn("prose max-w-none", className)} 
      dangerouslySetInnerHTML={{ __html: displayContent }}
    />
  );
}

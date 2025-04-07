
import React from 'react';
import parse from 'html-react-parser';

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

const RichTextDisplay = ({ content, className = '' }: RichTextDisplayProps) => {
  if (!content) return null;
  
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {parse(content)}
    </div>
  );
};

export default RichTextDisplay;

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ tags, onChange, placeholder = 'Введите текст и нажмите Enter...', className }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn('flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border border-border bg-[#fbfbfd] p-2 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all', className)}>
      {tags.map((tag, index) => (
        <span
          key={index}
          className="flex items-center gap-1.5 rounded bg-white px-2.5 py-1 text-[13px] font-medium text-content-primary border border-border shadow-sm"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="text-content-muted hover:text-content-primary transition-colors focus:outline-none"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-[14px] text-content-primary placeholder:text-content-muted focus:outline-none"
      />
    </div>
  );
}

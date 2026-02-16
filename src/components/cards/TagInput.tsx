import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ tags, onChange, placeholder = 'Add tag...' }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 min-h-[38px]">
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="text-[10px] px-2 py-0.5 gap-1 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
          onClick={() => removeTag(tag)}
        >
          {tag}
          <X className="w-2.5 h-2.5" />
        </Badge>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] text-xs bg-transparent outline-none text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400"
      />
    </div>
  );
}

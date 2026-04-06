import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tag } from '@/types/meeting';

interface TagChipProps {
  tag: Pick<Tag, 'id' | 'name' | 'color'>;
  onRemove?: () => void;
}

export function TagChip({ tag, onRemove }: TagChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
      <Link 
        to={`/tags/${tag.id}`} 
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1.5 min-w-0"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: tag.color }}
        />
        <span className="truncate max-w-[150px]">{tag.name}</span>
      </Link>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-transparent"
          aria-label={`Remove ${tag.name}`}
        >
          <X className="w-2.5 h-2.5" />
        </Button>
      )}
    </span>
  );
}

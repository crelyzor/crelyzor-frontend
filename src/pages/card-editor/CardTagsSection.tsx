import { useState, useMemo, useRef, useEffect } from 'react';
import { Tag, Plus, Check, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  useUserTags,
  useCardTags,
  useCreateTag,
  useAttachTagToCard,
  useDetachTagFromCard,
} from '@/hooks/queries/useTagQueries';
import type { Tag as TagType } from '@/types/meeting';

const DEFAULT_TAG_COLOR = '#6b7280';

function TagPill({ tag, onRemove }: { tag: TagType; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-xs text-neutral-700 dark:text-neutral-300">
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: tag.color }}
      />
      <span>{tag.name}</span>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
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

function SkeletonPills() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {[60, 80, 50].map((w) => (
        <span
          key={w}
          className="inline-block h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse"
          style={{ width: `${w}px` }}
        />
      ))}
    </div>
  );
}

export function CardTagsSection({ cardId }: { cardId: string }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const newNameRef = useRef<HTMLInputElement>(null);

  const { data: allTags = [], isLoading: loadingAll } = useUserTags();
  const { data: cardTags = [], isLoading: loadingCard } = useCardTags(cardId);

  const { mutate: createTag, isPending: isCreating } = useCreateTag();
  const { mutate: attach, isPending: isAttaching } = useAttachTagToCard(cardId);
  const { mutate: detach, isPending: isDetaching } =
    useDetachTagFromCard(cardId);

  const attachedIds = useMemo(
    () => new Set(cardTags.map((t) => t.id)),
    [cardTags]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return allTags;
    const q = search.toLowerCase();
    return allTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [allTags, search]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setNewName('');
    }
  }, [open]);

  function handleToggle(tag: TagType) {
    if (attachedIds.has(tag.id)) {
      detach(tag.id);
    } else {
      attach(tag.id);
    }
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    createTag(
      { name, color: DEFAULT_TAG_COLOR },
      {
        onSuccess: (tag) => {
          attach(tag.id);
          setNewName('');
        },
      }
    );
  }

  const isLoading = loadingAll || loadingCard;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {isLoading ? (
        <SkeletonPills />
      ) : cardTags.length === 0 ? null : (
        cardTags.map((tag) => (
          <TagPill key={tag.id} tag={tag} onRemove={() => detach(tag.id)} />
        ))
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground gap-1 hover:text-foreground"
          >
            <Tag className="w-3 h-3" />
            {cardTags.length === 0 ? 'Add tag' : '+'}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-64 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
          sideOffset={6}
        >
          {/* Search */}
          <div className="relative mb-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tags…"
              className="w-full pl-7 pr-2 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 placeholder:text-muted-foreground text-foreground"
            />
          </div>

          {/* Tag list */}
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">
                {search ? 'No tags match' : 'No tags yet'}
              </p>
            )}
            {filtered.map((tag) => {
              const attached = attachedIds.has(tag.id);
              return (
                <Button
                  key={tag.id}
                  variant="ghost"
                  onClick={() => handleToggle(tag)}
                  disabled={isAttaching || isDetaching}
                  className="w-full justify-start gap-2.5 px-2 h-8 text-sm text-neutral-800 dark:text-neutral-200 font-normal"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: tag.color }}
                  />
                  <span className="flex-1 text-left truncate">{tag.name}</span>
                  {attached && (
                    <Check className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 shrink-0 ml-auto" />
                  )}
                </Button>
              );
            })}
          </div>

          {/* Create new tag */}
          <Separator className="my-2" />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 mb-1.5">
            New tag
          </p>

          <div className="flex gap-1 px-0.5">
            <input
              ref={newNameRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
              placeholder="Tag name…"
              maxLength={50}
              className="flex-1 px-2 py-1 text-xs bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 placeholder:text-muted-foreground text-foreground min-w-0"
            />
            <Button
              size="sm"
              variant="default"
              onClick={handleCreate}
              disabled={!newName.trim() || isCreating}
              className="h-7 px-2 text-xs shrink-0"
            >
              {isCreating ? (
                <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="w-3 h-3" />
              )}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

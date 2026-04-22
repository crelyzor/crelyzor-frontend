import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Tag as TagIcon,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
} from 'lucide-react';
import { PageMotion } from '@/components/PageMotion';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useTagsWithCounts,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from '@/hooks/queries/useTagQueries';
import { Link } from 'react-router-dom';
import type { TagWithCounts } from '@/types/meeting';

const DEFAULT_TAG_COLOR = '#6b7280';
const TAG_COLOR_PRESETS = [
  '#6b7280',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

function TagCard({ tag }: { tag: TagWithCounts }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(tag.name);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const { mutate: updateTag } = useUpdateTag();
  const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag();

  const handleSave = () => {
    if (editName.trim() && editName.trim() !== tag.name) {
      updateTag({ tagId: tag.id, data: { name: editName.trim() } });
    }
    setIsEditing(false);
  };

  const countsRow = [
    `${tag._count?.meetingTags || 0} meetings`,
    `${tag._count?.cardTags || 0} cards`,
    `${tag._count?.taskTags || 0} tasks`,
    `${tag._count?.contactTags || 0} contacts`,
  ].join(' · ');

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm relative group hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              onBlur={handleSave}
              className="flex-1 w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded px-2 py-1 text-sm outline-none"
            />
          </div>
        ) : (
          <Link
            to={`/tags/${tag.id}`}
            className="flex-1 flex items-center gap-2 min-w-0 font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors"
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ background: tag.color }}
            />
            <span className="truncate">{tag.name}</span>
          </Link>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40 p-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-normal h-8"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-3.5 h-3.5 mr-2" />
              Rename
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 h-8"
              onClick={() => setShowConfirmDelete(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        {countsRow}
      </div>

      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center rounded-xl z-10 space-y-3">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Delete #{tag.name}?
          </p>
          <p className="text-xs text-neutral-500 mb-2">
            It will be removed from all items.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteTag(tag.id)}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TagsPage() {
  const { data: tags = [], isLoading } = useTagsWithCounts();
  const { mutate: createTag, isPending: isCreating } = useCreateTag();
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_TAG_COLOR);
  const createInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (!newName.trim()) return;
    createTag(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: () => {
          setNewName('');
          setNewColor(DEFAULT_TAG_COLOR);
          createInputRef.current?.focus();
        },
      }
    );
  };

  return (
    <PageMotion>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <TagIcon className="w-6 h-6 text-primary" />
              Tags
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
              Organize everything across your workspace
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreate}
          className="mb-8 grid gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Create a new tag
            </p>
            <input
              ref={createInputRef}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Tag name..."
              maxLength={50}
              className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500"
            />
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Color
              </span>
              <div className="flex flex-wrap gap-1.5">
                {TAG_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewColor(color)}
                    className={`h-6 w-6 rounded-full border-2 transition-transform hover:scale-105 ${
                      newColor === color
                        ? 'border-neutral-900 dark:border-neutral-100'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Use color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <Button
            type="submit"
            disabled={!newName.trim() || isCreating}
            className="h-10 shrink-0"
          >
            {isCreating ? (
              'Creating...'
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Tag
              </>
            )}
          </Button>
        </form>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
              />
            ))}
          </div>
        ) : tags.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full border-4 border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center mb-4">
              <TagIcon className="w-5 h-5 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
              No tags yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
              Create tags to organize your meetings, contacts, tasks, and cards
              across Crelyzor.
            </p>
            <Button onClick={() => createInputRef.current?.focus()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Tag
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tags.map((tag) => (
              <TagCard key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </PageMotion>
  );
}

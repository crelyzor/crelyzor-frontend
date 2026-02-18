import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Download,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  Users,
  Tag,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useCardContacts,
  useDeleteContact,
  useUpdateContactTags,
} from '@/hooks/queries/useCardQueries';
import { cardsApi } from '@/services/cardsService';
import { toast } from 'sonner';
import type { CardContact } from '@/types';
import { TagInput } from '@/components/cards/TagInput';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CardContacts() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTagging, setBulkTagging] = useState(false);
  const [bulkTags, setBulkTags] = useState<string[]>([]);

  const { data, isLoading } = useCardContacts({
    search: search || undefined,
    tags: filterTags.length > 0 ? filterTags.join(',') : undefined,
    page,
    limit: 20,
  });

  const deleteContact = useDeleteContact();
  const updateTags = useUpdateContactTags();

  const contacts = useMemo(() => data?.contacts ?? [], [data]);
  const pagination = data?.pagination;

  // Collect all unique tags from visible contacts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach((c) => c.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [contacts]);

  const handleDelete = (id: string) => {
    deleteContact.mutate(id, {
      onSuccess: () => toast.success('Contact removed'),
    });
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleExport = async () => {
    try {
      const csv = await cardsApi.exportContacts();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contacts.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Contacts exported');
    } catch {
      toast.error('Failed to export contacts');
    }
  };

  const handleTagUpdate = (contactId: string, tags: string[]) => {
    updateTags.mutate(
      { id: contactId, tags },
      { onSuccess: () => toast.success('Tags updated') }
    );
    setEditingTagId(null);
  };

  // Bulk actions
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === contacts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(contacts.map((c) => c.id)));
    }
  };

  const handleBulkDelete = () => {
    let completed = 0;
    selected.forEach((id) => {
      deleteContact.mutate(id, {
        onSuccess: () => {
          completed++;
          if (completed === selected.size) {
            toast.success(`${completed} contacts deleted`);
            setSelected(new Set());
          }
        },
      });
    });
  };

  const handleBulkTag = () => {
    if (bulkTags.length === 0) return;
    let completed = 0;
    const total = selected.size;
    selected.forEach((id) => {
      const contact = contacts.find((c) => c.id === id);
      const existingTags = contact?.tags ?? [];
      const merged = Array.from(new Set([...existingTags, ...bulkTags]));
      updateTags.mutate(
        { id, tags: merged },
        {
          onSuccess: () => {
            completed++;
            if (completed === total) {
              toast.success(`Tagged ${completed} contacts`);
              setSelected(new Set());
              setBulkTagging(false);
              setBulkTags([]);
            }
          },
        }
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => navigate('/cards')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Contacts
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {pagination?.total ?? 0} people shared their info with you
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-neutral-600 dark:text-neutral-400"
          onClick={handleExport}
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-200 dark:border-neutral-800
                     bg-white dark:bg-neutral-900 text-sm text-neutral-950 dark:text-neutral-50
                     placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                     focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10
                     transition-shadow"
        />
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-6">
          <Tag className="w-3.5 h-3.5 text-neutral-400 mr-1" />
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={filterTags.includes(tag) ? 'default' : 'outline'}
              className="text-[10px] px-2 py-0.5 cursor-pointer"
              onClick={() => {
                setFilterTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                );
                setPage(1);
              }}
            >
              {tag}
              {filterTags.includes(tag) && <X className="w-2.5 h-2.5 ml-1" />}
            </Badge>
          ))}
          {filterTags.length > 0 && (
            <button
              onClick={() => setFilterTags([])}
              className="text-[10px] text-neutral-400 hover:text-neutral-600 ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Contact list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {search || filterTags.length > 0
              ? 'No contacts match your filters'
              : 'No contacts yet'}
          </p>
          {!search && filterTags.length === 0 && (
            <p className="text-xs text-neutral-400 mt-1">
              Share your card and contacts will appear here
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Select all row */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              {selected.size === contacts.length ? (
                <CheckSquare className="w-3.5 h-3.5" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
            </button>
          </div>

          <div className="space-y-2">
            {contacts.map((contact: CardContact) => (
              <Card
                key={contact.id}
                className={`p-0 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors ${
                  selected.has(contact.id)
                    ? 'ring-2 ring-neutral-900/10 dark:ring-neutral-100/10'
                    : ''
                }`}
              >
                <div className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    {/* Checkbox + contact info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleSelect(contact.id)}
                        className="mt-0.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      >
                        {selected.has(contact.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                            {contact.name}
                          </h3>
                          {contact.card && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                              /{contact.card.slug}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {contact.email && (
                            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                              <Mail className="w-3 h-3" />
                              <span>{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                              <Phone className="w-3 h-3" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.company && (
                            <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                              <Building className="w-3 h-3" />
                              <span>{contact.company}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-neutral-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(contact.scannedAt)}</span>
                          </div>
                        </div>

                        {contact.note && (
                          <p className="text-xs text-neutral-400 mt-1.5 italic">
                            &ldquo;{contact.note}&rdquo;
                          </p>
                        )}

                        {/* Tags */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {contact.tags?.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {editingTagId === contact.id ? (
                            <div className="w-full mt-1">
                              <TagInput
                                tags={contact.tags ?? []}
                                onChange={(tags) =>
                                  handleTagUpdate(contact.id, tags)
                                }
                                placeholder="Type tag and press Enter..."
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingTagId(contact.id)}
                              className="flex items-center gap-0.5 text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {contact.tags?.length ? 'Edit' : '+ Tag'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-neutral-400 hover:text-red-500"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-neutral-500">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xl">
            <span className="text-sm font-medium">
              {selected.size} selected
            </span>
            <div className="w-px h-5 bg-white/20 dark:bg-neutral-900/20" />

            {bulkTagging ? (
              <div className="flex items-center gap-2">
                <div className="w-48">
                  <TagInput
                    tags={bulkTags}
                    onChange={setBulkTags}
                    placeholder="Add tags..."
                  />
                </div>
                <Button
                  size="sm"
                  className="h-7 text-xs bg-white text-neutral-900 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                  onClick={handleBulkTag}
                  disabled={bulkTags.length === 0}
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-white/70 hover:text-white dark:text-neutral-900/70 dark:hover:text-neutral-900"
                  onClick={() => {
                    setBulkTagging(false);
                    setBulkTags([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-white/80 hover:text-white hover:bg-white/10 dark:text-neutral-900/80 dark:hover:text-neutral-900 dark:hover:bg-neutral-900/10"
                  onClick={() => setBulkTagging(true)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  Tag
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-white/80 hover:text-white hover:bg-white/10 dark:text-neutral-900/80 dark:hover:text-neutral-900 dark:hover:bg-neutral-900/10"
                  onClick={handleExport}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </>
            )}

            <button
              onClick={() => setSelected(new Set())}
              className="ml-1 text-white/50 hover:text-white dark:text-neutral-900/50 dark:hover:text-neutral-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

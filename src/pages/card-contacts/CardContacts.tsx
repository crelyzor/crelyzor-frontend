import { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PageMotion } from '@/components/PageMotion';
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
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { tagsApi } from '@/services/tagsService';
import {
  useCardContacts,
  useCardMeetings,
  useDeleteContact,
  useImportContactsCsv,
  useCards,
} from '@/hooks/queries/useCardQueries';
import { useUserTags } from '@/hooks/queries/useTagQueries';
import { cardsApi } from '@/services/cardsService';
import { toast } from 'sonner';
import type { CardContact } from '@/types';
import { ContactRowTags } from './ContactRowTags';

/** Shows how many meetings are linked to a specific contact email on a card. */
function ContactMeetingsChip({
  cardId,
  contactEmail,
}: {
  cardId: string;
  contactEmail: string;
}) {
  const { data: meetings } = useCardMeetings(cardId);

  const count = (meetings ?? []).filter((m) => {
    const inParticipants = m.participants?.some(
      (p) => p.user?.email === contactEmail
    );
    const inGuests = m.guests?.some((g) => g.email === contactEmail);
    return inParticipants || inGuests;
  }).length;

  if (count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
      <Calendar className="w-2.5 h-2.5" />
      {count} meeting{count !== 1 ? 's' : ''}
    </span>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CardContacts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>(
    searchParams.get('card') ?? 'all'
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const csvInputRef = useRef<HTMLInputElement>(null);

  const qc = useQueryClient();
  const [bulkTagOpen, setBulkTagOpen] = useState(false);
  const [bulkSearch, setBulkSearch] = useState('');

  const { data, isLoading, isError } = useCardContacts({
    cardId: selectedCardId !== 'all' ? selectedCardId : undefined,
    search: search || undefined,
    tags: filterTags.length > 0 ? filterTags.join(',') : undefined,
    page,
    limit: 20,
  });
  const { data: cards = [] } = useCards();

  const deleteContact = useDeleteContact();
  const importContactsCsv = useImportContactsCsv();

  const contacts = useMemo(() => data?.contacts ?? [], [data]);
  const pagination = data?.pagination;

  const { data: userTagsData } = useUserTags();

  const allTags = useMemo(() => {
    return userTagsData?.map((t) => t.name).sort() || [];
  }, [userTagsData]);

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
      const csv = await cardsApi.exportContacts({
        cardId: selectedCardId !== 'all' ? selectedCardId : undefined,
        search: search || undefined,
        tags: filterTags.length > 0 ? filterTags.join(',') : undefined,
      });
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

  const handleImportCsv = (file: File) => {
    if (selectedCardId === 'all') {
      toast.error('Select a card before importing contacts');
      return;
    }

    importContactsCsv.mutate(
      { cardId: selectedCardId, file },
      {
        onSuccess: (result) => {
          if (result.errors.length > 0) {
            toast.message(
              `Imported ${result.created}, skipped ${result.skipped}`,
              { description: result.errors.slice(0, 2).join(' · ') }
            );
          }
        },
      }
    );
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

  // Bulk tagging
  const handleBulkTag = async (tagId: string) => {
    // We already have `contacts: CardContact[]` in the component scope.
    const selectedContacts = contacts.filter((c) => selected.has(c.id));

    // Process attaches in parallel
    await Promise.all(
      selectedContacts.map((c) =>
        tagsApi.attachTagToContact(c.cardId, c.id, tagId).catch(() => {})
      )
    );

    // Invalidate queries so that the contacts list refetches
    qc.invalidateQueries({ queryKey: ['cards', 'contacts'] });
    qc.invalidateQueries({ queryKey: ['tags', 'contact'] }); // Invalidate individual row tags

    toast.success(`Tag applied to ${selected.size} contacts`);
    setBulkTagOpen(false);
    setSelected(new Set());
    setBulkSearch('');
  };

  const filteredTags = useMemo(() => {
    if (!bulkSearch.trim()) return userTagsData || [];
    const q = bulkSearch.toLowerCase();
    return (userTagsData || []).filter((t) => t.name.toLowerCase().includes(q));
  }, [userTagsData, bulkSearch]);

  return (
    <PageMotion>
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
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => csvInputRef.current?.click()}
            disabled={importContactsCsv.isPending}
          >
            Import CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-neutral-600 dark:text-neutral-400"
            onClick={handleExport}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
          <input
            ref={csvInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleImportCsv(file);
              e.currentTarget.value = '';
            }}
          />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900 text-sm text-neutral-950 dark:text-neutral-50
                       placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                       focus:outline-none focus:ring-1 focus:ring-neutral-300 dark:focus:ring-neutral-700
                       transition-shadow"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Select
            value={selectedCardId}
            onValueChange={(v) => {
              setSelectedCardId(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[160px] h-9 text-xs rounded-lg border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
              <SelectValue placeholder="All cards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All cards
              </SelectItem>
              {cards.map((card) => (
                <SelectItem
                  key={card.id}
                  value={card.id}
                  className="text-xs font-mono"
                >
                  /{card.slug}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-5">
            {allTags.map((tag) => {
              const active = filterTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setFilterTags((prev) =>
                      active ? prev.filter((t) => t !== tag) : [...prev, tag]
                    );
                    setPage(1);
                  }}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    active
                      ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {tag}
                  {active && <X className="w-2.5 h-2.5 shrink-0" />}
                </button>
              );
            })}
            {filterTags.length > 0 && (
              <button
                onClick={() => {
                  setFilterTags([]);
                  setPage(1);
                }}
                className="text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors ml-0.5"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Contact list */}
        {isError ? (
          <div className="text-center py-20">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Failed to load contacts
            </p>
          </div>
        ) : isLoading ? (
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

                          {/* Meetings chip + Tags */}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {contact.email && (
                              <ContactMeetingsChip
                                cardId={contact.cardId}
                                contactEmail={contact.email}
                              />
                            )}
                            <ContactRowTags
                              cardId={contact.cardId}
                              contactId={contact.id}
                            />
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

              <Popover open={bulkTagOpen} onOpenChange={setBulkTagOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-white/80 hover:text-white hover:bg-white/10 dark:text-neutral-900/80 dark:hover:text-neutral-900 dark:hover:bg-neutral-900/10"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    Tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={8}
                  className="w-64 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl z-50 mb-2"
                >
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      value={bulkSearch}
                      onChange={(e) => setBulkSearch(e.target.value)}
                      placeholder="Search tags…"
                      className="w-full pl-7 pr-2 py-1.5 text-sm bg-neutral-50 dark:bg-neutral-800 rounded-lg outline-none border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 placeholder:text-muted-foreground text-foreground"
                    />
                  </div>
                  <div className="max-h-44 overflow-y-auto">
                    {filteredTags.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-3">
                        {bulkSearch ? 'No tags match' : 'No tags available'}
                      </p>
                    )}
                    {filteredTags.map((tag) => (
                      <Button
                        key={tag.id}
                        variant="ghost"
                        onClick={() => handleBulkTag(tag.id)}
                        className="w-full justify-start gap-2.5 px-2 h-8 text-sm text-neutral-800 dark:text-neutral-200 font-normal"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: tag.color }}
                        />
                        <span className="flex-1 text-left truncate">
                          {tag.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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
    </PageMotion>
  );
}

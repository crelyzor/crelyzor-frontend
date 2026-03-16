import { useNavigate } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';
import {
  Plus,
  Eye,
  Users,
  MoreHorizontal,
  Copy,
  Trash2,
  Pause,
  Play,
  ExternalLink,
  CreditCard,
  QrCode,
  FileSignature,
  X,
  ArrowUpRight,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { useQueries } from '@tanstack/react-query';
import {
  useCards,
  useDeleteCard,
  useUpdateCard,
} from '@/hooks/queries/useCardQueries';
import { useUserTags } from '@/hooks/queries/useTagQueries';
import { tagsApi } from '@/services/tagsService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import { useState, useEffect, useMemo, useRef } from 'react';
import type { Card as CardType } from '@/types';
import type { Tag as TagType } from '@/types/meeting';
import { CardPreview } from '@/components/cards/CardPreview';
import { QRCodeDialog } from '@/components/cards/QRCodeDialog';
import { EmailSignatureDialog } from '@/components/cards/EmailSignatureDialog';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';

const CARDS_PUBLIC_URL =
  import.meta.env.VITE_CARDS_PUBLIC_URL ?? 'http://localhost:5174';

export default function Cards() {
  const navigate = useNavigate();
  const { data: cards, isLoading, isError } = useCards();
  const deleteCard = useDeleteCard();
  const updateCard = useUpdateCard();
  const { data: currentUser } = useCurrentUser();
  const { data: userTags } = useUserTags();
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [qrDialogCard, setQrDialogCard] = useState<CardType | null>(null);
  const [sigCard, setSigCard] = useState<CardType | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Batch-fetch tags for all cards in parallel
  const cardTagsMap = useQueries({
    queries: (cards ?? []).map((card) => ({
      queryKey: queryKeys.tags.byCard(card.id),
      queryFn: () => tagsApi.getCardTags(card.id),
    })),
    combine: (results): Map<string, TagType[]> => {
      const map = new Map<string, TagType[]>();
      (cards ?? []).forEach((card, i) => {
        map.set(card.id, results[i]?.data ?? []);
      });
      return map;
    },
  });

  const filteredCards = useMemo(() => {
    if (selectedTagIds.size === 0) return cards ?? [];
    return (cards ?? []).filter((card) => {
      const tags = cardTagsMap.get(card.id) ?? [];
      return [...selectedTagIds].some((id) => tags.some((t) => t.id === id));
    });
  }, [cards, cardTagsMap, selectedTagIds]);

  const openCard = (card: CardType) => {
    setClosing(false);
    setSelectedCard(card);
  };

  const closeCard = () => {
    setClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setSelectedCard(null);
      setClosing(false);
      closeTimerRef.current = null;
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCard) closeCard();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedCard]);

  const handleToggleActive = (card: CardType) => {
    updateCard.mutate(
      { id: card.id, data: { isActive: !card.isActive } },
      {
        onSuccess: () =>
          toast.success(card.isActive ? 'Card paused' : 'Card activated'),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteCard.mutate(id, { onSuccess: () => toast.success('Card deleted') });
    setMenuOpen(null);
  };

  const getCardUrl = (card: CardType) => {
    const username = currentUser?.username;
    if (!username) return `${CARDS_PUBLIC_URL}`;
    if (card.isDefault) return `${CARDS_PUBLIC_URL}/${username}`;
    return `${CARDS_PUBLIC_URL}/${username}/${card.slug}`;
  };

  return (
    <PageMotion>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
              Cards
            </h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              {isLoading ? (
                '—'
              ) : (
                <>
                  {cards?.length ?? 0} digital card
                  {(cards?.length ?? 0) !== 1 ? 's' : ''}
                  {selectedTagIds.size > 0 &&
                    ` (${filteredCards.length} shown)`}
                </>
              )}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            onClick={() => navigate('/cards/contacts')}
          >
            <Users className="w-4 h-4 mr-1.5" />
            Contacts
          </Button>
        </div>

        {/* Tag filters — only shown if user has tags */}
        {userTags && userTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-6">
            <Tag className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" />
            {userTags.map((tag) => {
              const active = selectedTagIds.has(tag.id);
              return (
                <Button
                  key={tag.id}
                  variant="ghost"
                  onClick={() =>
                    setSelectedTagIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(tag.id)) next.delete(tag.id);
                      else next.add(tag.id);
                      return next;
                    })
                  }
                  className={`flex items-center gap-1 px-2.5 py-1 h-auto rounded-full text-[11px] font-medium transition-all duration-150
                    ${
                      active
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-900 dark:hover:bg-neutral-100'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </Button>
              );
            })}
            {selectedTagIds.size > 0 && (
              <button
                onClick={() => setSelectedTagIds(new Set())}
                className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Cards grid */}
        {isError ? (
          <div className="text-center py-20">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              Failed to load cards
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                {/* Card preview shape — matches 1.586:1 credit card ratio */}
                <div
                  className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 w-full"
                  style={{ aspectRatio: '1.586 / 1' }}
                />
                {/* Stats bar */}
                <div className="flex items-center justify-between px-1 mt-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-8 bg-neutral-100 dark:bg-neutral-800 rounded" />
                    <div className="h-3 w-8 bg-neutral-100 dark:bg-neutral-800 rounded" />
                  </div>
                  <div className="h-3 w-12 bg-neutral-100 dark:bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !cards?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center py-20"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <CreditCard className="w-7 h-7 text-neutral-400 dark:text-neutral-500" />
            </div>
            <h3 className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-1">
              No cards yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-xs mx-auto">
              Create your first digital card and start sharing your contact info
              with a QR code.
            </p>
            <Button
              onClick={() => navigate('/cards/create')}
              className="h-10 px-5 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200
                       text-white dark:text-neutral-900 text-sm font-medium gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Card
            </Button>
          </motion.div>
        ) : filteredCards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <CreditCard className="w-9 h-9 mx-auto text-neutral-200 dark:text-neutral-700 mb-3" />
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              No cards match the selected tags
            </p>
            <button
              onClick={() => setSelectedTagIds(new Set())}
              className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 mt-2 transition-colors"
            >
              Clear filter
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
            {filteredCards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: i * 0.07,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={`relative group transition-opacity ${!card.isActive ? 'opacity-60' : ''}`}
              >
                {/* Card preview */}
                <div
                  className="cursor-pointer rounded-2xl overflow-hidden active:scale-[0.97] transition-transform duration-150 ease-out"
                  style={{
                    boxShadow:
                      '0 4px 24px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)',
                  }}
                  onClick={() => openCard(card)}
                >
                  <CardPreview
                    displayName={card.displayName}
                    title={card.title ?? undefined}
                    bio={card.bio ?? undefined}
                    avatarUrl={card.avatarUrl}
                    coverUrl={card.coverUrl}
                    links={card.links}
                    contactFields={card.contactFields}
                    theme={card.theme}
                    htmlContent={card.htmlContent}
                    htmlBackContent={card.htmlBackContent}
                  />
                </div>

                {/* Badges */}
                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 z-[5]">
                  {card.isDefault && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-sm"
                    >
                      Default
                    </Badge>
                  )}
                  {!card.isActive && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 text-neutral-400 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-sm"
                    >
                      Paused
                    </Badge>
                  )}
                </div>

                {/* Action buttons — visible on hover */}
                <div className="absolute top-2.5 right-3 flex items-center gap-1 z-[5] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrDialogCard(card);
                    }}
                    className="p-1.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-sm
                             text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-colors"
                    title="Download QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === card.id ? null : card.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-sm
                               text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-colors"
                      title="More options"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>

                    {menuOpen === card.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(null);
                          }}
                        />
                        <div className="absolute right-0 top-9 z-20 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-1 overflow-hidden">
                          {[
                            {
                              icon: ExternalLink,
                              label: 'Edit card',
                              action: () => {
                                openCard(card);
                                setMenuOpen(null);
                              },
                            },
                            {
                              icon: Copy,
                              label: 'Copy link',
                              action: () => {
                                navigator.clipboard.writeText(getCardUrl(card));
                                toast.success('Link copied');
                                setMenuOpen(null);
                              },
                            },
                            {
                              icon: QrCode,
                              label: 'Download QR',
                              action: () => {
                                setQrDialogCard(card);
                                setMenuOpen(null);
                              },
                            },
                            {
                              icon: Eye,
                              label: 'Analytics',
                              action: () => {
                                navigate(`/cards/${card.id}/analytics`);
                                setMenuOpen(null);
                              },
                            },
                            {
                              icon: FileSignature,
                              label: 'Email Signature',
                              action: () => {
                                setSigCard(card);
                                setMenuOpen(null);
                              },
                            },
                          ].map(({ icon: Icon, label, action }) => (
                            <button
                              key={label}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                action();
                              }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {label}
                            </button>
                          ))}
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(card);
                              setMenuOpen(null);
                            }}
                          >
                            {card.isActive ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                Pause card
                              </>
                            ) : (
                              <>
                                <Play className="w-3.5 h-3.5" />
                                Activate card
                              </>
                            )}
                          </button>
                          <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(card.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete card
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Stats bar */}
                <div className="flex items-center justify-between px-1 mt-2.5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                      <Eye className="w-3 h-3" />
                      <span>{card._count?.views ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                      <Users className="w-3 h-3" />
                      <span>{card._count?.contacts ?? 0}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-600">
                    /{card.slug}
                  </span>
                </div>

                {/* Tag chips */}
                {(cardTagsMap.get(card.id) ?? []).length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap px-1">
                    {(cardTagsMap.get(card.id) ?? []).map((tag) => (
                      <span
                        key={tag.id}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Floating CTA */}
        {(cards?.length ?? 0) > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.3,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <Button
                onClick={() => navigate('/cards/create')}
                className="h-11 px-5 rounded-full bg-neutral-950 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200
                         text-white dark:text-neutral-900 shadow-lg shadow-neutral-900/20 dark:shadow-neutral-100/10
                         text-sm font-medium gap-2 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                New Card
              </Button>
            </motion.div>
          </div>
        )}

        {qrDialogCard && (
          <QRCodeDialog
            open={!!qrDialogCard}
            onOpenChange={(open) => !open && setQrDialogCard(null)}
            cardUrl={getCardUrl(qrDialogCard)}
            cardName={qrDialogCard.displayName}
          />
        )}

        {sigCard && (
          <EmailSignatureDialog
            open={!!sigCard}
            onOpenChange={(open) => !open && setSigCard(null)}
            card={sigCard}
          />
        )}
      </div>

      {/* ── Card detail modal — springs open like CommandPalette ── */}
      {selectedCard && (
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px] ${closing ? 'animate-out fade-out-0 duration-180' : 'animate-in fade-in-0 duration-200'}`}
            onClick={closeCard}
          />

          {/* Panel */}
          <div
            className={`fixed z-50 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-[10%] sm:top-[8%] sm:w-[480px]
              bg-white dark:bg-neutral-900
              ring-1 ring-neutral-200/80 dark:ring-neutral-700/60
              shadow-2xl shadow-neutral-900/30 dark:shadow-neutral-950/80
              rounded-2xl overflow-hidden
              ${closing ? 'card-spring-out' : 'card-spring-in'}`}
          >
            {/* Card preview at top */}
            <div className="p-4 bg-neutral-950">
              <CardPreview
                displayName={selectedCard.displayName}
                title={selectedCard.title ?? undefined}
                bio={selectedCard.bio ?? undefined}
                avatarUrl={selectedCard.avatarUrl}
                coverUrl={selectedCard.coverUrl}
                links={selectedCard.links}
                contactFields={selectedCard.contactFields}
                theme={selectedCard.theme}
                htmlContent={selectedCard.htmlContent}
                htmlBackContent={selectedCard.htmlBackContent}
              />
            </div>

            {/* Card info + actions */}
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 truncate">
                    {selectedCard.displayName}
                  </h2>
                  {selectedCard.title && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                      {selectedCard.title}
                    </p>
                  )}
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-1 font-mono">
                    /{selectedCard.slug}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {selectedCard.isDefault && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800"
                    >
                      Default
                    </Badge>
                  )}
                  {!selectedCard.isActive && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-2 py-0.5 text-neutral-400"
                    >
                      Paused
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{selectedCard._count?.views ?? 0} views</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{selectedCard._count?.contacts ?? 0} contacts</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1 h-9 rounded-xl text-xs font-medium bg-neutral-950 dark:bg-neutral-50 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 gap-1.5"
                  onClick={() => {
                    closeCard();
                    setTimeout(
                      () => navigate(`/cards/${selectedCard.id}`),
                      200
                    );
                  }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Edit card
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl p-0 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                  onClick={() => {
                    navigator.clipboard.writeText(getCardUrl(selectedCard));
                    toast.success('Link copied');
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl p-0 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                  onClick={() => {
                    closeCard();
                    setTimeout(() => setQrDialogCard(selectedCard), 200);
                  }}
                >
                  <QrCode className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl p-0 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                  onClick={closeCard}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </PageMotion>
  );
}

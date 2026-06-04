// Aesthetic: collapsed accordion rows per member — compact by default,
// expands to show card grid on click. Dense, scannable, handles any card count.
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowUpRight,
  ExternalLink,
  Copy,
  QrCode,
  RotateCcw,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardPreview } from '@/components/cards/CardPreview';
import { QRCodeDialog } from '@/components/cards/QRCodeDialog';
import { useTeamCards } from '@/hooks/queries/useTeamQueries';
import { useDeleteCard } from '@/hooks/queries/useCardQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import { CARDS_PUBLIC_URL } from '@/lib/publicUrl';
import type {
  TeamRole,
  TeamCardRow,
  TeamCardEntry,
  TeamSummary,
} from '@/services/teamService';

interface Props {
  teamId: string;
  role: TeamRole;
  team: TeamSummary;
}

function getCardUrl(
  card: TeamCardRow,
  teamSlug: string,
  username?: string | null
): string {
  if (username) return `${CARDS_PUBLIC_URL}/t/${teamSlug}/${username}/${card.slug}`;
  return `${CARDS_PUBLIC_URL}/t/${teamSlug}/${card.slug}`;
}


function MemberAccordionRow({
  member,
  role,
  cards,
  myId,
  onOpen,
  onCreateCard,
  defaultExpanded,
}: {
  member: TeamCardEntry['member'];
  role: TeamRole;
  cards: TeamCardRow[];
  myId: string | undefined;
  onOpen: (card: TeamCardRow, username: string | null) => void;
  onCreateCard: () => void;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isMe = member.id === myId;
  const hasCards = cards.length > 0;

  const roleLabel =
    role === 'OWNER' ? 'Owner' : role === 'ADMIN' ? 'Admin' : 'Member';
  const initials = (member.name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleHeaderClick = () => {
    if (hasCards) {
      setExpanded((v) => !v);
    } else if (isMe) {
      onCreateCard();
    }
  };

  return (
    <div className="border-b border-neutral-800/40 last:border-b-0">
      {/* Collapsed header */}
      <button
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors duration-100
          ${hasCards || isMe ? 'cursor-pointer hover:bg-neutral-900/40' : 'cursor-default'}`}
        onClick={handleHeaderClick}
        disabled={!hasCards && !isMe}
      >
        {/* Avatar */}
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            className="w-7 h-7 rounded-full object-cover shrink-0"
            alt=""
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-semibold text-neutral-400 shrink-0 select-none">
            {initials}
          </div>
        )}

        {/* Name + designation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-medium text-neutral-200 leading-tight truncate">
              {member.name ?? 'Team member'}
            </span>
            {isMe && (
              <span className="text-[9px] text-neutral-600 shrink-0 leading-tight">
                you
              </span>
            )}
          </div>
          <span className="text-[10px] text-neutral-600 leading-tight">
            {member.designation ?? roleLabel}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          {hasCards ? (
            <>
              <span className="text-[10px] text-neutral-600 tabular-nums">
                {cards.length} card{cards.length !== 1 ? 's' : ''}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-600 transition-transform duration-200 ${
                  expanded ? 'rotate-180' : ''
                }`}
              />
            </>
          ) : isMe ? (
            <span className="text-[10px] text-neutral-600">+ Add card</span>
          ) : (
            <span className="text-[10px] text-neutral-700">No card yet</span>
          )}
        </div>
      </button>

      {/* Expanded card grid */}
      <AnimatePresence initial={false}>
        {expanded && hasCards && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pt-1 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="cursor-pointer rounded-2xl overflow-hidden active:scale-[0.97] transition-transform duration-150"
                    style={{
                      boxShadow:
                        '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.07)',
                    }}
                    onClick={() => onOpen(card, member.username)}
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
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CardsSection({ teamId, team }: Props) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: currentUser } = useCurrentUser();
  const { data, isLoading, isError } = useTeamCards(teamId);
  const deleteCard = useDeleteCard();

  const [selectedCard, setSelectedCard] = useState<TeamCardRow | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [closing, setClosing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [qrDialogCard, setQrDialogCard] = useState<TeamCardRow | null>(null);
  const [qrDialogUsername, setQrDialogUsername] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (actionTimerRef.current) clearTimeout(actionTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCard) closeCard();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedCard]);

  const openCard = (card: TeamCardRow, username?: string | null) => {
    setClosing(false);
    setFlipped(false);
    setConfirmDelete(false);
    setSelectedCard(card);
    setSelectedUsername(username ?? null);
  };

  const closeCard = () => {
    setClosing(true);
    setConfirmDelete(false);
    closeTimerRef.current = setTimeout(() => {
      setSelectedCard(null);
      setClosing(false);
      closeTimerRef.current = null;
    }, 180);
  };

  const myId = currentUser?.id;

  const canEditCard = (card: TeamCardRow) => card.userId === myId;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-3 w-20 bg-neutral-800 rounded" />
        <div
          className="rounded-2xl bg-neutral-800 w-72"
          style={{ aspectRatio: '1.586 / 1' }}
        />
        <div className="h-3 w-24 bg-neutral-800 rounded mt-6" />
        <div className="rounded-2xl border border-neutral-800/50 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-800/30 last:border-b-0"
            >
              <div className="w-7 h-7 rounded-full bg-neutral-800 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 bg-neutral-800 rounded" />
                <div className="h-2.5 w-16 bg-neutral-800/60 rounded" />
              </div>
              <div className="h-2.5 w-12 bg-neutral-800/60 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-neutral-400 dark:text-neutral-500 py-8 text-center">
        Failed to load cards
      </p>
    );
  }

  const { memberCards } = data!;

  return (
    <>
      <div className="space-y-8">
        {/* ── Member Cards ── */}
        <section>
          <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Members · {memberCards.length}
          </h2>
          {memberCards.length === 0 ? (
            <p className="text-sm text-neutral-600 py-4">No members yet</p>
          ) : (
            <div className="rounded-2xl border border-neutral-800/50 overflow-hidden">
              {memberCards.map(({ member, role: memberRole, cards }) => (
                <MemberAccordionRow
                  key={member.id}
                  member={member}
                  role={memberRole}
                  cards={cards}
                  myId={myId}
                  onOpen={openCard}
                  onCreateCard={() => navigate('/cards/create')}
                  defaultExpanded={member.id === myId && cards.length > 0}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Card detail panel ── */}
      {selectedCard && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={closeCard}
          />
          <div
            className={`fixed z-50 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-[10%] sm:top-[8%] sm:w-[480px]
              bg-white dark:bg-neutral-900
              ring-1 ring-neutral-200/80 dark:ring-neutral-700/60
              shadow-2xl shadow-neutral-900/30 dark:shadow-neutral-950/80
              rounded-2xl overflow-hidden
              ${closing ? 'card-spring-out' : 'card-spring-in'}`}
          >
            <div
              className="p-4 bg-neutral-950 cursor-pointer relative select-none"
              onClick={() => setFlipped((f) => !f)}
              title={flipped ? 'Click to see front' : 'Click to flip'}
            >
              <div style={{ perspective: '1200px' }}>
                <div
                  style={{
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div style={{ backfaceVisibility: 'hidden' }}>
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
                      face="front"
                    />
                  </div>
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      position: 'absolute',
                      inset: 0,
                    }}
                  >
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
                      face="back"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 pointer-events-none">
                <RotateCcw className="w-3 h-3 text-white/25" />
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 truncate">
                  {selectedCard.displayName}
                </h2>
                {selectedCard.title && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                    {selectedCard.title}
                  </p>
                )}
                <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-1 font-mono">
                  {selectedUsername
                    ? `/t/${team.slug}/${selectedUsername}/${selectedCard.slug}`
                    : `/t/${team.slug}/${selectedCard.slug}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {canEditCard(selectedCard) && (
                  <Button
                    size="sm"
                    className="flex-1 h-9 rounded-xl text-xs font-medium bg-neutral-950 dark:bg-neutral-50 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 gap-1.5"
                    onClick={() => {
                      closeCard();
                      if (actionTimerRef.current)
                        clearTimeout(actionTimerRef.current);
                      actionTimerRef.current = setTimeout(
                        () => navigate(`/cards/${selectedCard.id}`),
                        200
                      );
                    }}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Edit card
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl p-0 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                  title="Open public card"
                  onClick={() =>
                    window.open(
                      getCardUrl(selectedCard, team.slug, selectedUsername),
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 rounded-xl p-0 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      getCardUrl(selectedCard, team.slug, selectedUsername)
                    );
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
                    if (actionTimerRef.current)
                      clearTimeout(actionTimerRef.current);
                    actionTimerRef.current = setTimeout(() => {
                      setQrDialogCard(selectedCard);
                      setQrDialogUsername(selectedUsername);
                    }, 200);
                  }}
                >
                  <QrCode className="w-3.5 h-3.5" />
                </Button>

                {canEditCard(selectedCard) && (
                  <div className="ml-auto">
                    {confirmDelete ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                          Delete?
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 rounded-lg text-[11px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                          disabled={deleteCard.isPending}
                          onClick={() => {
                            deleteCard.mutate(selectedCard.id, {
                              onSuccess: () => {
                                qc.invalidateQueries({
                                  queryKey: queryKeys.teams.cards(teamId),
                                });
                                toast.success('Card deleted');
                                closeCard();
                              },
                            });
                          }}
                        >
                          {deleteCard.isPending ? '…' : 'Yes'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 rounded-lg text-[11px] text-neutral-500"
                          onClick={() => setConfirmDelete(false)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl p-0 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete card"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {qrDialogCard && (
        <QRCodeDialog
          open={!!qrDialogCard}
          onOpenChange={(open) => {
            if (!open) {
              setQrDialogCard(null);
              setQrDialogUsername(null);
            }
          }}
          cardUrl={getCardUrl(qrDialogCard, team.slug, qrDialogUsername)}
          cardName={qrDialogCard.displayName}
        />
      )}
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ArrowUpRight,
  ExternalLink,
  Copy,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardPreview } from '@/components/cards/CardPreview';
import { QRCodeDialog } from '@/components/cards/QRCodeDialog';
import { useTeamCards } from '@/hooks/queries/useTeamQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
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

function getCardUrl(card: TeamCardRow, teamSlug: string): string {
  return `${CARDS_PUBLIC_URL}/t/${teamSlug}/${card.slug}`;
}

function CardTile({
  card,
  canEdit,
  onOpen,
}: {
  card: TeamCardRow;
  canEdit: boolean;
  onOpen: (card: TeamCardRow) => void;
}) {
  return (
    <div className="relative group">
      <div
        className="cursor-pointer rounded-2xl overflow-hidden active:scale-[0.97] transition-transform duration-150 ease-out"
        style={{
          boxShadow: '0 4px 24px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
        onClick={() => onOpen(card)}
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
      <div className="mt-2 px-1 flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
          {card.displayName}
        </p>
        {canEdit && (
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
            yours
          </span>
        )}
      </div>
    </div>
  );
}

function NoCardPlaceholder({
  member,
}: {
  member: TeamCardEntry['member'];
}) {
  return (
    <div className="relative">
      <div
        className="rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-dashed border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center"
        style={{ aspectRatio: '1.586 / 1' }}
      >
        <CreditCard className="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
      </div>
      <div className="mt-2 px-1">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">
          {member.name ?? 'Team member'}
        </p>
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">No card yet</p>
      </div>
    </div>
  );
}

export function CardsSection({ teamId, role, team }: Props) {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { data, isLoading, isError } = useTeamCards(teamId);

  const [selectedCard, setSelectedCard] = useState<TeamCardRow | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [closing, setClosing] = useState(false);
  const [qrDialogCard, setQrDialogCard] = useState<TeamCardRow | null>(null);
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
  }, [selectedCard]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCard = (card: TeamCardRow) => {
    setClosing(false);
    setFlipped(false);
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

  const isAdminOrOwner = role === 'OWNER' || role === 'ADMIN';
  const myId = currentUser?.id;

  const canEditCard = (card: TeamCardRow) => card.userId === myId;

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded" />
        <div
          className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 w-full"
          style={{ aspectRatio: '1.586 / 1' }}
        />
        <div className="h-4 w-28 bg-neutral-100 dark:bg-neutral-800 rounded mt-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-neutral-100 dark:bg-neutral-800"
              style={{ aspectRatio: '1.586 / 1' }}
            />
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

  const { teamCard, memberCards } = data!;

  return (
    <>
      <div className="space-y-8">
        {/* ── Team Card ── */}
        <section>
          <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Team Card
          </h2>
          {teamCard ? (
            <div className="max-w-xs">
              <CardTile
                card={teamCard}
                canEdit={isAdminOrOwner}
                onOpen={openCard}
              />
            </div>
          ) : isAdminOrOwner ? (
            <div
              className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-dashed border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center gap-2 max-w-xs cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              style={{ aspectRatio: '1.586 / 1' }}
              onClick={() => navigate('/cards/create')}
            >
              <CreditCard className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                Create team card
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-dashed border-neutral-200 dark:border-neutral-700 flex items-center justify-center max-w-xs"
              style={{ aspectRatio: '1.586 / 1' }}
            >
              <p className="text-xs text-neutral-400 dark:text-neutral-500">
                No team card yet
              </p>
            </div>
          )}
        </section>

        {/* ── Member Cards ── */}
        <section>
          <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
            Member Cards · {memberCards.length}
          </h2>
          {memberCards.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              No other members yet
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {memberCards.map(({ member, card }) =>
                card ? (
                  <CardTile
                    key={member.id}
                    card={card}
                    canEdit={canEditCard(card)}
                    onOpen={openCard}
                  />
                ) : (
                  <NoCardPlaceholder key={member.id} member={member} />
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {/* ── Card flip panel overlay ── */}
      {selectedCard && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
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
            {/* Card preview — click to flip */}
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

            {/* Card info + actions */}
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
                  /t/{team.slug}/{selectedCard.slug}
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
                        200,
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
                      getCardUrl(selectedCard, team.slug),
                      '_blank',
                      'noopener,noreferrer',
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
                      getCardUrl(selectedCard, team.slug),
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
                    actionTimerRef.current = setTimeout(
                      () => setQrDialogCard(selectedCard),
                      200,
                    );
                  }}
                >
                  <QrCode className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* QR dialog */}
      {qrDialogCard && (
        <QRCodeDialog
          open={!!qrDialogCard}
          onOpenChange={(open) => !open && setQrDialogCard(null)}
          cardUrl={getCardUrl(qrDialogCard, team.slug)}
          cardName={qrDialogCard.displayName}
        />
      )}
    </>
  );
}

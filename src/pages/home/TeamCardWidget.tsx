import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowUpRight, Pencil, X, RotateCcw } from 'lucide-react';
import { useTeamCards } from '@/hooks/queries/useTeamQueries';
import { CardPreview } from '@/components/cards/CardPreview';
import { Button } from '@/components/ui/button';

interface Props {
  teamId: string;
}

export function TeamCardWidget({ teamId }: Props) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useTeamCards(teamId);
  const [show3D, setShow3D] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const teamCard = data?.teamCard ?? null;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 animate-pulse">
        <div className="h-2.5 w-20 bg-neutral-100 dark:bg-neutral-800 rounded mb-3" />
        <div className="aspect-[1.586/1] rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <p className="text-[12px] text-neutral-400 dark:text-neutral-500 text-center">
          Could not load team card
        </p>
      </div>
    );
  }

  if (!teamCard) {
    return (
      <Button
        variant="ghost"
        onClick={() => navigate(`/teams/${teamId}/settings?tab=cards`)}
        className="w-full h-auto rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900
                   p-6 flex flex-col items-center text-center hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <CreditCard className="w-4.5 h-4.5 text-neutral-400" />
        </div>
        <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Set a team card
        </p>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
          Add a shared card that represents your team
        </p>
      </Button>
    );
  }

  const hasFront = !!teamCard.htmlContent;
  const hasBack = !!teamCard.htmlBackContent;

  return (
    <>
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[10px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 uppercase font-medium">
              Team Card
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate(`/teams/${teamId}/settings?tab=cards`)}
              aria-label="Edit team card"
            >
              <Pencil className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate(`/teams/${teamId}/settings?tab=cards`)}
              aria-label="Team cards"
            >
              <ArrowUpRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <div
          className="px-3 py-3 cursor-pointer"
          onClick={() => {
            setFlipped(false);
            setShow3D(true);
          }}
        >
          <div className="rounded-xl overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-700 transition-transform hover:scale-[1.01] duration-200">
            <CardPreview
              displayName={teamCard.displayName}
              title={teamCard.title ?? undefined}
              bio={teamCard.bio ?? undefined}
              avatarUrl={teamCard.avatarUrl}
              coverUrl={teamCard.coverUrl}
              links={teamCard.links}
              contactFields={teamCard.contactFields}
              theme={teamCard.theme}
              htmlContent={teamCard.htmlContent}
              htmlBackContent={teamCard.htmlBackContent}
            />
          </div>
          <p className="text-[9px] text-neutral-300 dark:text-neutral-700 text-center mt-2">
            Click to preview in 3D
          </p>
        </div>
      </div>

      {show3D && (hasFront || hasBack) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShow3D(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShow3D(false)}
              aria-label="Close preview"
              className="absolute -top-10 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
            {hasBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFlipped(!flipped)}
                className="absolute -top-10 left-0 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Flip
              </Button>
            )}
            <div style={{ perspective: '1200px' }}>
              <div
                className="w-[340px] sm:w-[480px] transition-transform duration-700 cursor-pointer"
                onClick={() => hasBack && setFlipped(!flipped)}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      aspectRatio: '1.586 / 1',
                      boxShadow:
                        '0 0 0 1px rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.4)',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: teamCard.htmlContent || '',
                    }}
                  />
                </div>
                {hasBack && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{
                        aspectRatio: '1.586 / 1',
                        boxShadow:
                          '0 0 0 1px rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.4)',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: teamCard.htmlBackContent || '',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-white/40 text-[10px] mt-4">
              {hasBack
                ? 'Click the card or "Flip" to rotate'
                : 'Click anywhere to close'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

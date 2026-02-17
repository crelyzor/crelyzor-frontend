import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowUpRight, X, RotateCcw } from 'lucide-react';
import { useCards } from '@/hooks/queries/useCardQueries';
import { CardPreview } from '@/components/cards/CardPreview';

export function DefaultCardWidget() {
  const navigate = useNavigate();
  const { data: cards, isLoading } = useCards();
  const [show3D, setShow3D] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const defaultCard = cards?.find((c) => c.isDefault) ?? cards?.[0];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
        <div className="h-4 w-24 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse mb-3" />
        <div className="aspect-[1.586/1] rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      </div>
    );
  }

  if (!defaultCard) {
    return (
      <div
        onClick={() => navigate('/cards/create')}
        className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900
                   p-6 flex flex-col items-center text-center cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <CreditCard className="w-5 h-5 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Create your card
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Share your contact info with a digital business card
        </p>
      </div>
    );
  }

  const hasFront = !!defaultCard.htmlContent;
  const hasBack = !!defaultCard.htmlBackContent;

  return (
    <>
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Your Card
          </h3>
          <button
            onClick={() => navigate('/cards')}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div
          className="px-3 pb-3 cursor-pointer"
          onClick={() => {
            setFlipped(false);
            setShow3D(true);
          }}
        >
          <div className="rounded-xl overflow-hidden ring-1 ring-white/10 transition-transform hover:scale-[1.02]">
            <CardPreview
              displayName={defaultCard.displayName}
              title={defaultCard.title ?? undefined}
              bio={defaultCard.bio ?? undefined}
              avatarUrl={defaultCard.avatarUrl}
              coverUrl={defaultCard.coverUrl}
              links={defaultCard.links}
              contactFields={defaultCard.contactFields}
              theme={defaultCard.theme}
              htmlContent={defaultCard.htmlContent}
              htmlBackContent={defaultCard.htmlBackContent}
            />
          </div>
        </div>
      </div>

      {/* 3D Flip Modal */}
      {show3D && (hasFront || hasBack) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShow3D(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Close */}
            <button
              onClick={() => setShow3D(false)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Flip toggle */}
            {hasBack && (
              <button
                onClick={() => setFlipped(!flipped)}
                className="absolute -top-10 left-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Flip
              </button>
            )}

            {/* 3D card */}
            <div style={{ perspective: '1200px' }}>
              <div
                className="w-[340px] sm:w-[480px] transition-transform duration-700 cursor-pointer"
                onClick={() => hasBack && setFlipped(!flipped)}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front */}
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
                      __html: defaultCard.htmlContent || '',
                    }}
                  />
                </div>

                {/* Back */}
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
                        __html: defaultCard.htmlBackContent || '',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-white/40 text-[11px] mt-4">
              Click &ldquo;Flip&rdquo; or press the card to rotate
            </p>
          </div>
        </div>
      )}
    </>
  );
}

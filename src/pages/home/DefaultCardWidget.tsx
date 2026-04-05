import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowUpRight, X, RotateCcw, Pencil } from 'lucide-react';
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
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 animate-pulse">
        <div className="h-2.5 w-16 bg-neutral-100 dark:bg-neutral-800 rounded mb-3" />
        <div className="aspect-[1.586/1] rounded-xl bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  if (!defaultCard) {
    return (
      <button
        onClick={() => navigate('/cards/create')}
        className="w-full rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900
                   p-6 flex flex-col items-center text-center cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors group"
      >
        <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <CreditCard className="w-4.5 h-4.5 text-neutral-400" />
        </div>
        <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Create your card
        </p>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
          Share your contact info with a digital business card
        </p>
      </button>
    );
  }

  const hasFront = !!defaultCard.htmlContent;
  const hasBack = !!defaultCard.htmlBackContent;

  return (
    <>
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[10px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 uppercase font-medium">
              Your Card
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/cards/${defaultCard.id}`)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Edit card"
            >
              <Pencil className="w-3 h-3" />
            </button>
            <button
              onClick={() => navigate('/cards')}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="All cards"
            >
              <ArrowUpRight className="w-3 h-3" />
            </button>
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
          <p className="text-[9px] text-neutral-300 dark:text-neutral-700 text-center mt-2">
            Click to preview in 3D
          </p>
        </div>
      </div>

      {/* 3D Flip Modal */}
      {show3D && (hasFront || hasBack) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShow3D(false)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShow3D(false)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {hasBack && (
              <button
                onClick={() => setFlipped(!flipped)}
                className="absolute -top-10 left-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Flip
              </button>
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
                <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      aspectRatio: '1.586 / 1',
                      boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.4)',
                    }}
                    dangerouslySetInnerHTML={{ __html: defaultCard.htmlContent || '' }}
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
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 30px rgba(0,0,0,0.4)',
                      }}
                      dangerouslySetInnerHTML={{ __html: defaultCard.htmlBackContent || '' }}
                    />
                  </div>
                )}
              </div>
            </div>
            <p className="text-center text-white/40 text-[10px] mt-4">
              {hasBack ? 'Click the card or "Flip" to rotate' : 'Click anywhere to close'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

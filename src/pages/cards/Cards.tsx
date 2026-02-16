import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCards, useDeleteCard, useUpdateCard } from '@/hooks/queries/useCardQueries';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Card as CardType } from '@/types';

export default function Cards() {
  const navigate = useNavigate();
  const { data: cards, isLoading } = useCards();
  const deleteCard = useDeleteCard();
  const updateCard = useUpdateCard();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

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
    deleteCard.mutate(id, {
      onSuccess: () => toast.success('Card deleted'),
    });
    setMenuOpen(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Cards
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {cards?.length ?? 0} digital card{cards?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-neutral-600 dark:text-neutral-400"
          onClick={() => navigate('/cards/contacts')}
        >
          <Users className="w-4 h-4 mr-1.5" />
          Contacts
        </Button>
      </div>

      {/* Card list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
            />
          ))}
        </div>
      ) : !cards?.length ? (
        <div className="text-center py-20">
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
        </div>
      ) : (
        <div className="space-y-3 pb-24">
          {cards.map((card) => (
            <Card
              key={card.id}
              className={`p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all
                hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer
                ${!card.isActive ? 'opacity-60' : ''}`}
              onClick={() => navigate(`/cards/${card.id}`)}
            >
              <div className="px-4 py-3.5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {card.avatarUrl ? (
                        <img
                          src={card.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                          {card.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 truncate">
                          {card.displayName}
                        </h3>
                        {card.isDefault && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0"
                          >
                            Default
                          </Badge>
                        )}
                        {!card.isActive && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 text-neutral-400"
                          >
                            Paused
                          </Badge>
                        )}
                      </div>
                      {card.title && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                          {card.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === card.id ? null : card.id);
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                    </Button>

                    {menuOpen === card.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(null);
                          }}
                        />
                        <div className="absolute right-0 top-9 z-20 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg py-1">
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/cards/${card.id}`);
                              setMenuOpen(null);
                            }}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Edit card
                          </button>
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(
                                `${window.location.origin}/c/${card.slug}`
                              );
                              toast.success('Link copied');
                              setMenuOpen(null);
                            }}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy link
                          </button>
                          <button
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
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
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
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

                {/* Stats row */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{card._count?.views ?? 0} views</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{card._count?.contacts ?? 0} contacts</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>/{card.slug}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Floating CTA */}
      {(cards?.length ?? 0) > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
          <Button
            onClick={() => navigate('/cards/create')}
            className="h-12 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200
                       text-white dark:text-neutral-900 shadow-xl shadow-neutral-900/20 dark:shadow-neutral-100/10
                       text-sm font-medium gap-2"
          >
            <Plus className="w-4 h-4" />
            New Card
          </Button>
        </div>
      )}
    </div>
  );
}

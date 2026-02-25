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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import {
  useCards,
  useDeleteCard,
  useUpdateCard,
} from '@/hooks/queries/useCardQueries';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Card as CardType } from '@/types';
import { CardPreview } from '@/components/cards/CardPreview';
import { QRCodeDialog } from '@/components/cards/QRCodeDialog';
import { EmailSignatureDialog } from '@/components/cards/EmailSignatureDialog';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';

const CARDS_PUBLIC_URL =
  import.meta.env.VITE_CARDS_PUBLIC_URL ?? 'http://localhost:5174';

export default function Cards() {
  const navigate = useNavigate();
  const { data: cards, isLoading } = useCards();
  const deleteCard = useDeleteCard();
  const updateCard = useUpdateCard();
  const { data: currentUser } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [qrDialogCard, setQrDialogCard] = useState<CardType | null>(null);
  const [sigCard, setSigCard] = useState<CardType | null>(null);

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
              {cards?.length ?? 0} digital card{cards?.length !== 1 ? 's' : ''}
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

        {/* Cards grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
              />
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
            {cards.map((card, i) => (
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
                  className="cursor-pointer transition-transform duration-200 hover:scale-[1.02] rounded-2xl overflow-hidden"
                  style={{
                    boxShadow:
                      '0 4px 24px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.06)',
                  }}
                  onClick={() => navigate(`/cards/${card.id}`)}
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
                                navigate(`/cards/${card.id}`);
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
    </PageMotion>
  );
}

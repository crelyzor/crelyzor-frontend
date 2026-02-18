import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  Copy,
  Pencil,
  Trash2,
  ExternalLink,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useEventTypes,
  useDeleteEventType,
  useToggleEventType,
} from '@/hooks/queries/useEventTypeQueries';
import { toast } from 'sonner';
import { useState } from 'react';
import type { EventType } from '@/types';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';

const APP_URL = import.meta.env.VITE_APP_URL ?? window.location.origin;

export default function EventTypes() {
  const navigate = useNavigate();
  const { data: eventTypes, isLoading } = useEventTypes();
  const { data: user } = useCurrentUser();
  const deleteEventType = useDeleteEventType();
  const toggleEventType = useToggleEventType();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const handleToggle = (et: EventType) => {
    toggleEventType.mutate(et.id, {
      onSuccess: () =>
        toast.success(et.isActive ? 'Event type disabled' : 'Event type enabled'),
    });
  };

  const handleDelete = (id: string) => {
    deleteEventType.mutate(id, {
      onSuccess: () => toast.success('Event type deleted'),
    });
    setMenuOpen(null);
  };

  const getBookingUrl = (et: EventType) => {
    if (!user?.username) return '';
    return `${APP_URL}/book/${user.username}/${et.slug}`;
  };

  const handleCopyLink = (et: EventType) => {
    const url = getBookingUrl(et);
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success('Booking link copied!');
    }
    setMenuOpen(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Event Types
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {eventTypes?.length ?? 0} event type
            {eventTypes?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={() => navigate('/event-types/create')}
          className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 gap-2"
        >
          <Plus className="w-4 h-4" />
          New Event Type
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-neutral-400 dark:text-neutral-500 text-sm">
          Loading...
        </div>
      )}

      {/* Empty */}
      {!isLoading && (!eventTypes || eventTypes.length === 0) && (
        <div className="text-center py-16">
          <Clock
            className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <h2 className="text-lg font-medium text-neutral-950 dark:text-neutral-50 mb-1">
            No event types yet
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            Create your first event type so people can book time with you.
          </p>
          <Button
            onClick={() => navigate('/event-types/create')}
            className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Event Type
          </Button>
        </div>
      )}

      {/* List */}
      {eventTypes && eventTypes.length > 0 && (
        <div className="space-y-3">
          {eventTypes.map((et) => (
            <div
              key={et.id}
              className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Color indicator */}
                <div
                  className={`w-1.5 h-12 rounded-full ${
                    et.isActive
                      ? 'bg-emerald-500'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-neutral-950 dark:text-neutral-50 truncate">
                      {et.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        et.isActive
                          ? 'border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400'
                          : 'border-neutral-200 text-neutral-500 dark:border-neutral-700 dark:text-neutral-400'
                      }`}
                    >
                      {et.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {et.duration} min
                    </span>
                    {user?.username && (
                      <span className="truncate">
                        /{user.username}/{et.slug}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyLink(et)}
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  title="Copy booking link"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = getBookingUrl(et);
                    if (url) window.open(url, '_blank');
                  }}
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  title="Open booking page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/event-types/${et.id}`)}
                  className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </Button>

                {/* More menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setMenuOpen(menuOpen === et.id ? null : et.id)
                    }
                    className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  {menuOpen === et.id && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg z-20 py-1">
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        onClick={() => {
                          handleToggle(et);
                          setMenuOpen(null);
                        }}
                      >
                        {et.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        onClick={() => handleDelete(et.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

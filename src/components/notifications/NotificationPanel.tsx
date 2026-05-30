import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  BellRing,
  Sparkles,
  CheckSquare,
  Calendar,
  Mail,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteAllRead,
} from '@/hooks/queries/useNotificationQueries';
import {
  useAcceptInvite,
  useDeclineInvite,
  useMyPendingInvites,
} from '@/hooks/queries/useTeamQueries';
import type {
  Notification,
  NotificationType,
} from '@/services/notificationService';
import type { MyPendingInvite } from '@/services/teamService';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function typeIcon(type: NotificationType) {
  const cls = 'w-4 h-4 text-neutral-500 dark:text-neutral-400';
  switch (type) {
    case 'BOOKING_RECEIVED':
    case 'BOOKING_CONFIRMED':
    case 'BOOKING_CANCELLED':
    case 'BOOKING_REMINDER':
      return <BellRing className={cls} />;
    case 'MEETING_AI_COMPLETE':
      return <Sparkles className={cls} />;
    case 'TASK_DUE_SOON':
      return <CheckSquare className={cls} />;
    default:
      return <Calendar className={cls} />;
  }
}

function entityPath(n: Notification): string | null {
  if (n.type === 'TASK_DUE_SOON') return `/tasks`;
  if (!n.entityType || !n.entityId) return null;
  if (n.entityType === 'meeting') return `/meetings/${n.entityId}`;
  if (n.entityType === 'booking') return `/bookings`;
  if (n.entityType === 'task') return `/tasks`;
  return null;
}

// ── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
        <div className="h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
      </div>
    </div>
  );
}

// ── Notification row ──────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: () => void;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    onRead();
    const path = entityPath(notification);
    if (path) navigate(path);
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
        {typeIcon(notification.type)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-snug truncate">
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {notification.body}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
      )}
    </motion.button>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-4 pt-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
  );
}

// ── Pending invite row (Phase 6 P13) ──────────────────────────────────────────

function InviteRow({
  invite,
  onAccept,
  onDecline,
  busy,
}: {
  invite: MyPendingInvite;
  onAccept: () => void;
  onDecline: () => void;
  busy: boolean;
}) {
  const inviter = invite.invitedBy?.name ?? 'A teammate';
  const role = invite.role === 'ADMIN' ? 'admin' : 'member';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 px-4 py-3"
    >
      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
        {invite.team.logoUrl ? (
          <img
            src={invite.team.logoUrl}
            alt={invite.team.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <Mail className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-snug truncate">
          {invite.team.name}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {inviter} invited you as {role}
        </p>
        <div className="flex items-center gap-1.5 mt-2">
          <Button
            size="xs"
            variant="default"
            disabled={busy}
            onClick={onAccept}
          >
            Accept
          </Button>
          <Button size="xs" variant="ghost" disabled={busy} onClick={onDecline}>
            Decline
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();
  const { data: invitesData } = useMyPendingInvites();
  const acceptInvite = useAcceptInvite();
  const declineInvite = useDeclineInvite();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteAllRead = useDeleteAllRead();

  const pendingInvites = invitesData?.invites ?? [];
  const hasPendingInvites = pendingInvites.length > 0;
  const inviteBusy = acceptInvite.isPending || declineInvite.isPending;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      sentinelRef.current = node;
      if (!node || !hasNextPage || isFetchingNextPage) return;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) fetchNextPage();
        },
        { threshold: 0.1 }
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const allNotifications = data?.pages.flatMap((p) => p.notifications) ?? [];

  const todayItems = allNotifications.filter((n) => isToday(n.createdAt));
  const earlierItems = allNotifications.filter((n) => !isToday(n.createdAt));

  const readItems = allNotifications.filter((n) => n.isRead);
  const hasUnread = allNotifications.some((n) => !n.isRead);

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleClearAll = () => {
    deleteAllRead.mutate();
  };

  return (
    <div
      className="w-80 rounded-2xl bg-white dark:bg-neutral-900
                 border border-neutral-200 dark:border-neutral-800
                 shadow-2xl shadow-black/10 dark:shadow-black/40
                 flex flex-col overflow-hidden"
      style={{ maxHeight: 480 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Notifications
        </p>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground"
            onClick={handleMarkAllRead}
            disabled={markAllRead.isPending}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {hasPendingInvites && (
          <>
            <SectionLabel label="Pending invitations" />
            {pendingInvites.map((invite) => (
              <InviteRow
                key={invite.id}
                invite={invite}
                busy={inviteBusy}
                onAccept={() => {
                  acceptInvite.mutate(invite.team.id, {
                    onSuccess: () => onClose(),
                  });
                }}
                onDecline={() => {
                  declineInvite.mutate(invite.team.id);
                }}
              />
            ))}
          </>
        )}
        {isLoading ? (
          <div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : allNotifications.length === 0 && !hasPendingInvites ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mb-3 opacity-40" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              You're all caught up
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Notifications will appear here
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {todayItems.length > 0 && (
              <>
                <SectionLabel label="Today" />
                {todayItems.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onRead={() => {
                      if (!n.isRead) markRead.mutate(n.id);
                      onClose();
                    }}
                  />
                ))}
              </>
            )}

            {earlierItems.length > 0 && (
              <>
                <SectionLabel label="Earlier" />
                {earlierItems.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onRead={() => {
                      if (!n.isRead) markRead.mutate(n.id);
                      onClose();
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={setRef} className="h-1" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <div className="w-4 h-4 rounded-full border-2 border-neutral-300 dark:border-neutral-700 border-t-neutral-600 dark:border-t-neutral-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Footer — clear read */}
      {readItems.length > 0 && (
        <div className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-2.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground h-7 gap-1.5"
            onClick={handleClearAll}
            disabled={deleteAllRead.isPending}
          >
            <Trash2 className="w-3 h-3" />
            Clear {readItems.length} read
          </Button>
        </div>
      )}
    </div>
  );
}

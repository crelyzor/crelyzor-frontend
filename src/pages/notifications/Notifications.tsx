import { useState } from 'react';
import {
  Bell,
  Calendar,
  Users,
  Mic,
  Sparkles,
  CheckCheck,
  ArrowUpRight,
  Building2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useOrganizationStore } from '@/stores/organizationStore';

// ── Filter tabs ──
const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'sma', label: 'SMA' },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]['id'];

// ── Notification types ──
type NotificationType =
  | 'meeting_scheduled'
  | 'meeting_cancelled'
  | 'meeting_reminder'
  | 'transcription_complete'
  | 'action_items_generated'
  | 'new_team_member';

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  meetingId?: number;
  orgSource?: { orgId: string; orgName: string; isPersonal: boolean };
};

const NOTIFICATION_META: Record<NotificationType, { icon: typeof Bell; color: string; bg: string; filterGroup: 'meetings' | 'sma' | 'other' }> = {
  meeting_scheduled: { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', filterGroup: 'meetings' },
  meeting_cancelled: { icon: Calendar, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30', filterGroup: 'meetings' },
  meeting_reminder: { icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', filterGroup: 'meetings' },
  transcription_complete: { icon: Mic, color: 'text-neutral-500', bg: 'bg-neutral-100 dark:bg-neutral-800', filterGroup: 'sma' },
  action_items_generated: { icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-950/30', filterGroup: 'sma' },
  new_team_member: { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', filterGroup: 'other' },
};

// ── Mock notifications ──
const mockNotifications: Notification[] = [
  {
    id: 'n-1',
    type: 'meeting_scheduled',
    title: 'New meeting scheduled',
    message: 'Product Strategy Review — Today at 2:00 PM',
    timestamp: '2026-02-10T09:30:00',
    isRead: false,
    meetingId: 101,
    orgSource: { orgId: '2', orgName: 'Acme Inc', isPersonal: false },
  },
  {
    id: 'n-2',
    type: 'action_items_generated',
    title: 'Action items ready',
    message: '4 action items generated from Sprint Retrospective',
    timestamp: '2026-02-10T08:15:00',
    isRead: false,
    meetingId: 103,
    orgSource: { orgId: '2', orgName: 'Acme Inc', isPersonal: false },
  },
  {
    id: 'n-3',
    type: 'transcription_complete',
    title: 'Transcription complete',
    message: 'Voice note for Client Feedback Session has been transcribed',
    timestamp: '2026-02-09T16:45:00',
    isRead: true,
    meetingId: 106,
    orgSource: { orgId: '2', orgName: 'Acme Inc', isPersonal: false },
  },
  {
    id: 'n-4',
    type: 'meeting_reminder',
    title: 'Meeting in 15 minutes',
    message: 'Design Sync starts at 4:30 PM in Meeting Room 2B',
    timestamp: '2026-02-09T16:15:00',
    isRead: true,
    meetingId: 102,
    orgSource: { orgId: '3', orgName: 'Design Studio', isPersonal: false },
  },
  {
    id: 'n-5',
    type: 'new_team_member',
    title: 'New team member joined',
    message: 'Alex Kim has joined Acme Inc as a Member',
    timestamp: '2026-02-09T10:00:00',
    isRead: true,
    orgSource: { orgId: '2', orgName: 'Acme Inc', isPersonal: false },
  },
  {
    id: 'n-6',
    type: 'meeting_cancelled',
    title: 'Meeting cancelled',
    message: 'Weekly All-hands has been cancelled by Sarah Chen',
    timestamp: '2026-02-08T14:20:00',
    isRead: true,
    meetingId: 112,
    orgSource: { orgId: '2', orgName: 'Acme Inc', isPersonal: false },
  },
  {
    id: 'n-7',
    type: 'action_items_generated',
    title: 'Action items ready',
    message: '2 action items generated from Design Review',
    timestamp: '2026-02-08T11:00:00',
    isRead: true,
    meetingId: 110,
    orgSource: { orgId: '3', orgName: 'Design Studio', isPersonal: false },
  },
  {
    id: 'n-8',
    type: 'meeting_scheduled',
    title: 'New meeting scheduled',
    message: 'Quarterly Review — Feb 11 at 10:00 AM',
    timestamp: '2026-02-07T09:00:00',
    isRead: true,
    meetingId: 108,
    orgSource: { orgId: '2', orgName: 'Acme Inc', isPersonal: false },
  },
];

export default function Notifications() {
  const navigate = useNavigate();
  const { currentOrg } = useOrganizationStore();
  const isPersonalView = currentOrg?.isPersonal ?? true;

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  // Filter by org
  let filtered = isPersonalView
    ? notifications
    : notifications.filter((n) => n.orgSource?.orgId === currentOrg?.id);

  // Filter by tab
  if (activeFilter === 'unread') filtered = filtered.filter((n) => !n.isRead);
  if (activeFilter === 'meetings') filtered = filtered.filter((n) => NOTIFICATION_META[n.type].filterGroup === 'meetings');
  if (activeFilter === 'sma') filtered = filtered.filter((n) => NOTIFICATION_META[n.type].filterGroup === 'sma');

  const unreadCount = (isPersonalView ? notifications : notifications.filter((n) => n.orgSource?.orgId === currentOrg?.id)).filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  // Group by date
  const formatRelativeDate = (ts: string) => {
    const d = new Date(ts);
    const today = new Date('2026-02-10T00:00:00');
    const yesterday = new Date('2026-02-09T00:00:00');
    const dateOnly = new Date(d.toISOString().split('T')[0] + 'T00:00:00');
    if (dateOnly.getTime() === today.getTime()) return 'Today';
    if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, n) => {
    const key = formatRelativeDate(n.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(n);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            className="text-xs gap-1.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
              ${activeFilter === tab.id
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              }`}
          >
            {tab.label}
            {tab.id === 'unread' && unreadCount > 0 && (
              <span className="ml-1 px-1 py-0.5 rounded-full text-[9px] bg-red-500 text-white dark:bg-red-500 dark:text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <Bell className="w-7 h-7 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">No notifications</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            {activeFilter === 'unread' ? 'You\'re all caught up!' : 'Nothing here yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h2 className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                {dateLabel}
              </h2>
              <div className="space-y-1.5">
                {items.map((n) => {
                  const meta = NOTIFICATION_META[n.type];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        markRead(n.id);
                        if (n.meetingId) navigate(`/meetings/${n.meetingId}`);
                      }}
                      className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors group
                        ${n.isRead
                          ? 'hover:bg-neutral-50 dark:hover:bg-neutral-800/30'
                          : 'bg-neutral-50 dark:bg-neutral-800/40 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                        }`}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-full ${meta.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium truncate ${n.isRead ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-950 dark:text-neutral-50'}`}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-neutral-400">{formatTime(n.timestamp)}</span>
                          {isPersonalView && n.orgSource && !n.orgSource.isPersonal && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-500 dark:text-blue-400">
                              <Building2 className="w-2.5 h-2.5" />
                              {n.orgSource.orgName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      {n.meetingId && (
                        <ArrowUpRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-500 dark:group-hover:text-neutral-400 transition-colors shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

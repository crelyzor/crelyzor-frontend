import { useState, useMemo, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';
import {
  Search,
  MapPin,
  Clock,
  Mic,
  FileText,
  ClipboardList,
  Users,
  MoreHorizontal,
  Calendar,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Video,
  Tag,
  Trash2,
  X,
  UserPlus,
  CalendarClock,
  CalendarDays,
  MessageSquare,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { TagChip } from '@/components/ui/TagChip';
import { StartMeetingFab } from '@/components/home/StartMeetingFab';
import {
  useMeetingsAll,
  useCreateMeeting,
  useAcceptMeeting,
  useDeclineMeeting,
  useCancelMeeting,
  useCompleteMeeting,
  useDeleteMeeting,
  useImportMeetingsIcs,
} from '@/hooks/queries/useMeetingQueries';
import { useUserTags } from '@/hooks/queries/useTagQueries';
import { useBookings } from '@/hooks/queries/useSchedulingQueries';
import { useGoogleCalendarStatus } from '@/hooks/queries/useIntegrationQueries';
import { useUserSearch } from '@/hooks/queries/useUserQueries';
import { toDisplayMeeting, type DisplayMeeting } from '@/lib/meetingHelpers';
import { getStatusStyle, getStatusLabel } from '@/types';
import type { MeetingStatus } from '@/types';
import type { UserSearchResult } from '@/services/userService';

type SelectedParticipant =
  | { kind: 'user'; id: string; name: string; email: string }
  | { kind: 'guest'; email: string };

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ── Participant Picker ──────────────────────────────────────────────────────

function ParticipantPicker({
  participants,
  onChange,
}: {
  participants: SelectedParticipant[];
  onChange: (participants: SelectedParticipant[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isFetching } = useUserSearch(query);
  const results = data?.users ?? [];

  const selectedIds = new Set(
    participants.filter((p) => p.kind === 'user').map((p) => p.id)
  );

  const selectedGuestEmails = new Set(
    participants
      .filter((p) => p.kind === 'guest')
      .map((p) => p.email.toLowerCase())
  );

  const visibleResults = results.filter((u) => !selectedIds.has(u.id));

  const add = (user: UserSearchResult) => {
    if (selectedIds.has(user.id)) return;
    flushSync(() => {
      onChange([
        ...participants,
        { kind: 'user', id: user.id, name: user.name, email: user.email },
      ]);
    });
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const addGuest = () => {
    const email = query.trim().toLowerCase();
    if (!isValidEmail(email)) return;
    if (selectedGuestEmails.has(email)) return;
    if (
      participants.some(
        (p) => p.kind === 'user' && p.email.toLowerCase() === email
      )
    ) {
      return;
    }

    flushSync(() => {
      onChange([...participants, { kind: 'guest', email }]);
    });
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (target: SelectedParticipant) =>
    onChange(
      participants.filter((p) => {
        if (target.kind === 'user') {
          return !(p.kind === 'user' && p.id === target.id);
        }
        return !(p.kind === 'guest' && p.email === target.email);
      })
    );

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {participants.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {participants.map((p) => (
            <span
              key={p.kind === 'user' ? p.id : `guest:${p.email}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              {p.kind === 'user' ? p.name : p.email}
              <button
                type="button"
                onClick={() => remove(p)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <UserPlus className="w-3.5 h-3.5" />
        </div>
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(e.target.value.trim().length >= 2);
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();

            if (!open || visibleResults.length === 0) {
              addGuest();
              return;
            }

            const normalizedQuery = query.trim().toLowerCase();
            const exactMatch = visibleResults.find(
              (user) =>
                user.email.toLowerCase() === normalizedQuery ||
                user.name.toLowerCase() === normalizedQuery
            );
            add(exactMatch ?? visibleResults[0]);
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by name/email or add guest email"
          className="text-sm pl-8"
        />

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-50 overflow-hidden">
            {isFetching ? (
              <div className="px-3 py-2.5 text-xs text-neutral-400">
                Searching…
              </div>
            ) : results.length === 0 ? (
              isValidEmail(query.trim()) ? (
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    addGuest();
                  }}
                  className="w-full px-3 py-2.5 text-xs text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Add guest: <span className="font-medium">{query.trim()}</span>
                </button>
              ) : (
                <div className="px-3 py-2.5 text-xs text-neutral-400">
                  No users found
                </div>
              )
            ) : (
              visibleResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    add(user);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const TYPE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'recorded', label: 'Recordings' },
  { id: 'bookings', label: 'Bookings' },
] as const;

type TypeTab = (typeof TYPE_TABS)[number]['id'];

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]['id'];

function matchesFilter(status: MeetingStatus, filter: FilterTab): boolean {
  if (filter === 'all') return true;
  if (filter === 'upcoming')
    return status === 'ACCEPTED' || status === 'CREATED';
  if (filter === 'completed') return status === 'COMPLETED';
  if (filter === 'cancelled')
    return status === 'CANCELLED' || status === 'DECLINED';
  return true;
}

function groupByDate(meetings: DisplayMeeting[]) {
  const groups: Record<string, DisplayMeeting[]> = {};
  for (const m of meetings) {
    if (!groups[m.date]) groups[m.date] = [];
    groups[m.date].push(m);
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, items]) => {
      let label: string;
      if (date === todayStr) label = 'Today';
      else if (date === tomorrowStr) label = 'Tomorrow';
      else
        label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      return { label, date, meetings: items };
    });
}

// ── Meeting context menu ──
function MeetingContextMenu({ meeting }: { meeting: DisplayMeeting }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const accept = useAcceptMeeting();
  const decline = useDeclineMeeting();
  const cancel = useCancelMeeting();
  const complete = useCompleteMeeting();
  const deleteMeeting = useDeleteMeeting();

  const close = () => setOpen(false);

  const isRecorded = meeting.meetingType === 'RECORDED';

  const canAccept =
    !isRecorded &&
    (meeting.status === 'PENDING_ACCEPTANCE' ||
      meeting.status === 'RESCHEDULING_REQUESTED');
  const canDecline = canAccept;
  const canComplete =
    !isRecorded &&
    (meeting.status === 'ACCEPTED' || meeting.status === 'CREATED');
  const canCancel = canComplete;

  const menuItems: {
    label: string;
    icon: React.ElementType;
    action: () => void;
    danger?: boolean;
  }[] = [
    {
      label: 'Open',
      icon: ExternalLink,
      action: () => {
        navigate(`/meetings/${meeting.id}`);
        close();
      },
    },
    ...(canAccept
      ? [
          {
            label: 'Accept',
            icon: ThumbsUp,
            action: () => {
              accept.mutate(meeting.id, {
                onSuccess: () => {
                  toast.success('Meeting accepted');
                  close();
                },
                onError: () => toast.error('Failed to accept'),
              });
            },
          },
        ]
      : []),
    ...(canDecline
      ? [
          {
            label: 'Decline',
            icon: ThumbsDown,
            action: () => {
              decline.mutate(
                { id: meeting.id },
                {
                  onSuccess: () => {
                    toast.success('Meeting declined');
                    close();
                  },
                  onError: () => toast.error('Failed to decline'),
                }
              );
            },
            danger: true,
          },
        ]
      : []),
    ...(canComplete
      ? [
          {
            label: 'Mark complete',
            icon: CheckCircle2,
            action: () => {
              complete.mutate(meeting.id, {
                onSuccess: () => {
                  toast.success('Marked as complete');
                  close();
                },
                onError: () => toast.error('Failed to update'),
              });
            },
          },
        ]
      : []),
    ...(canCancel
      ? [
          {
            label: 'Cancel meeting',
            icon: XCircle,
            action: () => {
              cancel.mutate(
                { id: meeting.id },
                {
                  onSuccess: () => {
                    toast.success('Meeting cancelled');
                    close();
                  },
                  onError: () => toast.error('Failed to cancel'),
                }
              );
            },
            danger: true,
          },
        ]
      : []),
    ...(isRecorded
      ? [
          {
            label: 'Delete',
            icon: Trash2,
            action: () => {
              deleteMeeting.mutate(meeting.id, {
                onSuccess: () => {
                  toast.success('Meeting deleted');
                  close();
                },
                onError: () => toast.error('Failed to delete'),
              });
            },
            danger: true,
          },
        ]
      : []),
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-4 h-4 text-neutral-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-44 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            onClick={item.action}
            className={`w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium
              ${
                item.danger
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
          >
            <item.icon className="w-3.5 h-3.5 shrink-0" />
            {item.label}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export default function Meetings() {
  const navigate = useNavigate();
  const icsInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [typeTab, setTypeTab] = useState<TypeTab>('all');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [showCreateScheduled, setShowCreateScheduled] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    autoGenerateMeet: true,
  });
  const [openTimePicker, setOpenTimePicker] = useState<'start' | 'end' | null>(
    null
  );
  const [participants, setParticipants] = useState<SelectedParticipant[]>([]);

  const createMeeting = useCreateMeeting();
  const importIcs = useImportMeetingsIcs();
  const { data: gcalStatus } = useGoogleCalendarStatus();

  // Auto-open create scheduled dialog from FAB
  useEffect(() => {
    if (searchParams.get('create') === 'scheduled') {
      setShowCreateScheduled(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleCreateScheduled = () => {
    if (
      !createForm.title.trim() ||
      !createForm.startDate ||
      !createForm.startTime ||
      !createForm.endDate ||
      !createForm.endTime
    ) {
      toast.error('Title, start time, and end time are required');
      return;
    }
    const buildISO = (date: string, time: string) => {
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);
      return new Date(year, month - 1, day, hours, minutes).toISOString();
    };
    const startISO = buildISO(createForm.startDate, createForm.startTime);
    const endISO = buildISO(createForm.endDate, createForm.endTime);
    if (new Date(startISO) >= new Date(endISO)) {
      toast.error('End time must be after start time');
      return;
    }
    createMeeting.mutate(
      {
        title: createForm.title.trim(),
        type: 'SCHEDULED',
        startTime: startISO,
        endTime: endISO,
        timezone: 'UTC',
        location: createForm.location.trim() || undefined,
        addToCalendar: gcalStatus?.connected
          ? createForm.autoGenerateMeet
          : undefined,
        participantUserIds: participants
          .filter(
            (p): p is Extract<SelectedParticipant, { kind: 'user' }> =>
              p.kind === 'user'
          )
          .map((p) => p.id),
        guestEmails: participants
          .filter(
            (p): p is Extract<SelectedParticipant, { kind: 'guest' }> =>
              p.kind === 'guest'
          )
          .map((p) => p.email),
      },
      {
        onSuccess: (meeting) => {
          setShowCreateScheduled(false);
          setCreateForm({
            title: '',
            startTime: '',
            endTime: '',
            location: '',
            autoGenerateMeet: true,
          });
          setParticipants([]);
          navigate(`/meetings/${meeting.id}`);
        },
      }
    );
  };

  const {
    data: meetingsData,
    isLoading: meetingsLoading,
    isError: meetingsError,
    refetch: refetchMeetings,
  } = useMeetingsAll();
  const { data: userTags } = useUserTags();
  const { data: pendingBookingsData } = useBookings({ status: 'PENDING' });
  const pendingCount = pendingBookingsData?.bookings?.length ?? 0;

  // Exclude VOICE_NOTE from the main meeting list — they live in /voice-notes.
  // PENDING_ACCEPTANCE + RESCHEDULING_REQUESTED are booking requests awaiting host action —
  // they show on the Bookings page, not here.
  const scopedMeetings = useMemo(
    () =>
      (meetingsData ?? [])
        .filter((m) => {
          if (m.type === 'VOICE_NOTE') return false;
          if (
            m.status === 'PENDING_ACCEPTANCE' ||
            m.status === 'RESCHEDULING_REQUESTED'
          )
            return false;
          if (typeTab === 'scheduled')
            return m.type === 'SCHEDULED' && !m.booking;
          if (typeTab === 'recorded') return m.type === 'RECORDED';
          if (typeTab === 'bookings') return !!m.booking;
          return true;
        })
        .map(toDisplayMeeting),
    [meetingsData, typeTab]
  );

  const filtered = useMemo(() => {
    return scopedMeetings.filter((m) => {
      if (!matchesFilter(m.status, activeTab)) return false;
      if (
        searchQuery &&
        !m.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !m.location?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !m.participants.some((p) =>
          p.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
        return false;
      if (selectedTagIds.size > 0) {
        const meetingTagIds = new Set(m.tags.map((t) => t.id));
        if (![...selectedTagIds].some((id) => meetingTagIds.has(id)))
          return false;
      }
      return true;
    });
  }, [scopedMeetings, activeTab, searchQuery, selectedTagIds]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  let globalIndex = 0;

  return (
    <PageMotion>
      <div className="max-w-3xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-5 sm:mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
              Meetings
            </h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              {scopedMeetings.length} total
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => icsInputRef.current?.click()}
            disabled={importIcs.isPending}
          >
            <Upload className="w-3.5 h-3.5" />
            Import calendar
          </Button>
          <input
            ref={icsInputRef}
            type="file"
            accept=".ics,text/calendar"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              importIcs.mutate(file, {
                onSuccess: (result) => {
                  if (result.errors.length > 0) {
                    toast.message(
                      `Imported ${result.created}, skipped ${result.skipped}`,
                      { description: result.errors.slice(0, 2).join(' · ') }
                    );
                  }
                },
              });

              e.currentTarget.value = '';
            }}
          />
        </div>

        {/* ── Bookings CTA ── */}
        <button
          onClick={() => navigate('/bookings')}
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 mb-5 rounded-xl border transition-colors text-left group ${
            pendingCount > 0
              ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 hover:border-amber-300 dark:hover:border-amber-700/60'
              : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                pendingCount > 0
                  ? 'bg-amber-100 dark:bg-amber-950/40'
                  : 'bg-neutral-100 dark:bg-neutral-800'
              }`}
            >
              <CalendarClock
                className={`w-3.5 h-3.5 ${pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-500 dark:text-neutral-400'}`}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                {pendingCount > 0
                  ? `${pendingCount} pending booking ${pendingCount === 1 ? 'request' : 'requests'}`
                  : 'Bookings'}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {pendingCount > 0
                  ? 'Confirm or decline on the Bookings page'
                  : 'Manage scheduling requests'}
              </p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors shrink-0" />
        </button>

        {/* ── Type toggle: Live / Recordings ── */}
        <div className="flex items-center gap-1 mb-5 p-1 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl w-fit">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeTab(tab.id)}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
              ${
                typeTab === tab.id
                  ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Search + Filters ── */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search meetings, people, or places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl
                       border border-neutral-200 dark:border-neutral-800
                       bg-white dark:bg-neutral-900
                       text-sm text-neutral-950 dark:text-neutral-50
                       placeholder:text-neutral-400 dark:placeholder:text-neutral-600
                       focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600
                       transition-colors"
            />
          </div>

          {/* Animated status filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-0.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150
                ${
                  activeTab === tab.id
                    ? 'text-white dark:text-neutral-900'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 bg-neutral-900 dark:bg-neutral-100 rounded-full"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tag filters — only shown if user has tags */}
          {userTags && userTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" />
              {userTags.map((tag) => {
                const active = selectedTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() =>
                      setSelectedTagIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(tag.id)) next.delete(tag.id);
                        else next.add(tag.id);
                        return next;
                      })
                    }
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-150
                      ${
                        active
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </button>
                );
              })}
              {selectedTagIds.size > 0 && (
                <button
                  onClick={() => setSelectedTagIds(new Set())}
                  className="text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Meeting List ── */}
        <div className="space-y-7 pb-24">
          {/* Skeleton */}
          {meetingsLoading && (
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 px-4 py-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2" />
                      <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3" />
                    </div>
                    <div className="h-5 w-16 bg-neutral-100 dark:bg-neutral-800 rounded-full shrink-0" />
                  </div>
                  <div className="flex items-center gap-3 mt-2.5">
                    <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-20" />
                    <div className="h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {meetingsError && (
            <div className="text-center py-20">
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                Failed to load meetings
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetchMeetings()}
              >
                Try again
              </Button>
            </div>
          )}
          {!meetingsLoading && !meetingsError && grouped.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Calendar className="w-9 h-9 mx-auto text-neutral-200 dark:text-neutral-700 mb-3" />
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                No meetings found
              </p>
            </motion.div>
          )}

          {!meetingsLoading &&
            !meetingsError &&
            grouped.map((group) => (
              <div key={group.date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.12em]">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
                </div>

                {/* Meeting cards */}
                <div className="space-y-2">
                  {group.meetings.map((meeting) => {
                    const idx = globalIndex++;
                    const hasSMA =
                      meeting.hasRecording ||
                      meeting.hasTranscript ||
                      meeting.hasSummary ||
                      meeting.hasTasks;

                    return (
                      <motion.div
                        key={meeting.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.28,
                          delay: idx * 0.04,
                          ease: [0.25, 0.1, 0.25, 1],
                        }}
                        onClick={() => navigate(`/meetings/${meeting.id}`)}
                        className="group bg-white dark:bg-neutral-900 rounded-xl border cursor-pointer
                                border-neutral-100 dark:border-neutral-800
                                hover:border-neutral-200 dark:hover:border-neutral-700
                                hover:shadow-sm transition-[border-color,box-shadow] duration-200"
                      >
                        <div className="px-4 py-3.5">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0 flex items-center gap-2">
                              {meeting.meetingType === 'RECORDED' && (
                                <div
                                  title="Recording"
                                  className="shrink-0 w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                >
                                  <Video className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                                </div>
                              )}
                              {meeting.meetingType === 'SCHEDULED' &&
                                meeting.isFromBooking && (
                                  <div
                                    title="Booking"
                                    className="shrink-0 w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                  >
                                    <CalendarClock className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                                  </div>
                                )}
                              {meeting.meetingType === 'SCHEDULED' &&
                                !meeting.isFromBooking && (
                                  <div
                                    title="Meeting"
                                    className="shrink-0 w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                  >
                                    <CalendarDays className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                                  </div>
                                )}
                              <h3 className="text-sm font-medium text-neutral-950 dark:text-neutral-50 truncate">
                                {meeting.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[11px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/meetings/${meeting.id}#ask-ai`);
                                }}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Ask AI
                              </Button>
                              {meeting.meetingType === 'SCHEDULED' && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusStyle(meeting.status)}`}
                                >
                                  {getStatusLabel(meeting.status)}
                                </span>
                              )}
                              <MeetingContextMenu meeting={meeting} />
                            </div>
                          </div>
                          {meeting.description && (
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-1">
                              {meeting.description}
                            </p>
                          )}

                          {/* Tags */}
                          {meeting.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                              {meeting.tags.map((tag) => (
                                <TagChip key={tag.id} tag={tag} />
                              ))}
                            </div>
                          )}

                          {/* Meta row */}
                          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                            <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                {meeting.time} · {meeting.duration}
                              </span>
                            </div>

                            {meeting.location && (
                              <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                                <MapPin className="w-3 h-3" />
                                <span>{meeting.location}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500">
                              <Users className="w-3 h-3" />
                              <span>
                                {meeting.participants.length > 2
                                  ? `${meeting.participants[0]} +${meeting.participants.length - 1}`
                                  : meeting.participants.join(', ')}
                              </span>
                            </div>

                            <div className="flex-1" />

                            {hasSMA && (
                              <div className="flex items-center gap-1">
                                {meeting.hasRecording && (
                                  <div
                                    className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                    title="Recording"
                                  >
                                    <Mic className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400" />
                                  </div>
                                )}
                                {meeting.hasTranscript && (
                                  <div
                                    className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                    title="Transcript"
                                  >
                                    <FileText className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400" />
                                  </div>
                                )}
                                {meeting.hasSummary && (
                                  <div
                                    className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                    title="AI Summary"
                                  />
                                )}
                                {meeting.hasTasks && (
                                  <div
                                    className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                    title="Tasks"
                                  >
                                    <ClipboardList className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400" />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {/* ── Floating CTA ── */}
        <StartMeetingFab />
      </div>

      {/* ── Create Scheduled Meeting Dialog ── */}
      <Dialog
        open={showCreateScheduled}
        onOpenChange={(open) => {
          setShowCreateScheduled(open);
          if (!open) {
            setCreateForm({
              title: '',
              startDate: '',
              startTime: '',
              endDate: '',
              endTime: '',
              location: '',
              autoGenerateMeet: true,
            });
            setOpenTimePicker(null);
            setParticipants([]);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule a Meet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500">Title</Label>
              <Input
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Meeting title"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500">Start time</Label>
              <Popover
                open={openTimePicker === 'start'}
                onOpenChange={(open) =>
                  setOpenTimePicker(open ? 'start' : null)
                }
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`w-full flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors text-left ${
                      createForm.startDate
                        ? 'border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
                    } bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                    <span>
                      {createForm.startDate
                        ? (() => {
                            const d = new Date(
                              `${createForm.startDate}T${createForm.startTime || '00:00'}`
                            );
                            const datePart = d.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            });
                            if (!createForm.startTime) return datePart;
                            const h = d.getHours(),
                              m = d.getMinutes();
                            const p = h >= 12 ? 'PM' : 'AM';
                            const h12 = h % 12 || 12;
                            return `${datePart} · ${h12}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''} ${p}`;
                          })()
                        : 'Set date & time'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 border-0 shadow-none bg-transparent w-auto"
                  align="start"
                >
                  <DateTimePicker
                    date={createForm.startDate || null}
                    time={createForm.startTime}
                    onDateChange={(iso) =>
                      setCreateForm((f) => ({ ...f, startDate: iso }))
                    }
                    onTimeChange={(t) =>
                      setCreateForm((f) => ({ ...f, startTime: t }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500">End time</Label>
              <Popover
                open={openTimePicker === 'end'}
                onOpenChange={(open) => setOpenTimePicker(open ? 'end' : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`w-full flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors text-left ${
                      createForm.endDate
                        ? 'border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                        : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
                    } bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                    <span>
                      {createForm.endDate
                        ? (() => {
                            const d = new Date(
                              `${createForm.endDate}T${createForm.endTime || '00:00'}`
                            );
                            const datePart = d.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            });
                            if (!createForm.endTime) return datePart;
                            const h = d.getHours(),
                              m = d.getMinutes();
                            const p = h >= 12 ? 'PM' : 'AM';
                            const h12 = h % 12 || 12;
                            return `${datePart} · ${h12}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''} ${p}`;
                          })()
                        : 'Set date & time'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 border-0 shadow-none bg-transparent w-auto"
                  align="start"
                >
                  <DateTimePicker
                    date={createForm.endDate || null}
                    time={createForm.endTime}
                    onDateChange={(iso) =>
                      setCreateForm((f) => ({ ...f, endDate: iso }))
                    }
                    onTimeChange={(t) =>
                      setCreateForm((f) => ({ ...f, endTime: t }))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500">
                Location <span className="text-neutral-400">(optional)</span>
              </Label>
              <Input
                value={createForm.location}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Zoom link or address"
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500">
                Participants{' '}
                <span className="text-neutral-400">(optional)</span>
              </Label>
              <ParticipantPicker
                participants={participants}
                onChange={setParticipants}
              />
            </div>
            {gcalStatus?.connected && (
              <div className="flex items-center gap-2 pt-1">
                <Switch
                  id="gcal-meet"
                  checked={createForm.autoGenerateMeet}
                  onCheckedChange={(checked) =>
                    setCreateForm((f) => ({ ...f, autoGenerateMeet: checked }))
                  }
                />
                <Label
                  htmlFor="gcal-meet"
                  className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer"
                >
                  Add to Google Calendar with a Meet link
                </Label>
              </div>
            )}
            <div className="flex gap-2 justify-end pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateScheduled(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateScheduled}
                disabled={createMeeting.isPending}
              >
                {createMeeting.isPending ? 'Creating…' : 'Create meeting'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageMotion>
  );
}

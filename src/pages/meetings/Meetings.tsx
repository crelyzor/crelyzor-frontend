import { useState, useMemo, useEffect } from 'react';
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
  Globe,
  Tag,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { StartMeetingFab } from '@/components/home/StartMeetingFab';
import {
  useMeetingsAll,
  useCreateMeeting,
  useAcceptMeeting,
  useDeclineMeeting,
  useCancelMeeting,
  useCompleteMeeting,
  useDeleteMeeting,
} from '@/hooks/queries/useMeetingQueries';
import { useUserTags } from '@/hooks/queries/useTagQueries';
import { useGoogleCalendarStatus } from '@/hooks/queries/useIntegrationQueries';
import { toDisplayMeeting, type DisplayMeeting } from '@/lib/meetingHelpers';
import { getStatusStyle, getStatusLabel } from '@/types';
import type { MeetingStatus } from '@/types';

const TYPE_TABS = [
  { id: 'all', label: 'All' },
  { id: 'scheduled', label: 'Live' },
  { id: 'recorded', label: 'Recordings' },
] as const;

type TypeTab = (typeof TYPE_TABS)[number]['id'];

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]['id'];

function isOnlineMeeting(
  location?: string | null,
  meetingProvider?: string | null
): boolean {
  if (meetingProvider) return true;
  if (!location) return false;
  return location.startsWith('http');
}

function matchesFilter(status: MeetingStatus, filter: FilterTab): boolean {
  if (filter === 'all') return true;
  if (filter === 'upcoming')
    return status === 'ACCEPTED' || status === 'CREATED';
  if (filter === 'completed') return status === 'COMPLETED';
  if (filter === 'pending')
    return (
      status === 'PENDING_ACCEPTANCE' || status === 'RESCHEDULING_REQUESTED'
    );
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [typeTab, setTypeTab] = useState<TypeTab>('all');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [showCreateScheduled, setShowCreateScheduled] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    autoGenerateMeet: true,
  });

  const createMeeting = useCreateMeeting();
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
      !createForm.startTime ||
      !createForm.endTime
    ) {
      toast.error('Title, start time, and end time are required');
      return;
    }
    createMeeting.mutate(
      {
        title: createForm.title.trim(),
        type: 'SCHEDULED',
        startTime: new Date(createForm.startTime).toISOString(),
        endTime: new Date(createForm.endTime).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: createForm.location.trim() || undefined,
        addToCalendar: gcalStatus?.connected
          ? createForm.autoGenerateMeet
          : undefined,
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

  // Exclude VOICE_NOTE — they live in /voice-notes. Also apply type toggle.
  const scopedMeetings = useMemo(
    () =>
      (meetingsData ?? [])
        .filter((m) => {
          if (m.type === 'VOICE_NOTE') return false;
          if (typeTab === 'scheduled') return m.type === 'SCHEDULED';
          if (typeTab === 'recorded') return m.type === 'RECORDED';
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
        </div>

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
                                isOnlineMeeting(
                                  meeting.location,
                                  meeting.meetingProvider
                                ) && (
                                  <div
                                    title="Online meeting"
                                    className="shrink-0 w-5 h-5 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                  >
                                    <Globe className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                                  </div>
                                )}
                              <h3 className="text-sm font-medium text-neutral-950 dark:text-neutral-50 truncate">
                                {meeting.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
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
                                <span
                                  key={tag.id}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  {tag.name}
                                </span>
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
          if (!open)
            setCreateForm({
              title: '',
              startTime: '',
              endTime: '',
              location: '',
              autoGenerateMeet: true,
            });
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Schedule a meeting</DialogTitle>
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
              <Input
                type="datetime-local"
                value={createForm.startTime}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, startTime: e.target.value }))
                }
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500">End time</Label>
              <Input
                type="datetime-local"
                value={createForm.endTime}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, endTime: e.target.value }))
                }
                className="text-sm"
              />
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

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';
import {
  Search,
  Plus,
  MapPin,
  Clock,
  Mic,
  FileText,
  ClipboardList,
  Users,
  MoreHorizontal,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useMeetingsAll } from '@/hooks/queries/useMeetingQueries';
import { toDisplayMeeting, type DisplayMeeting } from '@/lib/meetingHelpers';
import { getStatusStyle, getStatusLabel } from '@/types';
import type { MeetingStatus } from '@/types';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]['id'];

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

export default function Meetings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: meetingsData } = useMeetingsAll();

  const scopedMeetings = useMemo(
    () => (meetingsData ?? []).map(toDisplayMeeting),
    [meetingsData]
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
      return true;
    });
  }, [scopedMeetings, activeTab, searchQuery]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  let globalIndex = 0;

  return (
    <PageMotion>
    <div className="max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Meetings
          </h1>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
            {scopedMeetings.length} total
          </p>
        </div>
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

        {/* Animated filter tabs */}
        <div className="flex items-center gap-1">
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
      </div>

      {/* ── Meeting List ── */}
      <div className="space-y-7 pb-24">
        {grouped.length === 0 && (
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

        {grouped.map((group) => (
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
                const isExpanded = expandedId === meeting.id;
                const hasSMA =
                  meeting.hasRecording ||
                  meeting.hasTranscript ||
                  meeting.hasSummary ||
                  meeting.hasActionItems;

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
                    onClick={() =>
                      setExpandedId(isExpanded ? null : meeting.id)
                    }
                    className={`group bg-white dark:bg-neutral-900 rounded-xl border cursor-pointer
                                transition-all duration-200 overflow-hidden
                                ${
                                  isExpanded
                                    ? 'border-neutral-300 dark:border-neutral-600 shadow-md'
                                    : 'border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 hover:shadow-sm'
                                }`}
                  >
                    <div className="px-4 py-3.5">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-neutral-950 dark:text-neutral-50 truncate">
                            {meeting.title}
                          </h3>
                          {meeting.description && (
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-1">
                              {meeting.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${getStatusStyle(meeting.status)}`}
                        >
                          {getStatusLabel(meeting.status)}
                        </span>
                      </div>

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
                                className="w-5 h-5 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center"
                                title="AI Summary"
                              />
                            )}
                            {meeting.hasActionItems && (
                              <div
                                className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                title="Action items"
                              >
                                <ClipboardList className="w-2.5 h-2.5 text-neutral-500 dark:text-neutral-400" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expanded — animated */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{
                              duration: 0.2,
                              ease: [0.25, 0.1, 0.25, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                              <div className="flex items-center gap-2 flex-wrap">
                                {meeting.category && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                    {meeting.category}
                                  </span>
                                )}
                                {meeting.organizer && (
                                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                    by {meeting.organizer}
                                  </span>
                                )}
                                <div className="flex-1" />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/meetings/${meeting.id}`);
                                  }}
                                >
                                  Open
                                  <ArrowUpRight className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-4 h-4 text-neutral-400" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Floating CTA ── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.4,
            delay: 0.25,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <Button
            onClick={() => navigate('/meetings/create')}
            className="h-11 px-5 rounded-full bg-neutral-950 hover:bg-neutral-800
                       dark:bg-neutral-50 dark:hover:bg-neutral-200
                       text-white dark:text-neutral-900
                       shadow-lg shadow-neutral-900/20 dark:shadow-neutral-100/10
                       text-sm font-medium gap-2 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </Button>
        </motion.div>
      </div>
    </div>
    </PageMotion>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  MapPin,
  Clock,
  Mic,
  FileText,

  ClipboardList,
  Users,
  User,
  MoreHorizontal,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOrganizationStore } from '@/stores/organizationStore';
import { allMeetings } from '@/data/meetings';
import type { MeetingStatus } from '@/types';

// ── Filter Tabs ──
const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'pending', label: 'Pending' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]['id'];

// ── Status pill colors ──
function statusStyle(status: MeetingStatus) {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    case 'pending':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
    case 'completed':
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
    case 'cancelled':
    case 'declined':
      return 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400';
    case 'rescheduling':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
    default:
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
  }
}

function statusLabel(status: MeetingStatus) {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'declined':
      return 'Declined';
    case 'rescheduling':
      return 'Rescheduling';
    default:
      return status;
  }
}

// ── Map filter tab to meeting statuses ──
function matchesFilter(status: MeetingStatus, filter: FilterTab): boolean {
  if (filter === 'all') return true;
  if (filter === 'upcoming')
    return status === 'confirmed' || status === 'pending';
  if (filter === 'completed') return status === 'completed';
  if (filter === 'pending')
    return status === 'pending' || status === 'rescheduling';
  if (filter === 'cancelled')
    return status === 'cancelled' || status === 'declined';
  return true;
}

// ── Group meetings by date ──
function groupByDate(meetings: typeof allMeetings) {
  const groups: Record<string, typeof allMeetings> = {};

  for (const m of meetings) {
    const key = m.date;
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
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
      if (date === todayStr) {
        label = 'Today';
      } else if (date === tomorrowStr) {
        label = 'Tomorrow';
      } else {
        label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }
      return { label, date, meetings: items };
    });
}

export default function Meetings() {
  const navigate = useNavigate();
  const { currentOrg } = useOrganizationStore();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isTeamView, setIsTeamView] = useState(false);

  // Org context
  const isPersonalView = currentOrg?.isPersonal ?? true;
  const isOwnerOrAdmin =
    currentOrg?.role === 'owner' || currentOrg?.role === 'admin';
  const showTeamToggle = !isPersonalView && isOwnerOrAdmin;

  // Org-scoped meetings
  const orgMeetings = useMemo(() => {
    if (isPersonalView) return allMeetings; // personal = aggregate all
    return allMeetings.filter((m) => m.orgSource?.orgId === currentOrg?.id);
  }, [isPersonalView, currentOrg?.id]);

  // Team view: show all org meetings. My view: only "You" as organizer
  const scopedMeetings = useMemo(() => {
    if (!showTeamToggle || isTeamView) return orgMeetings;
    return orgMeetings.filter((m) => m.organizer === 'You');
  }, [orgMeetings, showTeamToggle, isTeamView]);

  // Filter & search
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

  const smaCount = useMemo(() => {
    return scopedMeetings.filter(
      (m) => m.hasRecording || m.hasTranscript || m.hasSummary
    ).length;
  }, [scopedMeetings]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Meetings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {scopedMeetings.length} total &middot; {smaCount} with voice notes
            {!isPersonalView && currentOrg && (
              <span> &middot; {currentOrg.name}</span>
            )}
          </p>
        </div>

        {/* My / Team toggle */}
        {showTeamToggle && (
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-full p-0.5">
            <button
              onClick={() => setIsTeamView(false)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${
                  !isTeamView
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
            >
              <User className="w-3 h-3" />
              My
            </button>
            <button
              onClick={() => setIsTeamView(true)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors
                ${
                  isTeamView
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
            >
              <Users className="w-3 h-3" />
              Team
            </button>
          </div>
        )}
      </div>

      {/* ── Search + Filters ── */}
      <div className="space-y-3 mb-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search meetings, people, or places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-neutral-200 dark:border-neutral-800 
                       bg-white dark:bg-neutral-900 text-sm text-neutral-950 dark:text-neutral-50
                       placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                       focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10
                       transition-shadow"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Meeting List ── */}
      <div className="space-y-6 pb-24">
        {grouped.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No meetings found
            </p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.date}>
            {/* Date header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Meeting cards */}
            <div className="space-y-2">
              {group.meetings.map((meeting) => {
                const isExpanded = expandedId === meeting.id;
                const hasSMA =
                  meeting.hasRecording ||
                  meeting.hasTranscript ||
                  meeting.hasSummary ||
                  meeting.hasActionItems;

                return (
                  <Card
                    key={meeting.id}
                    className={`p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden transition-shadow
                      hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 cursor-pointer
                      ${isExpanded ? 'ring-1 ring-neutral-300 dark:ring-neutral-700' : ''}`}
                    onClick={() =>
                      setExpandedId(isExpanded ? null : meeting.id)
                    }
                  >
                    <div className="px-4 py-3.5">
                      {/* Top row: title + status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 truncate">
                            {meeting.title}
                          </h3>
                          {meeting.description && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                              {meeting.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${statusStyle(meeting.status)}`}
                        >
                          {statusLabel(meeting.status)}
                        </span>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                        {/* Time */}
                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {meeting.time} &middot; {meeting.duration}
                          </span>
                        </div>

                        {/* Location */}
                        {meeting.location && (
                          <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{meeting.location}</span>
                          </div>
                        )}

                        {/* Participants */}
                        <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {meeting.participants.length > 2
                              ? `${meeting.participants[0]} +${meeting.participants.length - 1}`
                              : meeting.participants.join(', ')}
                          </span>
                        </div>

                        {/* Organizer — shown in team view */}
                        {showTeamToggle &&
                          isTeamView &&
                          meeting.organizer &&
                          meeting.organizer !== 'You' && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                              <User className="w-3 h-3" />
                              <span>{meeting.organizer}</span>
                            </div>
                          )}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* SMA indicators */}
                        {hasSMA && (
                          <div className="flex items-center gap-1.5">
                            {meeting.hasRecording && (
                              <div
                                className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                title="Voice note"
                              >
                                <Mic className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                              </div>
                            )}
                            {meeting.hasTranscript && (
                              <div
                                className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                title="Transcript"
                              >
                                <FileText className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                              </div>
                            )}
                            {meeting.hasSummary && (
                              <div
                                className="w-5 h-5 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center"
                                title="AI Summary"
                              >

                              </div>
                            )}
                            {meeting.hasActionItems && (
                              <div
                                className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
                                title="Action items"
                              >
                                <ClipboardList className="w-3 h-3 text-neutral-500 dark:text-neutral-400" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                          <div className="flex items-center gap-2 flex-wrap">
                            {meeting.category && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                {meeting.category}
                              </span>
                            )}
                            {meeting.organizer && (
                              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                by {meeting.organizer}
                              </span>
                            )}
                            {isPersonalView &&
                              meeting.orgSource &&
                              !meeting.orgSource.isPersonal && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                                  {meeting.orgSource.orgName}
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
                              <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Floating CTA ── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <Button
          onClick={() => navigate('/meetings/create')}
          className="h-12 px-6 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 
                     text-white dark:text-neutral-900 shadow-xl shadow-neutral-900/20 dark:shadow-neutral-100/10
                     text-sm font-medium gap-2"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </Button>
      </div>
    </div>
  );
}

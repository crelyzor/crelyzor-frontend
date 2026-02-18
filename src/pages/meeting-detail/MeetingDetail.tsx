import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Mic,
  FileText,
  ClipboardList,
  Upload,
  Play,
  Building2,
  MoreHorizontal,
  Edit3,
  RefreshCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMeeting } from '@/hooks/queries/useMeetingQueries';
import { toDisplayMeeting } from '@/lib/meetingHelpers';
import { getStatusStyle, getStatusLabel } from '@/types';
import { PageLoader } from '@/components/PageLoader';

// ── SMA Tab config ──
const SMA_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'recording', label: 'Recording', icon: Mic },
  { id: 'transcript', label: 'Transcript', icon: FileText },
  { id: 'summary', label: 'AI Summary', icon: FileText },
  { id: 'actions', label: 'Action Items', icon: ClipboardList },
] as const;

type SMATab = (typeof SMA_TABS)[number]['id'];

// ── Mock transcript segments ──
const mockTranscript = [
  {
    speaker: 'Sarah Chen',
    time: '0:00',
    text: "Alright, let's kick off. I've shared the updated roadmap doc — have you all had a chance to look through it?",
  },
  {
    speaker: 'Mike Ross',
    time: '0:42',
    text: 'Yes, I went through it. I think the Q2 timeline for the analytics dashboard is tight. Can we discuss dependencies?',
  },
  {
    speaker: 'You',
    time: '1:15',
    text: 'Agreed. I think we should front-load the data pipeline work. That would unblock the visualization layer early.',
  },
  {
    speaker: 'Alex Kim',
    time: '2:03',
    text: 'I can take on the pipeline POC this sprint if we prioritize it. Should be doable in a week.',
  },
  {
    speaker: 'Sarah Chen',
    time: '2:38',
    text: "Perfect. Let's also talk about the client demo — we need a working prototype by the 20th.",
  },
];

// ── Mock action items ──
const mockActionItems = [
  {
    id: '1',
    title: 'Set up analytics data pipeline POC',
    assignedTo: 'Alex Kim',
    dueDate: 'Feb 17',
    status: 'pending' as const,
    category: 'PARTICIPANT_TASK',
  },
  {
    id: '2',
    title: 'Prepare client demo prototype',
    assignedTo: 'Sarah Chen',
    dueDate: 'Feb 20',
    status: 'pending' as const,
    category: 'UPCOMING_EVENT',
  },
  {
    id: '3',
    title: 'Review Q2 timeline dependencies',
    assignedTo: 'Mike Ross',
    dueDate: 'Feb 14',
    status: 'completed' as const,
    category: 'SHARED_TASK',
  },
  {
    id: '4',
    title: 'Share updated roadmap doc with stakeholders',
    assignedTo: 'You',
    dueDate: 'Feb 12',
    status: 'pending' as const,
    category: 'DOCUMENT_REQUIRED',
  },
];

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SMATab>('overview');
  const { data: rawMeeting, isLoading } = useMeeting(id ?? '');

  if (isLoading) return <PageLoader />;

  if (!rawMeeting) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
          Meeting not found
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          This meeting may have been deleted or doesn't exist.
        </p>
        <Button variant="outline" onClick={() => navigate('/meetings')}>
          Back to Meetings
        </Button>
      </div>
    );
  }

  const meeting = toDisplayMeeting(rawMeeting);
  const statusClasses = getStatusStyle(meeting.status);
  const statusText = getStatusLabel(meeting.status);
  const hasSMA = !!(
    meeting.hasRecording ||
    meeting.hasTranscript ||
    meeting.hasSummary ||
    meeting.hasActionItems
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Back ── */}
      <button
        onClick={() => navigate('/meetings')}
        className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Meetings
      </button>

      {/* ── Header Card ── */}
      <Card className="border-neutral-200 dark:border-neutral-800 mb-4">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${statusClasses}`}
                >
                  {statusText}
                </span>
                {meeting.category && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    {meeting.category}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
                {meeting.title}
              </h1>
              {meeting.description && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {meeting.description}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
              <MoreHorizontal className="w-4 h-4 text-neutral-500" />
            </Button>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-neutral-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Date
                </p>
                <p className="text-xs font-medium text-neutral-950 dark:text-neutral-50">
                  {new Date(meeting._raw.startTime).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Clock className="w-4 h-4 text-neutral-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Time
                </p>
                <p className="text-xs font-medium text-neutral-950 dark:text-neutral-50">
                  {meeting.time} &middot; {meeting.duration}
                </p>
              </div>
            </div>
            {meeting.location && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Location
                  </p>
                  <p className="text-xs font-medium text-neutral-950 dark:text-neutral-50">
                    {meeting.location}
                  </p>
                </div>
              </div>
            )}
            {meeting.orgSource && !meeting.orgSource.isPersonal && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Organization
                  </p>
                  <p className="text-xs font-medium text-neutral-950 dark:text-neutral-50">
                    {meeting.orgSource.orgName}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Participants */}
          <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Participants ({meeting.participants.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {meeting.organizer && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
                  {meeting.organizer} (Organizer)
                </span>
              )}
              {meeting.participants.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            {meeting.status === 'ACCEPTED' && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Completed
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reschedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── SMA Section ── */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          {/* Tab bar */}
          <div className="flex border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto">
            {SMA_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = 'icon' in tab ? tab.icon : null;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors
                    ${
                      isActive
                        ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100'
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab meeting={meeting} hasSMA={hasSMA} />
            )}
            {activeTab === 'recording' && (
              <RecordingTab hasRecording={meeting.hasRecording} />
            )}
            {activeTab === 'transcript' && (
              <TranscriptTab hasTranscript={meeting.hasTranscript} />
            )}
            {activeTab === 'summary' && (
              <SummaryTab hasSummary={meeting.hasSummary} />
            )}
            {activeTab === 'actions' && (
              <ActionsTab hasActionItems={meeting.hasActionItems} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab: Overview ──
function OverviewTab({
  meeting,
  hasSMA,
}: {
  meeting: ReturnType<typeof toDisplayMeeting>;
  hasSMA: boolean;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
        Smart Meeting Assistant
      </h3>
      {hasSMA ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Recording',
              icon: Mic,
              ready: meeting.hasRecording,
              color: 'text-neutral-500',
            },
            {
              label: 'Transcript',
              icon: FileText,
              ready: meeting.hasTranscript,
              color: 'text-neutral-500',
            },
            {
              label: 'AI Summary',
              icon: FileText,
              ready: meeting.hasSummary,
              color: 'text-neutral-500',
            },
            {
              label: 'Action Items',
              icon: ClipboardList,
              ready: meeting.hasActionItems,
              color: 'text-neutral-500',
            },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors
                ${
                  item.ready
                    ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50'
                    : 'border-dashed border-neutral-200 dark:border-neutral-700'
                }`}
            >
              <item.icon
                className={`w-5 h-5 ${item.ready ? item.color : 'text-neutral-300 dark:text-neutral-600'}`}
              />
              <span
                className={`text-[11px] font-medium ${item.ready ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}`}
              >
                {item.label}
              </span>
              <span
                className={`text-[10px] ${item.ready ? 'text-emerald-500' : 'text-neutral-400'}`}
              >
                {item.ready ? 'Available' : 'Not available'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
            <Mic className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            No voice note uploaded
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs mb-4">
            Upload a recording to unlock transcript, AI summary, and
            auto-generated action items.
          </p>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Upload className="w-3.5 h-3.5" />
            Upload Recording
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Tab: Recording ──
function RecordingTab({ hasRecording }: { hasRecording?: boolean }) {
  if (!hasRecording) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <Mic className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          No voice note yet
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs mb-4">
          Upload an audio recording of this meeting to get started.
        </p>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Upload className="w-3.5 h-3.5" />
          Upload Recording
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
          Recording
        </h3>
        <span className="text-[10px] text-neutral-400">
          meeting-recording.webm &middot; 12.4 MB
        </span>
      </div>
      {/* Audio player placeholder */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          <Play className="w-4 h-4 text-white dark:text-neutral-900 ml-0.5" />
        </Button>
        <div className="flex-1">
          <div className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-neutral-900 dark:bg-neutral-100" />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-neutral-400">14:32</span>
            <span className="text-[10px] text-neutral-400">45:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Transcript ──
function TranscriptTab({ hasTranscript }: { hasTranscript?: boolean }) {
  if (!hasTranscript) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          No transcript available
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
          Upload a voice note first. The transcript will be generated
          automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-4">
        Transcript
      </h3>
      {mockTranscript.map((seg, i) => (
        <div
          key={i}
          className="flex gap-3 py-2.5 group hover:bg-neutral-50 dark:hover:bg-neutral-800/30 -mx-2 px-2 rounded-md transition-colors"
        >
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 w-8 shrink-0 pt-0.5 font-mono">
            {seg.time}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {seg.speaker}
            </span>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
              {seg.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab: AI Summary ──
function SummaryTab({ hasSummary }: { hasSummary?: boolean }) {
  if (!hasSummary) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          No AI summary yet
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
          A summary will be generated once the transcript is processed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-2 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-neutral-500" />
          AI Summary
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          The team discussed the Q1 roadmap and agreed to prioritize the
          analytics data pipeline. Alex will lead a POC this sprint. A client
          demo prototype is needed by Feb 20th, and Sarah will coordinate. The
          Q2 timeline for the analytics dashboard was flagged as tight, and Mike
          will review dependencies. The updated roadmap should be shared with
          stakeholders.
        </p>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
          Key Points
        </h4>
        <ul className="space-y-1.5">
          {[
            'Analytics data pipeline POC approved — Alex leading',
            'Client demo prototype deadline: Feb 20',
            'Q2 timeline dependencies need review',
            'Roadmap doc to be shared with stakeholders',
          ].map((point, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Tab: Action Items ──
function ActionsTab({ hasActionItems }: { hasActionItems?: boolean }) {
  if (!hasActionItems) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <ClipboardList className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          No action items
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
          Action items will be auto-generated from the AI summary once
          available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
        Action Items
      </h3>
      {mockActionItems.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors
            ${
              item.status === 'completed'
                ? 'border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20'
                : 'border-neutral-200 dark:border-neutral-700'
            }`}
        >
          <div
            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0
            ${
              item.status === 'completed'
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'border-2 border-neutral-300 dark:border-neutral-600'
            }`}
          >
            {item.status === 'completed' && (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${item.status === 'completed' ? 'text-neutral-400 line-through' : 'text-neutral-900 dark:text-neutral-100'}`}
            >
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                {item.assignedTo}
              </span>
              {item.dueDate && (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  &middot; Due {item.dueDate}
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                {item.category.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageMotion } from '@/components/PageMotion';
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
  Pause,
  MoreHorizontal,
  Edit3,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { queryKeys } from '@/lib/queryKeys';
import { meetingsApi } from '@/services/meetingsService';
import { toDisplayMeeting } from '@/lib/meetingHelpers';
import { getStatusStyle, getStatusLabel } from '@/types';
import type { TranscriptionStatus, ActionItem } from '@/types';
import { PageLoader } from '@/components/PageLoader';
import {
  useAcceptMeeting,
  useDeclineMeeting,
  useCancelMeeting,
  useCompleteMeeting,
} from '@/hooks/queries/useMeetingQueries';
import {
  useTranscript,
  useSummary,
  useActionItems,
  useRecordings,
  useUploadRecording,
  useTriggerAI,
} from '@/hooks/queries/useSMAQueries';
import type { SMATranscriptSegment, SMARecording } from '@/services/smaService';

// ── SMA Tab config ──
const SMA_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'recording', label: 'Recording', icon: Mic },
  { id: 'transcript', label: 'Transcript', icon: FileText },
  { id: 'summary', label: 'AI Summary', icon: FileText },
  { id: 'actions', label: 'Action Items', icon: ClipboardList },
] as const;

type SMATab = (typeof SMA_TABS)[number]['id'];

// ── Helpers ──
function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Loading Skeleton ──
function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg"
          style={{ width: `${75 + (i % 3) * 10}%` }}
        />
      ))}
    </div>
  );
}

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SMATab>('overview');
  const [moreOpen, setMoreOpen] = useState(false);
  const completedAtRef = useRef<number | null>(null);

  const accept = useAcceptMeeting();
  const decline = useDeclineMeeting();
  const cancel = useCancelMeeting();
  const complete = useCompleteMeeting();

  // Poll while transcription runs, then for 30s after COMPLETED to catch AI title update
  const { data: rawMeeting, isLoading } = useQuery({
    queryKey: queryKeys.meetings.detail(id ?? ''),
    queryFn: () => meetingsApi.getById(id ?? ''),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.transcriptionStatus;
      if (status === 'UPLOADED' || status === 'PROCESSING') {
        completedAtRef.current = null;
        return 3000;
      }
      if (status === 'COMPLETED') {
        if (!completedAtRef.current) completedAtRef.current = Date.now();
        if (Date.now() - completedAtRef.current < 30_000) return 4000;
      }
      return false;
    },
  });

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
  const transcriptionStatus = rawMeeting.transcriptionStatus;
  const statusClasses = getStatusStyle(meeting.status);
  const statusText = getStatusLabel(meeting.status);
  const hasSMA = transcriptionStatus !== 'NONE';

  return (
    <PageMotion>
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
              <Popover open={moreOpen} onOpenChange={setMoreOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                    <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-44 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
                  align="end"
                >
                  {(meeting.status === 'ACCEPTED' || meeting.status === 'CREATED') && (
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      onClick={() => { complete.mutate(rawMeeting.id, { onSuccess: () => toast.success('Marked as complete'), onError: () => toast.error('Failed') }); setMoreOpen(false); }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark complete
                    </button>
                  )}
                  {(meeting.status === 'PENDING_ACCEPTANCE' || meeting.status === 'RESCHEDULING_REQUESTED') && (
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      onClick={() => { accept.mutate(rawMeeting.id, { onSuccess: () => toast.success('Accepted'), onError: () => toast.error('Failed') }); setMoreOpen(false); }}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Accept
                    </button>
                  )}
                  {(meeting.status !== 'CANCELLED' && meeting.status !== 'DECLINED' && meeting.status !== 'COMPLETED') && (
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      onClick={() => { cancel.mutate({ id: rawMeeting.id }, { onSuccess: () => { toast.success('Cancelled'); navigate('/meetings'); }, onError: () => toast.error('Failed') }); setMoreOpen(false); }}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel meeting
                    </button>
                  )}
                </PopoverContent>
              </Popover>
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
            <div className="flex gap-2 mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex-wrap">
              {/* Pending: Accept + Decline */}
              {(meeting.status === 'PENDING_ACCEPTANCE' || meeting.status === 'RESCHEDULING_REQUESTED') && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
                    disabled={accept.isPending}
                    onClick={() => accept.mutate(rawMeeting.id, {
                      onSuccess: () => toast.success('Meeting accepted'),
                      onError: () => toast.error('Failed to accept'),
                    })}
                  >
                    {accept.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    disabled={decline.isPending}
                    onClick={() => decline.mutate({ id: rawMeeting.id }, {
                      onSuccess: () => { toast.success('Meeting declined'); navigate('/meetings'); },
                      onError: () => toast.error('Failed to decline'),
                    })}
                  >
                    {decline.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsDown className="w-3.5 h-3.5" />}
                    Decline
                  </Button>
                </>
              )}

              {/* Active: Mark Complete + Reschedule + Edit */}
              {(meeting.status === 'ACCEPTED' || meeting.status === 'CREATED') && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
                    disabled={complete.isPending}
                    onClick={() => complete.mutate(rawMeeting.id, {
                      onSuccess: () => toast.success('Marked as complete'),
                      onError: () => toast.error('Failed to update'),
                    })}
                  >
                    {complete.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Mark Complete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
                    onClick={() => toast.info('Reschedule coming soon')}
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
                    onClick={() => toast.info('Edit coming soon')}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </>
              )}

              <div className="flex-1" />

              {/* Cancel — only for active meetings */}
              {(meeting.status === 'ACCEPTED' || meeting.status === 'CREATED' || meeting.status === 'PENDING_ACCEPTANCE') && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs gap-1.5 h-8"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate({ id: rawMeeting.id }, {
                    onSuccess: () => { toast.success('Meeting cancelled'); navigate('/meetings'); },
                    onError: () => toast.error('Failed to cancel'),
                  })}
                >
                  {cancel.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── SMA Section ── */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as SMATab)}
            >
              <TabsList
                variant="line"
                className="w-full h-auto justify-start gap-0 rounded-none border-b border-neutral-200 dark:border-neutral-800 bg-transparent p-0 overflow-x-auto"
              >
                {SMA_TABS.map((tab) => {
                  const Icon = 'icon' in tab ? tab.icon : null;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap rounded-none h-auto border-b-2 border-transparent data-[state=active]:border-neutral-900 dark:data-[state=active]:border-neutral-100 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="overview" className="p-6 mt-0">
                <OverviewTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                  hasSMA={hasSMA}
                  onUploadClick={() => setActiveTab('recording')}
                />
              </TabsContent>
              <TabsContent value="recording" className="p-6 mt-0">
                <RecordingTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </TabsContent>
              <TabsContent value="transcript" className="p-6 mt-0">
                <TranscriptTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </TabsContent>
              <TabsContent value="summary" className="p-6 mt-0">
                <SummaryTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </TabsContent>
              <TabsContent value="actions" className="p-6 mt-0">
                <ActionsTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </PageMotion>
  );
}

// ── Tab: Overview ──
function OverviewTab({
  meetingId,
  transcriptionStatus,
  hasSMA,
  onUploadClick,
}: {
  meetingId: string;
  transcriptionStatus: TranscriptionStatus;
  hasSMA: boolean;
  onUploadClick: () => void;
}) {
  const isProcessing =
    transcriptionStatus === 'UPLOADED' || transcriptionStatus === 'PROCESSING';
  const isCompleted = transcriptionStatus === 'COMPLETED';
  const isFailed = transcriptionStatus === 'FAILED';

  const { data: summary } = useSummary(meetingId, isCompleted);
  const { mutate: triggerAI, isPending: isRetrying } = useTriggerAI(meetingId);
  // Show retry if transcription succeeded but AI has no summary (previous AI job failed)
  const aiMissing = isCompleted && !summary;

  const smaItems = [
    {
      label: 'Recording',
      icon: Mic,
      ready: hasSMA,
      processing: isProcessing,
    },
    {
      label: 'Transcript',
      icon: FileText,
      ready: isCompleted,
      processing: transcriptionStatus === 'PROCESSING',
    },
    {
      label: 'AI Summary',
      icon: FileText,
      ready: isCompleted,
      processing: false,
    },
    {
      label: 'Action Items',
      icon: ClipboardList,
      ready: isCompleted,
      processing: false,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
        Smart Meeting Assistant
      </h3>

      {isFailed && (
        <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            Transcription failed. Try uploading the recording again.
          </p>
        </div>
      )}

      {aiMissing && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            AI processing didn't complete. Generate summary and action items now.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 ml-3 shrink-0 h-7"
            onClick={() => triggerAI()}
            disabled={isRetrying}
          >
            {isRetrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
            {isRetrying ? 'Running…' : 'Retry AI'}
          </Button>
        </div>
      )}

      {hasSMA ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {smaItems.map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors
                ${
                  item.ready
                    ? 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50'
                    : 'border-dashed border-neutral-200 dark:border-neutral-700'
                }`}
            >
              {item.processing ? (
                <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
              ) : (
                <item.icon
                  className={`w-5 h-5 ${item.ready ? 'text-neutral-500' : 'text-neutral-300 dark:text-neutral-600'}`}
                />
              )}
              <span
                className={`text-[11px] font-medium ${item.ready ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}`}
              >
                {item.label}
              </span>
              <span
                className={`text-[10px] ${
                  item.processing
                    ? 'text-neutral-500 dark:text-neutral-400'
                    : item.ready
                      ? 'text-neutral-600 dark:text-neutral-400 font-medium'
                      : 'text-neutral-400 dark:text-neutral-500'
                }`}
              >
                {item.processing
                  ? 'Processing…'
                  : item.ready
                    ? 'Available'
                    : 'Not available'}
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
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={onUploadClick}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Recording
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Tab: Recording ──
function RecordingTab({
  meetingId,
  transcriptionStatus,
}: {
  meetingId: string;
  transcriptionStatus: TranscriptionStatus;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const { data: recordings, isLoading } = useRecordings(meetingId);
  const { mutate: upload, isPending: isUploading } =
    useUploadRecording(meetingId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      upload(file);
      e.target.value = '';
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audioDuration;
  };

  const recording: SMARecording | undefined = recordings?.[0];
  const hasRecording = !!recording || transcriptionStatus !== 'NONE';
  const isProcessing =
    transcriptionStatus === 'UPLOADED' || transcriptionStatus === 'PROCESSING';

  if (isLoading) {
    return <SkeletonLines count={2} />;
  }

  if (!hasRecording) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <Mic className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          No voice note yet
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs mb-4">
          Upload an audio or video recording to get a transcript, AI summary,
          and action items.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {isUploading ? 'Uploading…' : 'Upload Recording'}
        </Button>
      </div>
    );
  }

  const displayDuration = audioDuration || recording?.duration || 0;
  const progress =
    displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
          Recording
        </h3>
        {recording && (
          <span className="text-[10px] text-neutral-400">
            {recording.fileName} &middot; {formatFileSize(recording.fileSize)}
          </span>
        )}
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <Loader2 className="w-4 h-4 animate-spin text-neutral-500 shrink-0" />
          <div>
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {transcriptionStatus === 'UPLOADED'
                ? 'Queued for transcription…'
                : 'Transcribing…'}
            </p>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              This usually takes 1–3 minutes. The page will update
              automatically.
            </p>
          </div>
        </div>
      )}

      {/* Audio player */}
      {recording?.signedUrl ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
          <audio
            ref={audioRef}
            src={recording.signedUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
            }}
            onTimeUpdate={() =>
              setCurrentTime(audioRef.current?.currentTime ?? 0)
            }
            onLoadedMetadata={() =>
              setAudioDuration(audioRef.current?.duration ?? 0)
            }
            preload="metadata"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 shrink-0"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white dark:text-neutral-900" />
            ) : (
              <Play className="w-4 h-4 text-white dark:text-neutral-900 ml-0.5" />
            )}
          </Button>
          <div className="flex-1">
            <div
              className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-neutral-400 font-mono">
                {formatTimestamp(currentTime)}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {formatDuration(displayDuration)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        !isProcessing && (
          <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Recording unavailable — the playback link may have expired.
            </p>
          </div>
        )
      )}

      {/* Replace recording */}
      <div className="flex justify-end">
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-neutral-500"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isProcessing}
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {isUploading ? 'Uploading…' : 'Replace Recording'}
        </Button>
      </div>
    </div>
  );
}

// ── Tab: Transcript ──
function TranscriptTab({
  meetingId,
  transcriptionStatus,
}: {
  meetingId: string;
  transcriptionStatus: TranscriptionStatus;
}) {
  const isCompleted = transcriptionStatus === 'COMPLETED';
  const isProcessing =
    transcriptionStatus === 'UPLOADED' || transcriptionStatus === 'PROCESSING';

  const { data: transcript, isLoading } = useTranscript(meetingId, isCompleted);

  if (transcriptionStatus === 'NONE') {
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

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Loader2 className="w-8 h-8 text-neutral-400 animate-spin mb-3" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Transcribing your recording…
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
          This usually takes 1–3 minutes. Hang tight.
        </p>
      </div>
    );
  }

  if (transcriptionStatus === 'FAILED') {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          Transcription failed
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
          Something went wrong. Try uploading the recording again.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <SkeletonLines count={6} />;
  }

  if (!transcript || transcript.segments.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          No transcript segments
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
          The transcript may still be processing. Refresh the page in a moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-4">
        Transcript
      </h3>
      {transcript.segments.map((seg: SMATranscriptSegment) => (
        <div
          key={seg.id}
          className="flex gap-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 -mx-2 px-2 rounded-md transition-colors"
        >
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 w-10 shrink-0 pt-0.5 font-mono">
            {formatTimestamp(seg.startTime)}
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
function SummaryTab({
  meetingId,
  transcriptionStatus,
}: {
  meetingId: string;
  transcriptionStatus: TranscriptionStatus;
}) {
  const isCompleted = transcriptionStatus === 'COMPLETED';
  const {
    data: summary,
    isLoading,
    isError,
  } = useSummary(meetingId, isCompleted);

  if (isLoading) {
    return <SkeletonLines count={5} />;
  }

  if (isError || !summary) {
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
          {summary.summary}
        </p>
      </div>

      {summary.keyPoints.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
            Key Points
          </h4>
          <ul className="space-y-1.5">
            {summary.keyPoints.map((point: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Tab: Action Items ──
function ActionsTab({
  meetingId,
  transcriptionStatus,
}: {
  meetingId: string;
  transcriptionStatus: TranscriptionStatus;
}) {
  const isCompleted = transcriptionStatus === 'COMPLETED';
  const { data: actionItems, isLoading } = useActionItems(
    meetingId,
    isCompleted
  );

  if (isLoading) {
    return <SkeletonLines count={3} />;
  }

  if (!actionItems || actionItems.length === 0) {
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
      {actionItems.map((item: ActionItem) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors"
        >
          <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {item.assignedTo && (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  {item.assignedTo}
                </span>
              )}
              {item.suggestedStartDate && (
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  &middot; Due{' '}
                  {new Date(item.suggestedStartDate).toLocaleDateString(
                    'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                    }
                  )}
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                {item.category.replace(/_/g, ' ')}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

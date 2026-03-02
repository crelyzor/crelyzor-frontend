import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  Calendar,
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  Loader2,
  RefreshCcw,
  Users,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Meeting, TranscriptionStatus } from '@/types';
import { toDisplayMeeting } from '@/lib/meetingHelpers';
import {
  useCompleteMeeting,
} from '@/hooks/queries/useMeetingQueries';
import {
  useSpeakers,
  useRenameSpeaker,
  useSummary,
  useTriggerAI,
} from '@/hooks/queries/useSMAQueries';
import type { SMASpeaker } from '@/services/smaService';
import { RecordingTab, TranscriptTab, SummaryTab, ActionsTab } from './SharedTabs';

const RECORDED_TABS = [
  { id: 'recording', label: 'Recording' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'summary', label: 'AI Summary' },
  { id: 'actions', label: 'Action Items' },
] as const;

type RecordedTab = (typeof RECORDED_TABS)[number]['id'];

// ── Inline speaker rename ──
function SpeakerChip({
  speaker,
  meetingId,
}: {
  speaker: SMASpeaker;
  meetingId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(speaker.displayName ?? speaker.speakerLabel);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: rename, isPending } = useRenameSpeaker(meetingId);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  // Sync if parent data changes (e.g. after rename)
  useEffect(() => {
    if (!editing) setValue(speaker.displayName ?? speaker.speakerLabel);
  }, [speaker.displayName, speaker.speakerLabel, editing]);

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === (speaker.displayName ?? speaker.speakerLabel)) {
      setEditing(false);
      return;
    }
    rename(
      { speakerId: speaker.id, displayName: trimmed },
      { onSettled: () => setEditing(false) }
    );
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') {
              setValue(speaker.displayName ?? speaker.speakerLabel);
              setEditing(false);
            }
          }}
          className="px-2 py-0.5 rounded-md text-xs font-medium border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-500 dark:focus:border-neutral-400 w-28"
        />
        {isPending && <Loader2 className="w-3 h-3 animate-spin text-neutral-400 shrink-0" />}
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
      title={`${speaker.speakerLabel} — click to rename`}
    >
      <span>{speaker.displayName ?? speaker.speakerLabel}</span>
      <Pencil className="w-2.5 h-2.5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}

export function RecordedDetail({
  meeting: rawMeeting,
  transcriptionStatus,
}: {
  meeting: Meeting;
  transcriptionStatus: TranscriptionStatus;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RecordedTab>('recording');
  const [moreOpen, setMoreOpen] = useState(false);

  const meeting = toDisplayMeeting(rawMeeting);
  const isCompleted = transcriptionStatus === 'COMPLETED';

  const complete = useCompleteMeeting();
  const { data: speakers } = useSpeakers(rawMeeting.id, isCompleted);
  const { data: summary } = useSummary(rawMeeting.id, isCompleted);
  const { mutate: triggerAI, isPending: isRetrying } = useTriggerAI(rawMeeting.id);
  const aiMissing = isCompleted && !summary;

  // Build a speakerLabel → displayName map for use in TranscriptTab
  const speakerNames: Record<string, string> = {};
  for (const s of speakers ?? []) {
    if (s.displayName) speakerNames[s.speakerLabel] = s.displayName;
  }

  const recordedOn = new Date(rawMeeting.startTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const canComplete =
    rawMeeting.status === 'ACCEPTED' || rawMeeting.status === 'CREATED';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/meetings')}
        className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Meetings
      </button>

      {/* Header */}
      <Card className="border-neutral-200 dark:border-neutral-800 mb-4">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
                {meeting.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-3 h-3" />
                  {recordedOn}
                </span>
                <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                  <Clock className="w-3 h-3" />
                  {meeting.duration}
                </span>
              </div>
            </div>

            {/* ⋯ menu */}
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
                {canComplete && (
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    disabled={complete.isPending}
                    onClick={() => {
                      complete.mutate(rawMeeting.id, {
                        onSuccess: () => toast.success('Marked as complete'),
                        onError: () => toast.error('Failed'),
                      });
                      setMoreOpen(false);
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark complete
                  </button>
                )}
                <button
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  onClick={() => {
                    toast.info('Delete coming soon');
                    setMoreOpen(false);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Speakers section */}
          {speakers && speakers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Users className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  Speakers ({speakers.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {speakers.map((s) => (
                  <SpeakerChip key={s.id} speaker={s} meetingId={rawMeeting.id} />
                ))}
              </div>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
                Click a speaker to rename them
              </p>
            </div>
          )}

          {/* AI missing banner */}
          {aiMissing && (
            <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                AI processing didn't complete.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 ml-3 shrink-0 h-7"
                onClick={() => triggerAI()}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCcw className="w-3 h-3" />
                )}
                {isRetrying ? 'Running…' : 'Retry AI'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as RecordedTab)}
          >
            <TabsList
              variant="line"
              className="w-full h-auto justify-start gap-0 rounded-none border-b border-neutral-200 dark:border-neutral-800 bg-transparent p-0 overflow-x-auto"
            >
              {RECORDED_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-4 py-3 text-xs font-medium whitespace-nowrap rounded-none h-auto border-b-2 border-transparent data-[state=active]:border-neutral-900 dark:data-[state=active]:border-neutral-100 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

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
                speakerNames={speakerNames}
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
  );
}

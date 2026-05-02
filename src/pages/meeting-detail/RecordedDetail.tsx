import { useState, useEffect, useRef } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
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
  Languages,
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
import { useCompleteMeeting, useUpdateMeeting } from '@/hooks/queries/useMeetingQueries';
import {
  useSpeakers,
  useSummary,
  useTriggerAI,
  useRegenerateTitle,
  useRegenerateTranscript,
} from '@/hooks/queries/useSMAQueries';
import {
  RecordingTab,
  TranscriptTab,
  SummaryTab,
  ActionsTab,
  NotesTab,
  AskAITab,
  GenerateTab,
} from './SharedTabs';
import { SpeakersSection } from './meetingDetailHelpers';
import { DeleteMeetingModal } from './DeleteMeetingModal';
import { ShareSheet } from './ShareSheet';
import { TagsSection } from './TagsSection';
import { AttachmentsSection } from './AttachmentsSection';
import { ChangeLanguageDialog } from './ChangeLanguageDialog';

const RECORDED_TABS = [
  { id: 'recording', label: 'Recording' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'summary', label: 'AI Summary' },
  { id: 'actions', label: 'Tasks' },
  { id: 'notes', label: 'Notes' },
  { id: 'ask', label: 'Ask AI' },
  { id: 'generate', label: 'Generate' },
] as const;

type RecordedTab = (typeof RECORDED_TABS)[number]['id'];

export function RecordedDetail({
  meeting: rawMeeting,
  transcriptionStatus,
  initialTab,
}: {
  meeting: Meeting;
  transcriptionStatus: TranscriptionStatus;
  initialTab?: RecordedTab;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RecordedTab>(
    initialTab ?? 'recording'
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  const meeting = toDisplayMeeting(rawMeeting);
  const isCompleted = transcriptionStatus === 'COMPLETED';

  const complete = useCompleteMeeting();
  const updateMeeting = useUpdateMeeting();

  const startEditTitle = () => {
    setEditTitleValue(meeting.title);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  };

  const saveTitle = () => {
    const trimmed = editTitleValue.trim();
    if (!trimmed || trimmed === meeting.title) {
      setIsEditingTitle(false);
      return;
    }
    updateMeeting.mutate(
      { id: rawMeeting.id, data: { title: trimmed } },
      {
        onSuccess: () => {
          toast.success('Title updated');
          setIsEditingTitle(false);
        },
      }
    );
  };
  const { data: speakers } = useSpeakers(rawMeeting.id, isCompleted);
  const { data: summary } = useSummary(rawMeeting.id, isCompleted);
  const { mutate: triggerAI, isPending: isRetrying } = useTriggerAI(
    rawMeeting.id
  );
  const { mutate: regenerateTitle, isPending: isRegeneratingTitle } =
    useRegenerateTitle(rawMeeting.id);
  const { mutate: regenerateTranscript, isPending: isRegeneratingTranscript } =
    useRegenerateTranscript(rawMeeting.id);
  const aiMissing = isCompleted && !summary;

  // Build a speakerLabel → displayName map for use in TranscriptTab
  const speakerNames: Record<string, string> = {};
  for (const s of speakers ?? []) {
    if (s.displayName) speakerNames[s.speakerLabel] = s.displayName;
  }

  const recordedOn = new Date(rawMeeting.startTime).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  const canComplete =
    rawMeeting.status === 'ACCEPTED' || rawMeeting.status === 'CREATED';

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

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
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTitle();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="w-full text-xl font-semibold tracking-tight bg-transparent border-b border-neutral-300 dark:border-neutral-600 text-neutral-950 dark:text-neutral-50 outline-none pb-0.5"
                  autoFocus
                />
              ) : (
                <h1 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
                  {meeting.title}
                </h1>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-3 h-3" />
                  {recordedOn}
                </span>
                <span className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                  <Clock className="w-3 h-3" />
                  {meeting.duration}
                </span>
                {rawMeeting.meetLink && (
                  <a
                    href={rawMeeting.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    Join meeting →
                  </a>
                )}
              </div>
              <div className="mt-2.5">
                <TagsSection meetingId={rawMeeting.id} />
              </div>
              <div className="mt-2">
                <AttachmentsSection meetingId={rawMeeting.id} />
              </div>
            </div>

            {/* Share + ⋯ menu */}
            <div className="flex items-center gap-1 shrink-0">
              <ShareSheet
                meetingId={rawMeeting.id}
                meetingTitle={meeting.title}
                transcriptionStatus={transcriptionStatus}
              />
              <Popover open={moreOpen} onOpenChange={setMoreOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                  >
                    <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-44 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
                  align="end"
                >
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    onClick={() => {
                      setMoreOpen(false);
                      startEditTitle();
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Title
                  </button>
                  {isCompleted && (
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      disabled={isRegeneratingTitle}
                      onClick={() => {
                        regenerateTitle();
                        setMoreOpen(false);
                      }}
                    >
                      {isRegeneratingTitle ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCcw className="w-3.5 h-3.5" />
                      )}
                      Regenerate Title
                    </button>
                  )}
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    disabled={isRegeneratingTranscript}
                    onClick={() => {
                      regenerateTranscript();
                      setMoreOpen(false);
                    }}
                  >
                    {isRegeneratingTranscript ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCcw className="w-3.5 h-3.5" />
                    )}
                    Regenerate Transcript
                  </button>
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    onClick={() => {
                      setLangOpen(true);
                      setMoreOpen(false);
                    }}
                  >
                    <Languages className="w-3.5 h-3.5" />
                    Change Language
                  </button>
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    onClick={() => {
                      setDeleteOpen(true);
                      setMoreOpen(false);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Speakers section */}
          {speakers && speakers.length > 0 && (
            <SpeakersSection
              speakers={speakers}
              meetingId={rawMeeting.id}
              participantNames={rawMeeting.participants
                .map((p) => p.user?.name ?? p.guestEmail ?? null)
                .filter((n): n is string => !!n)}
            />
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
              className="w-full h-auto justify-start gap-0 rounded-none border-b border-neutral-200 dark:border-neutral-800 bg-transparent p-0 overflow-x-auto scrollbar-hide"
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

            <TabsContent value="recording" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary
                fallback={
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
                    Something went wrong in this tab
                  </p>
                }
              >
                <RecordingTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="transcript" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary
                fallback={
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
                    Something went wrong in this tab
                  </p>
                }
              >
                <TranscriptTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                  speakerNames={speakerNames}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="summary" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary
                fallback={
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
                    Something went wrong in this tab
                  </p>
                }
              >
                <SummaryTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="actions" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary
                fallback={
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
                    Something went wrong in this tab
                  </p>
                }
              >
                <ActionsTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="notes" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary
                fallback={
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
                    Something went wrong in this tab
                  </p>
                }
              >
                <NotesTab meetingId={rawMeeting.id} />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="ask" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary
                fallback={
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
                    Something went wrong in this tab
                  </p>
                }
              >
                <AskAITab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="generate" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary
                fallback={
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
                    Something went wrong in this tab
                  </p>
                }
              >
                <GenerateTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DeleteMeetingModal
        meetingId={rawMeeting.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate('/meetings')}
      />
      <ChangeLanguageDialog
        meetingId={rawMeeting.id}
        open={langOpen}
        onOpenChange={setLangOpen}
      />
    </div>
  );
}

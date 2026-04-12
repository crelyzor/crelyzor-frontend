import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Copy,
  MapPin,
  Users,
  MoreHorizontal,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Edit3,
  Languages,
  Video,
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
import { getStatusStyle, getStatusLabel } from '@/types';
import { toDisplayMeeting } from '@/lib/meetingHelpers';
import {
  useAcceptMeeting,
  useDeclineMeeting,
  useCancelMeeting,
  useCompleteMeeting,
} from '@/hooks/queries/useMeetingQueries';
import {
  RecordingTab,
  TranscriptTab,
  SummaryTab,
  ActionsTab,
  NotesTab,
  OverviewTab,
  AskAITab,
  GenerateTab,
} from './SharedTabs';
import { EditMeetingModal } from './EditMeetingModal';
import { RescheduleMeetingModal } from './RescheduleMeetingModal';
import { ShareSheet } from './ShareSheet';
import {
  useRegenerateTitle,
  useRegenerateTranscript,
} from '@/hooks/queries/useSMAQueries';
import { TagsSection } from './TagsSection';
import { AttachmentsSection } from './AttachmentsSection';
import { ChangeLanguageDialog } from './ChangeLanguageDialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function TabError() {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-muted-foreground">
        Something went wrong in this section.
      </p>
      <button
        className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 underline underline-offset-2"
        onClick={() => window.location.reload()}
      >
        Refresh page
      </button>
    </div>
  );
}

const SCHEDULED_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'summary', label: 'AI Summary' },
  { id: 'actions', label: 'Tasks' },
  { id: 'notes', label: 'Notes' },
  { id: 'recording', label: 'Recording' },
  { id: 'ask', label: 'Ask AI' },
  { id: 'generate', label: 'Generate' },
] as const;

type ScheduledTab = (typeof SCHEDULED_TABS)[number]['id'];

export function ScheduledDetail({
  meeting: rawMeeting,
  transcriptionStatus,
  initialTab,
}: {
  meeting: Meeting;
  transcriptionStatus: TranscriptionStatus;
  initialTab?: ScheduledTab;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ScheduledTab>(
    initialTab ?? 'overview'
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const accept = useAcceptMeeting();
  const decline = useDeclineMeeting();
  const cancel = useCancelMeeting();
  const complete = useCompleteMeeting();

  const meeting = toDisplayMeeting(rawMeeting);
  const statusClasses = getStatusStyle(meeting.status);
  const statusText = getStatusLabel(meeting.status);
  const hasSMA = transcriptionStatus !== 'NONE';
  const isCompleted = transcriptionStatus === 'COMPLETED';

  const { mutate: regenerateTitle, isPending: isRegeneratingTitle } =
    useRegenerateTitle(rawMeeting.id);
  const { mutate: regenerateTranscript, isPending: isRegeneratingTranscript } =
    useRegenerateTranscript(rawMeeting.id);

  const canAccept =
    rawMeeting.status === 'PENDING_ACCEPTANCE' ||
    rawMeeting.status === 'RESCHEDULING_REQUESTED';
  const canComplete =
    rawMeeting.status === 'ACCEPTED' || rawMeeting.status === 'CREATED';
  const canCancel =
    rawMeeting.status === 'ACCEPTED' ||
    rawMeeting.status === 'CREATED' ||
    rawMeeting.status === 'PENDING_ACCEPTANCE';

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

      {/* Header Card */}
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
                      onClick={() => {
                        complete.mutate(rawMeeting.id, {
                          onSuccess: () => toast.success('Marked as complete'),
                          onError: () => toast.error('Failed'),
                        });
                        setMoreOpen(false);
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark complete
                    </button>
                  )}
                  {canAccept && (
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      onClick={() => {
                        accept.mutate(rawMeeting.id, {
                          onSuccess: () => toast.success('Accepted'),
                          onError: () => toast.error('Failed'),
                        });
                        setMoreOpen(false);
                      }}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Accept
                    </button>
                  )}
                  {hasSMA && (
                    <>
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
                    </>
                  )}
                  {canCancel && (
                    <button
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      onClick={() => {
                        cancel.mutate(
                          { id: rawMeeting.id },
                          {
                            onSuccess: () => {
                              toast.success('Cancelled');
                              navigate('/meetings');
                            },
                            onError: () => toast.error('Failed'),
                          }
                        );
                        setMoreOpen(false);
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel meeting
                    </button>
                  )}
                </PopoverContent>
              </Popover>
            </div>
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
                  {new Date(rawMeeting.startTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
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
                  {meeting.time} · {meeting.duration}
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
                Participants (
                {rawMeeting.participants.length +
                  (rawMeeting.guests?.length ?? 0)}
                )
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {meeting.organizer && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
                  {meeting.organizer} (Organizer)
                </span>
              )}
              {rawMeeting.participants.map((p) => {
                const label =
                  p.user?.name ?? p.user?.email ?? p.guestEmail ?? 'Unknown';
                if (p.card) {
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/cards/${p.card!.id}/edit`)}
                      className="px-2.5 py-1 rounded-full text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border border-neutral-700 dark:border-neutral-300 hover:opacity-80 transition-opacity flex items-center gap-1"
                    >
                      <span>{label}</span>
                      <span className="text-[9px] opacity-60">
                        ↗ {p.card.displayName}
                      </span>
                    </button>
                  );
                }
                return (
                  <span
                    key={p.id}
                    className="px-2.5 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    {label}
                  </span>
                );
              })}
              {rawMeeting.guests?.map((g) => (
                <span
                  key={g.id}
                  className="px-2.5 py-1 rounded-full text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                >
                  {g.name ?? g.email}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Tags
              </span>
            </div>
            <TagsSection meetingId={rawMeeting.id} />
          </div>

          {/* Attachments */}
          <div className="mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Attachments
              </span>
            </div>
            <AttachmentsSection meetingId={rawMeeting.id} />
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mt-5 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex-wrap">
            {rawMeeting.meetLink && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs gap-1.5 h-8"
                  asChild
                >
                  <a
                    href={rawMeeting.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Meeting
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(rawMeeting.meetLink!);
                    toast.success('Link copied');
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </>
            )}

            {canAccept && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
                  disabled={accept.isPending}
                  onClick={() =>
                    accept.mutate(rawMeeting.id, {
                      onSuccess: () => toast.success('Meeting accepted'),
                      onError: () => toast.error('Failed to accept'),
                    })
                  }
                >
                  {accept.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-3.5 h-3.5" />
                  )}
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  disabled={decline.isPending}
                  onClick={() =>
                    decline.mutate(
                      { id: rawMeeting.id },
                      {
                        onSuccess: () => {
                          toast.success('Meeting declined');
                          navigate('/meetings');
                        },
                        onError: () => toast.error('Failed to decline'),
                      }
                    )
                  }
                >
                  {decline.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ThumbsDown className="w-3.5 h-3.5" />
                  )}
                  Decline
                </Button>
              </>
            )}

            {canComplete && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
                  disabled={complete.isPending}
                  onClick={() =>
                    complete.mutate(rawMeeting.id, {
                      onSuccess: () => toast.success('Marked as complete'),
                      onError: () => toast.error('Failed to update'),
                    })
                  }
                >
                  {complete.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
                  onClick={() => setRescheduleOpen(true)}
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5 h-8 border-neutral-200 dark:border-neutral-700"
                  onClick={() => setEditOpen(true)}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Button>
              </>
            )}

            <div className="flex-1" />

            {canCancel && (
              <Button
                variant="destructive"
                size="sm"
                className="text-xs gap-1.5 h-8"
                disabled={cancel.isPending}
                onClick={() =>
                  cancel.mutate(
                    { id: rawMeeting.id },
                    {
                      onSuccess: () => {
                        toast.success('Meeting cancelled');
                        navigate('/meetings');
                      },
                      onError: () => toast.error('Failed to cancel'),
                    }
                  )
                }
              >
                {cancel.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SMA Tabs */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ScheduledTab)}
          >
            <TabsList
              variant="line"
              className="w-full h-auto justify-start gap-0 rounded-none border-b border-neutral-200 dark:border-neutral-800 bg-transparent p-0 overflow-x-auto scrollbar-hide"
            >
              {SCHEDULED_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-4 py-3 text-xs font-medium whitespace-nowrap rounded-none h-auto border-b-2 border-transparent data-[state=active]:border-neutral-900 dark:data-[state=active]:border-neutral-100 data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-neutral-900 dark:data-[state=active]:text-neutral-100 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary fallback={<TabError />}>
                <OverviewTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                  hasSMA={hasSMA}
                  onUploadClick={() => setActiveTab('recording')}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="transcript" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary fallback={<TabError />}>
                <TranscriptTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="summary" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary fallback={<TabError />}>
                <SummaryTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="actions" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary fallback={<TabError />}>
                <ActionsTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="notes" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary fallback={<TabError />}>
                <NotesTab meetingId={rawMeeting.id} />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="recording" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary fallback={<TabError />}>
                <RecordingTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="ask" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary fallback={<TabError />}>
                <AskAITab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
            <TabsContent value="generate" className="p-4 sm:p-6 mt-0">
              <ErrorBoundary fallback={<TabError />}>
                <GenerateTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <EditMeetingModal
        meeting={rawMeeting}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <RescheduleMeetingModal
        meeting={rawMeeting}
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
      />
      <ChangeLanguageDialog
        meetingId={rawMeeting.id}
        open={langOpen}
        onOpenChange={setLangOpen}
      />
    </div>
  );
}

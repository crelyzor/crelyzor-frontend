import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MoreHorizontal,
  Trash2,
  Loader2,
  RefreshCcw,
  Languages,
  Mic,
  FileText,
  Sparkles,
  ListTodo,
  PenLine,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Meeting, TranscriptionStatus } from '@/types';
import { toDisplayMeeting } from '@/lib/meetingHelpers';
import {
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
import { DeleteMeetingModal } from './DeleteMeetingModal';
import { ShareSheet } from './ShareSheet';
import { TagsSection } from './TagsSection';
import { AttachmentsSection } from './AttachmentsSection';
import { ChangeLanguageDialog } from './ChangeLanguageDialog';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const VOICE_NOTE_TABS = [
  { id: 'recording', label: 'Recording', Icon: Mic },
  { id: 'transcript', label: 'Transcript', Icon: FileText },
  { id: 'summary', label: 'AI Summary', Icon: Sparkles },
  { id: 'actions', label: 'Tasks', Icon: ListTodo },
  { id: 'notes', label: 'Notes', Icon: PenLine },
  { id: 'ask', label: 'Ask AI', Icon: MessageSquare },
  { id: 'generate', label: 'Generate', Icon: Zap },
] as const;

type VoiceNoteTab = (typeof VOICE_NOTE_TABS)[number]['id'];

export function VoiceNoteDetail({
  meeting: rawMeeting,
  transcriptionStatus,
}: {
  meeting: Meeting;
  transcriptionStatus: TranscriptionStatus;
}) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<VoiceNoteTab>('recording');
  const [moreOpen, setMoreOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const meeting = toDisplayMeeting(rawMeeting);
  const isCompleted = transcriptionStatus === 'COMPLETED';

  const { data: summary } = useSummary(rawMeeting.id, isCompleted);
  const { mutate: triggerAI, isPending: isRetrying } = useTriggerAI(
    rawMeeting.id
  );
  const { mutate: regenerateTitle, isPending: isRegeneratingTitle } =
    useRegenerateTitle(rawMeeting.id);
  const { mutate: regenerateTranscript, isPending: isRegeneratingTranscript } =
    useRegenerateTranscript(rawMeeting.id);
  const aiMissing = isCompleted && !summary;

  const recordedOn = new Date(rawMeeting.startTime).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/voice-notes')}
        className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Voice Notes
      </button>

      {/* Header */}
      <Card className="border-neutral-200 dark:border-neutral-800 mb-4">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight leading-snug">
                {meeting.title}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {recordedOn}
                </span>
                <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                  <Clock className="w-3 h-3" />
                  {meeting.duration}
                </div>
                {rawMeeting.meetLink && (
                  <a
                    href={rawMeeting.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
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

      {/* Sidebar + content */}
      <Card className="border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="flex min-h-[420px]">
          {/* Left nav */}
          <nav className="w-44 shrink-0 border-r border-neutral-100 dark:border-neutral-800 py-3 flex flex-col gap-0.5 px-2">
            {VOICE_NOTE_TABS.map(({ id, label, Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left w-full
                    ${
                      isActive
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-400 dark:text-neutral-500'}`}
                  />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 p-5 sm:p-6">
            <ErrorBoundary
              fallback={
                <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
                  Something went wrong
                </p>
              }
            >
              {activeTab === 'recording' && (
                <RecordingTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              )}
              {activeTab === 'transcript' && (
                <TranscriptTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              )}
              {activeTab === 'summary' && (
                <SummaryTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              )}
              {activeTab === 'actions' && (
                <ActionsTab meetingId={rawMeeting.id} />
              )}
              {activeTab === 'notes' && <NotesTab meetingId={rawMeeting.id} />}
              {activeTab === 'ask' && (
                <AskAITab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              )}
              {activeTab === 'generate' && (
                <GenerateTab
                  meetingId={rawMeeting.id}
                  transcriptionStatus={transcriptionStatus}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </Card>

      <DeleteMeetingModal
        meetingId={rawMeeting.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate('/voice-notes')}
      />
      <ChangeLanguageDialog
        meetingId={rawMeeting.id}
        open={langOpen}
        onOpenChange={setLangOpen}
      />
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MoreHorizontal,
  Trash2,
  Loader2,
  RefreshCcw,
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
import { useSummary, useTriggerAI } from '@/hooks/queries/useSMAQueries';
import {
  RecordingTab,
  TranscriptTab,
  SummaryTab,
  NotesTab,
  AskAITab,
} from './SharedTabs';
import { DeleteMeetingModal } from './DeleteMeetingModal';
import { SkeletonLines } from './meetingDetailHelpers';

export function VoiceNoteDetail({
  meeting: rawMeeting,
  transcriptionStatus,
}: {
  meeting: Meeting;
  transcriptionStatus: TranscriptionStatus;
}) {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const meeting = toDisplayMeeting(rawMeeting);
  const isCompleted = transcriptionStatus === 'COMPLETED';

  const { data: summary } = useSummary(rawMeeting.id, isCompleted);
  const { mutate: triggerAI, isPending: isRetrying } = useTriggerAI(
    rawMeeting.id
  );
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
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate('/voice-notes')}
        className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Voice Notes
      </button>

      {/* Header */}
      <Card className="border-neutral-200 dark:border-neutral-800 mb-5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight leading-snug">
                {meeting.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {recordedOn}
                </span>
                <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                  <Clock className="w-3 h-3" />
                  {meeting.duration}
                </div>
              </div>
            </div>

            {/* ⋯ menu */}
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
                className="w-40 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
                align="end"
              >
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

      {/* Flat scroll sections */}
      <div className="space-y-5 pb-16">
        {/* Recording player */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            <RecordingTab
              meetingId={rawMeeting.id}
              transcriptionStatus={transcriptionStatus}
            />
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            <TranscriptTab
              meetingId={rawMeeting.id}
              transcriptionStatus={transcriptionStatus}
            />
          </CardContent>
        </Card>

        {/* Summary + key points */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            {!isCompleted ? (
              <div>
                <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-3">
                  AI Summary
                </h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Available after transcription completes.
                </p>
              </div>
            ) : !summary ? (
              <SkeletonLines count={4} />
            ) : (
              <SummaryTab
                meetingId={rawMeeting.id}
                transcriptionStatus={transcriptionStatus}
              />
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            <NotesTab meetingId={rawMeeting.id} />
          </CardContent>
        </Card>

        {/* Ask AI */}
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-5">
            <AskAITab
              meetingId={rawMeeting.id}
              transcriptionStatus={transcriptionStatus}
            />
          </CardContent>
        </Card>
      </div>

      <DeleteMeetingModal
        meetingId={rawMeeting.id}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate('/voice-notes')}
      />
    </div>
  );
}

import { useRef, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import {
  Mic,
  FileText,
  ClipboardList,
  StickyNote,
  Upload,
  Play,
  Pause,
  RefreshCcw,
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  SendHorizonal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TranscriptionStatus, Task } from '@/types';
import type {
  SMATranscriptSegment,
  SMARecording,
  MeetingNote,
} from '@/services/smaService';
import {
  useTranscript,
  useSummary,
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useNotes,
  useCreateNote,
  useDeleteNote,
  useRecordings,
  useUploadRecording,
  useTriggerAI,
  useRegenerateSummary,
} from '@/hooks/queries/useSMAQueries';
import { smaApi } from '@/services/smaService';
import { toast } from 'sonner';
import {
  formatTimestamp,
  formatFileSize,
  formatDuration,
  SkeletonLines,
} from './meetingDetailHelpers';

// ── Recording Tab ──
export function RecordingTab({
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
    if (isPlaying) audio.pause();
    else audio.play();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !effectiveDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * effectiveDuration;
  };

  const recording: SMARecording | undefined = recordings?.[0];
  const hasRecording = !!recording || transcriptionStatus !== 'NONE';
  const isProcessing =
    transcriptionStatus === 'UPLOADED' || transcriptionStatus === 'PROCESSING';

  // audio.duration can return Infinity when GCS doesn't support range requests.
  // Fall back to the DB-stored duration in that case.
  const effectiveDuration =
    isFinite(audioDuration) && audioDuration > 0
      ? audioDuration
      : (recording?.duration ?? 0);
  const progress =
    effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  if (isLoading) return <SkeletonLines count={2} />;

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
          No recording yet
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
          Recording
        </h3>
        {recording && (
          <span className="text-[10px] text-neutral-400">
            {recording.fileName} · {formatFileSize(recording.fileSize)}
          </span>
        )}
      </div>

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
              Usually takes 1–3 minutes. This page updates automatically.
            </p>
          </div>
        </div>
      )}

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
                {formatDuration(effectiveDuration)}
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

// ── Transcript Tab ──
export function TranscriptTab({
  meetingId,
  transcriptionStatus,
  speakerNames = {},
}: {
  meetingId: string;
  transcriptionStatus: TranscriptionStatus;
  /** Map of speakerLabel → displayName for replacing labels in transcript */
  speakerNames?: Record<string, string>;
}) {
  const isCompleted = transcriptionStatus === 'COMPLETED';
  const isProcessing =
    transcriptionStatus === 'UPLOADED' || transcriptionStatus === 'PROCESSING';
  const { data: transcript, isLoading } = useTranscript(meetingId, isCompleted);

  if (transcriptionStatus === 'NONE') {
    return (
      <EmptyState
        icon={FileText}
        title="No transcript available"
        body="Upload a recording first. The transcript will be generated automatically."
      />
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
      <EmptyState
        icon={FileText}
        title="Transcription failed"
        body="Something went wrong. Try uploading the recording again."
      />
    );
  }

  if (isLoading) return <SkeletonLines count={6} />;

  if (!transcript || transcript.segments.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No transcript segments"
        body="The transcript may still be processing. Refresh in a moment."
      />
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
              {speakerNames[seg.speaker] ?? seg.speaker}
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

// ── Summary Tab ──
export function SummaryTab({
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
  const { mutate: regenerate, isPending: isRegenerating } =
    useRegenerateSummary(meetingId);

  if (!isCompleted) {
    return (
      <EmptyState
        icon={FileText}
        title="No AI summary yet"
        body="A summary will be generated once the transcript is processed."
      />
    );
  }

  if (isLoading) return <SkeletonLines count={5} />;

  if (isError || !summary) {
    return (
      <EmptyState
        icon={FileText}
        title="No AI summary yet"
        body="A summary will be generated once the transcript is processed."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-neutral-500" />
            AI Summary
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-neutral-500 gap-1"
            onClick={() => regenerate()}
            disabled={isRegenerating}
          >
            {isRegenerating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCcw className="w-3 h-3" />
            )}
            {isRegenerating ? 'Regenerating…' : 'Regenerate'}
          </Button>
        </div>
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

// ── Tasks Tab ──
export function ActionsTab({
  meetingId,
}: {
  meetingId: string;
  transcriptionStatus?: TranscriptionStatus; // kept for caller compatibility, unused
}) {
  const [newTitle, setNewTitle] = useState('');
  const qc = useQueryClient();

  const { data: tasks, isLoading } = useTasks(meetingId);
  const { mutate: createTask, isPending: isCreating } =
    useCreateTask(meetingId);
  const { mutate: updateTask } = useUpdateTask(meetingId);
  const { mutate: deleteTask } = useDeleteTask(meetingId);

  const handleToggle = (task: Task) => {
    const newCompleted = !task.isCompleted;
    // Optimistic update
    qc.setQueryData(queryKeys.sma.tasks(meetingId), (old: Task[] | undefined) =>
      old?.map((t) =>
        t.id === task.id ? { ...t, isCompleted: newCompleted } : t
      )
    );
    updateTask(
      { taskId: task.id, data: { isCompleted: newCompleted } },
      {
        onError: () => {
          // Roll back on failure
          qc.setQueryData(
            queryKeys.sma.tasks(meetingId),
            (old: Task[] | undefined) =>
              old?.map((t) =>
                t.id === task.id ? { ...t, isCompleted: task.isCompleted } : t
              )
          );
        },
      }
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createTask(
      { title: newTitle.trim() },
      { onSuccess: () => setNewTitle('') }
    );
  };

  if (isLoading) return <SkeletonLines count={3} />;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
        Tasks
      </h3>

      {/* Inline create form */}
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a task…"
          className="flex-1 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
          disabled={isCreating}
        />
        <Button
          type="submit"
          size="icon"
          variant="outline"
          className="h-9 w-9 shrink-0"
          disabled={!newTitle.trim() || isCreating}
        >
          {isCreating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </Button>
      </form>

      {/* Task list */}
      {!tasks || tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks yet"
          body="Add tasks above or they'll be auto-generated from the AI summary."
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task: Task) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 group"
            >
              {/* Toggle checkbox */}
              <button
                type="button"
                onClick={() => handleToggle(task)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 transition-colors cursor-pointer ${
                  task.isCompleted
                    ? 'border-neutral-900 bg-neutral-900 dark:border-neutral-100 dark:bg-neutral-100'
                    : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 dark:hover:border-neutral-400'
                }`}
              />

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium transition-colors ${
                    task.isCompleted
                      ? 'line-through text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {task.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {task.dueDate && (
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                      Due{' '}
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                  {task.priority && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                      {task.priority}
                    </span>
                  )}
                  {task.source === 'AI_EXTRACTED' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500">
                      AI
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Delete button — visible on row hover */}
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-6 w-6 text-neutral-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Overview Tab (SCHEDULED only) ──
export function OverviewTab({
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
  const aiMissing = isCompleted && !summary;

  const smaItems = [
    { label: 'Recording', icon: Mic, ready: hasSMA, processing: isProcessing },
    {
      label: 'Transcript',
      icon: FileText,
      ready: isCompleted,
      processing: isProcessing,
    },
    {
      label: 'AI Summary',
      icon: FileText,
      ready: isCompleted && !!summary,
      processing: false,
    },
    {
      label: 'Tasks',
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
            AI processing didn't complete. Generate summary and action items
            now.
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

      {hasSMA ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {smaItems.map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
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
            No recording uploaded
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

// ── Notes Tab ──
export function NotesTab({ meetingId }: { meetingId: string }) {
  const [content, setContent] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: notes, isLoading } = useNotes(meetingId);
  const { mutate: createNote, isPending: isCreating } =
    useCreateNote(meetingId);
  const { mutate: deleteNote, isPending: isDeleting } =
    useDeleteNote(meetingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createNote(
      { content: content.trim() },
      {
        onSuccess: () => {
          setContent('');
          toast.success('Note added');
        },
      }
    );
  };

  if (isLoading) return <SkeletonLines count={3} />;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
        Notes
      </h3>

      {/* Create form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note…"
          rows={2}
          className="w-full text-sm resize-none rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey))
              handleSubmit(e as unknown as React.FormEvent);
          }}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 h-7"
            disabled={!content.trim() || isCreating}
          >
            {isCreating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
            {isCreating ? 'Adding…' : 'Add Note'}
          </Button>
        </div>
      </form>

      {/* Notes list */}
      {!notes || notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="No notes yet"
          body="Add notes to capture key moments and follow-ups from this meeting."
        />
      ) : (
        <div className="space-y-2">
          {notes.map((note: MeetingNote) => (
            <div
              key={note.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1.5">
                  {new Date(note.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                  {' · '}
                  {new Date(note.createdAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {deletingId === note.id ? (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] h-6 px-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                    disabled={isDeleting}
                    onClick={() =>
                      deleteNote(note.id, {
                        onSuccess: () => setDeletingId(null),
                      })
                    }
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Delete'
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] h-6 px-2 text-neutral-500"
                    onClick={() => setDeletingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-6 w-6 text-neutral-400 hover:text-red-500 dark:hover:text-red-400"
                  onClick={() => setDeletingId(note.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Ask AI Tab ──
type AIChatMessage = { role: 'user' | 'assistant'; content: string };

const SUGGESTION_CHIPS = [
  'Summarize decisions made',
  'List all tasks mentioned',
  'What were the blockers?',
  'Who said what?',
];

export function AskAITab({
  meetingId,
  transcriptionStatus,
}: {
  meetingId: string;
  transcriptionStatus: TranscriptionStatus;
}) {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isAvailable = transcriptionStatus === 'COMPLETED';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const ask = (question: string) => {
    if (!question.trim() || isStreaming) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: '' },
    ]);
    setInput('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    smaApi.askAI(
      meetingId,
      question,
      (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + token,
            };
          }
          return updated;
        });
      },
      () => {
        setIsStreaming(false);
        abortRef.current = null;
      },
      (err) => {
        toast.error(err ?? 'AI response failed');
        setIsStreaming(false);
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant' && !last.content) {
            updated[updated.length - 1] = {
              ...last,
              content: 'Something went wrong. Please try again.',
            };
          }
          return updated;
        });
        abortRef.current = null;
      },
      controller.signal
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input.trim());
  };

  if (!isAvailable) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Ask AI not available"
        body="A completed transcript is required before you can ask questions about this meeting."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4 text-neutral-500" />
        Ask AI
      </h3>

      {/* Suggestion chips — shown only when conversation is empty */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => ask(chip)}
              disabled={isStreaming}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {msg.role === 'assistant' &&
                !msg.content &&
                isStreaming &&
                i === messages.length - 1 ? (
                  <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Thinking…
                  </span>
                ) : (
                  <>
                    {msg.content}
                    {msg.role === 'assistant' &&
                      isStreaming &&
                      i === messages.length - 1 &&
                      msg.content && (
                        <span className="inline-block w-0.5 h-3.5 bg-neutral-400 dark:bg-neutral-500 ml-0.5 animate-pulse align-middle" />
                      )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about this meeting…"
          disabled={isStreaming}
          className="flex-1 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 disabled:opacity-50"
        />
        <Button
          type="submit"
          size="icon"
          variant="outline"
          className="h-9 w-9 shrink-0"
          disabled={!input.trim() || isStreaming}
        >
          {isStreaming ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <SendHorizonal className="w-3.5 h-3.5" />
          )}
        </Button>
      </form>
    </div>
  );
}

// ── Shared empty state ──
function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-neutral-400" />
      </div>
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
        {title}
      </p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">
        {body}
      </p>
    </div>
  );
}

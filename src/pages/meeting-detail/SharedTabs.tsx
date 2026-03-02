import { useRef, useState } from 'react';
import {
  Mic,
  FileText,
  ClipboardList,
  Upload,
  Play,
  Pause,
  RefreshCcw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TranscriptionStatus, ActionItem } from '@/types';
import type { SMATranscriptSegment, SMARecording } from '@/services/smaService';
import {
  useTranscript,
  useSummary,
  useActionItems,
  useRecordings,
  useUploadRecording,
  useTriggerAI,
} from '@/hooks/queries/useSMAQueries';
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
  const { mutate: upload, isPending: isUploading } = useUploadRecording(meetingId);

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
    if (!audio || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audioDuration;
  };

  const recording: SMARecording | undefined = recordings?.[0];
  const hasRecording = !!recording || transcriptionStatus !== 'NONE';
  const isProcessing =
    transcriptionStatus === 'UPLOADED' || transcriptionStatus === 'PROCESSING';

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

  const displayDuration = audioDuration || recording?.duration || 0;
  const progress = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

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
            onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
            onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
            onLoadedMetadata={() => setAudioDuration(audioRef.current?.duration ?? 0)}
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
  const { data: summary, isLoading, isError } = useSummary(meetingId, isCompleted);

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

// ── Action Items Tab ──
export function ActionsTab({
  meetingId,
  transcriptionStatus,
}: {
  meetingId: string;
  transcriptionStatus: TranscriptionStatus;
}) {
  const isCompleted = transcriptionStatus === 'COMPLETED';
  const { data: actionItems, isLoading } = useActionItems(meetingId, isCompleted);

  if (isLoading) return <SkeletonLines count={3} />;

  if (!actionItems || actionItems.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No action items"
        body="Action items will be auto-generated from the AI summary once available."
      />
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
          className="flex items-start gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
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
                  · Due{' '}
                  {new Date(item.suggestedStartDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
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
    { label: 'Transcript', icon: FileText, ready: isCompleted, processing: isProcessing },
    { label: 'AI Summary', icon: FileText, ready: isCompleted && !!summary, processing: false },
    { label: 'Action Items', icon: ClipboardList, ready: isCompleted, processing: false },
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
                {item.processing ? 'Processing…' : item.ready ? 'Available' : 'Not available'}
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
            Upload a recording to unlock transcript, AI summary, and auto-generated action items.
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
      <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs">{body}</p>
    </div>
  );
}

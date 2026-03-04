import { useState } from 'react';
import { toast } from 'sonner';
import { Share2, Copy, Download, Mail, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { TranscriptionStatus } from '@/types';
import {
  useTranscript,
  useSummary,
  useRecordings,
} from '@/hooks/queries/useSMAQueries';
import { formatTimestamp } from './meetingDetailHelpers';

interface ShareSheetProps {
  meetingId: string;
  meetingTitle: string;
  transcriptionStatus: TranscriptionStatus;
}

export function ShareSheet({
  meetingId,
  meetingTitle,
  transcriptionStatus,
}: ShareSheetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const isCompleted = transcriptionStatus === 'COMPLETED';
  const { data: transcript } = useTranscript(meetingId, isCompleted);
  const { data: summary } = useSummary(meetingId, isCompleted);
  const { data: recordings } = useRecordings(meetingId);

  const recording = recordings?.[0];
  const hasTranscript =
    isCompleted && !!transcript && transcript.segments.length > 0;
  const hasSummary = isCompleted && !!summary;
  const hasAudio = !!recording?.signedUrl;

  if (!hasTranscript && !hasSummary && !hasAudio) return null;

  const copyWithFeedback = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyTranscript = async () => {
    if (!transcript) return;
    const text = transcript.segments
      .map(
        (seg) =>
          `[${formatTimestamp(seg.startTime)}] ${seg.speaker}: ${seg.text}`
      )
      .join('\n');
    await copyWithFeedback(text, 'transcript');
    setOpen(false);
  };

  const handleCopySummary = async () => {
    if (!summary) return;
    const lines: string[] = ['Summary', '=======', summary.summary];
    if (summary.keyPoints.length > 0) {
      lines.push('', 'Key Points', '----------');
      summary.keyPoints.forEach((pt) => lines.push(`• ${pt}`));
    }
    await copyWithFeedback(lines.join('\n'), 'summary');
    setOpen(false);
  };

  const handleDownloadAudio = () => {
    if (!recording?.signedUrl) return;
    const a = document.createElement('a');
    a.href = recording.signedUrl;
    a.download = recording.fileName || 'recording';
    a.click();
    setOpen(false);
    toast.success('Download started');
  };

  const handleShareEmail = () => {
    if (!summary) return;
    const subject = encodeURIComponent(`Meeting Notes: ${meetingTitle}`);
    const bodyLines = [`Summary\n\n${summary.summary}`];
    if (summary.keyPoints.length > 0) {
      bodyLines.push(
        `\n\nKey Points\n${summary.keyPoints.map((p) => `• ${p}`).join('\n')}`
      );
    }
    window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(bodyLines.join(''))}`;
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
          <Share2 className="w-4 h-4 text-neutral-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
        align="end"
      >
        <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Share
        </p>
        {hasTranscript && (
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={handleCopyTranscript}
          >
            {copied === 'transcript' ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy Transcript
          </button>
        )}
        {hasSummary && (
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={handleCopySummary}
          >
            {copied === 'summary' ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy Summary
          </button>
        )}
        {hasAudio && (
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={handleDownloadAudio}
          >
            <Download className="w-3.5 h-3.5" />
            Download Audio
          </button>
        )}
        {hasSummary && (
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={handleShareEmail}
          >
            <Mail className="w-3.5 h-3.5" />
            Share via Email
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

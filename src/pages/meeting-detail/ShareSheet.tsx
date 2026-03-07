import { useState } from 'react';
import { toast } from 'sonner';
import {
  Share2,
  Copy,
  Download,
  Mail,
  Check,
  Link,
  Link2Off,
  Loader2,
  FileText,
} from 'lucide-react';
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
  useShare,
  useUpdateShare,
} from '@/hooks/queries/useSMAQueries';
import { smaApi } from '@/services/smaService';
import { formatTimestamp } from './meetingDetailHelpers';

interface ShareSheetProps {
  meetingId: string;
  meetingTitle: string;
  transcriptionStatus: TranscriptionStatus;
}

const CARDS_BASE =
  (import.meta.env.VITE_CARDS_BASE_URL as string | undefined) ??
  'http://localhost:5174';

export function ShareSheet({
  meetingId,
  meetingTitle,
  transcriptionStatus,
}: ShareSheetProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const isCompleted = transcriptionStatus === 'COMPLETED';
  const { data: transcript } = useTranscript(meetingId, isCompleted);
  const { data: summary } = useSummary(meetingId, isCompleted);
  const { data: recordings } = useRecordings(meetingId);
  const { data: share, isLoading: shareLoading } = useShare(meetingId, open);
  const updateShare = useUpdateShare(meetingId);

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

  const handleExport = async (
    format: 'pdf' | 'txt',
    content: 'transcript' | 'summary'
  ) => {
    const key = `${content}-${format}`;
    setExporting(key);
    try {
      await smaApi.exportMeeting(meetingId, format, content);
      toast.success('Download started');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(null);
    }
    setOpen(false);
  };

  const publicUrl = share ? `${CARDS_BASE}/m/${share.shortId}` : null;

  const handleCopyPublicLink = async () => {
    if (!share) return;
    if (!share.isPublic) {
      await updateShare.mutateAsync({ isPublic: true });
    }
    const url = `${CARDS_BASE}/m/${share.shortId}`;
    await copyWithFeedback(url, 'link');
  };

  const handleDisableLink = async () => {
    if (!share?.isPublic) return;
    await updateShare.mutateAsync({ isPublic: false });
    toast.success('Public link disabled');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
          <Share2 className="w-4 h-4 text-neutral-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
        align="end"
      >
        <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Share
        </p>
        {hasTranscript && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
            onClick={handleCopyTranscript}
          >
            {copied === 'transcript' ? (
              <Check className="w-3.5 h-3.5 text-neutral-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy Transcript
          </Button>
        )}
        {hasSummary && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
            onClick={handleCopySummary}
          >
            {copied === 'summary' ? (
              <Check className="w-3.5 h-3.5 text-neutral-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            Copy Summary
          </Button>
        )}
        {hasAudio && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
            onClick={handleDownloadAudio}
          >
            <Download className="w-3.5 h-3.5" />
            Download Audio
          </Button>
        )}
        {hasSummary && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
            onClick={handleShareEmail}
          >
            <Mail className="w-3.5 h-3.5" />
            Share via Email
          </Button>
        )}

        {/* Export Section */}
        {(hasTranscript || hasSummary) && (
          <>
            <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
            <p className="px-3 pt-1 pb-1 text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Export
            </p>
            {hasTranscript && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  onClick={() => handleExport('pdf', 'transcript')}
                  disabled={!!exporting}
                >
                  {exporting === 'transcript-pdf' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                  Transcript as PDF
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  onClick={() => handleExport('txt', 'transcript')}
                  disabled={!!exporting}
                >
                  {exporting === 'transcript-txt' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                  Transcript as .txt
                </Button>
              </>
            )}
            {hasSummary && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  onClick={() => handleExport('pdf', 'summary')}
                  disabled={!!exporting}
                >
                  {exporting === 'summary-pdf' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                  Summary as PDF
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  onClick={() => handleExport('txt', 'summary')}
                  disabled={!!exporting}
                >
                  {exporting === 'summary-txt' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-neutral-500" />
                  )}
                  Summary as .txt
                </Button>
              </>
            )}
          </>
        )}

        {/* Public Link Section */}
        <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
        <p className="px-3 pt-1 pb-1 text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Public Link
        </p>

        {shareLoading ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
            <span className="text-xs text-neutral-400">Loading...</span>
          </div>
        ) : (
          <>
            {share?.isPublic && publicUrl && (
              <div className="px-3 py-1.5">
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                  {publicUrl}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
              onClick={handleCopyPublicLink}
              disabled={updateShare.isPending}
            >
              {updateShare.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : copied === 'link' ? (
                <Check className="w-3.5 h-3.5 text-neutral-500" />
              ) : (
                <Link className="w-3.5 h-3.5" />
              )}
              {share?.isPublic ? 'Copy public link' : 'Make public & copy link'}
            </Button>
            {share?.isPublic && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2.5 px-3 py-2 h-auto rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300"
                onClick={handleDisableLink}
                disabled={updateShare.isPending}
              >
                <Link2Off className="w-3.5 h-3.5" />
                Disable public link
              </Button>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

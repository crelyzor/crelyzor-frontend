import { useState, useRef, useCallback } from 'react';
import {
  Paperclip,
  Link2,
  Image,
  FileText,
  ExternalLink,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useMeetingAttachments,
  useAddLink,
  useUploadAttachment,
  useDeleteAttachment,
} from '@/hooks/queries/useAttachmentQueries';
import type { Attachment, AttachmentType } from '@/types/meeting';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getAttachmentHref(attachment: Attachment): string {
  return attachment.signedUrl ?? attachment.url ?? '#';
}

function AttachmentIcon({ type }: { type: AttachmentType }) {
  if (type === 'LINK') return <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />;
  if (type === 'PHOTO') return <Image className="w-4 h-4 text-muted-foreground shrink-0" />;
  return <FileText className="w-4 h-4 text-muted-foreground shrink-0" />;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <div className="space-y-1">
      {[140, 100, 120].map((w) => (
        <div key={w} className="flex items-center gap-2 py-1.5 px-1">
          <div className="w-4 h-4 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse shrink-0" />
          <div
            className="h-3.5 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse"
            style={{ width: `${w}px` }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Attachment Row ────────────────────────────────────────────────────────────

function AttachmentRow({
  attachment,
  onDelete,
  isDeleting,
}: {
  attachment: Attachment;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [pendingDelete, setPendingDelete] = useState(false);
  const href = getAttachmentHref(attachment);

  function handleDeleteClick() {
    if (!pendingDelete) {
      setPendingDelete(true);
      // Auto-reset after 2.5s if user doesn't confirm
      setTimeout(() => setPendingDelete(false), 2500);
      return;
    }
    onDelete();
  }

  return (
    <div className="group flex items-center gap-2 py-1.5 px-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
      <AttachmentIcon type={attachment.type} />

      <span className="text-sm truncate flex-1 text-neutral-800 dark:text-neutral-200 leading-none">
        {attachment.name}
      </span>

      {attachment.size != null && (
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {formatSize(attachment.size)}
        </span>
      )}

      {/* Actions — revealed on row hover */}
      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        {href !== '#' && (
          <Button
            variant="ghost"
            size="icon-xs"
            asChild
            className="h-6 w-6 text-muted-foreground hover:text-neutral-900 dark:hover:text-neutral-100"
            aria-label="Open attachment"
          >
            <a href={href} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className={`h-6 w-6 transition-colors ${
            pendingDelete
              ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
              : 'text-muted-foreground hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
          aria-label={pendingDelete ? 'Confirm delete' : 'Delete attachment'}
        >
          {isDeleting ? (
            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Link Tab ──────────────────────────────────────────────────────────────────

function LinkTab({
  meetingId,
  onDone,
}: {
  meetingId: string;
  onDone: () => void;
}) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const { mutate: addLink, isPending } = useAddLink(meetingId);

  function handleAdd() {
    if (!url.trim()) return;
    addLink(
      { url: url.trim(), name: name.trim() || undefined },
      {
        onSuccess: () => {
          setUrl('');
          setName('');
          onDone();
        },
      }
    );
  }

  return (
    <div className="space-y-2 mt-3">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        placeholder="https://…"
        className="w-full px-2.5 py-1.5 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 outline-none placeholder:text-muted-foreground text-foreground"
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
        placeholder="Label (optional)"
        className="w-full px-2.5 py-1.5 text-sm rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 outline-none placeholder:text-muted-foreground text-foreground"
      />
      <Button
        size="sm"
        onClick={handleAdd}
        disabled={!url.trim() || isPending}
        className="w-full h-8 text-sm"
      >
        {isPending ? (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          'Add link'
        )}
      </Button>
    </div>
  );
}

// ── File Tab ──────────────────────────────────────────────────────────────────

function FileTab({
  meetingId,
  onDone,
}: {
  meetingId: string;
  onDone: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadFile, isPending } = useUploadAttachment(meetingId);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  }, []);

  function handleUpload() {
    if (!selectedFile) return;
    uploadFile(
      { file: selectedFile },
      {
        onSuccess: () => {
          setSelectedFile(null);
          onDone();
        },
      }
    );
  }

  return (
    <div className="space-y-2 mt-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-neutral-400 dark:border-neutral-500 bg-neutral-50 dark:bg-neutral-800/50'
            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedFile(file);
            e.target.value = '';
          }}
        />
        <Upload className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
        {selectedFile ? (
          <p className="text-xs text-neutral-700 dark:text-neutral-300 truncate px-2 font-medium">
            {selectedFile.name}
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">Drop a file or click to browse</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              JPG, PNG, GIF, WebP, PDF, DOC · max 50 MB
            </p>
          </>
        )}
      </div>

      {selectedFile && (
        <Button
          size="sm"
          onClick={handleUpload}
          disabled={isPending}
          className="w-full h-8 text-sm"
        >
          {isPending ? (
            <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            'Upload'
          )}
        </Button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AttachmentsSection({ meetingId }: { meetingId: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'link' | 'file'>('link');

  const { data: attachments = [], isLoading } = useMeetingAttachments(meetingId);
  const { mutate: deleteAttachment, isPending: isDeleting, variables: deletingId } =
    useDeleteAttachment(meetingId);

  // Reset tab on close
  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setTab('link');
  }

  return (
    <div>
      {/* Attachment list */}
      {isLoading ? (
        <SkeletonRows />
      ) : attachments.length === 0 ? (
        <div className="py-4 text-center">
          <Paperclip className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">No attachments</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {attachments.map((attachment) => (
            <AttachmentRow
              key={attachment.id}
              attachment={attachment}
              onDelete={() => deleteAttachment(attachment.id)}
              isDeleting={isDeleting && deletingId === attachment.id}
            />
          ))}
        </div>
      )}

      {/* Add attachment popover */}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 px-2 text-xs text-muted-foreground gap-1.5 hover:text-foreground"
          >
            <Paperclip className="w-3 h-3" />
            Add attachment
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-72 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg"
        >
          {/* Tabs */}
          <div className="flex items-center gap-0 border-b border-neutral-100 dark:border-neutral-800">
            {(['link', 'file'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-sm capitalize transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-medium'
                    : 'border-transparent text-muted-foreground hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'link' ? (
            <LinkTab meetingId={meetingId} onDone={() => setOpen(false)} />
          ) : (
            <FileTab meetingId={meetingId} onDone={() => setOpen(false)} />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

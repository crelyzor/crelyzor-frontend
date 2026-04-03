import { X, Copy, AlignLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EmailSignatureModalProps {
  displayName: string;
  title?: string;
  email?: string;
  phone?: string;
  website?: string;
  onClose: () => void;
}

function buildHtmlSignature(
  displayName: string,
  title?: string,
  email?: string,
  phone?: string,
  website?: string
): string {
  const rows: string[] = [];

  // Name row
  rows.push(
    `<tr><td style="padding:0 0 2px 0;"><strong style="font-size:16px;color:#0a0a0a;font-family:Arial,sans-serif;">${displayName}</strong></td></tr>`
  );

  // Title row
  if (title) {
    rows.push(
      `<tr><td style="padding:0 0 10px 0;font-size:13px;color:#525252;font-family:Arial,sans-serif;">${title}</td></tr>`
    );
  } else {
    rows.push(`<tr><td style="padding:0 0 10px 0;"></td></tr>`);
  }

  // Divider row
  rows.push(
    `<tr><td style="padding:0 0 10px 0;border-top:1px solid #e5e5e5;font-size:0;line-height:0;">&nbsp;</td></tr>`
  );

  // Contact rows
  if (email) {
    rows.push(
      `<tr><td style="padding:0 0 4px 0;font-size:13px;color:#0a0a0a;font-family:Arial,sans-serif;">&#128231; <a href="mailto:${email}" style="color:#0a0a0a;text-decoration:none;">${email}</a></td></tr>`
    );
  }
  if (phone) {
    rows.push(
      `<tr><td style="padding:0 0 4px 0;font-size:13px;color:#0a0a0a;font-family:Arial,sans-serif;">&#128222; ${phone}</td></tr>`
    );
  }
  if (website) {
    const href = website.startsWith('http') ? website : `https://${website}`;
    const display = website.replace(/^https?:\/\//, '');
    rows.push(
      `<tr><td style="padding:0;font-size:13px;color:#0a0a0a;font-family:Arial,sans-serif;">&#127760; <a href="${href}" style="color:#0a0a0a;text-decoration:none;">${display}</a></td></tr>`
    );
  }

  return `<table cellpadding="0" cellspacing="0" border="0">${rows.join('')}</table>`;
}

function buildPlainSignature(
  displayName: string,
  title?: string,
  email?: string,
  phone?: string,
  website?: string
): string {
  const lines: string[] = [displayName];
  if (title) lines.push(title);
  lines.push('──────────────────');
  if (email) lines.push(email);
  if (phone) lines.push(phone);
  if (website) lines.push(website.replace(/^https?:\/\//, ''));
  return lines.join('\n');
}

export function EmailSignatureModal({
  displayName,
  title,
  email,
  phone,
  website,
  onClose,
}: EmailSignatureModalProps) {
  const htmlSig = buildHtmlSignature(displayName, title, email, phone, website);
  const plainSig = buildPlainSignature(displayName, title, email, phone, website);

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlSig).then(() => {
      toast.success('HTML signature copied to clipboard');
    });
  };

  const copyPlain = () => {
    navigator.clipboard.writeText(plainSig).then(() => {
      toast.success('Plain text signature copied to clipboard');
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-neutral-950 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Email Signature
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Copy and paste into Gmail, Outlook, or Apple Mail
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Preview */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <p className="text-[10px] uppercase tracking-wider font-medium text-neutral-400 dark:text-neutral-500 mb-3">
            Preview
          </p>
          {/* Fixed white bg so the email HTML always reads correctly regardless of app theme */}
          <div
            className="bg-white rounded-xl border border-neutral-200 px-4 py-4 overflow-auto"
            dangerouslySetInnerHTML={{ __html: htmlSig }}
          />
        </div>

        {/* Actions */}
        <div className="px-5 py-4 flex flex-col gap-2">
          <Button
            onClick={copyHtml}
            className="w-full h-10 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-sm font-medium gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy HTML (for Gmail / Outlook)
          </Button>
          <Button
            variant="outline"
            onClick={copyPlain}
            className="w-full h-10 rounded-full text-sm font-medium gap-2 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            Copy Plain Text
          </Button>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center mt-1">
            In Gmail: Settings → Signature → paste. In Outlook: File → Options → Mail → Signatures.
          </p>
        </div>
      </div>
    </div>
  );
}

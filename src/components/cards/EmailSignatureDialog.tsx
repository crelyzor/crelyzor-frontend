import { useState, useMemo } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { generateSignatureHtml } from '@/lib/emailSignature';
import type { Card } from '@/types';

interface EmailSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: Card;
}

export function EmailSignatureDialog({
  open,
  onOpenChange,
  card,
}: EmailSignatureDialogProps) {
  const [includeSocials, setIncludeSocials] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const html = useMemo(
    () => generateSignatureHtml(card, { includeSocials }),
    [card, includeSocials]
  );

  const copyHtml = async () => {
    await navigator.clipboard.writeText(html);
    setCopied('html');
    setTimeout(() => setCopied(null), 2000);
  };

  const copyFormatted = async () => {
    const blob = new Blob([html], { type: 'text/html' });
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': blob }),
    ]);
    setCopied('formatted');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Email Signature</DialogTitle>
          <DialogDescription>
            Copy and paste into your email client's signature settings
          </DialogDescription>
        </DialogHeader>

        {/* Preview */}
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white p-4 overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>

        {/* Options */}
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={includeSocials}
            onChange={(e) => setIncludeSocials(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          Include social links
        </label>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-10 text-sm gap-2"
            onClick={copyFormatted}
          >
            {copied === 'formatted' ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied === 'formatted' ? 'Copied!' : 'Copy Formatted'}
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10 text-sm gap-2"
            onClick={copyHtml}
          >
            {copied === 'html' ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied === 'html' ? 'Copied!' : 'Copy HTML'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

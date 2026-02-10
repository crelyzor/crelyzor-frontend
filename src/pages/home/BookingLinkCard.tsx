import { ExternalLink, ArrowUpRight, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

const BOOKING_URL = 'https://cal.harsh.dev/book/harsh';

export function BookingLinkCard() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BOOKING_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="mt-6 p-4 border-neutral-200 dark:border-neutral-800 bg-neutral-900 dark:bg-neutral-800 text-white">
      <div className="flex items-start justify-between mb-3">
        <ExternalLink className="w-5 h-5 text-neutral-400" />
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
      <h3 className="text-sm font-medium mb-1">Your Booking Page</h3>
      <p className="text-xs text-neutral-400 mb-3">
        Share your availability link with others
      </p>
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between text-xs text-neutral-500 bg-neutral-800 dark:bg-neutral-700 px-3 py-2 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors cursor-pointer"
      >
        <span className="truncate">cal.harsh.dev/book/harsh</span>
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-400 shrink-0 ml-2" />
        ) : (
          <Copy className="w-3.5 h-3.5 shrink-0 ml-2" />
        )}
      </button>
    </Card>
  );
}

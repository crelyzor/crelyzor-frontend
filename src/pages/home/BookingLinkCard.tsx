import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function BookingLinkCard() {
  return (
    <Card className="mt-6 p-4 border-neutral-200 dark:border-neutral-800 bg-neutral-900 dark:bg-neutral-800 text-white">
      <div className="flex items-start justify-between mb-3">
        <ExternalLink className="w-5 h-5 text-neutral-400" />
        <ArrowUpRight className="w-4 h-4 text-neutral-500" />
      </div>
      <h3 className="text-sm font-medium mb-1">Your Booking Page</h3>
      <p className="text-xs text-neutral-400 mb-3">
        Share your availability link with others
      </p>
      <div className="text-xs text-neutral-500 bg-neutral-800 dark:bg-neutral-700 px-3 py-2 rounded-lg truncate">
        cal.harsh.dev/book/harsh
      </div>
    </Card>
  );
}

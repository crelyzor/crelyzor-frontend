import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Meeting } from '@/types';
import { useUpdateMeeting } from '@/hooks/queries/useMeetingQueries';
import { ApiError } from '@/lib/apiClient';

type Props = {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function RescheduleMeetingModal({ meeting, open, onOpenChange }: Props) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const { mutate: updateMeeting, isPending } = useUpdateMeeting();

  useEffect(() => {
    if (open) {
      setStartTime(toDatetimeLocal(meeting.startTime));
      setEndTime(toDatetimeLocal(meeting.endTime));
    }
  }, [open, meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      toast.error('End time must be after start time');
      return;
    }

    updateMeeting(
      {
        id: meeting.id,
        data: {
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Meeting rescheduled');
          onOpenChange(false);
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            toast.error('Time conflict with another meeting');
          } else {
            toast.error('Failed to reschedule meeting');
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Reschedule Meeting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label
              htmlFor="reschedule-start"
              className="text-xs text-neutral-500 dark:text-neutral-400"
            >
              New Start Time
            </Label>
            <Input
              id="reschedule-start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="text-sm"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="reschedule-end"
              className="text-xs text-neutral-500 dark:text-neutral-400"
            >
              New End Time
            </Label>
            <Input
              id="reschedule-end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="text-sm"
            />
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs gap-1.5"
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              {isPending ? 'Saving…' : 'Reschedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

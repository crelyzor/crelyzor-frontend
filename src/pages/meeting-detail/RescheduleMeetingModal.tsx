import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, CalendarDays } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import type { Meeting } from '@/types';
import { useUpdateMeeting } from '@/hooks/queries/useMeetingQueries';
import { ApiError } from '@/lib/apiClient';

type Props = {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function toLocalParts(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return { date, time };
}

function buildISO(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (time || '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

function formatDateTime(date: string, time: string): string {
  if (!date) return 'Set date & time';
  const d = new Date(`${date}T${time || '00:00'}`);
  const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!time) return datePart;
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const minStr = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
  return `${datePart} · ${h12}${minStr} ${period}`;
}

export function RescheduleMeetingModal({ meeting, open, onOpenChange }: Props) {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [openPicker, setOpenPicker] = useState<'start' | 'end' | null>(null);

  const { mutate: updateMeeting, isPending } = useUpdateMeeting();

  useEffect(() => {
    if (open) {
      const start = toLocalParts(meeting.startTime);
      const end = toLocalParts(meeting.endTime);
      setStartDate(start.date);
      setStartTime(start.time);
      setEndDate(end.date);
      setEndTime(end.time);
    } else {
      setOpenPicker(null);
    }
  }, [open, meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !startTime || !endDate || !endTime) {
      toast.error('Start and end time are required');
      return;
    }

    const start = new Date(buildISO(startDate, startTime));
    const end = new Date(buildISO(endDate, endTime));
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
            <Label className="text-xs text-neutral-500 dark:text-neutral-400">
              New Start Time
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenPicker(openPicker === 'start' ? null : 'start')
                }
                className="w-full flex items-center gap-2 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors text-left"
              >
                <CalendarDays className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                <span>{formatDateTime(startDate, startTime)}</span>
              </button>
              {openPicker === 'start' && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenPicker(null)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 z-50">
                    <DateTimePicker
                      date={startDate || null}
                      time={startTime}
                      onDateChange={(iso) => setStartDate(iso)}
                      onTimeChange={(t) => setStartTime(t)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500 dark:text-neutral-400">
              New End Time
            </Label>
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenPicker(openPicker === 'end' ? null : 'end')
                }
                className="w-full flex items-center gap-2 h-9 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors text-left"
              >
                <CalendarDays className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                <span>{formatDateTime(endDate, endTime)}</span>
              </button>
              {openPicker === 'end' && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenPicker(null)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 z-50">
                    <DateTimePicker
                      date={endDate || null}
                      time={endTime}
                      onDateChange={(iso) => setEndDate(iso)}
                      onTimeChange={(t) => setEndTime(t)}
                    />
                  </div>
                </>
              )}
            </div>
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

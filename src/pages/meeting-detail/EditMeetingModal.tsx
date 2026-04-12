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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DateTimePicker, TimePicker } from '@/components/ui/DateTimePicker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Meeting } from '@/types';
import { useUpdateMeeting } from '@/hooks/queries/useMeetingQueries';
import { useGoogleCalendarStatus } from '@/hooks/queries/useIntegrationQueries';
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
  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  if (!time) return datePart;
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const minStr = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
  return `${datePart} · ${h12}${minStr} ${period}`;
}

function formatTime(time: string): string {
  if (!time) return 'Set time';
  const d = new Date(`2000-01-01T${time}`);
  const h = d.getHours();
  const m = d.getMinutes();
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const minStr = m > 0 ? `:${String(m).padStart(2, '0')}` : '';
  return `${h12}${minStr} ${period}`;
}

export function EditMeetingModal({ meeting, open, onOpenChange }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [autoGenerateMeet, setAutoGenerateMeet] = useState(true);
  const [openPicker, setOpenPicker] = useState<'date' | 'start' | 'end' | null>(
    null
  );

  const { mutate: updateMeeting, isPending } = useUpdateMeeting();
  const { data: gcalStatus } = useGoogleCalendarStatus();
  const canAutoGenerateMeet = !!gcalStatus?.writable;

  useEffect(() => {
    if (open) {
      setTitle(meeting.title);
      setDescription(meeting.description ?? '');
      const start = toLocalParts(meeting.startTime);
      const end = toLocalParts(meeting.endTime);
      setDate(start.date);
      setStartTime(start.time);
      setEndTime(end.time);
      setMeetingLink(meeting.location ?? meeting.meetLink ?? '');
      setAutoGenerateMeet(!!(meeting.meetLink || meeting.googleEventId));
    } else {
      setOpenPicker(null);
    }
  }, [open, meeting]);

  useEffect(() => {
    if (open && !canAutoGenerateMeet) {
      setAutoGenerateMeet(false);
    }
  }, [open, canAutoGenerateMeet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (!date || !startTime || !endTime) {
      toast.error('Date, start time, and end time are required');
      return;
    }

    const shouldAutoGenerate = canAutoGenerateMeet && autoGenerateMeet;
    const normalizedMeetingLink = meetingLink.trim();

    if (!shouldAutoGenerate && !normalizedMeetingLink) {
      toast.error('Add a meeting link or reconnect Google Calendar');
      return;
    }

    const start = new Date(buildISO(date, startTime));
    const end = new Date(buildISO(date, endTime));
    if (start >= end) {
      toast.error('End time must be after start time');
      return;
    }

    updateMeeting(
      {
        id: meeting.id,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          location: normalizedMeetingLink || undefined,
          addToCalendar: shouldAutoGenerate,
        },
      },
      {
        onSuccess: () => {
          toast.success('Meeting updated');
          onOpenChange(false);
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            toast.error('Time conflict with another meeting');
          } else {
            toast.error('Failed to update meeting');
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Meeting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-title"
              className="text-xs text-neutral-500 dark:text-neutral-400"
            >
              Title
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
              required
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-description"
              className="text-xs text-neutral-500 dark:text-neutral-400"
            >
              Description
              <span className="text-neutral-400 dark:text-neutral-500 font-normal ml-1">
                (optional)
              </span>
            </Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Date / Start / End */}
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500 dark:text-neutral-400">
              Date
            </Label>
            <Popover
              open={openPicker === 'date'}
              onOpenChange={(open) => setOpenPicker(open ? 'date' : null)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors text-left"
                >
                  <CalendarDays className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                  <span className="truncate">{formatDateTime(date, '')}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 border-0 shadow-none bg-transparent w-auto"
                align="start"
              >
                <DateTimePicker
                  date={date || null}
                  time=""
                  showTime={false}
                  onDateChange={(iso) => setDate(iso)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500 dark:text-neutral-400">
                Start
              </Label>
              <Popover
                open={openPicker === 'start'}
                onOpenChange={(open) => setOpenPicker(open ? 'start' : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors text-left"
                  >
                    <CalendarDays className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                    <span className="truncate">{formatTime(startTime)}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 border-0 shadow-none bg-transparent w-auto"
                  align="start"
                >
                  <div className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 w-56 shadow-lg">
                    <TimePicker time={startTime} onChange={setStartTime} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500 dark:text-neutral-400">
                End
              </Label>
              <Popover
                open={openPicker === 'end'}
                onOpenChange={(open) => setOpenPicker(open ? 'end' : null)}
              >
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors text-left"
                  >
                    <CalendarDays className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                    <span className="truncate">{formatTime(endTime)}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 border-0 shadow-none bg-transparent w-auto"
                  align="start"
                >
                  <div className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 w-56 shadow-lg">
                    <TimePicker time={endTime} onChange={setEndTime} />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {gcalStatus?.connected && (
            <div className="space-y-2 pt-1">
              <Label className="text-xs text-neutral-500">Meeting Link</Label>
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-950/2 dark:bg-neutral-900 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Auto-generate Google Meet
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {canAutoGenerateMeet
                      ? 'Turn off to use your own Zoom/Meet link'
                      : 'Reconnect Google Calendar to generate Meet links automatically'}
                  </p>
                </div>
                <Switch
                  id="edit-generate-link"
                  checked={canAutoGenerateMeet && autoGenerateMeet}
                  onCheckedChange={setAutoGenerateMeet}
                  disabled={!canAutoGenerateMeet}
                />
              </div>
              {!canAutoGenerateMeet && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit-meeting-link"
                    className="text-xs text-neutral-500 dark:text-neutral-400"
                  >
                    Meeting URL
                  </Label>
                  <Input
                    id="edit-meeting-link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="text-sm"
                  />
                </div>
              )}
              {canAutoGenerateMeet ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Google Meet link will be created automatically when you save
                  changes.
                </p>
              ) : (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Use a manual meeting URL for Recall until Google Calendar
                  write access is restored.
                </p>
              )}
            </div>
          )}

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
              disabled={!title.trim() || isPending}
            >
              {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              {isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

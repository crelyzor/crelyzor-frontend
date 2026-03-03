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
import { Textarea } from '@/components/ui/textarea';
import type { Meeting } from '@/types';
import { useUpdateMeeting } from '@/hooks/queries/useMeetingQueries';
import { ApiError } from '@/lib/apiClient';

type Props = {
  meeting: Meeting;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Convert an ISO UTC string to the value format required by datetime-local inputs (YYYY-MM-DDTHH:mm) */
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EditMeetingModal({ meeting, open, onOpenChange }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  const { mutate: updateMeeting, isPending } = useUpdateMeeting();

  // Sync form fields whenever the dialog opens or the meeting changes
  useEffect(() => {
    if (open) {
      setTitle(meeting.title);
      setDescription(meeting.description ?? '');
      setStartTime(toDatetimeLocal(meeting.startTime));
      setEndTime(toDatetimeLocal(meeting.endTime));
      setLocation(meeting.location ?? '');
    }
  }, [open, meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

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
          title: title.trim(),
          description: description.trim() || undefined,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          location: location.trim() || undefined,
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
            <Label htmlFor="edit-title" className="text-xs text-neutral-500 dark:text-neutral-400">
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
            <Label htmlFor="edit-description" className="text-xs text-neutral-500 dark:text-neutral-400">
              Description
              <span className="text-neutral-400 dark:text-neutral-500 font-normal ml-1">(optional)</span>
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

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-start" className="text-xs text-neutral-500 dark:text-neutral-400">
                Start
              </Label>
              <Input
                id="edit-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-end" className="text-xs text-neutral-500 dark:text-neutral-400">
                End
              </Label>
              <Input
                id="edit-end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="text-sm"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-location" className="text-xs text-neutral-500 dark:text-neutral-400">
              Location
              <span className="text-neutral-400 dark:text-neutral-500 font-normal ml-1">(optional)</span>
            </Label>
            <Input
              id="edit-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Zoom, Google Meet, Office…"
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

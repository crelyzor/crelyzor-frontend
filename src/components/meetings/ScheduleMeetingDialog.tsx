import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useCreateMeeting } from '@/hooks/queries/useMeetingQueries';
import { useGoogleCalendarStatus } from '@/hooks/queries/useIntegrationQueries';
import { useUserSearch } from '@/hooks/queries/useUserQueries';
import { toast } from 'sonner';
import { UserPlus, X } from 'lucide-react';
import type { UserSearchResult } from '@/services/userService';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (meetingId: string) => void;
  defaultStartTime?: Date | null;
};

type CreateFormState = {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  autoGenerateMeet: boolean;
};

function formatDateTimeLocal(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function ParticipantPicker({
  participants,
  onChange,
}: {
  participants: UserSearchResult[];
  onChange: (participants: UserSearchResult[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isFetching } = useUserSearch(query);
  const results = data?.users ?? [];

  const selectedIds = useMemo(() => new Set(participants.map((p) => p.id)), [participants]);

  const add = useCallback(
    (user: UserSearchResult) => {
      if (!selectedIds.has(user.id)) onChange([...participants, user]);
      setQuery('');
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange, participants, selectedIds]
  );

  const remove = useCallback(
    (id: string) => onChange(participants.filter((p) => p.id !== id)),
    [onChange, participants]
  );

  return (
    <div className="space-y-2">
      {participants.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {participants.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              {p.name}
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
          <UserPlus className="w-3.5 h-3.5" />
        </div>
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(e.target.value.trim().length >= 2);
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by name or email"
          className="text-sm pl-8"
        />

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-50 overflow-hidden">
            {isFetching ? (
              <div className="px-3 py-2.5 text-xs text-neutral-400">Searching…</div>
            ) : results.length === 0 ? (
              <div className="px-3 py-2.5 text-xs text-neutral-400">No users found</div>
            ) : (
              results
                .filter((u) => !selectedIds.has(u.id))
                .map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onMouseDown={() => add(user)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0 text-[10px] font-medium text-neutral-600 dark:text-neutral-300">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultStartTime,
}: Props) {
  const [createForm, setCreateForm] = useState<CreateFormState>({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    autoGenerateMeet: true,
  });
  const [participants, setParticipants] = useState<UserSearchResult[]>([]);
  const createMeeting = useCreateMeeting();
  const { data: gcalStatus } = useGoogleCalendarStatus();

  useEffect(() => {
    if (!open) {
      setCreateForm({
        title: '',
        startTime: '',
        endTime: '',
        location: '',
        autoGenerateMeet: true,
      });
      setParticipants([]);
      return;
    }

    if (defaultStartTime) {
      const start = new Date(defaultStartTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      setCreateForm((prev) => ({
        ...prev,
        startTime: formatDateTimeLocal(start),
        endTime: formatDateTimeLocal(end),
      }));
    }
  }, [open, defaultStartTime]);

  const handleCreateScheduled = useCallback(() => {
    if (
      !createForm.title.trim() ||
      !createForm.startTime ||
      !createForm.endTime
    ) {
      toast.error('Title, start time, and end time are required');
      return;
    }

    createMeeting.mutate(
      {
        title: createForm.title.trim(),
        type: 'SCHEDULED',
        startTime: new Date(createForm.startTime).toISOString(),
        endTime: new Date(createForm.endTime).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        location: createForm.location.trim() || undefined,
        addToCalendar: gcalStatus?.connected
          ? createForm.autoGenerateMeet
          : undefined,
        participantUserIds:
          participants.length > 0 ? participants.map((p) => p.id) : undefined,
      },
      {
        onSuccess: (meeting) => {
          onOpenChange(false);
          onSuccess?.(meeting.id);
        },
      }
    );
  }, [
    createForm,
    createMeeting,
    gcalStatus?.connected,
    onOpenChange,
    onSuccess,
    participants,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a meeting</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Title</Label>
            <Input
              value={createForm.title}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Meeting title"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Start time</Label>
            <Input
              type="datetime-local"
              value={createForm.startTime}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, startTime: e.target.value }))
              }
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">End time</Label>
            <Input
              type="datetime-local"
              value={createForm.endTime}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, endTime: e.target.value }))
              }
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">
              Location <span className="text-neutral-400">(optional)</span>
            </Label>
            <Input
              value={createForm.location}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, location: e.target.value }))
              }
              placeholder="Zoom link or address"
              className="text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">
              Participants <span className="text-neutral-400">(optional)</span>
            </Label>
            <ParticipantPicker
              participants={participants}
              onChange={setParticipants}
            />
          </div>
          {gcalStatus?.connected && (
            <div className="flex items-center gap-2 pt-1">
              <Switch
                id="gcal-meet"
                checked={createForm.autoGenerateMeet}
                onCheckedChange={(checked) =>
                  setCreateForm((f) => ({ ...f, autoGenerateMeet: checked }))
                }
              />
              <Label
                htmlFor="gcal-meet"
                className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer"
              >
                Add to Google Calendar with a Meet link
              </Label>
            </div>
          )}
          <div className="flex gap-2 justify-end pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateScheduled}
              disabled={createMeeting.isPending}
            >
              {createMeeting.isPending ? 'Creating…' : 'Create meeting'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCreateMeeting } from '@/hooks/queries/useMeetingQueries';
import { useGoogleCalendarStatus } from '@/hooks/queries/useIntegrationQueries';
import { useUserSearch } from '@/hooks/queries/useUserQueries';
import { toast } from 'sonner';
import { CalendarDays, UserPlus, X } from 'lucide-react';
import type { UserSearchResult } from '@/services/userService';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (meetingId: string) => void;
  defaultStartTime?: Date | null;
};

type SelectedParticipant =
  | { kind: 'user'; id: string; name: string; email: string }
  | { kind: 'guest'; email: string };

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function toLocalTimeStr(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatMeetingDateTime(date: string, time: string): string {
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

function buildISO(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = (time || '00:00').split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

function ParticipantPicker({
  participants,
  onChange,
}: {
  participants: SelectedParticipant[];
  onChange: (participants: SelectedParticipant[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isFetching } = useUserSearch(query);
  const results = useMemo(() => data?.users ?? [], [data]);

  const selectedIds = useMemo(
    () =>
      new Set(participants.filter((p) => p.kind === 'user').map((p) => p.id)),
    [participants]
  );

  const selectedGuestEmails = useMemo(
    () =>
      new Set(
        participants
          .filter((p) => p.kind === 'guest')
          .map((p) => p.email.toLowerCase())
      ),
    [participants]
  );

  const visibleResults = useMemo(
    () => results.filter((u) => !selectedIds.has(u.id)),
    [results, selectedIds]
  );

  const add = useCallback(
    (user: UserSearchResult) => {
      if (selectedIds.has(user.id)) return;
      flushSync(() => {
        onChange([
          ...participants,
          { kind: 'user', id: user.id, name: user.name, email: user.email },
        ]);
      });
      setQuery('');
      setOpen(false);
      inputRef.current?.focus();
    },
    [onChange, participants, selectedIds]
  );

  const addGuest = useCallback(() => {
    const email = query.trim().toLowerCase();
    if (!isValidEmail(email)) return;
    if (selectedGuestEmails.has(email)) return;
    if (
      participants.some(
        (p) => p.kind === 'user' && p.email.toLowerCase() === email
      )
    ) {
      return;
    }

    flushSync(() => {
      onChange([...participants, { kind: 'guest', email }]);
    });
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }, [onChange, participants, query, selectedGuestEmails]);

  const remove = useCallback(
    (target: SelectedParticipant) =>
      onChange(
        participants.filter((p) => {
          if (target.kind === 'user') {
            return !(p.kind === 'user' && p.id === target.id);
          }
          return !(p.kind === 'guest' && p.email === target.email);
        })
      ),
    [onChange, participants]
  );

  return (
    <div className="space-y-2">
      {participants.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {participants.map((p) => (
            <span
              key={p.kind === 'user' ? p.id : `guest:${p.email}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              {p.kind === 'user' ? p.name : p.email}
              <button
                type="button"
                onClick={() => remove(p)}
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
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            e.preventDefault();

            if (!open || visibleResults.length === 0) {
              addGuest();
              return;
            }

            const normalizedQuery = query.trim().toLowerCase();
            const exactMatch = visibleResults.find(
              (user) =>
                user.email.toLowerCase() === normalizedQuery ||
                user.name.toLowerCase() === normalizedQuery
            );
            add(exactMatch ?? visibleResults[0]);
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by name/email or add guest email"
          className="text-sm pl-8"
        />

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg z-50 overflow-hidden">
            {isFetching ? (
              <div className="px-3 py-2.5 text-xs text-neutral-400">
                Searching…
              </div>
            ) : results.length === 0 ? (
              isValidEmail(query.trim()) ? (
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    addGuest();
                  }}
                  className="w-full px-3 py-2.5 text-xs text-left hover:bg-neutral-50 dark:hover:bg-neutral-800"
                >
                  Add guest: <span className="font-medium">{query.trim()}</span>
                </button>
              ) : (
                <div className="px-3 py-2.5 text-xs text-neutral-400">
                  No users found
                </div>
              )
            ) : (
              visibleResults.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    add(user);
                  }}
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
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [autoGenerateMeet, setAutoGenerateMeet] = useState(true);
  const [participants, setParticipants] = useState<SelectedParticipant[]>([]);
  const [openPicker, setOpenPicker] = useState<'start' | 'end' | null>(null);

  const createMeeting = useCreateMeeting();
  const { data: gcalStatus } = useGoogleCalendarStatus();

  useEffect(() => {
    if (!open) {
      setTitle('');
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setLocation('');
      setAutoGenerateMeet(true);
      setParticipants([]);
      setOpenPicker(null);
      return;
    }

    if (defaultStartTime) {
      const start = new Date(defaultStartTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      setStartDate(toLocalDateStr(start));
      setStartTime(toLocalTimeStr(start));
      setEndDate(toLocalDateStr(end));
      setEndTime(toLocalTimeStr(end));
    }
  }, [open, defaultStartTime]);

  const handleCreateScheduled = useCallback(() => {
    if (!title.trim() || !startDate || !startTime || !endDate || !endTime) {
      toast.error('Title, start time, and end time are required');
      return;
    }

    const startISO = buildISO(startDate, startTime);
    const endISO = buildISO(endDate, endTime);

    if (new Date(startISO) >= new Date(endISO)) {
      toast.error('End time must be after start time');
      return;
    }

    createMeeting.mutate(
      {
        title: title.trim(),
        type: 'SCHEDULED',
        startTime: startISO,
        endTime: endISO,
        timezone: 'UTC',
        location: location.trim() || undefined,
        addToCalendar: gcalStatus?.connected ? autoGenerateMeet : undefined,
        participantUserIds: participants
          .filter(
            (p): p is Extract<SelectedParticipant, { kind: 'user' }> =>
              p.kind === 'user'
          )
          .map((p) => p.id),
        guestEmails: participants
          .filter(
            (p): p is Extract<SelectedParticipant, { kind: 'guest' }> =>
              p.kind === 'guest'
          )
          .map((p) => p.email),
      },
      {
        onSuccess: (meeting) => {
          onOpenChange(false);
          onSuccess?.(meeting.id);
        },
      }
    );
  }, [
    title,
    startDate,
    startTime,
    endDate,
    endTime,
    location,
    autoGenerateMeet,
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
          <DialogTitle>Schedule a Meet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
              className="text-sm"
            />
          </div>

          {/* Start time */}
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">Start time</Label>
            <Popover
              open={openPicker === 'start'}
              onOpenChange={(open) => setOpenPicker(open ? 'start' : null)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors text-left ${
                    startDate
                      ? 'border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
                  } bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600`}
                >
                  <CalendarDays className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                  <span>{formatMeetingDateTime(startDate, startTime)}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 border-0 shadow-none bg-transparent w-auto"
                align="start"
              >
                <DateTimePicker
                  date={startDate || null}
                  time={startTime}
                  onDateChange={(iso) => setStartDate(iso)}
                  onTimeChange={(t) => setStartTime(t)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End time */}
          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">End time</Label>
            <Popover
              open={openPicker === 'end'}
              onOpenChange={(open) => setOpenPicker(open ? 'end' : null)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full flex items-center gap-2 h-9 px-3 rounded-lg border text-sm transition-colors text-left ${
                    endDate
                      ? 'border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-500'
                  } bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600`}
                >
                  <CalendarDays className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                  <span>{formatMeetingDateTime(endDate, endTime)}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 border-0 shadow-none bg-transparent w-auto"
                align="start"
              >
                <DateTimePicker
                  date={endDate || null}
                  time={endTime}
                  onDateChange={(iso) => setEndDate(iso)}
                  onTimeChange={(t) => setEndTime(t)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-neutral-500">
              Location <span className="text-neutral-400">(optional)</span>
            </Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
                checked={autoGenerateMeet}
                onCheckedChange={setAutoGenerateMeet}
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

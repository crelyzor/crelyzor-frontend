/**
 * Phase 6 P12 — Book a team member (internal booking flow).
 *
 * Four steps:
 *   1. Pick member (excludes self)
 *   2. Pick event type (from member's team-scoped EventTypes)
 *   3. Pick date + slot
 *   4. Confirm + book
 *
 * Pre-fills the booker's identity (current user) as guestName/guestEmail
 * so the workflow is one-click after the slot pick.
 */
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Users2,
  Video,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTeamMembers } from '@/hooks/queries/useTeamQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { publicSchedulingService } from '@/services/publicSchedulingService';
import { queryKeys } from '@/lib/queryKeys';
import { ApiError } from '@/lib/apiClient';
import { toast } from 'sonner';
import type {
  PublicScheduledEventType,
  PublicSlot,
} from '@/services/publicSchedulingService';
import type { TeamMemberRow } from '@/services/teamService';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

function todayLocalDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

interface Props {
  teamId: string;
  teamSlug: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Step = 'member' | 'event-type' | 'slot' | 'confirm';

export function BookTeamMemberModal({
  teamId,
  teamSlug,
  open,
  onOpenChange,
}: Props) {
  const [step, setStep] = useState<Step>('member');
  const [selectedMember, setSelectedMember] = useState<TeamMemberRow | null>(
    null
  );
  const [selectedEventType, setSelectedEventType] =
    useState<PublicScheduledEventType | null>(null);
  const [date, setDate] = useState<string>(todayLocalDate());
  const [selectedSlot, setSelectedSlot] = useState<PublicSlot | null>(null);
  const [note, setNote] = useState('');

  // Reset everything when the modal closes — delayed so the close anim runs first.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setStep('member');
      setSelectedMember(null);
      setSelectedEventType(null);
      setDate(todayLocalDate());
      setSelectedSlot(null);
      setNote('');
    }, 200);
    return () => clearTimeout(t);
  }, [open]);

  const goBack = () => {
    if (step === 'confirm') {
      setSelectedSlot(null);
      setStep('slot');
    } else if (step === 'slot') {
      setStep('event-type');
    } else if (step === 'event-type') {
      setSelectedEventType(null);
      setStep('member');
    }
  };

  const title = (() => {
    switch (step) {
      case 'member':
        return 'Who do you want to book?';
      case 'event-type':
        return `Pick a session with ${selectedMember?.user.name ?? selectedMember?.user.email}`;
      case 'slot':
        return 'Pick a time';
      case 'confirm':
        return 'Confirm booking';
    }
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step !== 'member' && (
              <button
                onClick={goBack}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <DialogTitle className="text-base font-semibold">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            <StepIndicator step={step} />
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {step === 'member' && (
            <MemberStep
              teamId={teamId}
              onPick={(member) => {
                setSelectedMember(member);
                setStep('event-type');
              }}
            />
          )}
          {step === 'event-type' && selectedMember && (
            <EventTypeStep
              teamSlug={teamSlug}
              username={selectedMember.user.username ?? ''}
              onPick={(et) => {
                setSelectedEventType(et);
                setStep('slot');
              }}
            />
          )}
          {step === 'slot' && selectedMember && selectedEventType && (
            <SlotStep
              username={selectedMember.user.username ?? ''}
              eventTypeSlug={selectedEventType.slug}
              teamSlug={teamSlug}
              date={date}
              onChangeDate={setDate}
              onPick={(slot) => {
                setSelectedSlot(slot);
                setStep('confirm');
              }}
            />
          )}
          {step === 'confirm' &&
            selectedMember &&
            selectedEventType &&
            selectedSlot && (
              <ConfirmStep
                member={selectedMember}
                eventType={selectedEventType}
                slot={selectedSlot}
                teamSlug={teamSlug}
                note={note}
                onNoteChange={setNote}
                onCancel={() => onOpenChange(false)}
                onDone={() => onOpenChange(false)}
              />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const order: Step[] = ['member', 'event-type', 'slot', 'confirm'];
  const idx = order.indexOf(step);
  return (
    <span>
      Step {idx + 1} of {order.length}
    </span>
  );
}

// ── Step 1: Pick member ─────────────────────────────────────────────────────

function MemberStep({
  teamId,
  onPick,
}: {
  teamId: string;
  onPick: (member: TeamMemberRow) => void;
}) {
  const { data: user } = useCurrentUser();
  const { data, isLoading } = useTeamMembers(teamId);

  const bookable = useMemo(() => {
    const all = data?.members ?? [];
    return all.filter((m) => m.user.id !== user?.id && !!m.user.username);
  }, [data, user]);

  if (isLoading) return <RowsSkeleton />;

  if (bookable.length === 0) {
    return (
      <EmptyState
        icon={Users2}
        title="No teammates to book"
        body="Once teammates set up their team event types, they'll show up here."
      />
    );
  }

  return (
    <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[60vh] overflow-y-auto -mx-2">
      {bookable.map((m) => {
        const initials = (m.user.name ?? m.user.email)
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        return (
          <li key={m.id}>
            <button
              onClick={() => onPick(m)}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors"
            >
              {m.user.avatarUrl ? (
                <img
                  src={m.user.avatarUrl}
                  alt={m.user.name ?? m.user.email}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 shrink-0">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {m.user.name ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {m.user.email}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ── Step 2: Pick event type ─────────────────────────────────────────────────

function EventTypeStep({
  teamSlug,
  username,
  onPick,
}: {
  teamSlug: string;
  username: string;
  onPick: (et: PublicScheduledEventType) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-scheduling', 'team-member', teamSlug, username],
    queryFn: () =>
      publicSchedulingService.getTeamMemberScheduling(teamSlug, username),
    enabled: !!teamSlug && !!username,
  });

  if (isLoading) return <RowsSkeleton />;
  if (isError || !data) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Scheduling not available"
        body="This teammate hasn't enabled scheduling or hasn't set up team event types yet."
      />
    );
  }

  const eventTypes = data.eventTypes ?? [];
  if (eventTypes.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No team event types yet"
        body="This teammate hasn't set up any team-scoped event types."
      />
    );
  }

  return (
    <ul className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-[60vh] overflow-y-auto -mx-2">
      {eventTypes.map((et) => (
        <li key={et.id}>
          <button
            onClick={() => onPick(et)}
            className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-muted-foreground shrink-0">
              {et.locationType === 'ONLINE' ? (
                <Video className="w-4 h-4" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {et.title}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {et.duration} min · {et.locationType.toLowerCase()}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        </li>
      ))}
    </ul>
  );
}

// ── Step 3: Pick date + slot ────────────────────────────────────────────────

function SlotStep({
  username,
  eventTypeSlug,
  teamSlug,
  date,
  onChangeDate,
  onPick,
}: {
  username: string;
  eventTypeSlug: string;
  teamSlug: string;
  date: string;
  onChangeDate: (d: string) => void;
  onPick: (slot: PublicSlot) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-scheduling', 'slots', username, eventTypeSlug, teamSlug, date],
    queryFn: () =>
      publicSchedulingService.getSlots(username, eventTypeSlug, date, teamSlug),
    enabled: !!username && !!eventTypeSlug && !!date,
  });

  const slots = data?.slots ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label htmlFor="book-date" className="text-xs font-medium shrink-0">
          Date
        </Label>
        <Input
          id="book-date"
          type="date"
          value={date}
          min={todayLocalDate()}
          onChange={(e) => onChangeDate(e.target.value)}
          className="flex-1"
        />
      </div>

      {isLoading ? (
        <SlotsSkeleton />
      ) : isError ? (
        <EmptyState
          icon={CalendarDays}
          title="Couldn't load slots"
          body="Try a different date or refresh."
        />
      ) : slots.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No availability"
          body="No open slots on this date. Try another day."
        />
      ) : (
        <div className="grid grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto">
          {slots.map((slot) => (
            <button
              key={slot.startTime}
              onClick={() => onPick(slot)}
              className="px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-sm hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors tabular-nums"
            >
              {formatTime(slot.startTime)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 4: Confirm ─────────────────────────────────────────────────────────

function ConfirmStep({
  member,
  eventType,
  slot,
  teamSlug,
  note,
  onNoteChange,
  onCancel,
  onDone,
}: {
  member: TeamMemberRow;
  eventType: PublicScheduledEventType;
  slot: PublicSlot;
  teamSlug: string;
  note: string;
  onNoteChange: (v: string) => void;
  onCancel: () => void;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const bookingMutation = useMutation({
    mutationFn: (
      payload: Parameters<typeof publicSchedulingService.createBooking>[0]
    ) => publicSchedulingService.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
      toast.success('Booking sent — pending host approval');
      onDone();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        const msg =
          (err.data as { message?: string } | null)?.message ??
          'Failed to create booking';
        toast.error(msg);
        return;
      }
      toast.error('Failed to create booking');
    },
  });

  const handleSubmit = () => {
    if (!member.user.username || !user?.email) return;
    bookingMutation.mutate({
      username: member.user.username,
      eventTypeSlug: eventType.slug,
      startTime: slot.startTime,
      guestName: user.name ?? user.email,
      guestEmail: user.email,
      guestNote: note.trim() || undefined,
      guestTimezone: BROWSER_TZ,
      teamSlug,
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
        <Row label="With" value={member.user.name ?? member.user.email} />
        <Row
          label="Session"
          value={`${eventType.title} · ${eventType.duration} min`}
        />
        <Row
          label="When"
          value={`${formatDateLong(slot.startTime)} at ${formatTime(slot.startTime)}`}
        />
        <Row label="Timezone" value={BROWSER_TZ} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs font-medium">
          Note <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          maxLength={500}
          rows={3}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add a quick agenda or context…"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={bookingMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={bookingMutation.isPending}
          onClick={handleSubmit}
        >
          {bookingMutation.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Booking…
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" /> Send booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-16 shrink-0">
        {label}
      </span>
      <span className="text-sm text-neutral-900 dark:text-neutral-100">
        {value}
      </span>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon className="w-8 h-8 text-muted-foreground mb-2" />
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {title}
      </p>
      <p className="text-xs text-muted-foreground mt-1 max-w-sm">{body}</p>
    </div>
  );
}

function RowsSkeleton() {
  return (
    <div className="space-y-2 -mx-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-1/3" />
            <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SlotsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse"
        />
      ))}
    </div>
  );
}

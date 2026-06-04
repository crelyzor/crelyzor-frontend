import { useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  Video,
  MapPin,
  Link2,
  Copy,
  X,
  LayoutList,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useTeamEventTypes,
  useCreateTeamEventType,
  useUpdateTeamEventType,
  useDeleteTeamEventType,
} from '@/hooks/queries/useSchedulingQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { CARDS_PUBLIC_URL } from '@/lib/publicUrl';
import type {
  EventType,
  LocationType,
  CreateEventTypePayload,
  UpdateEventTypePayload,
} from '@/types/settings';
import type { TeamRole, TeamSummary } from '@/services/teamService';

interface Props {
  teamId: string;
  role: TeamRole;
  team: TeamSummary;
}

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  duration: 30,
  locationType: 'IN_PERSON' as LocationType,
  meetingLink: '',
  bufferBefore: 0,
  bufferAfter: 0,
  minNoticeHours: 24,
  maxPerDay: '',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
        {description}
      </p>
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function TeamEventTypesSection({ teamId, team }: Props) {
  const { data: eventTypes, isLoading, isError } = useTeamEventTypes(teamId);
  const { data: profile } = useCurrentUser();
  const createEventType = useCreateTeamEventType(teamId);
  const updateEventType = useUpdateTeamEventType(teamId);
  const deleteEventType = useDeleteTeamEventType(teamId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);
  const [useAutoMeetingLink, setUseAutoMeetingLink] = useState(true);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugEdited(false);
    setUseAutoMeetingLink(true);
    setDialogOpen(true);
  };

  const openEdit = (et: EventType) => {
    setEditingId(et.id);
    setForm({
      title: et.title,
      slug: et.slug,
      description: et.description ?? '',
      duration: et.duration,
      locationType: et.locationType,
      meetingLink: et.meetingLink ?? '',
      bufferBefore: et.bufferBefore,
      bufferAfter: et.bufferAfter,
      minNoticeHours: et.minNoticeHours,
      maxPerDay: et.maxPerDay != null ? String(et.maxPerDay) : '',
    });
    setSlugEdited(true);
    setUseAutoMeetingLink(et.locationType === 'ONLINE' && !et.meetingLink);
    setDialogOpen(true);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      ...(!slugEdited ? { slug: slugify(title) } : {}),
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }
    if (
      form.locationType === 'ONLINE' &&
      !useAutoMeetingLink &&
      !form.meetingLink.trim()
    ) {
      toast.error('Add a meeting link or enable auto-generate');
      return;
    }

    const base: CreateEventTypePayload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      duration: form.duration,
      locationType: form.locationType,
      description: form.description.trim() || '',
      ...(form.locationType === 'ONLINE' &&
        !useAutoMeetingLink &&
        form.meetingLink.trim() && { meetingLink: form.meetingLink.trim() }),
      bufferBefore: form.bufferBefore,
      bufferAfter: form.bufferAfter,
      minNoticeHours: form.minNoticeHours,
    };

    if (editingId) {
      const payload: UpdateEventTypePayload = {
        ...base,
        maxPerDay: form.maxPerDay ? parseInt(form.maxPerDay, 10) : null,
      };
      updateEventType.mutate(
        { id: editingId, data: payload },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      const payload: CreateEventTypePayload = {
        ...base,
        ...(form.maxPerDay ? { maxPerDay: parseInt(form.maxPerDay, 10) } : {}),
      };
      createEventType.mutate(payload, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleToggleActive = (et: EventType) => {
    updateEventType.mutate({ id: et.id, data: { isActive: !et.isActive } });
  };

  const handleDelete = (id: string) => {
    deleteEventType.mutate(id, {
      onSuccess: () => setConfirmDeleteId(null),
    });
  };

  const handleCopyUrl = useCallback(
    (slug: string) => {
      const username = profile?.username ?? '';
      const url = `${CARDS_PUBLIC_URL}/schedule/t/${team.slug}/${username}/${slug}`;
      navigator.clipboard.writeText(url);
      toast.success('Booking URL copied');
    },
    [profile?.username, team.slug]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Event Types"
          description="Meeting types guests can book with you through this team"
        />
        <Button
          size="sm"
          onClick={openCreate}
          className="h-8 px-3 text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Event Type
        </Button>
      </div>

      <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50">
        <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            Availability and scheduling preferences are personal.
          </span>{' '}
          When someone books you through this team, your existing personal
          availability applies. Manage it under Personal → Availability.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card
              key={i}
              className="border-neutral-200 dark:border-neutral-800"
            >
              <CardContent className="p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-36" />
                    <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-48" />
                  </div>
                  <div className="h-6 w-11 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <LayoutList className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Failed to load event types
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (!eventTypes || eventTypes.length === 0) && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <LayoutList className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                No team event types yet
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 mb-4">
                Create event types that guests can book with you through{' '}
                {team.name}
              </p>
              <Button
                size="sm"
                onClick={openCreate}
                className="h-8 px-3 text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Event Type
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && eventTypes && eventTypes.length > 0 && (
        <div className="space-y-2">
          {eventTypes.map((et) => (
            <Card
              key={et.id}
              className={`border-neutral-200 dark:border-neutral-800 transition-opacity ${
                !et.isActive ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {et.title}
                      </h3>
                      {!et.isActive && (
                        <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {et.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        {et.locationType === 'ONLINE' ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <MapPin className="w-3 h-3" />
                        )}
                        {et.locationType === 'ONLINE' ? 'Online' : 'In Person'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        onClick={() => handleCopyUrl(et.slug)}
                        className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                      >
                        <Link2 className="w-3 h-3" />
                        /schedule/t/{team.slug}/{profile?.username ?? '…'}/
                        {et.slug}
                        <Copy className="w-2.5 h-2.5 ml-0.5 opacity-50" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(et)}
                    >
                      <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                    </Button>
                    {confirmDeleteId === et.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(et.id)}
                          disabled={deleteEventType.isPending}
                          className="text-[11px] font-medium text-red-500 hover:text-red-600 transition-colors px-1"
                        >
                          {deleteEventType.isPending
                            ? 'Deleting...'
                            : 'Delete?'}
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          <X className="w-3.5 h-3.5 text-neutral-400" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setConfirmDeleteId(et.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-400" />
                      </Button>
                    )}
                    <Switch
                      checked={et.isActive}
                      onCheckedChange={() => handleToggleActive(et)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingId ? 'Edit Event Type' : 'New Event Type'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <FieldGroup label="Title">
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 30-min consultation"
                maxLength={100}
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>

            <FieldGroup label="Slug (URL path)">
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  setForm((prev) => ({ ...prev, slug: e.target.value }));
                }}
                placeholder="30-min-consultation"
                maxLength={60}
                className="border-neutral-200 dark:border-neutral-700 font-mono text-xs"
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Lowercase letters, numbers, and hyphens only
              </p>
            </FieldGroup>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Duration">
                <Select
                  value={String(form.duration)}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, duration: parseInt(v, 10) }))
                  }
                >
                  <SelectTrigger className="border-neutral-200 dark:border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              <FieldGroup label="Location">
                <Select
                  value={form.locationType}
                  onValueChange={(v) => {
                    const locationType = v as LocationType;
                    setForm((prev) => ({ ...prev, locationType }));
                    if (locationType !== 'ONLINE') setUseAutoMeetingLink(true);
                  }}
                >
                  <SelectTrigger className="border-neutral-200 dark:border-neutral-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PERSON">In Person</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              </FieldGroup>
            </div>

            {form.locationType === 'ONLINE' && (
              <FieldGroup label="Meeting Link">
                <div className="flex items-center justify-between rounded-md border border-neutral-200 dark:border-neutral-700 px-3 py-2">
                  <div>
                    <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200">
                      Auto-generate Google Meet
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Turn off to use your own Zoom/Meet link
                    </p>
                  </div>
                  <Switch
                    checked={useAutoMeetingLink}
                    onCheckedChange={setUseAutoMeetingLink}
                  />
                </div>
                {!useAutoMeetingLink && (
                  <Input
                    value={form.meetingLink}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        meetingLink: e.target.value,
                      }))
                    }
                    placeholder="https://zoom.us/j/..."
                    className="border-neutral-200 dark:border-neutral-700 text-xs"
                  />
                )}
              </FieldGroup>
            )}

            <FieldGroup label="Description (optional)">
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description shown on the booking page"
                maxLength={500}
                rows={2}
                className="border-neutral-200 dark:border-neutral-700 resize-none text-sm"
              />
            </FieldGroup>

            <div className="grid grid-cols-3 gap-4">
              <FieldGroup label="Buffer before (min)">
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={form.bufferBefore}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      bufferBefore: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="border-neutral-200 dark:border-neutral-700"
                />
              </FieldGroup>
              <FieldGroup label="Buffer after (min)">
                <Input
                  type="number"
                  min={0}
                  max={120}
                  value={form.bufferAfter}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      bufferAfter: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="border-neutral-200 dark:border-neutral-700"
                />
              </FieldGroup>
              <FieldGroup label="Min notice (hrs)">
                <Input
                  type="number"
                  min={0}
                  max={168}
                  value={form.minNoticeHours}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      minNoticeHours: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="border-neutral-200 dark:border-neutral-700"
                />
              </FieldGroup>
            </div>

            <FieldGroup label="Max bookings per day">
              <Input
                type="number"
                min={1}
                max={50}
                value={form.maxPerDay}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, maxPerDay: e.target.value }))
                }
                placeholder="No limit"
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={
                  createEventType.isPending || updateEventType.isPending
                }
                className="h-8 px-4 text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
              >
                {createEventType.isPending || updateEventType.isPending
                  ? 'Saving...'
                  : editingId
                    ? 'Save Changes'
                    : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PageMotion } from '@/components/PageMotion';
import {
  User,
  Palette,
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Tag,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  CalendarClock,
  LayoutList,
  Clock,
  Puzzle,
  Sparkles,
  Lock,
  Video,
  MapPin,
  Link2,
  Copy,
  RotateCcw,
  CalendarOff,
  CalendarDays,
  Bot,
  Eye,
  EyeOff,
  BookOpen,
  XCircle,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser, useLogout } from '@/hooks/queries/useAuthQueries';
import { useUpdateProfile } from '@/hooks/queries/useUserQueries';
import { useSessions } from '@/hooks/queries/useIntegrationQueries';
import {
  useUserTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from '@/hooks/queries/useTagQueries';
import {
  useUserSettings,
  useUpdateUserSettings,
  useSaveRecallApiKey,
} from '@/hooks/queries/useSettingsQueries';
import { settingsApi } from '@/services/settingsService';
import {
  useEventTypes,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
  useAvailability,
  useUpdateAvailability,
  useOverrides,
  useCreateOverride,
  useDeleteOverride,
  useBookings,
  useCancelBooking,
} from '@/hooks/queries/useSchedulingQueries';
import { useThemeStore } from '@/stores';
import type { Theme } from '@/types';
import type {
  EventType,
  LocationType,
  CreateEventTypePayload,
  AvailabilityDay,
  PatchAvailabilityDayPayload,
  HostBooking,
  BookingStatus,
} from '@/types/settings';

// ── Settings sections ──
const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User, group: 'account' },
  { id: 'appearance', label: 'Appearance', icon: Palette, group: 'account' },
  {
    id: 'scheduling',
    label: 'Scheduling',
    icon: CalendarClock,
    group: 'scheduling',
  },
  {
    id: 'event-types',
    label: 'Event Types',
    icon: LayoutList,
    group: 'scheduling',
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: Clock,
    group: 'scheduling',
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: BookOpen,
    group: 'scheduling',
  },
  { id: 'ai', label: 'AI & Transcription', icon: Sparkles, group: 'features' },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Puzzle,
    group: 'features',
  },
  { id: 'tags', label: 'Tags', icon: Tag, group: 'features' },
  { id: 'security', label: 'Security', icon: Shield, group: 'other' },
  { id: 'privacy', label: 'Privacy', icon: Lock, group: 'other' },
] as const;

type SettingsSection = (typeof SETTINGS_SECTIONS)[number]['id'];

const SECTION_GROUPS = [
  { key: 'account', label: 'Account' },
  { key: 'scheduling', label: 'Scheduling' },
  { key: 'features', label: 'Features' },
  { key: 'other', label: '' },
] as const;

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeSection = (searchParams.get('tab') ??
    'profile') as SettingsSection;
  const setActiveSection = (section: SettingsSection) => {
    setSearchParams({ tab: section }, { replace: true });
  };

  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate('/signin', { replace: true });
      },
    });
  };

  return (
    <PageMotion>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="flex gap-6">
          {/* ── Sidebar ── */}
          <nav className="w-48 shrink-0 hidden md:block">
            <div className="space-y-4">
              {SECTION_GROUPS.map((group) => {
                const items = SETTINGS_SECTIONS.filter(
                  (s) => s.group === group.key
                );
                if (items.length === 0) return null;
                return (
                  <div key={group.key}>
                    {group.label && (
                      <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 mb-1.5">
                        {group.label}
                      </p>
                    )}
                    <div className="space-y-0.5">
                      {items.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${
                              isActive
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {section.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sign out */}
            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </nav>

          {/* ── Mobile tab bar ── */}
          <div className="md:hidden w-full mb-4 -mt-2">
            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {SETTINGS_SECTIONS.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0
                    ${
                      isActive
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">
            {activeSection === 'profile' && <ProfileSection />}
            {activeSection === 'appearance' && <AppearanceSection />}
            {activeSection === 'scheduling' && <SchedulingSection />}
            {activeSection === 'event-types' && <EventTypesSection />}
            {activeSection === 'availability' && <AvailabilitySection />}
            {activeSection === 'bookings' && <BookingsSection />}
            {activeSection === 'ai' && <AITranscriptionSection />}
            {activeSection === 'integrations' && <IntegrationsSection />}
            {activeSection === 'tags' && <TagsSection />}
            {activeSection === 'security' && <SecuritySection />}
            {activeSection === 'privacy' && <PrivacySection />}
          </div>
        </div>
      </div>
    </PageMotion>
  );
}

// ── Scheduling ──
function SchedulingSection() {
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const handleToggle = (field: string, value: boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  const handleNumberChange = (
    field: string,
    raw: string,
    min: number,
    max: number
  ) => {
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const clamped = Math.max(min, Math.min(max, num));
    updateSettings.mutate({ [field]: clamped });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Scheduling"
          description="Configure your booking preferences"
        />
        <SettingsSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Scheduling"
        description="Configure your booking preferences"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6 space-y-6">
          {/* Master toggle */}
          <SettingRow
            label="Enable scheduling"
            description="Allow others to book time with you via your public booking page"
          >
            <Switch
              checked={settings?.schedulingEnabled ?? false}
              onCheckedChange={(v) => handleToggle('schedulingEnabled', v)}
            />
          </SettingRow>

          <div className="border-t border-neutral-100 dark:border-neutral-800" />

          {/* Min notice */}
          <SettingRow
            label="Minimum notice"
            description="How far in advance someone must book (hours)"
          >
            <Input
              type="number"
              min={0}
              max={168}
              value={settings?.minNoticeHours ?? 24}
              onChange={(e) =>
                handleNumberChange('minNoticeHours', e.target.value, 0, 168)
              }
              className="w-24 border-neutral-200 dark:border-neutral-700 text-right"
            />
          </SettingRow>

          {/* Max window */}
          <SettingRow
            label="Booking window"
            description="How far into the future bookings are allowed (days)"
          >
            <Input
              type="number"
              min={1}
              max={365}
              value={settings?.maxWindowDays ?? 60}
              onChange={(e) =>
                handleNumberChange('maxWindowDays', e.target.value, 1, 365)
              }
              className="w-24 border-neutral-200 dark:border-neutral-700 text-right"
            />
          </SettingRow>

          {/* Default buffer */}
          <SettingRow
            label="Default buffer"
            description="Minutes between back-to-back meetings"
          >
            <Input
              type="number"
              min={0}
              max={120}
              value={settings?.defaultBufferMins ?? 15}
              onChange={(e) =>
                handleNumberChange('defaultBufferMins', e.target.value, 0, 120)
              }
              className="w-24 border-neutral-200 dark:border-neutral-700 text-right"
            />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}

// ── AI & Transcription ──
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
  { value: 'hi', label: 'Hindi' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ru', label: 'Russian' },
];

function AITranscriptionSection() {
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();

  const handleToggle = (field: string, value: boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="AI & Transcription"
          description="Configure automatic transcription and AI processing"
        />
        <SettingsSkeleton rows={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="AI & Transcription"
        description="Configure automatic transcription and AI processing"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6 space-y-6">
          <SettingRow
            label="Auto-transcribe"
            description="Automatically transcribe recordings after upload"
          >
            <Switch
              checked={settings?.autoTranscribe ?? true}
              onCheckedChange={(v) => handleToggle('autoTranscribe', v)}
            />
          </SettingRow>

          <div className="border-t border-neutral-100 dark:border-neutral-800" />

          <SettingRow
            label="Auto AI processing"
            description="Automatically generate summary, key points, and tasks after transcription"
          >
            <Switch
              checked={settings?.autoAIProcess ?? true}
              onCheckedChange={(v) => handleToggle('autoAIProcess', v)}
            />
          </SettingRow>

          <div className="border-t border-neutral-100 dark:border-neutral-800" />

          <SettingRow
            label="Default language"
            description="Language used for new transcriptions"
          >
            <Select
              value={settings?.defaultLanguage ?? 'en'}
              onValueChange={(v) =>
                updateSettings.mutate({ defaultLanguage: v })
              }
            >
              <SelectTrigger className="w-44 border-neutral-200 dark:border-neutral-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Event Types ──

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
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
  maxPerDay: '',
};

function EventTypesSection() {
  const { data: eventTypes, isLoading, isError } = useEventTypes();
  const { data: profile } = useCurrentUser();
  const createEventType = useCreateEventType();
  const updateEventType = useUpdateEventType();
  const deleteEventType = useDeleteEventType();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugEdited, setSlugEdited] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSlugEdited(false);
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
      maxPerDay: et.maxPerDay != null ? String(et.maxPerDay) : '',
    });
    setSlugEdited(true);
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
    if (form.locationType === 'ONLINE' && !form.meetingLink.trim()) {
      toast.error('Meeting link is required for online events');
      return;
    }

    const payload: CreateEventTypePayload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      duration: form.duration,
      locationType: form.locationType,
      ...(form.description.trim() && { description: form.description.trim() }),
      ...(form.locationType === 'ONLINE' &&
        form.meetingLink.trim() && { meetingLink: form.meetingLink.trim() }),
      ...(form.bufferBefore > 0 && { bufferBefore: form.bufferBefore }),
      ...(form.bufferAfter > 0 && { bufferAfter: form.bufferAfter }),
      ...(form.maxPerDay && { maxPerDay: parseInt(form.maxPerDay, 10) }),
    };

    if (editingId) {
      updateEventType.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success('Event type updated');
            setDialogOpen(false);
          },
        }
      );
    } else {
      createEventType.mutate(payload, {
        onSuccess: () => {
          setDialogOpen(false);
        },
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

  const handleCopySlug = useCallback(
    (slug: string) => {
      const publicBase =
        import.meta.env.VITE_CARDS_PUBLIC_URL ?? 'http://localhost:5174';
      const username = profile?.username ?? '';
      const url = `${publicBase}/schedule/${username}/${slug}`;
      navigator.clipboard.writeText(url);
      toast.success('Booking URL copied');
    },
    [profile?.username]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Event Types"
          description="Define the types of meetings people can book with you"
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

      {/* Loading */}
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

      {/* Error state */}
      {!isLoading && isError && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <LayoutList className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Failed to load event types
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Check your connection and try refreshing
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !isError && (!eventTypes || eventTypes.length === 0) && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <LayoutList className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                No event types yet
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 mb-4">
                Create your first event type so people can book time with you
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

      {/* Event type list */}
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
                      {(et.bufferBefore > 0 || et.bufferAfter > 0) && (
                        <span className="text-neutral-400 dark:text-neutral-500">
                          Buffer: {et.bufferBefore}/{et.bufferAfter}m
                        </span>
                      )}
                      {et.maxPerDay != null && (
                        <span className="text-neutral-400 dark:text-neutral-500">
                          Max {et.maxPerDay}/day
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        onClick={() => handleCopySlug(et.slug)}
                        className="flex items-center gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                      >
                        <Link2 className="w-3 h-3" />
                        /schedule/{profile?.username ?? '…'}/{et.slug}
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

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingId ? 'Edit Event Type' : 'New Event Type'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Title */}
            <FieldGroup label="Title">
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 30-min consultation"
                maxLength={100}
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>

            {/* Slug */}
            <FieldGroup label="Slug (URL path)">
              <div className="flex items-center gap-2">
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
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">
                Lowercase letters, numbers, and hyphens only
              </p>
            </FieldGroup>

            {/* Duration + Location row */}
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
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      locationType: v as LocationType,
                    }))
                  }
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

            {/* Meeting link (ONLINE only) */}
            {form.locationType === 'ONLINE' && (
              <FieldGroup label="Meeting Link">
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
              </FieldGroup>
            )}

            {/* Description */}
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

            {/* Buffer + Max per day row */}
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
              <FieldGroup label="Max per day">
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
            </div>

            {/* Submit */}
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

// ── Availability (placeholder — P1) ──
const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DEFAULT_SCHEDULE: PatchAvailabilityDayPayload[] = [
  { dayOfWeek: 0, isOff: true },
  { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
  { dayOfWeek: 6, isOff: true },
];

function AvailabilitySection() {
  const { data: schedule, isLoading, isError } = useAvailability();
  const updateAvailability = useUpdateAvailability();
  const { data: overrides, isLoading: overridesLoading } = useOverrides();
  const createOverride = useCreateOverride();
  const deleteOverride = useDeleteOverride();

  const [localSchedule, setLocalSchedule] = useState<
    { dayOfWeek: number; isOff: boolean; startTime: string; endTime: string }[]
  >([]);
  const [dirty, setDirty] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const initDone = useRef(false);

  useEffect(() => {
    if (schedule && !initDone.current) {
      setLocalSchedule(
        schedule.map((d: AvailabilityDay) => ({
          dayOfWeek: d.dayOfWeek,
          isOff: d.isOff,
          startTime: d.isOff ? '09:00' : d.startTime,
          endTime: d.isOff ? '17:00' : d.endTime,
        }))
      );
      initDone.current = true;
    }
  }, [schedule]);

  const handleToggleDay = (dayOfWeek: number) => {
    setLocalSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, isOff: !d.isOff } : d
      )
    );
    setDirty(true);
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setLocalSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    );
    setDirty(true);
  };

  const handleSave = () => {
    const payload: PatchAvailabilityDayPayload[] = localSchedule.map((d) => {
      if (d.isOff) return { dayOfWeek: d.dayOfWeek, isOff: true };
      if (d.startTime >= d.endTime) {
        toast.error(
          `${DAY_LABELS[d.dayOfWeek]}: start time must be before end time`
        );
        return null as unknown as PatchAvailabilityDayPayload;
      }
      return {
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
      };
    });
    if (payload.some((p) => p === null)) return;

    updateAvailability.mutate(payload, {
      onSuccess: () => {
        setDirty(false);
        initDone.current = false;
      },
    });
  };

  const handleReset = () => {
    setLocalSchedule(
      DEFAULT_SCHEDULE.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        isOff: !!d.isOff,
        startTime: d.startTime ?? '09:00',
        endTime: d.endTime ?? '17:00',
      }))
    );
    setDirty(true);
  };

  const handleBlockDate = () => {
    if (!blockDate) return;
    const today = new Date().toISOString().split('T')[0];
    if (blockDate < today) {
      toast.error('Cannot block a past date');
      return;
    }
    createOverride.mutate(blockDate, {
      onSuccess: () => setBlockDate(''),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Availability"
          description="Set your weekly schedule and block specific dates"
        />
        <SettingsSkeleton rows={7} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Availability"
          description="Set your weekly schedule and block specific dates"
        />
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Clock className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Failed to load availability
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Availability"
          description="Set your weekly schedule and block specific dates"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-8 px-3 text-xs shrink-0"
        >
          <RotateCcw className="w-3 h-3 mr-1.5" />
          Reset to Defaults
        </Button>
      </div>

      {/* Weekly grid */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6 space-y-3">
          {localSchedule.map((day) => (
            <div key={day.dayOfWeek} className="flex items-center gap-3 py-1">
              <div className="w-10 shrink-0">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {DAY_SHORT[day.dayOfWeek]}
                </span>
              </div>
              <Switch
                checked={!day.isOff}
                onCheckedChange={() => handleToggleDay(day.dayOfWeek)}
              />
              {day.isOff ? (
                <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">
                  Unavailable
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) =>
                      handleTimeChange(
                        day.dayOfWeek,
                        'startTime',
                        e.target.value
                      )
                    }
                    className="w-28 h-8 text-xs border-neutral-200 dark:border-neutral-700"
                  />
                  <span className="text-xs text-neutral-400">to</span>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) =>
                      handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)
                    }
                    className="w-28 h-8 text-xs border-neutral-200 dark:border-neutral-700"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!dirty || updateAvailability.isPending}
              className="h-8 px-4 text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
            >
              {updateAvailability.isPending ? 'Saving...' : 'Save Schedule'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Date overrides */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-1">
            Blocked Dates
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
            Block specific dates when you're unavailable
          </p>

          <div className="flex items-center gap-2 mb-4">
            <Input
              type="date"
              value={blockDate}
              onChange={(e) => setBlockDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-44 h-8 text-xs border-neutral-200 dark:border-neutral-700"
            />
            <Button
              size="sm"
              onClick={handleBlockDate}
              disabled={!blockDate || createOverride.isPending}
              className="h-8 px-3 text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
            >
              {createOverride.isPending ? 'Blocking...' : 'Block Date'}
            </Button>
          </div>

          {overridesLoading && (
            <div className="flex gap-2 animate-pulse">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-7 w-28 bg-neutral-100 dark:bg-neutral-800 rounded-full"
                />
              ))}
            </div>
          )}

          {!overridesLoading && overrides && overrides.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {overrides.map((o) => (
                <Badge
                  key={o.id}
                  variant="secondary"
                  className="gap-1.5 pr-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                >
                  <CalendarOff className="w-3 h-3" />
                  {new Date(o.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => deleteOverride.mutate(o.id)}
                    disabled={deleteOverride.isPending}
                    className="h-4 w-4 ml-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {!overridesLoading && (!overrides || overrides.length === 0) && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              No blocked dates. Use the date picker above to block specific
              days.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Integrations ──
function IntegrationsSection() {
  const { data: settings, isLoading } = useUserSettings();
  const updateSettings = useUpdateUserSettings();
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);

  // Recall.ai API key state
  const [recallApiKey, setRecallApiKey] = useState('');
  const [showRecallKey, setShowRecallKey] = useState(false);
  const saveRecallApiKey = useSaveRecallApiKey(() => setRecallApiKey(''));

  const isCalendarConnected = !!settings?.googleCalendarEmail;

  // After Google Calendar OAuth redirect, detect success/failure and refetch settings
  useEffect(() => {
    const calendarConnected = searchParams.get('calendarConnected');
    if (calendarConnected === 'true') {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Google Calendar connected');
      setSearchParams((prev) => {
        prev.delete('calendarConnected');
        return prev;
      });
    } else if (calendarConnected === 'false') {
      toast.error('Calendar connection cancelled');
      setSearchParams((prev) => {
        prev.delete('calendarConnected');
        return prev;
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCalendarConnect = async () => {
    setIsConnecting(true);
    try {
      const redirectUrl = window.location.href;
      const { url } = await settingsApi.getCalendarConnectUrl(redirectUrl);
      window.location.href = url;
    } catch {
      toast.error('Failed to initiate Google Calendar connection');
      setIsConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Integrations"
        description="Connect external services to enhance your workflow"
      />

      {/* Google Calendar */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Google Calendar
                </p>
                {isCalendarConnected && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  >
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Sync your availability and write confirmed bookings to your
                calendar
              </p>

              {isLoading ? (
                <div className="mt-4 animate-pulse h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
              ) : isCalendarConnected ? (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                    >
                      {settings?.googleCalendarEmail}
                    </Badge>
                  </div>
                  <SettingRow
                    label="Sync enabled"
                    description="Block busy times and write new bookings to this calendar"
                  >
                    <Switch
                      checked={settings?.googleCalendarSyncEnabled ?? false}
                      onCheckedChange={(v) =>
                        updateSettings.mutate({ googleCalendarSyncEnabled: v })
                      }
                    />
                  </SettingRow>
                </div>
              ) : (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCalendarConnect}
                    disabled={isConnecting}
                    className="h-8 px-3 text-xs border-neutral-200 dark:border-neutral-700"
                  >
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                    {isConnecting
                      ? 'Redirecting...'
                      : 'Connect Google Calendar'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recall.ai */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-0.5">
                Recall.ai
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                Automatically join your online meetings and begin transcribing
                in real time
              </p>

              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-4 w-36 bg-neutral-100 dark:bg-neutral-700 rounded" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* API key input */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      API Key
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showRecallKey ? 'text' : 'password'}
                          value={recallApiKey}
                          onChange={(e) => {
                            setRecallApiKey(e.target.value);
                            setRecallKeySaved(false);
                          }}
                          placeholder="Paste your Recall.ai API key"
                          className="pr-9 text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRecallKey((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          {showRecallKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          !recallApiKey.trim() || saveRecallApiKey.isPending
                        }
                        onClick={() =>
                          saveRecallApiKey.mutate(recallApiKey.trim())
                        }
                        className="shrink-0"
                      >
                        {saveRecallApiKey.isPending ? 'Saving…' : 'Save key'}
                      </Button>
                    </div>
                    {settings?.hasRecallApiKey ? (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        API key saved — paste a new key to replace it
                      </p>
                    ) : (
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        Get your key at{' '}
                        <span className="font-mono">
                          app.recall.ai → Settings → API Keys
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                    <SettingRow
                      label="Enable Recall.ai bot"
                      description="Bot joins scheduled online meetings and transcribes automatically"
                    >
                      <Switch
                        checked={settings?.recallEnabled ?? false}
                        onCheckedChange={(v) =>
                          updateSettings.mutate({ recallEnabled: v })
                        }
                      />
                    </SettingRow>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Privacy (placeholder) ──
function PrivacySection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Privacy"
        description="Control your data and privacy preferences"
      />
      <PlaceholderCard
        icon={Lock}
        message="Privacy settings are coming soon"
        hint="Data export, account deletion, and visibility controls"
      />
    </div>
  );
}

// ── Profile ──
function ProfileSection() {
  const { data: profile } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const initDone = useRef(false);

  useEffect(() => {
    if (profile && !initDone.current) {
      setName(profile.name ?? '');
      setPhone(profile.phoneNumber ?? '');
      initDone.current = true;
    }
  }, [profile]);

  const initials = (profile?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    const payload: Record<string, string> = {};
    if (name && name !== profile?.name) payload.name = name;
    if (phone !== (profile?.phoneNumber ?? '')) payload.phoneNumber = phone;
    if (Object.keys(payload).length === 0) return;

    updateProfile.mutate(payload, {
      onSuccess: () => toast.success('Profile updated'),
      onError: () => toast.error('Failed to update profile'),
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Profile"
        description="Your personal information and account details"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                {profile?.name ?? 'Loading...'}
              </h3>
              {profile?.username && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
                  @{profile.username}
                </p>
              )}
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {profile?.email ?? ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Full Name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
            <FieldGroup label="Email">
              <Input
                value={profile?.email ?? ''}
                disabled
                className="border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
              />
            </FieldGroup>
            <FieldGroup label="Username">
              <Input
                value={profile?.username ?? ''}
                disabled
                placeholder="No username set"
                className="border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 font-mono text-xs"
              />
            </FieldGroup>
            <FieldGroup label="Phone">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Add phone number"
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs px-4 h-8"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Appearance — wired to global themeStore ──
function AppearanceSection() {
  const { theme, setTheme } = useThemeStore();

  const themes: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Appearance"
        description="Customize how the app looks and feels"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
            Theme
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors
                    ${
                      isActive
                        ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}
                  />
                  <span
                    className={`text-xs font-medium ${isActive ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'}`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Security ──
function SecuritySection() {
  const { data: profile } = useCurrentUser();
  const {
    data: sessions,
    isLoading: sessionsLoading,
    isError: sessionsError,
  } = useSessions();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Security"
        description="Manage your account security and connected services"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6 space-y-4">
          {/* Connected accounts */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-3">
              Connected Accounts
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                <Globe className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Google
                </p>
                <p className="text-xs text-neutral-400">
                  {profile?.email ?? ''}
                </p>
              </div>
              <span className="text-[10px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>
          </div>

          {/* Sessions */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-3">
              Active Sessions
            </h3>
            {sessionsLoading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse"
                  />
                ))}
              </div>
            ) : sessionsError ? (
              <p className="text-xs text-neutral-400">
                Failed to load sessions.
              </p>
            ) : sessions && Array.isArray(sessions) && sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.map(
                  (session: {
                    id: string;
                    userAgent?: string;
                    ipAddress?: string;
                    createdAt: string;
                    isCurrent?: boolean;
                  }) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {session.userAgent ?? 'Unknown device'}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {session.isCurrent
                            ? 'Current session'
                            : `Since ${new Date(session.createdAt).toLocaleDateString()}`}
                          {session.ipAddress ? ` · ${session.ipAddress}` : ''}
                        </p>
                      </div>
                      {session.isCurrent && (
                        <span className="text-[10px] font-medium text-emerald-500">
                          Active
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Current session
                  </p>
                  <p className="text-xs text-neutral-400">Active now</p>
                </div>
                <span className="text-[10px] font-medium text-emerald-500">
                  Active
                </span>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-red-500 mb-3">
              Danger Zone
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-red-500 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const TAG_COLOR_PRESETS = [
  '#6b7280', // gray
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

// ── Tags ──
function TagsSection() {
  const { data: tags, isLoading } = useUserTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editColor, setEditColor] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(TAG_COLOR_PRESETS[0]);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createTag.mutate(
      { name, color: newColor },
      {
        onSuccess: () => {
          toast.success('Tag created');
          setNewName('');
          setNewColor(TAG_COLOR_PRESETS[0]);
        },
      }
    );
  };

  const startEdit = (id: string, currentName: string, currentColor: string) => {
    setEditingId(id);
    setEditValue(currentName);
    setEditColor(currentColor);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setEditColor('');
  };

  const saveEdit = (tagId: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) return cancelEdit();
    updateTag.mutate(
      { tagId, data: { name: trimmed, color: editColor } },
      {
        onSuccess: () => {
          toast.success('Tag updated');
          cancelEdit();
        },
      }
    );
  };

  const handleDelete = (tagId: string) => {
    deleteTag.mutate(tagId, {
      onSuccess: () => {
        toast.success('Tag deleted');
        setConfirmDeleteId(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tags"
        description="Create, rename, or delete tags. Changes apply across all meetings."
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0" />
                  <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-32" />
                  <div className="ml-auto flex gap-2">
                    <div className="h-7 w-7 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                    <div className="h-7 w-7 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (!tags || tags.length === 0) && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Tag className="w-8 h-8 text-neutral-200 dark:text-neutral-700 mb-3" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                No tags yet
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 mb-6">
                Create your first tag below.
              </p>
            </div>
          )}

          {!isLoading && tags && tags.length > 0 && (
            <div className="space-y-1 mb-4">
              {tags.map((tag) => {
                const isEditing = editingId === tag.id;
                const isConfirming = confirmDeleteId === tag.id;

                return (
                  <div
                    key={tag.id}
                    className={`px-3 py-2.5 rounded-lg transition-colors group ${isEditing ? 'bg-neutral-50 dark:bg-neutral-800/50' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}`}
                  >
                    {isEditing ? (
                      /* ── Edit mode: expanded layout ── */
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(tag.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="flex-1 h-8 px-3 rounded-lg text-sm
                              border border-neutral-300 dark:border-neutral-600
                              bg-white dark:bg-neutral-900
                              text-neutral-900 dark:text-neutral-100
                              focus:outline-none focus:border-neutral-500 dark:focus:border-neutral-500
                              transition-colors"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => saveEdit(tag.id)}
                            disabled={updateTag.isPending}
                          >
                            <Check className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={cancelEdit}
                          >
                            <X className="w-3.5 h-3.5 text-neutral-400" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mr-0.5">
                            Color
                          </span>
                          {TAG_COLOR_PRESETS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setEditColor(color)}
                              className="w-5 h-5 rounded-full transition-transform hover:scale-110 focus:outline-none shrink-0"
                              style={{ backgroundColor: color }}
                              aria-label={color}
                            >
                              {editColor === color && (
                                <span className="flex items-center justify-center w-full h-full">
                                  <Check className="w-3 h-3 text-white drop-shadow" />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* ── View mode: single row ── */
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="flex-1 text-sm text-neutral-800 dark:text-neutral-200">
                          {tag.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {isConfirming ? (
                            <>
                              <button
                                onClick={() => handleDelete(tag.id)}
                                disabled={deleteTag.isPending}
                                className="text-[11px] font-medium text-red-500 hover:text-red-600 transition-colors px-1.5"
                              >
                                {deleteTag.isPending
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
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() =>
                                  startEdit(tag.id, tag.name, tag.color)
                                }
                              >
                                <Pencil className="w-3.5 h-3.5 text-neutral-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  cancelEdit();
                                  setConfirmDeleteId(tag.id);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-red-400" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Create new tag ── */}
          {!isLoading && (
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
                New tag
              </p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 shrink-0">
                  {TAG_COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110 focus:outline-none"
                      style={{ backgroundColor: color }}
                      aria-label={color}
                    >
                      {newColor === color && (
                        <span className="flex items-center justify-center w-full h-full">
                          <Check className="w-3 h-3 text-white drop-shadow" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                  }}
                  placeholder="Tag name..."
                  maxLength={50}
                  className="flex-1 h-8 px-3 rounded-lg text-sm
                    border border-neutral-200 dark:border-neutral-700
                    bg-white dark:bg-neutral-800
                    text-neutral-900 dark:text-neutral-100
                    placeholder:text-neutral-400 dark:placeholder:text-neutral-600
                    focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600
                    transition-colors"
                />
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={!newName.trim() || createTag.isPending}
                  className="h-8 px-3 text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 shrink-0"
                >
                  {createTag.isPending ? (
                    <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      Create
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Shared components ──

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-1">
      <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
        {title}
      </h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
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
      <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {label}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          {description}
        </p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingsSkeleton({ rows }: { rows: number }) {
  return (
    <Card className="border-neutral-200 dark:border-neutral-800">
      <CardContent className="p-6 space-y-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between animate-pulse"
          >
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-48" />
            </div>
            <div className="h-6 w-11 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Bookings ──
const STATUS_LABELS: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled',
  NO_SHOW: 'No show',
};

const STATUS_STYLES: Record<BookingStatus, { badge: string; dot: string }> = {
  CONFIRMED: {
    badge:
      'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    dot: 'bg-emerald-500',
  },
  CANCELLED: {
    badge:
      'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500',
    dot: 'bg-neutral-400',
  },
  RESCHEDULED: {
    badge:
      'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
    dot: 'bg-amber-500',
  },
  NO_SHOW: {
    badge:
      'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500',
    dot: 'bg-red-400',
  },
};

function formatBookingTime(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  }).format(new Date(iso));
}

function BookingsSection() {
  const [statusFilter, setStatusFilter] = useState<string>('CONFIRMED');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading } = useBookings({ status: statusFilter, limit: 50 });
  const cancelBooking = useCancelBooking();

  const bookings: HostBooking[] = data?.bookings ?? [];

  const handleCancel = () => {
    if (!cancelId) return;
    cancelBooking.mutate(
      { id: cancelId, reason: cancelReason.trim() || undefined },
      {
        onSettled: () => {
          setCancelId(null);
          setCancelReason('');
        },
      }
    );
  };

  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Bookings"
        description="View and manage meetings booked by guests via your scheduling page"
      />

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {(['CONFIRMED', 'CANCELLED', 'NO_SHOW'] as BookingStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={[
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              statusFilter === s
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
            ].join(' ')}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-start justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-40" />
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-60" />
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-32" />
                </div>
                <div className="h-6 w-20 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && bookings.length === 0 && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                No {STATUS_LABELS[statusFilter as BookingStatus]?.toLowerCase()}{' '}
                bookings
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
                Bookings will appear here once guests schedule time with you.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking list */}
      {!isLoading && bookings.length > 0 && (
        <Card className="border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800">
          {bookings.map((booking) => {
            const style = STATUS_STYLES[booking.status];
            const canCancel =
              booking.status === 'CONFIRMED' ||
              booking.status === 'RESCHEDULED';
            return (
              <div key={booking.id} className="p-5 flex items-start gap-4">
                {/* Left */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {booking.eventType.title}
                    </p>
                    <span
                      className={[
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium',
                        style.badge,
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'w-1.5 h-1.5 rounded-full shrink-0',
                          style.dot,
                        ].join(' ')}
                      />
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatBookingTime(booking.startTime, userTz)}
                    <span className="text-neutral-300 dark:text-neutral-600 mx-1.5">
                      ·
                    </span>
                    {booking.eventType.duration} min
                    <span className="text-neutral-300 dark:text-neutral-600 mx-1.5">
                      ·
                    </span>
                    {booking.eventType.locationType === 'ONLINE' ? (
                      <span className="inline-flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Online
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        In person
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {booking.guestName}
                    <span className="text-neutral-400 dark:text-neutral-500 ml-1.5">
                      {booking.guestEmail}
                    </span>
                  </p>
                  {booking.guestNote && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 italic mt-1">
                      &ldquo;{booking.guestNote}&rdquo;
                    </p>
                  )}
                  {booking.cancelReason && (
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                      Cancellation reason: {booking.cancelReason}
                    </p>
                  )}
                </div>

                {/* Cancel action */}
                {canCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCancelId(booking.id);
                      setCancelReason('');
                    }}
                    className="shrink-0 text-xs text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {/* Pagination hint */}
      {data && data.pagination.total > data.pagination.limit && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
          Showing {bookings.length} of {data.pagination.total} bookings
        </p>
      )}

      {/* Cancel confirm dialog */}
      <Dialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              The guest will be notified that this booking has been cancelled.
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-500">
                Reason <span className="text-neutral-400">(optional)</span>
              </Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let the guest know why…"
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelId(null)}
              >
                Keep booking
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancel}
                disabled={cancelBooking.isPending}
              >
                {cancelBooking.isPending ? 'Cancelling…' : 'Cancel booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlaceholderCard({
  icon: Icon,
  message,
  hint,
}: {
  icon: typeof Clock;
  message: string;
  hint: string;
}) {
  return (
    <Card className="border-neutral-200 dark:border-neutral-800">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Icon className="w-10 h-10 text-neutral-200 dark:text-neutral-700 mb-3" />
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {message}
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs">
            {hint}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

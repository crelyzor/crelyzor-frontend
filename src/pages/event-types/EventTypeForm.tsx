import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useEventType,
  useCreateEventType,
  useUpdateEventType,
} from '@/hooks/queries/useEventTypeQueries';
import { useSchedules } from '@/hooks/queries/useScheduleQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { PageLoader } from '@/components/PageLoader';

const APP_URL = import.meta.env.VITE_APP_URL ?? window.location.origin;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function EventTypeForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data: existingEventType, isLoading: loadingET } = useEventType(
    id ?? ''
  );
  const { data: schedules, isLoading: loadingSchedules } = useSchedules();
  const { data: user } = useCurrentUser();
  const createEventType = useCreateEventType();
  const updateEventType = useUpdateEventType();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [scheduleId, setScheduleId] = useState('');
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [minNotice, setMinNotice] = useState(1);
  const [maxAdvance, setMaxAdvance] = useState(60);

  // Populate form when editing
  useEffect(() => {
    if (isEdit && existingEventType) {
      setTitle(existingEventType.title);
      setSlug(existingEventType.slug);
      setSlugTouched(true);
      setDescription(existingEventType.description ?? '');
      setDuration(existingEventType.duration);
      setScheduleId(existingEventType.scheduleId);
      setBufferBefore(existingEventType.bufferBefore);
      setBufferAfter(existingEventType.bufferAfter);
      setMinNotice(existingEventType.minNotice);
      setMaxAdvance(existingEventType.maxAdvance);
    }
  }, [isEdit, existingEventType]);

  // Auto-set scheduleId to first schedule
  useEffect(() => {
    if (!scheduleId && schedules && schedules.length > 0) {
      const defaultSchedule =
        schedules.find((s) => s.isDefault) ?? schedules[0];
      setScheduleId(defaultSchedule.id);
    }
  }, [schedules, scheduleId]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!scheduleId) {
      toast.error('Please select a schedule');
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug || undefined,
      description: description.trim() || undefined,
      duration,
      scheduleId,
      bufferBefore,
      bufferAfter,
      minNotice,
      maxAdvance,
    };

    if (isEdit) {
      updateEventType.mutate(
        { id: id!, data: payload },
        {
          onSuccess: () => {
            toast.success('Event type updated');
            navigate('/event-types');
          },
          onError: () => toast.error('Failed to update event type'),
        }
      );
    } else {
      createEventType.mutate(payload, {
        onSuccess: () => {
          toast.success('Event type created');
          navigate('/event-types');
        },
        onError: () => toast.error('Failed to create event type'),
      });
    }
  };

  if (isEdit && loadingET) return <PageLoader />;
  if (loadingSchedules) return <PageLoader />;

  const bookingPreview =
    user?.username && slug ? `${APP_URL}/book/${user.username}/${slug}` : null;

  const isPending = createEventType.isPending || updateEventType.isPending;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/event-types')}
          className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
          {isEdit ? 'Edit Event Type' : 'Create Event Type'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm border-neutral-200 dark:border-neutral-800 mb-6">
          <CardContent className="p-6 space-y-5">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="30 Minute Meeting"
                className="mt-1.5"
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                placeholder="30-minute-meeting"
                className="mt-1.5"
              />
              {bookingPreview && (
                <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  {bookingPreview}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A quick 30 minute meeting..."
                rows={3}
                className="mt-1.5"
              />
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={5}
                max={480}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="mt-1.5 w-32"
              />
            </div>

            {/* Schedule */}
            <div>
              <Label htmlFor="schedule">Schedule</Label>
              <select
                id="schedule"
                value={scheduleId}
                onChange={(e) => setScheduleId(e.target.value)}
                className="mt-1.5 w-full rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100"
              >
                {schedules?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {s.isDefault ? ' (Default)' : ''} - {s.timezone}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="shadow-sm border-neutral-200 dark:border-neutral-800 mb-6">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50 mb-4">
              Advanced Settings
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bufferBefore">Buffer Before (min)</Label>
                <Input
                  id="bufferBefore"
                  type="number"
                  min={0}
                  max={120}
                  value={bufferBefore}
                  onChange={(e) => setBufferBefore(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="bufferAfter">Buffer After (min)</Label>
                <Input
                  id="bufferAfter"
                  type="number"
                  min={0}
                  max={120}
                  value={bufferAfter}
                  onChange={(e) => setBufferAfter(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="minNotice">Minimum Notice (hours)</Label>
                <Input
                  id="minNotice"
                  type="number"
                  min={0}
                  max={720}
                  value={minNotice}
                  onChange={(e) => setMinNotice(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="maxAdvance">Max Advance (days)</Label>
                <Input
                  id="maxAdvance"
                  type="number"
                  min={1}
                  max={365}
                  value={maxAdvance}
                  onChange={(e) => setMaxAdvance(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/event-types')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
          >
            {isPending
              ? 'Saving...'
              : isEdit
                ? 'Update Event Type'
                : 'Create Event Type'}
          </Button>
        </div>
      </form>
    </div>
  );
}

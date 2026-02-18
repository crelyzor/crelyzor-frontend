import { Clock, Plus, Save } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { WeeklySchedule, DayOfWeek } from '@/types';
import { DAY_MAP, DAY_MAP_REVERSE } from '@/types';
import {
  useRecurringAvailability,
  useCreateRecurringBatch,
  useOverrides,
  useCreateOverride,
  useDeleteOverride,
  useBlockedTimes,
  useCreateBlockedTime,
  useDeleteBlockedTime,
} from '@/hooks/queries/useAvailabilityQueries';
import { useDefaultSchedule } from '@/hooks/queries/useScheduleQueries';
import { WeeklyScheduleForm } from './WeeklyScheduleForm';
import { AvailabilityPreview } from './AvailabilityPreview';
import { PageLoader } from '@/components/PageLoader';

// Default empty schedule
const emptySchedule: WeeklySchedule = {
  monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
  sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
};

export default function Availability() {
  const { data: defaultSchedule, isLoading: loadingSchedule } =
    useDefaultSchedule();
  const scheduleId = defaultSchedule?.id ?? '';

  const { data: recurring } = useRecurringAvailability(scheduleId || undefined);
  const saveBatch = useCreateRecurringBatch(scheduleId);

  // Overrides
  const { data: overrides } = useOverrides(scheduleId || undefined);
  const createOverride = useCreateOverride(scheduleId);
  const deleteOverride = useDeleteOverride(scheduleId);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideStart, setOverrideStart] = useState('09:00');
  const [overrideEnd, setOverrideEnd] = useState('17:00');
  const [overrideNotes, setOverrideNotes] = useState('');

  // Blocked Times
  const { data: blockedTimes } = useBlockedTimes(scheduleId || undefined);
  const createBlockedTime = useCreateBlockedTime(scheduleId);
  const deleteBlockedTime = useDeleteBlockedTime(scheduleId);
  const [showBlockedForm, setShowBlockedForm] = useState(false);
  const [blockedStart, setBlockedStart] = useState('');
  const [blockedEnd, setBlockedEnd] = useState('');
  const [blockedReason, setBlockedReason] = useState('');

  // Convert API recurring data to WeeklySchedule format
  const apiSchedule = useMemo<WeeklySchedule>(() => {
    if (!recurring || recurring.length === 0) return emptySchedule;
    const s = { ...emptySchedule };
    for (const slot of recurring) {
      const dayKey = DAY_MAP_REVERSE[slot.dayOfWeek];
      if (dayKey) {
        s[dayKey] = {
          enabled: true,
          startTime: slot.startTime,
          endTime: slot.endTime,
        };
      }
    }
    return s;
  }, [recurring]);

  const [schedule, setSchedule] = useState<WeeklySchedule>(emptySchedule);

  // Sync from API when data loads
  useEffect(() => {
    if (recurring) setSchedule(apiSchedule);
  }, [apiSchedule, recurring]);

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const handleTimeChange = (
    day: string,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = () => {
    const slots = Object.entries(schedule)
      .filter(([, day]) => day.enabled)
      .map(([dayKey, day]) => ({
        dayOfWeek: DAY_MAP[dayKey] as DayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
      }));

    saveBatch.mutate(slots, {
      onSuccess: () => toast.success('Availability saved!'),
      onError: () => toast.error('Failed to save availability'),
    });
  };

  const handleAddOverride = () => {
    if (!overrideDate) {
      toast.error('Please select a date');
      return;
    }
    createOverride.mutate(
      {
        date: overrideDate,
        startTime: overrideStart,
        endTime: overrideEnd,
        notes: overrideNotes || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Override added');
          setShowOverrideForm(false);
          setOverrideDate('');
          setOverrideStart('09:00');
          setOverrideEnd('17:00');
          setOverrideNotes('');
        },
        onError: () => toast.error('Failed to add override'),
      },
    );
  };

  const handleAddBlockedTime = () => {
    if (!blockedStart || !blockedEnd) {
      toast.error('Please set start and end times');
      return;
    }
    createBlockedTime.mutate(
      {
        startTime: blockedStart,
        endTime: blockedEnd,
        reason: blockedReason || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Blocked time added');
          setShowBlockedForm(false);
          setBlockedStart('');
          setBlockedEnd('');
          setBlockedReason('');
        },
        onError: () => toast.error('Failed to add blocked time'),
      },
    );
  };

  if (loadingSchedule) return <PageLoader />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 mb-1 tracking-tight">
            Availability
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {defaultSchedule
              ? `Schedule: ${defaultSchedule.name} (${defaultSchedule.timezone})`
              : 'Set your weekly schedule and manage your available time slots'}
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveBatch.isPending || !scheduleId}
          className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 gap-2"
        >
          <Save className="w-4 h-4" />
          {saveBatch.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="recurring" className="w-full">
        <TabsList className="mb-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1">
          <TabsTrigger
            value="recurring"
            className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white dark:data-[state=active]:bg-neutral-100 dark:data-[state=active]:text-neutral-900"
          >
            Recurring Weekly
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white dark:data-[state=active]:bg-neutral-100 dark:data-[state=active]:text-neutral-900"
          >
            Custom Dates
          </TabsTrigger>
          <TabsTrigger
            value="blocked"
            className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white dark:data-[state=active]:bg-neutral-100 dark:data-[state=active]:text-neutral-900"
          >
            Blocked Times
          </TabsTrigger>
        </TabsList>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <TabsContent value="recurring" className="m-0">
              <WeeklyScheduleForm
                schedule={schedule}
                onToggleDay={toggleDay}
                onTimeChange={handleTimeChange}
              />
            </TabsContent>

            <TabsContent value="custom" className="m-0">
              <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
                      Custom Date Availability
                    </h2>
                    <Button
                      onClick={() => setShowOverrideForm(true)}
                      className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
                    >
                      <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Add Custom Date
                    </Button>
                  </div>

                  {!overrides || overrides.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock
                        className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3"
                        strokeWidth={1.5}
                      />
                      <p className="text-neutral-400 dark:text-neutral-500 text-sm">
                        No custom dates set. Add specific dates to override your
                        weekly schedule.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {overrides.map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between p-3 rounded-md border border-neutral-200 dark:border-neutral-800"
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {o.date}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {o.startTime} - {o.endTime}
                              {o.notes && ` — ${o.notes}`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteOverride.mutate(o.id, {
                                onSuccess: () =>
                                  toast.success('Override removed'),
                              })
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="blocked" className="m-0">
              <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50">
                      Blocked Time Slots
                    </h2>
                    <Button
                      onClick={() => setShowBlockedForm(true)}
                      className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
                    >
                      <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Block Time
                    </Button>
                  </div>

                  {!blockedTimes || blockedTimes.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock
                        className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3"
                        strokeWidth={1.5}
                      />
                      <p className="text-neutral-400 dark:text-neutral-500 text-sm">
                        No blocked times. Add blocked times to prevent bookings.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {blockedTimes.map((bt) => (
                        <div
                          key={bt.id}
                          className="flex items-center justify-between p-3 rounded-md border border-neutral-200 dark:border-neutral-800"
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {new Date(bt.startTime).toLocaleString()} -{' '}
                              {new Date(bt.endTime).toLocaleString()}
                            </p>
                            {bt.reason && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {bt.reason}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteBlockedTime.mutate(bt.id, {
                                onSuccess: () =>
                                  toast.success('Blocked time removed'),
                              })
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:col-span-1">
            <AvailabilityPreview schedule={schedule} />
          </div>
        </div>
      </Tabs>

      {/* Override Dialog */}
      <Dialog open={showOverrideForm} onOpenChange={setShowOverrideForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Date Override</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="override-date">Date</Label>
              <Input
                id="override-date"
                type="date"
                value={overrideDate}
                onChange={(e) => setOverrideDate(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="override-start">Start Time</Label>
                <Input
                  id="override-start"
                  type="time"
                  value={overrideStart}
                  onChange={(e) => setOverrideStart(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="override-end">End Time</Label>
                <Input
                  id="override-end"
                  type="time"
                  value={overrideEnd}
                  onChange={(e) => setOverrideEnd(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="override-notes">Notes (optional)</Label>
              <Input
                id="override-notes"
                value={overrideNotes}
                onChange={(e) => setOverrideNotes(e.target.value)}
                placeholder="Reason for override..."
                className="mt-1.5"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowOverrideForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddOverride}
                disabled={createOverride.isPending}
                className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
              >
                {createOverride.isPending ? 'Adding...' : 'Add Override'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blocked Time Dialog */}
      <Dialog open={showBlockedForm} onOpenChange={setShowBlockedForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="blocked-start">Start</Label>
              <Input
                id="blocked-start"
                type="datetime-local"
                value={blockedStart}
                onChange={(e) => setBlockedStart(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="blocked-end">End</Label>
              <Input
                id="blocked-end"
                type="datetime-local"
                value={blockedEnd}
                onChange={(e) => setBlockedEnd(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="blocked-reason">Reason (optional)</Label>
              <Input
                id="blocked-reason"
                value={blockedReason}
                onChange={(e) => setBlockedReason(e.target.value)}
                placeholder="e.g., Doctor appointment"
                className="mt-1.5"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBlockedForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBlockedTime}
                disabled={createBlockedTime.isPending}
                className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
              >
                {createBlockedTime.isPending ? 'Adding...' : 'Block Time'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

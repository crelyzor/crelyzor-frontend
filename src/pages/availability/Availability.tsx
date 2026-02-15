import { Clock, Plus, X, Save } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { WeeklySchedule, DayOfWeek } from '@/types';
import { DAY_MAP, DAY_MAP_REVERSE } from '@/types';
import { useRecurringAvailability, useCreateRecurringBatch } from '@/hooks/queries/useAvailabilityQueries';
import { WeeklyScheduleForm } from './WeeklyScheduleForm';
import { AvailabilityPreview } from './AvailabilityPreview';

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
  const { data: recurring } = useRecurringAvailability();
  const saveBatch = useCreateRecurringBatch();

  // Convert API recurring data to WeeklySchedule format
  const apiSchedule = useMemo<WeeklySchedule>(() => {
    if (!recurring || recurring.length === 0) return emptySchedule;
    const s = { ...emptySchedule };
    for (const slot of recurring) {
      const dayKey = DAY_MAP_REVERSE[slot.dayOfWeek];
      if (dayKey) {
        s[dayKey] = { enabled: true, startTime: slot.startTime, endTime: slot.endTime };
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
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = () => {
    // Convert WeeklySchedule to batch payload
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 mb-1 tracking-tight">
            Availability
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            Set your weekly schedule and manage your available time slots
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saveBatch.isPending}
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
                    <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900">
                      <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Add Custom Date
                    </Button>
                  </div>

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
                    <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900">
                      <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                      Block Time
                    </Button>
                  </div>

                  <div className="text-center py-12">
                    <Clock
                      className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="text-neutral-400 dark:text-neutral-500 text-sm">
                      No blocked times. Add blocked times to prevent bookings.
                    </p>
                  </div>
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
    </div>
  );
}

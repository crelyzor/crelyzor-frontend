import { Clock, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultWeeklySchedule } from '@/data';
import type { WeeklySchedule } from '@/types';
import { WeeklyScheduleForm } from './WeeklyScheduleForm';
import { AvailabilityPreview } from './AvailabilityPreview';

export default function Availability() {
  const [schedule, setSchedule] = useState<WeeklySchedule>(
    defaultWeeklySchedule
  );

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

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 mb-1 tracking-tight">
          Availability
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Set your weekly schedule and manage your available time slots
        </p>
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

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-md border border-neutral-200 dark:border-neutral-700">
                      <div>
                        <div className="font-medium text-neutral-950 dark:text-neutral-50 text-sm">
                          Lunch Break
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Every day, 12:00 PM - 1:00 PM
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
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

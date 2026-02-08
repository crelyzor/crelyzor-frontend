import { Clock, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export default function Availability() {
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    saturday: { enabled: false, startTime: '10:00', endTime: '14:00' },
    sunday: { enabled: false, startTime: '10:00', endTime: '14:00' },
  });

  const toggleDay = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: { ...schedule[day], enabled: !schedule[day].enabled },
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
          <h1 className="text-3xl font-semibold text-neutral-950 mb-1 tracking-tight">
            Availability
          </h1>
          <p className="text-neutral-500 text-sm">
            Set your weekly schedule and manage your available time slots
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="recurring" className="w-full">
          <TabsList className="mb-6 bg-white border border-neutral-200 p-1">
            <TabsTrigger
              value="recurring"
              className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white"
            >
              Recurring Weekly
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white"
            >
              Custom Dates
            </TabsTrigger>
            <TabsTrigger
              value="blocked"
              className="data-[state=active]:bg-neutral-900 data-[state=active]:text-white"
            >
              Blocked Times
            </TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <TabsContent value="recurring" className="m-0">
                <Card className="shadow-sm border-neutral-200">
                  <CardContent className="p-6">
                    <h2 className="text-base font-semibold text-neutral-950 mb-6">
                      Weekly Schedule
                    </h2>

                    <div className="space-y-4">
                      {Object.entries(schedule).map(([day, config]) => (
                        <div
                          key={day}
                          className="flex items-center gap-4 pb-4 border-b border-neutral-200 last:border-0"
                        >
                          {/* Day Toggle */}
                          <div className="w-32">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={config.enabled}
                                onChange={() => toggleDay(day)}
                                className="w-4 h-4 rounded border-neutral-300 
                                         text-neutral-900 focus:ring-neutral-900"
                              />
                              <span
                                className={`text-sm font-medium capitalize ${
                                  config.enabled
                                    ? 'text-neutral-950'
                                    : 'text-neutral-400'
                                }`}
                              >
                                {day}
                              </span>
                            </label>
                          </div>

                          {/* Time Pickers */}
                          {config.enabled ? (
                            <div className="flex-1 flex items-center gap-3">
                              <Input
                                type="time"
                                value={config.startTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setSchedule({
                                    ...schedule,
                                    [day]: {
                                      ...config,
                                      startTime: e.target.value,
                                    },
                                  })
                                }
                                className="border-neutral-200 focus-visible:ring-neutral-900"
                              />
                              <span className="text-neutral-500 text-sm">to</span>
                              <Input
                                type="time"
                                value={config.endTime}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                  setSchedule({
                                    ...schedule,
                                    [day]: {
                                      ...config,
                                      endTime: e.target.value,
                                    },
                                  })
                                }
                                className="border-neutral-200 focus-visible:ring-neutral-900"
                              />
                            </div>
                          ) : (
                            <div className="flex-1 text-neutral-400 text-sm">
                              Unavailable
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-neutral-200">
                      <Button className="bg-neutral-900 hover:bg-neutral-800 text-white">
                        Save Schedule
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="custom" className="m-0">
                <Card className="shadow-sm border-neutral-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-base font-semibold text-neutral-950">
                        Custom Date Availability
                      </h2>
                      <Button className="bg-neutral-900 hover:bg-neutral-800 text-white">
                        <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Add Custom Date
                      </Button>
                    </div>

                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-neutral-400 text-sm">
                        No custom dates set. Add specific dates to override your
                        weekly schedule.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="blocked" className="m-0">
                <Card className="shadow-sm border-neutral-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-base font-semibold text-neutral-950">
                        Blocked Time Slots
                      </h2>
                      <Button className="bg-neutral-900 hover:bg-neutral-800 text-white">
                        <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                        Block Time
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {/* Example blocked time */}
                      <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-md border border-neutral-200">
                        <div>
                          <div className="font-medium text-neutral-950 text-sm">
                            Lunch Break
                          </div>
                          <div className="text-xs text-neutral-500">
                            Every day, 12:00 PM - 1:00 PM
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-neutral-100"
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
              <Card className="shadow-sm border-neutral-200 sticky top-8">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-neutral-950 mb-4 text-sm">
                    This Week's Availability
                  </h3>

                  <div className="space-y-3">
                    {Object.entries(schedule)
                      .filter(([, config]) => config.enabled)
                      .map(([day, config]) => (
                        <div
                          key={day}
                          className="flex items-center justify-between py-2"
                        >
                          <span className="text-xs capitalize text-neutral-500">
                            {day}
                          </span>
                          <span className="text-xs font-medium text-neutral-900">
                            {config.startTime} - {config.endTime}
                          </span>
                        </div>
                      ))}
                  </div>

                  {Object.values(schedule).filter((c) => c.enabled).length ===
                    0 && (
                    <p className="text-sm text-neutral-400 text-center py-4">
                      No availability set
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
    </div>
  );
}

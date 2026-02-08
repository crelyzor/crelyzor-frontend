import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { WeeklySchedule } from '@/types';

type WeeklyScheduleFormProps = {
  schedule: WeeklySchedule;
  onToggleDay: (day: string) => void;
  onTimeChange: (
    day: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => void;
};

export function WeeklyScheduleForm({
  schedule,
  onToggleDay,
  onTimeChange,
}: WeeklyScheduleFormProps) {
  return (
    <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
      <CardContent className="p-6">
        <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50 mb-6">
          Weekly Schedule
        </h2>

        <div className="space-y-4">
          {Object.entries(schedule).map(([day, config]) => (
            <div
              key={day}
              className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800 last:border-0"
            >
              {/* Day Toggle */}
              <div className="w-32">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={() => onToggleDay(day)}
                    className="w-4 h-4 rounded border-neutral-300 
                               text-neutral-900 focus:ring-neutral-900"
                  />
                  <span
                    className={`text-sm font-medium capitalize ${
                      config.enabled
                        ? 'text-neutral-950 dark:text-neutral-50'
                        : 'text-neutral-400 dark:text-neutral-500'
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
                      onTimeChange(day, 'startTime', e.target.value)
                    }
                    className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400"
                  />
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                    to
                  </span>
                  <Input
                    type="time"
                    value={config.endTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      onTimeChange(day, 'endTime', e.target.value)
                    }
                    className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400"
                  />
                </div>
              ) : (
                <div className="flex-1 text-neutral-400 dark:text-neutral-500 text-sm">
                  Unavailable
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900">
            Save Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import type { WeeklySchedule } from '@/types';

type AvailabilityPreviewProps = {
  schedule: WeeklySchedule;
};

export function AvailabilityPreview({ schedule }: AvailabilityPreviewProps) {
  const enabledDays = Object.entries(schedule).filter(
    ([, config]) => config.enabled
  );

  return (
    <Card className="shadow-sm border-neutral-200 dark:border-neutral-800 sticky top-8">
      <CardContent className="p-6">
        <h3 className="font-semibold text-neutral-950 dark:text-neutral-50 mb-4 text-sm">
          This Week&apos;s Availability
        </h3>

        <div className="space-y-3">
          {enabledDays.map(([day, config]) => (
            <div key={day} className="flex items-center justify-between py-2">
              <span className="text-xs capitalize text-neutral-500 dark:text-neutral-400">
                {day}
              </span>
              <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                {config.startTime} - {config.endTime}
              </span>
            </div>
          ))}
        </div>

        {enabledDays.length === 0 && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-4">
            No availability set
          </p>
        )}
      </CardContent>
    </Card>
  );
}

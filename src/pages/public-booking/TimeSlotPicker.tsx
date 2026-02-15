import { Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type TimeSlot = {
  startTime: string;
  endTime: string;
};

type TimeSlotPickerProps = {
  selectedDate: string | null;
  timeSlots: TimeSlot[];
  onSelectTime: (slot: {
    startTime: string;
    endTime: string;
    display: string;
  }) => void;
};

function formatSlotTime(isoOrTime: string): string {
  try {
    const d = new Date(isoOrTime);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  } catch {
    // fall through
  }
  // If it's already a display string like "9:00 AM", return as-is
  return isoOrTime;
}

export function TimeSlotPicker({
  selectedDate,
  timeSlots,
  onSelectTime,
}: TimeSlotPickerProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50 mb-4">
        <Clock className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
        Available Times
      </h2>
      {!selectedDate ? (
        <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-8 text-center">
            <Calendar
              className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3"
              strokeWidth={1.5}
            />
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">
              Please select a date to see available times
            </p>
          </CardContent>
        </Card>
      ) : timeSlots.length === 0 ? (
        <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-8 text-center">
            <p className="text-neutral-400 dark:text-neutral-500 text-sm">
              No available times for this date
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {timeSlots.map((slot) => {
            const display = formatSlotTime(slot.startTime);
            return (
              <Button
                key={slot.startTime}
                variant="outline"
                onClick={() =>
                  onSelectTime({
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    display,
                  })
                }
                className="w-full justify-center border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100
                           hover:bg-neutral-900 hover:text-white hover:border-neutral-900
                           dark:hover:bg-neutral-100 dark:hover:text-neutral-900 dark:hover:border-neutral-100"
              >
                {display}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

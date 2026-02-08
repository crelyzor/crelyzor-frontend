import { Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type TimeSlotPickerProps = {
  selectedDate: string | null;
  timeSlots: string[];
  onSelectTime: (time: string) => void;
};

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
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant="outline"
              onClick={() => onSelectTime(time)}
              className="w-full justify-center border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100
                         hover:bg-neutral-900 hover:text-white hover:border-neutral-900
                         dark:hover:bg-neutral-100 dark:hover:text-neutral-900 dark:hover:border-neutral-100"
            >
              {time}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

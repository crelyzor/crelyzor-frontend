import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type DatePickerProps = {
  availableDates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

export function DatePicker({
  availableDates,
  selectedDate,
  onSelectDate,
}: DatePickerProps) {
  return (
    <div>
      <h2 className="text-base font-semibold text-neutral-950 dark:text-neutral-50 mb-4">
        <Calendar className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
        Select a Date
      </h2>
      <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(28)].map((_, i) => {
              const day = i + 1;
              const dateStr = `2026-02-${day.toString().padStart(2, '0')}`;
              const isAvailable = availableDates.includes(dateStr);
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={i}
                  onClick={() => isAvailable && onSelectDate(dateStr)}
                  disabled={!isAvailable}
                  className={`
                    aspect-square rounded-md text-xs font-medium transition-colors
                    ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                        : isAvailable
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          : 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

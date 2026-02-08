import { useState } from 'react';
import { availableDates, availableTimeSlots } from '@/data';
import { DatePicker } from './DatePicker';
import { TimeSlotPicker } from './TimeSlotPicker';
import { BookingForm } from './BookingForm';

export default function PublicBooking() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 dark:bg-neutral-800 flex items-center justify-center text-white text-2xl font-semibold">
              JD
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
                John Doe
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Product Manager
              </p>
            </div>
          </div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-base">
            Select a time to meet with me
          </p>
        </div>
      </div>

      {/* Booking Interface */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {!selectedTime ? (
          <div className="grid md:grid-cols-2 gap-8">
            <DatePicker
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            <TimeSlotPicker
              selectedDate={selectedDate}
              timeSlots={availableTimeSlots}
              onSelectTime={setSelectedTime}
            />
          </div>
        ) : (
          <BookingForm
            selectedDate={selectedDate!}
            selectedTime={selectedTime}
            onBack={() => setSelectedTime(null)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
          Powered by Calendar
        </div>
      </div>
    </div>
  );
}

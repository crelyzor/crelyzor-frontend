import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  usePublicBookingProfile,
  useCreatePublicBooking,
} from '@/hooks/queries/useAvailabilityQueries';
import { DatePicker } from './DatePicker';
import { TimeSlotPicker } from './TimeSlotPicker';
import { BookingForm } from './BookingForm';
import { PageLoader } from '@/components/PageLoader';

export default function PublicBooking() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    startTime: string;
    endTime: string;
    display: string;
  } | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const { data, isLoading, isError } = usePublicBookingProfile(
    shareToken ?? ''
  );
  const createBooking = useCreatePublicBooking(shareToken ?? '');

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
            Booking link not found
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            This booking link may be invalid or has been disabled.
          </p>
        </div>
      </div>
    );
  }

  const consultant = data.consultant as {
    id?: string;
    name?: string;
    email?: string;
    title?: string;
  };
  const availableSlots = (data.availableSlots ?? data.slots ?? []) as Array<{
    date: string;
    slots?: Array<{ startTime: string; endTime: string }>;
    startTime?: string;
    endTime?: string;
  }>;

  // Extract unique available dates
  const availableDates = [...new Set(availableSlots.map((s) => s.date))].sort();

  // Get time slots for the selected date
  const slotsForDate = selectedDate
    ? availableSlots
        .filter((s) => s.date === selectedDate)
        .flatMap((s) =>
          s.slots
            ? s.slots.map((slot) => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
              }))
            : s.startTime && s.endTime
              ? [{ startTime: s.startTime, endTime: s.endTime }]
              : []
        )
    : [];

  const initials = (consultant.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 mb-2">
            Booking Requested!
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your meeting request has been sent to{' '}
            {consultant.name ?? 'the consultant'}. You&apos;ll receive a
            confirmation email once it&apos;s accepted.
          </p>
        </div>
      </div>
    );
  }

  const handleBookingSubmit = (formData: {
    name: string;
    email: string;
    message?: string;
  }) => {
    if (!selectedSlot || !selectedDate) return;

    createBooking.mutate(
      {
        title: `Meeting with ${formData.name}`,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        guestName: formData.name,
        guestEmail: formData.email,
        guestMessage: formData.message,
      },
      {
        onSuccess: () => setBookingSuccess(true),
      }
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 dark:bg-neutral-800 flex items-center justify-center text-white text-2xl font-semibold">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
                {consultant.name ?? 'Consultant'}
              </h1>
              {consultant.title && (
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  {consultant.title}
                </p>
              )}
            </div>
          </div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-base">
            Select a time to meet with me
          </p>
        </div>
      </div>

      {/* Booking Interface */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {!selectedSlot ? (
          <div className="grid md:grid-cols-2 gap-8">
            <DatePicker
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedSlot(null);
              }}
            />
            <TimeSlotPicker
              selectedDate={selectedDate}
              timeSlots={slotsForDate}
              onSelectTime={(slot) => setSelectedSlot(slot)}
            />
          </div>
        ) : (
          <BookingForm
            selectedDate={selectedDate!}
            selectedTime={selectedSlot.display}
            onBack={() => setSelectedSlot(null)}
            onSubmit={handleBookingSubmit}
            isSubmitting={createBooking.isPending}
            error={
              createBooking.isError
                ? 'Failed to create booking. Please try again.'
                : undefined
            }
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

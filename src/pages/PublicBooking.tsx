import { Calendar, Clock, User, Mail, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function PublicBooking() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const availableDates = [
    '2026-02-10',
    '2026-02-11',
    '2026-02-12',
    '2026-02-13',
    '2026-02-14',
  ];

  const availableTimeSlots = [
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
    '4:00 PM',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[#E8E8E8] py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0F766E] flex items-center justify-center text-white text-2xl font-semibold">
              JD
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#1A1A1A]">
                John Doe
              </h1>
              <p className="text-[#4A4A4A]">Product Manager</p>
            </div>
          </div>
          <p className="mt-4 text-[#4A4A4A] text-lg">
            Select a time to meet with me
          </p>
        </div>
      </div>

      {/* Booking Interface */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {!selectedTime ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Calendar - Left Side */}
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                <Calendar className="w-5 h-5 inline mr-2" />
                Select a Date
              </h2>
              <div className="border border-[#E8E8E8] rounded-lg p-4">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-[#4A4A4A]"
                      >
                        {day}
                      </div>
                    )
                  )}
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
                        onClick={() => isAvailable && setSelectedDate(dateStr)}
                        disabled={!isAvailable}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-colors
                          ${
                            isSelected
                              ? 'bg-[#0F766E] text-white'
                              : isAvailable
                                ? 'bg-[#0F766E]/10 text-[#0F766E] hover:bg-[#0F766E]/20'
                                : 'text-[#B8B8B8] cursor-not-allowed'
                          }
                        `}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time Slots - Right Side */}
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                <Clock className="w-5 h-5 inline mr-2" />
                Available Times
              </h2>
              {!selectedDate ? (
                <div className="border border-[#E8E8E8] rounded-lg p-8 text-center">
                  <Calendar className="w-12 h-12 text-[#B8B8B8] mx-auto mb-3" />
                  <p className="text-[#B8B8B8]">
                    Please select a date to see available times
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className="w-full px-4 py-3 border border-[#E8E8E8] 
                               rounded-lg text-[#1A1A1A] hover:border-[#0F766E] 
                               hover:bg-[#0F766E] hover:text-white 
                               transition-colors font-medium"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setSelectedTime(null)}
              className="text-[#0F766E] hover:text-[#134E4A] mb-6 flex items-center gap-2"
            >
              ← Back to time selection
            </button>

            <div className="bg-[#FAFAF9] rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-[#1A1A1A] mb-2">
                Selected Time
              </h3>
              <p className="text-[#4A4A4A]">
                {selectedDate} at {selectedTime} (30 minutes)
              </p>
            </div>

            <div className="bg-white border border-[#E8E8E8] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                Your Information
              </h2>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                             focus:border-transparent text-[#1A1A1A] 
                             placeholder:text-[#B8B8B8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                             focus:border-transparent text-[#1A1A1A] 
                             placeholder:text-[#B8B8B8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Message (optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="What would you like to discuss?"
                    className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                             focus:border-transparent text-[#1A1A1A] 
                             placeholder:text-[#B8B8B8] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#0F766E] text-white 
                           rounded-lg hover:bg-[#134E4A] transition-colors 
                           font-medium text-lg"
                >
                  Confirm Booking
                </button>

                <p className="text-xs text-[#B8B8B8] text-center">
                  By confirming, you agree to receive calendar invitations via
                  email
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#E8E8E8] py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-[#B8B8B8]">
          Powered by Calendar
        </div>
      </div>
    </div>
  );
}

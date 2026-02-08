import { Calendar, Clock, User, Mail, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      <div className="border-b border-neutral-200 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center text-white text-2xl font-semibold">
              JD
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-neutral-950 tracking-tight">
                John Doe
              </h1>
              <p className="text-neutral-500 text-sm">Product Manager</p>
            </div>
          </div>
          <p className="mt-4 text-neutral-600 text-base">
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
              <h2 className="text-base font-semibold text-neutral-950 mb-4">
                <Calendar className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                Select a Date
              </h2>
              <Card className="shadow-sm border-neutral-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-medium text-neutral-500"
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
                            aspect-square rounded-md text-xs font-medium transition-colors
                            ${
                              isSelected
                                ? 'bg-neutral-900 text-white'
                                : isAvailable
                                  ? 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                                  : 'text-neutral-300 cursor-not-allowed'
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

            {/* Time Slots - Right Side */}
            <div>
              <h2 className="text-base font-semibold text-neutral-950 mb-4">
                <Clock className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                Available Times
              </h2>
              {!selectedDate ? (
                <Card className="shadow-sm border-neutral-200">
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-neutral-300 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-neutral-400 text-sm">
                      Please select a date to see available times
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableTimeSlots.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      onClick={() => setSelectedTime(time)}
                      className="w-full justify-center border-neutral-200 text-neutral-900 
                               hover:bg-neutral-900 hover:text-white hover:border-neutral-900"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Booking Form */
          <div className="max-w-2xl mx-auto">
            <Button
              variant="link"
              onClick={() => setSelectedTime(null)}
              className="text-neutral-900 hover:text-neutral-700 mb-6 px-0"
            >
              ← Back to time selection
            </Button>

            <Card className="shadow-sm border-neutral-200 bg-neutral-50 mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-neutral-950 mb-2 text-sm">
                  Selected Time
                </h3>
                <p className="text-neutral-600 text-sm">
                  {selectedDate} at {selectedTime} (30 minutes)
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-neutral-200">
              <CardHeader>
                <CardTitle className="text-xl tracking-tight">
                  Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-neutral-950">
                      <User className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                      Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      placeholder="Enter your name"
                      className="border-neutral-200 focus-visible:ring-neutral-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-neutral-950">
                      <Mail className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                      className="border-neutral-200 focus-visible:ring-neutral-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-neutral-950">
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                      Message (optional)
                    </Label>
                    <Textarea
                      id="message"
                      rows={4}
                      placeholder="What would you like to discuss?"
                      className="border-neutral-200 focus-visible:ring-neutral-900 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-neutral-900 hover:bg-neutral-800 text-white text-base py-6"
                  >
                    Confirm Booking
                  </Button>

                  <p className="text-xs text-neutral-400 text-center">
                    By confirming, you agree to receive calendar invitations via
                    email
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-neutral-400">
          Powered by Calendar
        </div>
      </div>
    </div>
  );
}

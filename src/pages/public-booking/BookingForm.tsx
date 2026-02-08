import { User, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type BookingFormProps = {
  selectedDate: string;
  selectedTime: string;
  onBack: () => void;
};

export function BookingForm({
  selectedDate,
  selectedTime,
  onBack,
}: BookingFormProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="link"
        onClick={onBack}
        className="text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 mb-6 px-0"
      >
        ← Back to time selection
      </Button>

      <Card className="shadow-sm border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-neutral-950 dark:text-neutral-50 mb-2 text-sm">
            Selected Time
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            {selectedDate} at {selectedTime} (30 minutes)
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-neutral-200 dark:border-neutral-800">
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">
            Your Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-neutral-950 dark:text-neutral-50"
              >
                <User className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                Name *
              </Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Enter your name"
                className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-neutral-950 dark:text-neutral-50"
              >
                <Mail className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="your@email.com"
                className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-neutral-950 dark:text-neutral-50"
              >
                <MessageSquare
                  className="w-3.5 h-3.5 inline mr-1"
                  strokeWidth={1.5}
                />
                Message (optional)
              </Label>
              <Textarea
                id="message"
                rows={4}
                placeholder="What would you like to discuss?"
                className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400 resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-base py-6"
            >
              Confirm Booking
            </Button>

            <p className="text-xs text-neutral-400 text-center">
              By confirming, you agree to receive calendar invitations via email
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

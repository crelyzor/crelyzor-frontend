import { Calendar, Clock, Users, Video, MapPin, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateMeeting() {
  const [meetingType, setMeetingType] = useState<
    'google-meet' | 'zoom' | 'in-person'
  >('google-meet');
  const participants: string[] = [];

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-950 mb-1 tracking-tight">
          Create Meeting
        </h1>
        <p className="text-neutral-500 text-sm">
          Schedule a new meeting with your team or guests
        </p>
      </div>

      {/* Form Card */}
      <Card className="shadow-sm border-neutral-200">
        <CardContent className="p-8">
          <form className="space-y-6">
            {/* Meeting Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-neutral-950">
                Meeting Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Product Review Meeting"
                className="border-neutral-200 focus-visible:ring-neutral-900"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-neutral-950">
                  <Calendar
                    className="w-3.5 h-3.5 inline mr-1"
                    strokeWidth={1.5}
                  />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  className="border-neutral-200 focus-visible:ring-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="text-neutral-950">
                  <Clock
                    className="w-3.5 h-3.5 inline mr-1"
                    strokeWidth={1.5}
                  />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  className="border-neutral-200 focus-visible:ring-neutral-900"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-neutral-950">Duration</Label>
              <div className="grid grid-cols-4 gap-3">
                {['15 min', '30 min', '1 hour', 'Custom'].map((duration) => (
                  <Button
                    key={duration}
                    type="button"
                    variant="outline"
                    className="border-neutral-200 text-neutral-600 hover:bg-neutral-900 hover:text-white hover:border-neutral-900"
                  >
                    {duration}
                  </Button>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-2">
              <Label htmlFor="participants" className="text-neutral-950">
                <Users className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                Participants
              </Label>
              <Input
                id="participants"
                type="text"
                placeholder="Add participants by email..."
                className="border-neutral-200 focus-visible:ring-neutral-900"
              />
              {participants.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {participants.map((email, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neutral-100 rounded-full text-sm 
                                 text-neutral-950 flex items-center gap-2 border border-neutral-200"
                    >
                      {email}
                      <button type="button" className="hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Meeting Type */}
            <div className="space-y-2">
              <Label className="text-neutral-950">
                <Video className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} />
                Meeting Type
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={
                    meetingType === 'google-meet' ? 'default' : 'outline'
                  }
                  onClick={() => setMeetingType('google-meet')}
                  className={
                    meetingType === 'google-meet'
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-900'
                  }
                >
                  Google Meet
                </Button>
                <Button
                  type="button"
                  variant={meetingType === 'zoom' ? 'default' : 'outline'}
                  onClick={() => setMeetingType('zoom')}
                  className={
                    meetingType === 'zoom'
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-900'
                  }
                >
                  Zoom
                </Button>
                <Button
                  type="button"
                  variant={meetingType === 'in-person' ? 'default' : 'outline'}
                  onClick={() => setMeetingType('in-person')}
                  className={
                    meetingType === 'in-person'
                      ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-900'
                  }
                >
                  In-person
                </Button>
              </div>
            </div>

            {/* Location (conditional) */}
            {meetingType === 'in-person' && (
              <div className="space-y-2">
                <Label htmlFor="location" className="text-neutral-950">
                  <MapPin
                    className="w-3.5 h-3.5 inline mr-1"
                    strokeWidth={1.5}
                  />
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter meeting location"
                  className="border-neutral-200 focus-visible:ring-neutral-900"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-neutral-950">
                Description
              </Label>
              <textarea
                id="description"
                rows={4}
                placeholder="Add meeting agenda or notes..."
                className="w-full px-3 py-2 border border-neutral-200 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-neutral-900 
                           focus:border-transparent text-neutral-950 text-sm
                           placeholder:text-neutral-400 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white"
              >
                Schedule Meeting
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { Calendar, Clock, Users, Video, MapPin, X } from 'lucide-react';
import { useState } from 'react';

export default function CreateMeeting() {
  const [meetingType, setMeetingType] = useState<'google-meet' | 'zoom' | 'in-person'>('google-meet');
  const participants: string[] = [];

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[#1A1A1A] mb-2">
            Create Meeting
          </h1>
          <p className="text-[#4A4A4A]">
            Schedule a new meeting with your team or guests
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-[#E8E8E8] p-8">
          <form className="space-y-6">
            {/* Meeting Title */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Meeting Title
              </label>
              <input
                type="text"
                placeholder="e.g., Product Review Meeting"
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                         focus:border-transparent text-[#1A1A1A] 
                         placeholder:text-[#B8B8B8]"
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                           focus:border-transparent text-[#1A1A1A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                           focus:border-transparent text-[#1A1A1A]"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Duration
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['15 min', '30 min', '1 hour', 'Custom'].map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    className="px-4 py-2 border border-[#E8E8E8] rounded-lg 
                             hover:border-[#0F766E] hover:bg-[#0F766E] 
                             hover:text-white transition-colors text-[#4A4A4A]"
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Participants
              </label>
              <input
                type="text"
                placeholder="Add participants by email..."
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                         focus:border-transparent text-[#1A1A1A] 
                         placeholder:text-[#B8B8B8]"
              />
              {participants.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {participants.map((email, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#E8E8E8] rounded-full text-sm 
                               text-[#1A1A1A] flex items-center gap-2"
                    >
                      {email}
                      <button type="button" className="hover:text-[#B91C1C]">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                Meeting Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMeetingType('google-meet')}
                  className={`px-4 py-3 border rounded-lg transition-colors ${
                    meetingType === 'google-meet'
                      ? 'border-[#0F766E] bg-[#0F766E] text-white'
                      : 'border-[#E8E8E8] text-[#4A4A4A] hover:border-[#0F766E]'
                  }`}
                >
                  Google Meet
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingType('zoom')}
                  className={`px-4 py-3 border rounded-lg transition-colors ${
                    meetingType === 'zoom'
                      ? 'border-[#0F766E] bg-[#0F766E] text-white'
                      : 'border-[#E8E8E8] text-[#4A4A4A] hover:border-[#0F766E]'
                  }`}
                >
                  Zoom
                </button>
                <button
                  type="button"
                  onClick={() => setMeetingType('in-person')}
                  className={`px-4 py-3 border rounded-lg transition-colors ${
                    meetingType === 'in-person'
                      ? 'border-[#0F766E] bg-[#0F766E] text-white'
                      : 'border-[#E8E8E8] text-[#4A4A4A] hover:border-[#0F766E]'
                  }`}
                >
                  In-person
                </button>
              </div>
            </div>

            {/* Location (conditional) */}
            {meetingType === 'in-person' && (
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter meeting location"
                  className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                           focus:border-transparent text-[#1A1A1A] 
                           placeholder:text-[#B8B8B8]"
                />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Add meeting agenda or notes..."
                className="w-full px-4 py-3 border border-[#E8E8E8] rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-[#0F766E] 
                         focus:border-transparent text-[#1A1A1A] 
                         placeholder:text-[#B8B8B8] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="flex-1 px-6 py-3 bg-[#E8E8E8] text-[#4A4A4A] 
                         rounded-lg hover:bg-[#B8B8B8] transition-colors 
                         font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-6 py-3 bg-[#E8E8E8] text-[#4A4A4A] 
                         rounded-lg hover:bg-[#B8B8B8] transition-colors 
                         font-medium"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-[#0F766E] text-white 
                         rounded-lg hover:bg-[#134E4A] transition-colors 
                         font-medium"
              >
                Schedule Meeting
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

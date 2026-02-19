import {
  Calendar,
  Clock,
  Users,
  MapPin,
  X,
  ArrowLeft,
  FileText,
  Video,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateMeeting } from '@/hooks/queries/useMeetingQueries';
import type { MeetingMode } from '@/types';

const DURATION_OPTIONS = [
  '15 min',
  '30 min',
  '45 min',
  '1 hour',
  '1.5 hours',
  '2 hours',
];

const MEETING_MODES = [
  { id: 'in-person', label: 'In-person', icon: MapPin },
  { id: 'google-meet', label: 'Google Meet', icon: Video },
  { id: 'zoom', label: 'Zoom', icon: Video },
] as const;

type MeetingModeId = (typeof MEETING_MODES)[number]['id'];

// Map UI mode IDs to backend values
function mapMode(modeId: MeetingModeId): MeetingMode {
  return modeId === 'in-person' ? 'IN_PERSON' : 'ONLINE';
}

// Parse duration string to minutes
function parseDurationMinutes(d: string): number {
  if (d.includes('hour')) {
    const hrs = parseFloat(d);
    return hrs * 60;
  }
  return parseInt(d, 10);
}

export default function CreateMeeting() {
  const navigate = useNavigate();
  const createMeeting = useCreateMeeting();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('30 min');
  const [meetingMode, setMeetingMode] = useState<MeetingModeId>('in-person');
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [location, setLocation] = useState('');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setModeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [participantInput, setParticipantInput] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const addParticipant = () => {
    const trimmed = participantInput.trim();
    if (trimmed && !participants.includes(trimmed)) {
      setParticipants([...participants, trimmed]);
      setParticipantInput('');
    }
  };

  const removeParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addParticipant();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/meetings')}
          className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Meetings
        </button>
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
          New Meeting
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Schedule a new meeting
        </p>
      </div>

      {/* Form */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title || !date || !time) {
                toast.error('Please fill in title, date, and time');
                return;
              }
              const startTime = new Date(`${date}T${time}`).toISOString();
              const durationMs = parseDurationMinutes(selectedDuration) * 60000;
              const endTime = new Date(
                new Date(startTime).getTime() + durationMs
              ).toISOString();

              createMeeting.mutate(
                {
                  title,
                  description: description || undefined,
                  startTime,
                  endTime,
                  mode: mapMode(meetingMode),
                  location:
                    meetingMode === 'in-person'
                      ? location || undefined
                      : undefined,
                  guestEmails:
                    participants.length > 0 ? participants : undefined,
                },
                {
                  onSuccess: (created) => {
                    toast.success('Meeting created!');
                    navigate(`/meetings/${created.id}`);
                  },
                  onError: () => {
                    toast.error('Failed to create meeting');
                  },
                }
              );
            }}
          >
            {/* Meeting Title */}
            <div className="space-y-1.5">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Sprint Planning, Client Sync..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900/20 dark:focus-visible:ring-neutral-100/20"
              />
            </div>

            {/* Date & Time — side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="date"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900/20 dark:focus-visible:ring-neutral-100/20"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="time"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900/20 dark:focus-visible:ring-neutral-100/20"
                />
              </div>
            </div>

            {/* Duration — pill selector */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Duration
              </Label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDuration(d)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                      ${
                        selectedDuration === d
                          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                      }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting Mode — Dropdown */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                <Video className="w-3.5 h-3.5 inline mr-1" />
                Meeting Type
              </Label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-700
                             bg-white dark:bg-neutral-900 text-sm text-neutral-950 dark:text-neutral-50
                             hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const active = MEETING_MODES.find(
                        (m) => m.id === meetingMode
                      )!;
                      const Icon = active.icon;
                      return (
                        <>
                          <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                          {active.label}
                        </>
                      );
                    })()}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform ${modeDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {modeDropdownOpen && (
                  <div
                    className="absolute z-10 mt-1 w-full rounded-md border border-neutral-200 dark:border-neutral-700
                                  bg-white dark:bg-neutral-900 shadow-lg overflow-hidden"
                  >
                    {MEETING_MODES.map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = meetingMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => {
                            setMeetingMode(mode.id);
                            setModeDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors
                            ${
                              isSelected
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 font-medium'
                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                            }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${isSelected ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}
                          />
                          <span>{mode.label}</span>
                          {isSelected && (
                            <span className="ml-auto text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                              Selected
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Location (in-person) or Meeting Link hint (online) */}
            {meetingMode === 'in-person' ? (
              <div className="space-y-1.5">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Conference Room A, Cafe Nook..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900/20 dark:focus-visible:ring-neutral-100/20"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-200 dark:border-neutral-700 px-4 py-3 flex items-center gap-2">
                <Video className="w-4 h-4 text-neutral-400" />
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  A {meetingMode === 'google-meet' ? 'Google Meet' : 'Zoom'}{' '}
                  link will be generated automatically when the meeting is
                  scheduled.
                </p>
              </div>
            )}

            {/* Participants */}
            <div className="space-y-1.5">
              <Label
                htmlFor="participants"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                <Users className="w-3.5 h-3.5 inline mr-1" />
                Participants
              </Label>
              <Input
                id="participants"
                type="text"
                placeholder="Type a name or email and press Enter..."
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addParticipant}
                className="border-neutral-200 dark:border-neutral-700 focus-visible:ring-neutral-900/20 dark:focus-visible:ring-neutral-100/20"
              />
              {participants.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {participants.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 
                                 rounded-full text-xs text-neutral-700 dark:text-neutral-300 
                                 border border-neutral-200 dark:border-neutral-700"
                    >
                      {p}
                      <button
                        type="button"
                        onClick={() => removeParticipant(p)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                <FileText className="w-3.5 h-3.5 inline mr-1" />
                Description{' '}
                <span className="text-neutral-400 font-normal">(optional)</span>
              </Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Meeting agenda, notes, or context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md 
                           focus:outline-none focus:ring-2 focus:ring-neutral-900/20 dark:focus:ring-neutral-100/20
                           text-sm text-neutral-950 dark:text-neutral-50
                           placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none
                           bg-white dark:bg-neutral-900"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/meetings')}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Cancel
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="outline"
                className="border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                disabled={createMeeting.isPending}
                className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 px-6"
              >
                {createMeeting.isPending ? 'Scheduling...' : 'Schedule'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

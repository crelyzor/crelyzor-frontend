import type { Meeting } from '@/types';
import {
  formatMeetingTime,
  formatMeetingDate,
  formatMeetingDuration,
  getParticipantNames,
} from '@/types';

function isHttpUrl(value?: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function formatMeetingLocationLabel(
  location?: string,
  meetingProvider?: Meeting['meetingProvider']
): string {
  if (meetingProvider === 'GOOGLE') return 'Google Meet';
  if (meetingProvider === 'ZOOM') return 'Zoom';
  if (isHttpUrl(location)) return 'Video call';
  return location || 'In Person';
}

export function getMeetingJoinUrl(meeting: Meeting): string | null {
  if (meeting.meetLink && isHttpUrl(meeting.meetLink)) return meeting.meetLink;
  if (meeting.location && isHttpUrl(meeting.location)) return meeting.location;
  if (meeting.meetingLink && isHttpUrl(meeting.meetingLink)) return meeting.meetingLink;
  return null;
}

/**
 * Display-friendly shape derived from backend Meeting.
 * Used by Meetings list, MeetingDetail, and Home page components
 * that were built against the original mock data format.
 */
export type DisplayMeeting = {
  id: string;
  title: string;
  description?: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "2:00 PM"
  duration: string; // "45 min"
  participants: string[];
  status: Meeting['status'];
  meetingType: Meeting['type'];
  location?: string;
  category?: string;
  organizer?: string;
  hasRecording: boolean;
  hasTranscript: boolean;
  hasSummary: boolean;
  hasTasks: boolean;
  meetingProvider?: Meeting['meetingProvider'];
  tags: Array<{ id: string; name: string; color: string }>;
  isFromBooking: boolean;
  // Keep original for detailed views
  _raw: Meeting;
};

export function toDisplayMeeting(m: Meeting): DisplayMeeting {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    date: formatMeetingDate(m),
    time: formatMeetingTime(m),
    duration: formatMeetingDuration(m),
    participants: getParticipantNames(m),
    status: m.status,
    meetingType: m.type,
    location: m.location,
    category: undefined,
    organizer: m.createdBy?.name,
    hasRecording: !!m.recording,
    hasTranscript: m.transcriptionStatus === 'COMPLETED',
    hasSummary: !!m.aiSummary,
    hasTasks: (m.tasks?.length ?? 0) > 0,
    meetingProvider: m.meetingProvider,
    tags: (m.tags ?? []).map((mt) => mt.tag),
    isFromBooking: !!m.booking,
    _raw: m,
  };
}

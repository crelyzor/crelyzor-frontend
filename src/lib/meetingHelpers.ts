import type { Meeting } from '@/types';
import {
  formatMeetingTime,
  formatMeetingDate,
  formatMeetingDuration,
  getParticipantNames,
} from '@/types';

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
  location?: string;
  category?: string;
  organizer?: string;
  hasRecording: boolean;
  hasTranscript: boolean;
  hasSummary: boolean;
  hasActionItems: boolean;
  meetingProvider?: Meeting['meetingProvider'];
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
    location: m.location,
    category: undefined,
    organizer: m.createdBy?.name,
    hasRecording: !!m.recording,
    hasTranscript: m.transcriptionStatus === 'COMPLETED',
    hasSummary: !!m.aiSummary,
    hasActionItems: (m.actionItems?.length ?? 0) > 0,
    meetingProvider: m.meetingProvider,
    _raw: m,
  };
}

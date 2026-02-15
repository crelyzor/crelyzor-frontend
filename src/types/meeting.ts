export type MeetingType = 'upcoming' | 'past' | 'live';

// Backend status values
export type MeetingStatus =
  | 'CREATED'
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULING_REQUESTED';

export type MeetingMode = 'ONLINE' | 'IN_PERSON';

export type MeetingProvider = 'GOOGLE' | 'ZOOM';

export type TranscriptionStatus =
  | 'NONE'
  | 'UPLOADED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export type MeetingCategory =
  | 'STANDUP'
  | 'CLIENT'
  | 'INTERNAL'
  | '1:1'
  | 'REVIEW'
  | 'SALES'
  | 'OTHER';

export type ParticipantType = 'ORGANIZER' | 'ATTENDEE';
export type ResponseStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export type MeetingParticipant = {
  id: string;
  meetingId: string;
  orgMemberId: string;
  participantType: ParticipantType;
  responseStatus: ResponseStatus;
  respondedAt?: string;
  joinedAt?: string;
  orgMember?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    };
  };
};

export type MeetingGuest = {
  id: string;
  meetingId: string;
  email: string;
  name?: string;
  responseStatus: ResponseStatus;
};

// Full meeting from backend
export type Meeting = {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  mode: MeetingMode;
  status: MeetingStatus;
  location?: string;
  meetingLink?: string;
  meetingProvider?: MeetingProvider;
  googleEventId?: string;
  recordingLink?: string;
  notes?: string;
  guestEmail?: string;
  guestName?: string;
  guestMessage?: string;
  createdById: string;
  createdByRole?: string;
  organizationId: string;
  isDeleted: boolean;
  transcriptionStatus: TranscriptionStatus;
  createdAt: string;
  updatedAt: string;
  participants: MeetingParticipant[];
  guests: MeetingGuest[];
  recording?: { id: string; gcsPath: string; duration: number; fileSize: number; fileName: string };
  aiSummary?: { id: string; summary: string; keyPoints: string[] };
  actionItems?: ActionItem[];
  createdByMember?: {
    id: string;
    user: { id: string; name: string; email: string; avatarUrl?: string };
  };
  organization?: { id: string; name: string; isPersonal: boolean };
};

// Simplified meeting for list views (same shape, just aliased)
export type ScheduledMeeting = Meeting;

export type ActionItem = {
  id: string;
  title: string;
  description?: string;
  owner: string;
  category: string;
  suggestedStartDate?: string;
  suggestedEndDate?: string;
  assignedTo?: string;
  meetingId: string;
  createdAt: string;
  updatedAt: string;
};

// Helper: derive display-friendly values from backend meeting
export function formatMeetingTime(meeting: Meeting): string {
  return new Date(meeting.startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatMeetingDate(meeting: Meeting): string {
  return new Date(meeting.startTime).toISOString().split('T')[0];
}

export function formatMeetingDuration(meeting: Meeting): string {
  const start = new Date(meeting.startTime).getTime();
  const end = new Date(meeting.endTime).getTime();
  const mins = Math.round((end - start) / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs} hour${hrs > 1 ? 's' : ''}`;
}

export function getParticipantNames(meeting: Meeting): string[] {
  const names: string[] = [];
  for (const p of meeting.participants) {
    names.push(p.orgMember?.user?.name ?? 'Unknown');
  }
  for (const g of meeting.guests) {
    names.push(g.name ?? g.email);
  }
  return names;
}

export function getStatusLabel(status: MeetingStatus): string {
  const map: Record<MeetingStatus, string> = {
    CREATED: 'Created',
    PENDING_ACCEPTANCE: 'Pending',
    ACCEPTED: 'Confirmed',
    DECLINED: 'Declined',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    RESCHEDULING_REQUESTED: 'Rescheduling',
  };
  return map[status] ?? status;
}

export function getStatusStyle(status: MeetingStatus): string {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400';
    case 'PENDING_ACCEPTANCE':
    case 'CREATED':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400';
    case 'COMPLETED':
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
    case 'CANCELLED':
    case 'DECLINED':
      return 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400';
    case 'RESCHEDULING_REQUESTED':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400';
    default:
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400';
  }
}

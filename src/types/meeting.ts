/** Local display grouping — not a backend field */
export type MeetingView = 'upcoming' | 'past' | 'live';

/** Backend MeetingType enum */
export type MeetingKind = 'SCHEDULED' | 'RECORDED' | 'VOICE_NOTE';

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
  userId: string;
  participantType: ParticipantType;
  responseStatus: ResponseStatus;
  respondedAt?: string;
  joinedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
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
  type: MeetingKind;
  startTime: string;
  endTime: string;
  timezone: string;
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
  isDeleted: boolean;
  transcriptionStatus: TranscriptionStatus;
  createdAt: string;
  updatedAt: string;
  participants: MeetingParticipant[];
  guests: MeetingGuest[];
  tags?: Array<{ tagId: string; meetingId: string; tag: { id: string; name: string; color: string } }>;
  recording?: {
    id: string;
    gcsPath: string;
    duration: number;
    fileSize: number;
    fileName: string;
  };
  aiSummary?: { id: string; summary: string; keyPoints: string[] };
  tasks?: Task[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
};

// Simplified meeting for list views (same shape, just aliased)
export type ScheduledMeeting = Meeting;

export type Tag = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  attachedAt?: string;
};

export type AttachmentType = 'FILE' | 'LINK' | 'PHOTO';

export type Attachment = {
  id: string;
  meetingId: string;
  type: AttachmentType;
  name: string;
  url?: string | null; // LINK type: raw URL
  signedUrl?: string | null; // FILE/PHOTO type: signed GCS URL (60min TTL)
  mimeType?: string | null;
  size?: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  userId: string;
  meetingId: string | null;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  dueDate?: string | null;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  source: 'AI_EXTRACTED' | 'MANUAL';
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
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
  for (const p of meeting.participants ?? []) {
    names.push(p.user?.name ?? 'Unknown');
  }
  for (const g of meeting.guests ?? []) {
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

export type MeetingType = 'upcoming' | 'past' | 'live';

export type MeetingStatus =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'declined'
  | 'rescheduling';

export type MeetingPlatform = 'google-meet' | 'zoom' | 'in-person';

export type MeetingCategory =
  | 'STANDUP'
  | 'CLIENT'
  | 'INTERNAL'
  | '1:1'
  | 'REVIEW'
  | 'SALES'
  | 'OTHER';

// Which org context this meeting belongs to
export type MeetingOrgSource = {
  orgId: string;
  orgName: string;
  isPersonal: boolean;
};

export type Meeting = {
  id: number;
  title: string;
  time: string;
  date?: string;
  duration: string;
  participants: string[];
  type: MeetingType;
  hasRecording?: boolean;
  hasTranscript?: boolean;
  hasSummary?: boolean;
  hasActionItems?: boolean;
  category?: MeetingCategory;
  location?: string;
  orgSource?: MeetingOrgSource;
};

export type ScheduledMeeting = {
  id: number;
  title: string;
  date: string;
  time: string;
  duration: string;
  participants: string[];
  status: MeetingStatus;
  type: MeetingPlatform;
  location?: string;
  orgSource?: MeetingOrgSource;
};

export type ActionItem = {
  id: string;
  title: string;
  meetingTitle: string;
  meetingId: number;
  dueDate?: string;
  isCompleted: boolean;
  assignedTo?: string;
  orgSource?: MeetingOrgSource;
};

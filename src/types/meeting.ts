export type MeetingType = 'upcoming' | 'past' | 'live';

export type MeetingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export type MeetingPlatform = 'google-meet' | 'zoom' | 'in-person';

export type MeetingCategory =
  | 'STANDUP'
  | 'CLIENT'
  | 'INTERNAL'
  | '1:1'
  | 'REVIEW'
  | 'SALES'
  | 'OTHER';

export type Meeting = {
  id: number;
  title: string;
  time: string;
  date?: string;
  duration: string;
  participants: string[];
  type: MeetingType;
  hasRecording?: boolean;
  category?: MeetingCategory;
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
};

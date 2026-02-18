import type { Meeting, ActionItem, MeetingParticipant } from '@/types';

// Helper to mock participants
const mockPart = (name: string): MeetingParticipant => ({
  id: `mp-${name.replace(/\s+/g, '-')}`,
  meetingId: 'm-1',
  orgMemberId: `om-${name.replace(/\s+/g, '-')}`,
  participantType: 'ATTENDEE',
  responseStatus: 'ACCEPTED',
  orgMember: {
    id: `om-${name.replace(/\s+/g, '-')}`,
    user: {
      id: `u-${name.replace(/\s+/g, '-')}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    },
  },
});


const acmeOrg = { id: '2', name: 'Acme Inc', isPersonal: false };
const designOrg = { id: '3', name: 'Design Studio', isPersonal: false };

// ── Unified meeting type for the Meetings page ──
export const allMeetings: Meeting[] = []; // Empty for now or populate if needed, but based on usage it seems strict typing is required.

export const upcomingMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Product Strategy Review',
    description: 'Q1 roadmap discussion',
    startTime: '2026-02-10T14:00:00Z',
    endTime: '2026-02-10T14:45:00Z',
    timezone: 'UTC',
    mode: 'IN_PERSON',
    status: 'ACCEPTED',
    participants: ['Sarah Chen', 'Mike Ross', 'Alex Kim'].map(mockPart),
    guests: [],
    createdById: 'u1',
    organizationId: '2',
    isDeleted: false,
    transcriptionStatus: 'NONE',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    location: 'Conference Room A',
    organization: acmeOrg,
    meetingProvider: 'GOOGLE',
  },
  {
    id: '2',
    title: 'Design Sync',
    startTime: '2026-02-10T16:30:00Z',
    endTime: '2026-02-10T17:00:00Z',
    timezone: 'UTC',
    mode: 'IN_PERSON',
    status: 'ACCEPTED',
    participants: ['Emma Wilson'].map(mockPart),
    guests: [],
    createdById: 'u1',
    organizationId: '3',
    isDeleted: false,
    transcriptionStatus: 'NONE',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    location: 'Meeting Room 2B',
    organization: designOrg,
  },
  {
    id: '3',
    title: 'Sprint Retrospective',
    startTime: '2026-02-10T17:30:00Z',
    endTime: '2026-02-10T18:30:00Z',
    timezone: 'UTC',
    mode: 'IN_PERSON',
    status: 'ACCEPTED',
    participants: ['Engineering Team'].map(mockPart),
    guests: [],
    createdById: 'u1',
    organizationId: '2',
    isDeleted: false,
    transcriptionStatus: 'NONE',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    location: 'Main Hall',
    organization: acmeOrg,
  },
];

export const recentMeetings: Meeting[] = [
  {
    id: '4',
    title: 'Weekly Standup',
    startTime: new Date().toISOString(), // Today
    endTime: new Date().toISOString(),
    timezone: 'UTC',
    mode: 'IN_PERSON',
    status: 'COMPLETED',
    participants: ['Team'].map(mockPart),
    guests: [],
    createdById: 'u1',
    organizationId: '2',
    isDeleted: false,
    transcriptionStatus: 'COMPLETED', // hasTranscript: true
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    location: 'Room 3A',
    organization: acmeOrg,
    recording: {
      id: 'rec-1',
      gcsPath: 'path/to/rec',
      duration: 900,
      fileSize: 1000,
      fileName: 'rec.mp4',
    },
    aiSummary: {
      id: 'sum-1',
      summary: 'Summary text',
      keyPoints: ['Point 1'],
    },
    actionItems: [
      {
        id: 'ai-3',
        title: 'Update sprint board',
        owner: 'u1',
        category: 'INTERNAL',
        meetingId: '4',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ],
  },
];

export const actionItems: ActionItem[] = [
  {
    id: 'ai-1',
    title: 'Send updated proposal to client',
    meetingId: '5',
    category: 'CLIENT',
    owner: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    suggestedStartDate: new Date().toISOString(),
  },
  {
    id: 'ai-2',
    title: 'Review Q1 design mockups',
    meetingId: '8',
    category: 'REVIEW',
    owner: 'u1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    suggestedStartDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    assignedTo: 'Emma Wilson', // Matches definition
  },
];

export const scheduledMeetings: Meeting[] = [
  {
    id: '10',
    title: 'Product Review Meeting',
    startTime: '2026-02-10T14:00:00Z',
    endTime: '2026-02-10T14:30:00Z',
    timezone: 'UTC',
    mode: 'IN_PERSON',
    status: 'ACCEPTED',
    participants: ['John Doe', 'Jane Smith'].map(mockPart),
    guests: [],
    createdById: 'u1',
    organizationId: '1',
    isDeleted: false,
    transcriptionStatus: 'NONE',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    location: 'Conference Room A',
  },
];

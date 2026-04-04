import { apiClient } from '@/lib/apiClient';

export interface SearchMeeting {
  id: string;
  title: string;
  type: string;
  status: string;
  startTime: string;
}

export interface SearchTask {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string | null;
  priority: string | null;
  meetingId: string | null;
}

export interface SearchCard {
  id: string;
  displayName: string;
  slug: string;
  title: string | null;
  avatarUrl: string | null;
}

export interface SearchContact {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  cardId: string;
}

export interface SearchResults {
  meetings: SearchMeeting[];
  tasks: SearchTask[];
  cards: SearchCard[];
  contacts: SearchContact[];
}

export const searchApi = {
  globalSearch: (q: string) =>
    apiClient.get<SearchResults>(`/search?q=${encodeURIComponent(q)}`),
};

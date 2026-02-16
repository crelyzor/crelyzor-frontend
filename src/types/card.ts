export interface CardLink {
  type: string;
  url: string;
  label: string;
  icon?: string;
}

export interface CardContactFields {
  phone?: string;
  email?: string;
  location?: string;
  website?: string;
  bookingUrl?: string;
}

export interface CardTheme {
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  layout?: 'classic' | 'modern' | 'minimal';
  darkMode?: boolean;
}

export interface Card {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  links: CardLink[];
  contactFields: CardContactFields;
  theme: CardTheme;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contacts: number;
    views: number;
  };
}

export interface CardContact {
  id: string;
  cardId: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  note: string | null;
  tags: string[];
  scannedAt: string;
  savedByScanner: boolean;
  card?: {
    slug: string;
    displayName: string;
  };
}

export interface CardAnalytics {
  totalViews: number;
  uniqueViews: number;
  totalContacts: number;
  conversionRate: number;
  linkClicks: { link: string; count: number }[];
  viewsByDay: { date: string; count: number }[];
  topCountries: { country: string; count: number }[];
}

export interface CreateCardPayload {
  slug?: string;
  displayName: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  links?: CardLink[];
  contactFields?: CardContactFields;
  theme?: CardTheme;
  isDefault?: boolean;
}

export interface UpdateCardPayload {
  slug?: string;
  displayName?: string;
  title?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  links?: CardLink[];
  contactFields?: CardContactFields;
  theme?: CardTheme;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface ContactsResponse {
  contacts: CardContact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export type WeeklySchedule = Record<string, DaySchedule>;

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

// Schedule (user-level)
export type AvailabilitySchedule = {
  id: string;
  userId: string;
  name: string;
  timezone: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Event Type (user-level)
export type EventType = {
  id: string;
  userId: string;
  title: string;
  slug: string;
  description?: string;
  duration: number; // minutes
  scheduleId: string;
  bookingModel: 'ONE_ON_ONE' | 'ROUND_ROBIN' | 'COLLECTIVE';
  bufferBefore: number;
  bufferAfter: number;
  minNotice: number; // hours
  maxAdvance: number; // days
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  schedule?: {
    id: string;
    name: string;
    timezone: string;
  };
};

// Backend recurring availability (schedule-scoped)
export type RecurringAvailability = {
  id: string;
  scheduleId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  isActive: boolean;
};

export type ScheduleOverride = {
  id: string;
  scheduleId: string;
  date: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  notes?: string;
};

export type BlockedTime = {
  id: string;
  scheduleId: string;
  startTime: string;
  endTime: string;
  reason?: string;
  recurrenceRule: 'NONE' | 'WEEKLY' | 'MONTHLY';
  recurrenceEnd?: string;
  isActive: boolean;
};

export type AvailableSlot = {
  start: string;
  end: string;
};

// Keep backward compat alias
export type CustomSlot = ScheduleOverride;

// Map between frontend day names and backend DayOfWeek enum
export const DAY_MAP: Record<string, DayOfWeek> = {
  monday: 'MONDAY',
  tuesday: 'TUESDAY',
  wednesday: 'WEDNESDAY',
  thursday: 'THURSDAY',
  friday: 'FRIDAY',
  saturday: 'SATURDAY',
  sunday: 'SUNDAY',
};

export const DAY_MAP_REVERSE: Record<DayOfWeek, string> = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
};

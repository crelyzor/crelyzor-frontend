export type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export type WeeklySchedule = Record<string, DaySchedule>;

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// Backend recurring availability
export type RecurringAvailability = {
  id: string;
  orgMemberId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  timezone: string;
  isActive: boolean;
};

export type CustomSlot = {
  id: string;
  orgMemberId: string;
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
  notes?: string;
};

export type BlockedTime = {
  id: string;
  orgMemberId: string;
  startTime: string;
  endTime: string;
  reason?: string;
  recurrenceRule: 'NONE' | 'WEEKLY' | 'MONTHLY';
  recurrenceEnd?: string;
  isActive: boolean;
};

export type AvailableSlot = {
  date: string;
  startTime: string;
  endTime: string;
};

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

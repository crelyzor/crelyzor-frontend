import type { WeeklySchedule } from '@/types';

export const defaultWeeklySchedule: WeeklySchedule = {
  monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
  saturday: { enabled: false, startTime: '10:00', endTime: '14:00' },
  sunday: { enabled: false, startTime: '10:00', endTime: '14:00' },
};

export const availableDates = [
  '2026-02-10',
  '2026-02-11',
  '2026-02-12',
  '2026-02-13',
  '2026-02-14',
];

export const availableTimeSlots = [
  '9:00 AM',
  '9:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
];

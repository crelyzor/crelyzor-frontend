export type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export type WeeklySchedule = Record<string, DaySchedule>;

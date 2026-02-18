export { meetingsApi } from './meetingsService';
export type {
  MeetingsListParams,
  CreateMeetingPayload,
} from './meetingsService';

export { organizationsApi } from './organizationsService';
export type { UpdateOrgPayload } from './organizationsService';

export { availabilityApi } from './availabilityService';
export type { CreateRecurringPayload } from './availabilityService';

export { scheduleApi } from './scheduleService';
export type {
  CreateSchedulePayload,
  UpdateSchedulePayload,
} from './scheduleService';

export { eventTypeApi } from './eventTypeService';
export type {
  CreateEventTypePayload,
  UpdateEventTypePayload,
} from './eventTypeService';

export { publicBookingApi } from './publicBookingService';
export type { CreatePublicBookingPayload } from './publicBookingService';

export { authApi } from './authService';

export { userApi } from './userService';
export type { UpdateProfilePayload } from './userService';

export { integrationsApi, sessionsApi } from './integrationsService';
export type {
  CalendarAccessStatus,
  GoogleScopesStatus,
  SessionInfo,
} from './integrationsService';

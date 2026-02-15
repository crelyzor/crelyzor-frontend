export { meetingsApi } from './meetingsService';
export type {
  MeetingsListParams,
  CreateMeetingPayload,
} from './meetingsService';

export { organizationsApi } from './organizationsService';
export type { UpdateOrgPayload } from './organizationsService';

export { availabilityApi } from './availabilityService';
export type { CreateBookingPayload } from './availabilityService';

export { authApi } from './authService';

export { userApi } from './userService';
export type { UpdateProfilePayload } from './userService';

export { integrationsApi, sessionsApi } from './integrationsService';
export type {
  CalendarAccessStatus,
  GoogleScopesStatus,
  SessionInfo,
} from './integrationsService';

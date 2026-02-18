// Re-export all meeting queries
export {
  useMeetings,
  useMeetingsAll,
  useMeeting,
  useCreateMeeting,
  useUpdateMeeting,
  useAcceptMeeting,
  useDeclineMeeting,
  useCancelMeeting,
  useCompleteMeeting,
} from './useMeetingQueries';

// Re-export all organization queries
export {
  useOrganizations,
  useCurrentOrganization,
  useOrgMembers,
  useUpdateOrg,
  useCreateOrg,
} from './useOrganizationQueries';

// Re-export all schedule queries
export {
  useSchedules,
  useDefaultSchedule,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useSetDefaultSchedule,
} from './useScheduleQueries';

// Re-export all event type queries
export {
  useEventTypes,
  useEventType,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
  useToggleEventType,
} from './useEventTypeQueries';

// Re-export all availability queries
export {
  useRecurringAvailability,
  useCreateRecurringBatch,
  useDeleteRecurring,
  useOverrides,
  useCreateOverride,
  useDeleteOverride,
  useBlockedTimes,
  useCreateBlockedTime,
  useDeleteBlockedTime,
  useAvailableSlots,
} from './useAvailabilityQueries';

// Re-export public booking queries
export {
  usePublicBookingPage,
  usePublicBookingSlots,
  useCreatePublicBooking,
} from './usePublicBookingQueries';

// Re-export all auth queries
export { useCurrentUser, useGoogleLogin, useLogout } from './useAuthQueries';

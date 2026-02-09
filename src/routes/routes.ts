import { lazy } from 'react';
import type { ReactNode } from 'react';

const Home = lazy(() => import('@/pages/home'));
const Meetings = lazy(() => import('@/pages/meetings'));
const CreateMeeting = lazy(() => import('@/pages/create-meeting'));
const MeetingDetail = lazy(() => import('@/pages/meeting-detail'));
const Availability = lazy(() => import('@/pages/availability'));
const VoiceNotes = lazy(() => import('@/pages/voice-notes'));
const Settings = lazy(() => import('@/pages/settings'));
const Notifications = lazy(() => import('@/pages/notifications'));
const SignIn = lazy(() => import('@/pages/sign-in'));
const PublicBooking = lazy(() => import('@/pages/public-booking'));

export type RouteConfig = {
  path: string;
  element: ReactNode;
  layout?: boolean;
};

export const routes = {
  Home,
  Meetings,
  CreateMeeting,
  MeetingDetail,
  Availability,
  VoiceNotes,
  Settings,
  Notifications,
  SignIn,
  PublicBooking,
};

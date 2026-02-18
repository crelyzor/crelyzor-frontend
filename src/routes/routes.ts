import { lazy } from 'react';
import type { ReactNode } from 'react';

const Home = lazy(() => import('@/pages/home'));
const Meetings = lazy(() => import('@/pages/meetings'));
const CreateMeeting = lazy(() => import('@/pages/create-meeting'));
const MeetingDetail = lazy(() => import('@/pages/meeting-detail'));
const Availability = lazy(() => import('@/pages/availability'));
const Analytics = lazy(() => import('@/pages/analytics'));
const Settings = lazy(() => import('@/pages/settings'));
const Notifications = lazy(() => import('@/pages/notifications'));
const SignIn = lazy(() => import('@/pages/sign-in'));
const AuthCallback = lazy(() => import('@/pages/auth-callback'));
const PublicBooking = lazy(() => import('@/pages/public-booking'));
const CreateOrganization = lazy(() => import('@/pages/create-organization'));
const Setup = lazy(() => import('@/pages/setup'));
const Cards = lazy(() => import('@/pages/cards'));
const CardEditor = lazy(() => import('@/pages/card-editor'));
const CardContacts = lazy(() => import('@/pages/card-contacts'));
const CardAnalytics = lazy(() => import('@/pages/card-analytics'));

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
  Analytics,
  Settings,
  Notifications,
  SignIn,
  AuthCallback,
  PublicBooking,
  CreateOrganization,
  Setup,
  Cards,
  CardEditor,
  CardContacts,
  CardAnalytics,
};

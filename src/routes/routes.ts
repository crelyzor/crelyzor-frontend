import { lazy } from 'react';
import type { ReactNode } from 'react';

const Home = lazy(() => import('@/pages/home'));
const Meetings = lazy(() => import('@/pages/meetings'));
const CreateMeeting = lazy(() => import('@/pages/create-meeting'));
const Availability = lazy(() => import('@/pages/availability'));
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
  Availability,
  SignIn,
  PublicBooking,
};

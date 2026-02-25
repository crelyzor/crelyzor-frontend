import { lazy } from 'react';
import type { ReactNode } from 'react';

const Home = lazy(() => import('@/pages/home'));
const Meetings = lazy(() => import('@/pages/meetings'));
const MeetingDetail = lazy(() => import('@/pages/meeting-detail'));
const Settings = lazy(() => import('@/pages/settings'));
const SignIn = lazy(() => import('@/pages/sign-in'));
const AuthCallback = lazy(() => import('@/pages/auth-callback'));
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
  MeetingDetail,
  Settings,
  SignIn,
  AuthCallback,
  Setup,
  Cards,
  CardEditor,
  CardContacts,
  CardAnalytics,
};

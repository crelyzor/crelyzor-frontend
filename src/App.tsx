import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/theme';
import { CommandPalette } from '@/components/command-palette';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/PageLoader';
import Layout from '@/layout/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { routes } from '@/routes/routes';

const {
  Home,
  Meetings,
  CreateMeeting,
  MeetingDetail,
  Availability,
  EventTypes,
  EventTypeForm,
  Analytics,
  Settings,
  Notifications,
  SignIn,
  AuthCallback,
  PublicBooking,
  Setup,
  Cards,
  CardEditor,
  CardContacts,
  CardAnalytics,
} = routes;

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            {/* Global Command Palette */}
            <CommandPalette />

            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Onboarding - Username Setup (No Layout) */}
                <Route
                  path="/setup"
                  element={
                    <AuthGuard>
                      <Setup />
                    </AuthGuard>
                  }
                />

                {/* Main Routes with Layout + Auth */}
                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Home />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/meetings"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Meetings />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/meetings/create"
                  element={
                    <AuthGuard>
                      <Layout>
                        <CreateMeeting />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/meetings/:id"
                  element={
                    <AuthGuard>
                      <Layout>
                        <MeetingDetail />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/availability"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Availability />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/event-types"
                  element={
                    <AuthGuard>
                      <Layout>
                        <EventTypes />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/event-types/create"
                  element={
                    <AuthGuard>
                      <Layout>
                        <EventTypeForm />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/event-types/:id"
                  element={
                    <AuthGuard>
                      <Layout>
                        <EventTypeForm />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Analytics />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Settings />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Notifications />
                      </Layout>
                    </AuthGuard>
                  }
                />

                {/* Card Routes */}
                <Route
                  path="/cards"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Cards />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/cards/create"
                  element={
                    <AuthGuard>
                      <Layout>
                        <CardEditor />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/cards/:id"
                  element={
                    <AuthGuard>
                      <Layout>
                        <CardEditor />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/cards/contacts"
                  element={
                    <AuthGuard>
                      <Layout>
                        <CardContacts />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/cards/:id/analytics"
                  element={
                    <AuthGuard>
                      <Layout>
                        <CardAnalytics />
                      </Layout>
                    </AuthGuard>
                  }
                />

                {/* Public Routes (No Layout) */}
                <Route
                  path="/book/:username/:eventSlug"
                  element={<PublicBooking />}
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'text-sm font-medium',
            }}
          />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/theme';
import { CommandPalette } from '@/components/command-palette';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/PageLoader';
import Layout from '@/layout/Layout';
import { routes } from '@/routes/routes';

const { Home, Meetings, CreateMeeting, MeetingDetail, Availability, VoiceNotes, Settings, Notifications, SignIn, PublicBooking } =
  routes;

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

                {/* Main Routes with Layout */}
                <Route
                  path="/"
                  element={
                    <Layout>
                      <Home />
                    </Layout>
                  }
                />
                <Route
                  path="/meetings"
                  element={
                    <Layout>
                      <Meetings />
                    </Layout>
                  }
                />
                <Route
                  path="/meetings/create"
                  element={
                    <Layout>
                      <CreateMeeting />
                    </Layout>
                  }
                />
                <Route
                  path="/meetings/:id"
                  element={
                    <Layout>
                      <MeetingDetail />
                    </Layout>
                  }
                />
                <Route
                  path="/availability"
                  element={
                    <Layout>
                      <Availability />
                    </Layout>
                  }
                />
                <Route
                  path="/voice-notes"
                  element={
                    <Layout>
                      <VoiceNotes />
                    </Layout>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <Layout>
                      <Settings />
                    </Layout>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <Layout>
                      <Notifications />
                    </Layout>
                  }
                />

                {/* Public Routes (No Layout) */}
                <Route path="/book/:shareToken" element={<PublicBooking />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

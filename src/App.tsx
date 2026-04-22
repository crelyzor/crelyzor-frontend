import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { ThemeProvider } from '@/components/theme';
import { CommandPalette } from '@/components/command-palette';
import { UpgradeModal } from '@/components/billing/UpgradeModal';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoader } from '@/components/PageLoader';
import Layout from '@/layout/Layout';
import { AuthGuard } from '@/components/AuthGuard';
import { AppInitializer } from '@/components/AppInitializer';
import { routes } from '@/routes/routes';

const {
  Home,
  Meetings,
  MeetingDetail,
  VoiceNotes,
  Tasks,
  Calendar,
  Bookings,
  Settings,
  SignIn,
  AuthCallback,
  Setup,
  Cards,
  CardEditor,
  CardContacts,
  CardAnalytics,
  Search,
  Tags,
  TagDetail,
  Pricing,
  NotFound,
} = routes;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider>
          <BrowserRouter>
            <AppInitializer>
              <CommandPalette />
              <UpgradeModal />

              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  <Route
                    path="/setup"
                    element={
                      <AuthGuard>
                        <Setup />
                      </AuthGuard>
                    }
                  />

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
                    path="/voice-notes"
                    element={
                      <AuthGuard>
                        <Layout>
                          <VoiceNotes />
                        </Layout>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <AuthGuard>
                        <Layout>
                          <Tasks />
                        </Layout>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/calendar"
                    element={
                      <AuthGuard>
                        <Layout>
                          <Calendar />
                        </Layout>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/bookings"
                    element={
                      <AuthGuard>
                        <Layout>
                          <Bookings />
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
                  <Route
                    path="/search"
                    element={
                      <AuthGuard>
                        <Layout>
                          <Search />
                        </Layout>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/tags"
                    element={
                      <AuthGuard>
                        <Layout>
                          <Tags />
                        </Layout>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/tags/:tagId"
                    element={
                      <AuthGuard>
                        <Layout>
                          <TagDetail />
                        </Layout>
                      </AuthGuard>
                    }
                  />
                  <Route
                    path="/pricing"
                    element={
                      <AuthGuard>
                        <Layout>
                          <Pricing />
                        </Layout>
                      </AuthGuard>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AppInitializer>
          </BrowserRouter>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'text-sm font-medium',
            }}
          />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;

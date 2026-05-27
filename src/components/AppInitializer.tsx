import { useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { PageLoader } from '@/components/PageLoader';

// Module-level flag — survives React StrictMode's double-invoke of useEffect.
let initialized = false;

/**
 * Runs once on app startup. Silently exchanges the httpOnly refresh_token cookie
 * for a new access token. Proceeds as unauthenticated if the cookie is absent or expired.
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const logout = useAuthStore((s) => s.logout);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    if (initialized) return;
    initialized = true;

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';

    fetch(`${apiBase}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // send httpOnly refresh_token cookie
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data ?? json;
        if (data?.accessToken) {
          setAccessToken(data.accessToken);
        } else {
          logout();
        }
      })
      .catch((err: unknown) => {
        // Network error (fetch itself failed) — treat as unauthenticated; an
        // actual 401 from the server resolves via the .then branch above (res.ok === false).
        if (import.meta.env.DEV) {
          console.warn('[AppInitializer] Token refresh network error:', err);
        }
        logout();
      })
      .finally(() => {
        setInitializing(false);
      });
  }, [logout, setAccessToken, setInitializing]);

  if (isInitializing) return <PageLoader />;

  return <>{children}</>;
}

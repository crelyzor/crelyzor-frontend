import { useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { PageLoader } from '@/components/PageLoader';

const REFRESH_TOKEN_KEY = 'calendar-refresh-token';

// Module-level flag — survives React StrictMode's double-invoke of useEffect.
// Without this, StrictMode fires the effect twice: first run rotates the token,
// second run tries the same (now-revoked) token and logs the user out.
let initialized = false;

/**
 * Runs once on app startup. If a refresh token exists in localStorage,
 * silently exchanges it for a new access token before any protected queries fire.
 * Clears auth and proceeds as unauthenticated if the refresh fails.
 */
export function AppInitializer({ children }: { children: React.ReactNode }) {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const logout = useAuthStore((s) => s.logout);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    if (initialized) return;
    initialized = true;

    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!storedRefreshToken) {
      setInitializing(false);
      return;
    }

    const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api';

    fetch(`${apiBase}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const data = json?.data ?? json;
        if (data?.accessToken && data?.refreshToken) {
          setAccessToken(data.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        } else {
          logout();
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      })
      .catch(() => {
        logout();
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      })
      .finally(() => {
        setInitializing(false);
      });
  }, [logout, setAccessToken, setInitializing]);

  if (isInitializing) return <PageLoader />;

  return <>{children}</>;
}

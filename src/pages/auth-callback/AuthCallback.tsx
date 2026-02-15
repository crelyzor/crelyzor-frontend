import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { PageLoader } from '@/components/PageLoader';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken) {
      // Store tokens
      setAccessToken(accessToken);
      if (refreshToken) {
        localStorage.setItem('calendar-refresh-token', refreshToken);
      }
      // Navigate to home — useCurrentUser hook will fetch profile
      navigate('/', { replace: true });
    } else {
      // No token — something went wrong, redirect to sign-in
      navigate('/signin', { replace: true });
    }
  }, [searchParams, setAccessToken, navigate]);

  return <PageLoader />;
}

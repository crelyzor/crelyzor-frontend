import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
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
      // No token — OAuth failed or was cancelled
      const oauthError = searchParams.get('error');
      const errorMessage = oauthError
        ? `Sign-in failed: ${oauthError.replace(/_/g, ' ')}`
        : 'Sign-in failed. Please try again.';
      toast.error(errorMessage);
      navigate('/signin', { replace: true });
    }
  }, [searchParams, setAccessToken, navigate]);

  return <PageLoader />;
}

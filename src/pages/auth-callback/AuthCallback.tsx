import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores';
import { PageLoader } from '@/components/PageLoader';
import { pickSafeNext } from '@/lib/safeNext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    // Tokens are passed via hash fragment to avoid server logs and referrer leakage
    const hash = window.location.hash.slice(1);
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('accessToken');

    // `next` round-trips via the redirectUrl query string the SignIn page
    // builds (Phase 6 P14.b — email-invite flow). Re-validate even though the
    // SignIn side already does — never trust a query param to decide where
    // to send a newly authenticated user.
    const search = new URLSearchParams(window.location.search);
    const next = pickSafeNext(search.get('next'), '/');

    if (accessToken) {
      setAccessToken(accessToken);
      // Refresh token is set as httpOnly cookie by the backend — no localStorage needed
      navigate(next, { replace: true });
    } else {
      // No token — OAuth failed or was cancelled
      toast.error('Sign-in failed. Please try again.');
      navigate('/signin', { replace: true });
    }
  }, [setAccessToken, navigate]);

  return <PageLoader />;
}

/**
 * Phase 6 P14.b — Dashboard token-scoped accept handler.
 *
 * Receives the CTA navigation from the public preview page at
 * crelyzor.app/invite/:token. Two paths:
 *   - Not signed in → redirect to /signin?next=/invite/:token. After OAuth
 *     completes, AuthCallback honors `next` and lands the user back here.
 *   - Signed in → fire POST /invites/:token/accept on mount (single-shot via
 *     ref guard) and render contextual states.
 *
 * Decline is offered as a secondary action on the loading/error views so the
 * rare "I want to decline" path doesn't require returning to the email.
 */
import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Clock, Loader2, Mail, ShieldAlert } from 'lucide-react';
import PageMotion from '@/components/PageMotion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';
import { useLogout } from '@/hooks/queries/useAuthQueries';
import {
  useAcceptInviteByToken,
  useDeclineInviteByToken,
} from '@/hooks/queries/useTeamQueries';
import { ApiError } from '@/lib/apiClient';

type ErrorKind = 'expired' | 'not-found' | 'wrong-account' | 'unknown';

function classifyError(err: unknown): ErrorKind {
  if (err instanceof ApiError) {
    if (err.status === 410) return 'expired';
    if (err.status === 404) return 'not-found';
    if (err.status === 403) return 'wrong-account';
  }
  return 'unknown';
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl px-8 py-10 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function IconDisc({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
      {children}
    </div>
  );
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const accept = useAcceptInviteByToken();
  const decline = useDeclineInviteByToken();
  const logoutMutation = useLogout();
  const fired = useRef(false);

  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    if (fired.current) return;
    fired.current = true;

    accept.mutate(token, {
      onSuccess: (data) => {
        navigate(`/teams/${data.membership.team.id}/settings`, {
          replace: true,
        });
      },
      onError: (err) => {
        setErrorKind(classifyError(err));
      },
    });
  }, [isAuthenticated, token, accept, navigate]);

  // Bad URL — no token segment.
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Not signed in — hand off through SignIn. After OAuth, AuthCallback honors
  // `next` and brings the user back here.
  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/signin?next=${encodeURIComponent(`/invite/${token}`)}`}
        replace
      />
    );
  }

  const handleDecline = () => {
    decline.mutate(token, {
      onSettled: () => navigate('/', { replace: true }),
    });
  };

  const handleSwitchAccount = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () =>
        navigate(`/signin?next=${encodeURIComponent(`/invite/${token}`)}`, {
          replace: true,
        }),
    });
  };

  // Error states.
  if (errorKind === 'expired') {
    return (
      <PageMotion>
        <Shell>
          <IconDisc>
            <Clock className="w-6 h-6 text-muted-foreground" />
          </IconDisc>
          <h1 className="text-lg font-medium text-foreground text-center mt-6 tracking-tight">
            This invitation has expired
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Ask the team owner to send a new invitation.
          </p>
          <Button
            variant="outline"
            className="w-full mt-6"
            onClick={() => navigate('/', { replace: true })}
          >
            Back to Crelyzor
          </Button>
        </Shell>
      </PageMotion>
    );
  }

  if (errorKind === 'not-found') {
    return (
      <PageMotion>
        <Shell>
          <IconDisc>
            <Mail className="w-6 h-6 text-muted-foreground" />
          </IconDisc>
          <h1 className="text-lg font-medium text-foreground text-center mt-6 tracking-tight">
            This invitation is no longer valid
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            It may have been cancelled, declined, or already accepted.
          </p>
          <Button
            variant="outline"
            className="w-full mt-6"
            onClick={() => navigate('/', { replace: true })}
          >
            Back to Crelyzor
          </Button>
        </Shell>
      </PageMotion>
    );
  }

  if (errorKind === 'wrong-account') {
    return (
      <PageMotion>
        <Shell>
          <IconDisc>
            <ShieldAlert className="w-6 h-6 text-muted-foreground" />
          </IconDisc>
          <h1 className="text-lg font-medium text-foreground text-center mt-6 tracking-tight">
            Different account
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            This invitation was sent to a different email address. Sign in with
            the address it was sent to.
          </p>
          <div className="mt-6 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSwitchAccount}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending
                ? 'Signing out…'
                : 'Sign out and sign in again'}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/', { replace: true })}
            >
              Back to Crelyzor
            </Button>
          </div>
        </Shell>
      </PageMotion>
    );
  }

  if (errorKind === 'unknown') {
    return (
      <PageMotion>
        <Shell>
          <IconDisc>
            <ShieldAlert className="w-6 h-6 text-muted-foreground" />
          </IconDisc>
          <h1 className="text-lg font-medium text-foreground text-center mt-6 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            We couldn&rsquo;t process this invitation. Try again, or ask the
            team owner to resend it.
          </p>
          <div className="mt-6 space-y-2">
            <Button
              className="w-full"
              onClick={() => {
                fired.current = false;
                setErrorKind(null);
                accept.reset();
                accept.mutate(token, {
                  onSuccess: (data) => {
                    navigate(`/teams/${data.membership.team.id}/settings`, {
                      replace: true,
                    });
                  },
                  onError: (err) => setErrorKind(classifyError(err)),
                });
              }}
              disabled={accept.isPending}
            >
              {accept.isPending ? 'Retrying…' : 'Try again'}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate('/', { replace: true })}
            >
              Back to Crelyzor
            </Button>
          </div>
        </Shell>
      </PageMotion>
    );
  }

  // Pending — accept mutation in-flight.
  return (
    <PageMotion>
      <Shell>
        <IconDisc>
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </IconDisc>
        <h1 className="text-lg font-medium text-foreground text-center mt-6 tracking-tight">
          Joining team…
        </h1>
        <p className="text-sm text-muted-foreground text-center mt-2">
          Hang tight — we&rsquo;re finalising your membership.
        </p>
        <button
          type="button"
          onClick={handleDecline}
          disabled={decline.isPending}
          className="block mx-auto mt-6 text-[12px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {decline.isPending ? 'Declining…' : 'Decline this invitation'}
        </button>
      </Shell>
    </PageMotion>
  );
}

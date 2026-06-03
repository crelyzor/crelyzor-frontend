import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Link2Off, Loader2 } from 'lucide-react';
import PageMotion from '@/components/PageMotion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';
import { useJoinByLink } from '@/hooks/queries/useTeamQueries';
import { ApiError } from '@/lib/apiClient';

type ErrorKind = 'not-found' | 'expired' | 'unknown';

function classifyError(err: unknown): ErrorKind {
  if (err instanceof ApiError) {
    if (err.status === 404) return 'not-found';
    if (err.status === 410) return 'expired';
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

export default function InviteLinkPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const joinMutation = useJoinByLink();
  const fired = useRef(false);
  const [errorKind, setErrorKind] = useState<ErrorKind | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    if (fired.current) return;
    fired.current = true;

    joinMutation.mutate(token, {
      onSuccess: (data) => {
        navigate(`/teams/${data.membership.teamId}/settings`, {
          replace: true,
        });
      },
      onError: (err) => {
        setErrorKind(classifyError(err));
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  if (!token) return <Navigate to="/" replace />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/signin?next=${encodeURIComponent(`/invite/link/${token}`)}`}
        replace
      />
    );
  }

  if (errorKind === 'not-found') {
    return (
      <PageMotion>
        <Shell>
          <IconDisc>
            <Link2Off className="w-6 h-6 text-muted-foreground" />
          </IconDisc>
          <h1 className="text-lg font-medium text-foreground text-center mt-6 tracking-tight">
            Link not found
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            This invite link is invalid or has been revoked by the team admin.
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

  if (errorKind === 'expired') {
    return (
      <PageMotion>
        <Shell>
          <IconDisc>
            <Link2Off className="w-6 h-6 text-muted-foreground" />
          </IconDisc>
          <h1 className="text-lg font-medium text-foreground text-center mt-6 tracking-tight">
            Link expired
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Ask the team admin to generate a new invite link.
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

  if (errorKind === 'unknown') {
    return (
      <PageMotion>
        <Shell>
          <IconDisc>
            <Link2Off className="w-6 h-6 text-muted-foreground" />
          </IconDisc>
          <h1 className="text-lg font-medium text-foreground text-center mt-6 tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            We couldn&apos;t process this invite link. Try again.
          </p>
          <div className="mt-6 space-y-2">
            <Button
              className="w-full"
              onClick={() => {
                fired.current = false;
                setErrorKind(null);
                joinMutation.reset();
                joinMutation.mutate(token!, {
                  onSuccess: (data) =>
                    navigate(`/teams/${data.membership.teamId}/settings`, {
                      replace: true,
                    }),
                  onError: (err) => setErrorKind(classifyError(err)),
                });
              }}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? 'Joining…' : 'Try again'}
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
          Hang tight — we&apos;re finalising your membership.
        </p>
      </Shell>
    </PageMotion>
  );
}

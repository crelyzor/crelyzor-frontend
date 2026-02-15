import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { PageLoader } from '@/components/PageLoader';

type Props = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isLoading } = useCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
}

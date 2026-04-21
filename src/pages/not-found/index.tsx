import { useNavigate } from 'react-router-dom';
import { PageMotion } from '@/components/PageMotion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageMotion>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-6 opacity-50">
          404
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-3">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Go home
        </button>
      </div>
    </PageMotion>
  );
}

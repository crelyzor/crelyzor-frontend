import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function SignIn() {
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    // TODO: Implement Google OAuth flow
    navigate('/');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-col justify-between bg-neutral-950 p-12 text-white">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-neutral-950 font-bold text-lg">C</span>
          </div>
          <span className="font-medium text-lg">Calendar</span>
        </div>

        {/* Main Message */}
        <div className="max-w-md">
          <h1 className="text-5xl font-semibold leading-tight tracking-tight mb-6">
            Your time,
            <br />
            beautifully
            <br />
            organized.
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            Schedule meetings, sync calendars, and never miss a moment. 
            The simplest way to own your schedule.
          </p>
        </div>

        {/* Bottom */}
        <div className="flex items-center gap-8 text-sm text-neutral-500">
          <span>© 2026 Calendar</span>
          <a href="#" className="hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Terms
          </a>
        </div>
      </div>

      {/* Right Side - Sign In */}
      <div className="flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-neutral-950 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-medium text-lg text-neutral-950">Calendar</span>
          </div>

          {/* Greeting */}
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-neutral-950 tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-neutral-500">
              Sign in to continue to your calendar
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            size="lg"
            className="w-full h-14 bg-white hover:bg-neutral-50 text-neutral-950 border-neutral-200 font-normal text-base"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 uppercase tracking-wider">
              or
            </span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* SSO Option */}
          <Button
            variant="ghost"
            className="w-full h-12 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100"
          >
            Sign in with SSO
          </Button>

          {/* Terms */}
          <p className="text-xs text-neutral-400 text-center mt-8 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-neutral-600">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-neutral-600">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

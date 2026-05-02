import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useGoogleLogin } from '@/hooks/queries/useAuthQueries';
import { useAuthStore } from '@/stores';
import { ThemeToggle } from '@/components/toolbar/ThemeToggle';
import { TooltipProvider } from '@/components/ui/tooltip';

const GOLD = '#d4af61';
const PILLARS = ['CARDS', 'CALENDAR', 'MEETINGS', 'VOICE', 'TASKS', 'AI'];
const PUBLIC_URL = import.meta.env.VITE_CARDS_PUBLIC_URL as string;

export default function SignIn() {
  const { login } = useGoogleLogin();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col px-8 sm:px-16 md:px-24 relative overflow-hidden bg-background text-foreground">
      {/* Ambient gold glow — top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${GOLD}09 0%, transparent 65%)`,
        }}
      />

      {/* Theme toggle — top right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="absolute top-5 right-8 sm:right-16 md:right-24 z-10"
      >
        <TooltipProvider>
          <ThemeToggle />
        </TooltipProvider>
      </motion.div>

      {/* Logo — top left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex items-center gap-2.5 pt-7 pb-0"
      >
        <img src="/assets/logo-light.svg" alt="Crelyzor" className="h-5 block dark:hidden" />
        <img src="/assets/logo-dark.svg" alt="Crelyzor" className="h-5 hidden dark:block" />
      </motion.div>

      {/* Top half — headline block */}
      <div className="flex-1 flex flex-col justify-end pb-10 max-w-2xl">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-8"
        >
          {PILLARS.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              <span className="text-[13px] font-medium tracking-[0.18em] text-muted-foreground opacity-60">
                {p}
              </span>
              {i < PILLARS.length - 1 && (
                <span
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ backgroundColor: `${GOLD}60` }}
                />
              )}
            </span>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22 }}
          className="font-semibold leading-[1.05] tracking-tight text-foreground"
          style={{ fontSize: 'clamp(42px, 6vw, 72px)' }}
        >
          your whole work life, <span style={{ color: GOLD }}>sorted.</span>
        </motion.h1>
      </div>

      {/* Divider */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full h-px bg-border"
      />

      {/* Bottom half — sign in block */}
      <div className="flex-1 flex flex-col justify-start pt-10 pb-12 max-w-sm">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="text-sm mb-6 text-muted-foreground"
        >
          Sign in to your workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.63 }}
        >
          <Button
            onClick={login}
            variant="outline"
            className="w-full h-11 rounded-xl font-medium text-[13px] transition-all duration-150
              border-border bg-surface text-foreground
              hover:bg-surface-raised hover:text-foreground"
          >
            <svg className="w-4 h-4 mr-2.5 flex-shrink-0" viewBox="0 0 24 24">
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
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.75 }}
          className="text-[11px] mt-5 leading-relaxed text-muted-foreground opacity-40"
        >
          By continuing you agree to our{' '}
          <a
            href={`${PUBLIC_URL}/terms`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Terms
          </a>{' '}
          &{' '}
          <a
            href={`${PUBLIC_URL}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            Privacy Policy
          </a>
          .
        </motion.p>
      </div>

      {/* Copyright */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="absolute bottom-6 right-8 sm:right-16 md:right-24 text-[10px] tracking-widest uppercase text-muted-foreground opacity-20"
      >
        © {new Date().getFullYear()} Crelyzor
      </motion.p>
    </div>
  );
}

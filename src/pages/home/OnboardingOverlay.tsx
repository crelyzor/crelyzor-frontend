import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Mic, Calendar, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    icon: CreditCard,
    title: 'Create your card',
    description: 'Your digital identity — share it with anyone via QR or link.',
    cta: 'Create card',
    route: '/cards/create',
    featured: true,
  },
  {
    icon: Mic,
    title: 'Record or schedule a meeting',
    description:
      'Upload a recording or start a live voice note to get AI summaries and tasks.',
    cta: 'Go to meetings',
    route: '/meetings',
  },
  {
    icon: Calendar,
    title: 'Connect Google Calendar',
    description:
      'Sync your schedule so Crelyzor can surface the right meetings at the right time.',
    cta: 'Connect calendar',
    route: '/settings?tab=integrations',
  },
] as const;

interface OnboardingOverlayProps {
  show: boolean;
  onDismiss: () => void;
}

export function OnboardingOverlay({ show, onDismiss }: OnboardingOverlayProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px]"
            onClick={onDismiss}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div
              className="relative w-full max-w-md mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dismiss button */}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onDismiss}
                className="absolute top-4 right-4 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="px-6 pt-6 pb-2">
                <div className="inline-flex items-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400 mb-3">
                  Start here
                </div>
                <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
                  Welcome to Crelyzor
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  Create your card first, then connect meetings and calendar.
                </p>
              </div>

              <div className="px-4 pb-4 mt-2 space-y-1">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const featured = 'featured' in step && step.featured;

                  return (
                    <button
                      key={step.route}
                      onClick={() => navigate(step.route)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors group ${
                        featured
                          ? 'bg-neutral-950 text-white dark:bg-neutral-50 dark:text-neutral-950'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center mt-0.5 ${
                          featured
                            ? 'bg-white/10 dark:bg-neutral-900/10'
                            : 'bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 ${
                            featured
                              ? 'text-white dark:text-neutral-950'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            featured
                              ? 'text-white dark:text-neutral-950'
                              : 'text-neutral-900 dark:text-neutral-100'
                          }`}
                        >
                          {step.title}
                        </p>
                        <p
                          className={`text-xs mt-0.5 leading-relaxed ${
                            featured
                              ? 'text-white/75 dark:text-neutral-700'
                              : 'text-neutral-500 dark:text-neutral-400'
                          }`}
                        >
                          {step.description}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 mt-0.5 inline-flex items-center gap-1 text-xs font-medium ${
                          featured
                            ? 'text-white/90 dark:text-neutral-900'
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {step.cta}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="px-6 pb-5 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="w-full text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 text-xs"
                >
                  I'm all set — skip this
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import {
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  CreditCard,
  Mic,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type ChecklistStep = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route: string;
  cta: string;
  icon: React.ElementType;
};

type GettingStartedChecklistProps = {
  activeCardCount: number;
  hasMeetingOrVoiceNote: boolean;
  calendarConnected: boolean;
  hasTask: boolean;
  dismissed: boolean;
  onDismiss: () => void;
};

export function GettingStartedChecklist({
  activeCardCount,
  hasMeetingOrVoiceNote,
  calendarConnected,
  hasTask,
  dismissed,
  onDismiss,
}: GettingStartedChecklistProps) {
  const navigate = useNavigate();

  const steps: ChecklistStep[] = [
    {
      id: 'card',
      title: 'Create your digital card',
      description: 'Set up your public identity and sharing link.',
      completed: activeCardCount > 0,
      route: '/cards/create',
      cta: 'Create card',
      icon: CreditCard,
    },
    {
      id: 'meeting',
      title: 'Record or schedule a meeting',
      description: 'Get a transcript, summary, and action items from a call.',
      completed: hasMeetingOrVoiceNote,
      route: '/meetings',
      cta: 'Open meetings',
      icon: Mic,
    },
    {
      id: 'calendar',
      title: 'Connect Google Calendar',
      description: 'Sync busy time and create Google Meet links.',
      completed: calendarConnected,
      route: '/settings?tab=integrations',
      cta: 'Connect calendar',
      icon: CalendarDays,
    },
    {
      id: 'task',
      title: 'Create your first task',
      description: 'Keep follow-ups connected to your work.',
      completed: hasTask,
      route: '/tasks',
      cta: 'Open tasks',
      icon: CheckSquare,
    },
  ];

  const completedCount = steps.filter((step) => step.completed).length;
  const totalCount = steps.length;

  if (dismissed || completedCount === totalCount) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <p className="text-[10px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 uppercase font-medium">
            Getting started
          </p>
          <h2 className="mt-1 text-sm font-semibold text-neutral-950 dark:text-neutral-50">
            Finish your Crelyzor setup
          </h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {completedCount} of {totalCount} complete
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDismiss}
          className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          aria-label="Dismiss getting started checklist"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => navigate(step.route)}
              className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  step.completed
                    ? 'bg-emerald-50 dark:bg-emerald-950/30'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.completed
                      ? 'text-neutral-500 dark:text-neutral-400 line-through decoration-neutral-300 dark:decoration-neutral-600'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {step.description}
                </p>
              </div>

              {!step.completed && (
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 shrink-0">
                  {step.cta}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

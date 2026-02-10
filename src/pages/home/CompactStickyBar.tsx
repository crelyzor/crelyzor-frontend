import { motion, type MotionValue } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { quickActions } from '@/data';
import { toast } from 'sonner';

type CompactStickyBarProps = {
  barOpacity: MotionValue<number>;
  barY: MotionValue<number>;
  barBorder: MotionValue<number>;
  barPointerEvents: MotionValue<string>;
  barDateX: MotionValue<number>;
  dayName: string;
  monthDay: string;
};

export function CompactStickyBar({
  barOpacity,
  barY,
  barBorder,
  barPointerEvents,
  barDateX,
  dayName,
  monthDay,
}: CompactStickyBarProps) {
  const navigate = useNavigate();

  const handleQuickAction = (action: (typeof quickActions)[number]) => {
    if (action.actionType === 'navigate' && action.path) {
      navigate(action.path);
    } else if (action.actionType === 'copy') {
      navigator.clipboard.writeText('https://cal.harsh.dev/book/harsh');
      toast.success('Booking link copied to clipboard');
    }
  };

  return (
    <motion.div
      style={{
        opacity: barOpacity,
        y: barY,
        borderBottomWidth: barBorder,
        pointerEvents: barPointerEvents,
      }}
      className="fixed top-14 left-0 right-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-neutral-200/60 dark:border-neutral-800/60"
    >
      <div className="max-w-7xl mx-auto px-8 h-12 flex items-center justify-between">
        {/* Left — Date */}
        <motion.div style={{ x: barDateX }} className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {dayName}
          </span>
          <span className="text-sm text-neutral-400 dark:text-neutral-500">
            {monthDay}
          </span>
        </motion.div>

        {/* Right — Compact Quick Actions */}
        <div className="flex items-center gap-1">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
            >
              <action.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

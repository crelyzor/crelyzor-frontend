import { Sparkles } from 'lucide-react';
import { motion, type MotionValue } from 'motion/react';
import { quickActions } from '@/data';

type BubbleTransform = {
  y: MotionValue<number>;
  scale: MotionValue<number>;
};

type HeroSectionProps = {
  greeting: string;
  dayName: string;
  monthDay: string;
  tip: string;
  userName: string;
  orgName?: string;
  isPersonalView: boolean;
  greetingOpacity: MotionValue<number>;
  greetingY: MotionValue<number>;
  greetingScale: MotionValue<number>;
  tipOpacity: MotionValue<number>;
  bubblesOpacity: MotionValue<number>;
  bubbleTransforms: BubbleTransform[];
};

export function HeroSection({
  greeting,
  dayName,
  monthDay,
  tip,
  userName,
  orgName,
  isPersonalView,
  greetingOpacity,
  greetingY,
  greetingScale,
  tipOpacity,
  bubblesOpacity,
  bubbleTransforms,
}: HeroSectionProps) {
  const firstName = userName.split(' ')[0];

  return (
    <div className="text-center">
      {/* Greeting — dissolves with scroll */}
      <motion.div
        style={{
          opacity: greetingOpacity,
          y: greetingY,
          scale: greetingScale,
        }}
        className="mb-10 origin-top"
      >
        <p className="text-xs tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
          {greeting.toUpperCase()}, {firstName.toUpperCase()}
        </p>
        <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight mb-1">
          It&apos;s {dayName}, {monthDay}
        </h1>
        {/* Org context indicator */}
        {!isPersonalView && orgName && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-2">
            Viewing {orgName}
          </p>
        )}
        <motion.div
          style={{ opacity: tipOpacity }}
          className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-2"
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>{tip}</span>
        </motion.div>
      </motion.div>

      {/* Full Quick Actions — Floating Bubbles with staggered scroll */}
      <motion.div
        style={{ opacity: bubblesOpacity }}
        className="flex items-start gap-12 justify-center mb-14"
      >
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            style={{
              y: bubbleTransforms[i].y,
              scale: bubbleTransforms[i].scale,
            }}
            className="group flex flex-col items-center gap-3 cursor-pointer origin-bottom"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-neutral-100 dark:group-hover:text-neutral-900 group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-200">
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

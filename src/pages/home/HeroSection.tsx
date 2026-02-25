import { motion, type MotionValue } from 'motion/react';
import { useNavigate } from 'react-router-dom';
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
  greetingOpacity,
  greetingY,
  greetingScale,
  tipOpacity,
  bubblesOpacity,
  bubbleTransforms,
}: HeroSectionProps) {
  const firstName = userName.split(' ')[0];
  const navigate = useNavigate();

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
        <p className="text-[11px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 mb-3 uppercase">
          {greeting}, {firstName}
        </p>
        <h1
          className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight mb-1"
        >
          It&apos;s {dayName}, {monthDay}
        </h1>
        <motion.div
          style={{ opacity: tipOpacity }}
          className="flex items-center justify-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 mt-3"
        >
          <span className="font-light">{tip}</span>
        </motion.div>
      </motion.div>

      {/* Quick action bubbles — staggered scroll */}
      <motion.div
        style={{ opacity: bubblesOpacity }}
        className="flex items-start gap-10 justify-center mb-14"
      >
        {quickActions.map((action, i) => (
          <motion.button
            key={action.label}
            onClick={() => navigate(action.path!)}
            style={{
              y: bubbleTransforms[i]?.y,
              scale: bubbleTransforms[i]?.scale,
            }}
            className="group flex flex-col items-center gap-2.5 cursor-pointer origin-bottom"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                            bg-white dark:bg-neutral-800/80
                            border border-neutral-200/80 dark:border-neutral-700/50
                            text-neutral-500 dark:text-neutral-400
                            group-hover:bg-neutral-950 group-hover:text-white group-hover:border-neutral-950
                            dark:group-hover:bg-neutral-100 dark:group-hover:text-neutral-900 dark:group-hover:border-neutral-100
                            group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-neutral-900/15
                            dark:group-hover:shadow-neutral-100/10
                            transition-all duration-200 ease-out">
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium tracking-wide text-neutral-500 dark:text-neutral-400
                             group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

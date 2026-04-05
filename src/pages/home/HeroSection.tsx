import { motion, type MotionValue } from 'motion/react';

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
}: HeroSectionProps) {
  const firstName = userName.split(' ')[0];

  return (
    <div className="text-center">
      <motion.div
        style={{ opacity: greetingOpacity, y: greetingY, scale: greetingScale }}
        className="mb-8 sm:mb-12 origin-top"
      >
        <p className="text-[11px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 mb-3 uppercase">
          {greeting}, {firstName}
        </p>
        <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight mb-1">
          It&apos;s {dayName}, {monthDay}
        </h1>
        <motion.div
          style={{ opacity: tipOpacity }}
          className="flex items-center justify-center gap-2 text-sm text-neutral-400 dark:text-neutral-500 mt-3"
        >
          <span className="font-light">{tip}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

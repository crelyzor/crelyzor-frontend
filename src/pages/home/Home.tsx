import { useMemo } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';
import { useGreeting } from '@/hooks';
import { useMeetingsAll } from '@/hooks/queries/useMeetingQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { toDisplayMeeting } from '@/lib/meetingHelpers';
import { CompactStickyBar } from './CompactStickyBar';
import { HeroSection } from './HeroSection';
import { RecentMeetings } from './RecentMeetings';
import { DefaultCardWidget } from './DefaultCardWidget';
import { RecentVoiceNotes } from './RecentVoiceNotes';
import { StartMeetingFab } from '@/components/home/StartMeetingFab';

export default function Home() {
  const { scrollY } = useScroll();
  const { greeting, dayName, monthDay, tip } = useGreeting();
  const { data: currentUser } = useCurrentUser();

  // Use same query key as /meetings page → shared cache, no duplicate fetch
  const {
    data: allMeetingsData,
    isLoading: meetingsLoading,
    isError: meetingsError,
  } = useMeetingsAll();

  const recentMeetings = useMemo(
    () =>
      (allMeetingsData ?? [])
        .filter((m) => m.type !== 'VOICE_NOTE')
        .slice(0, 8)
        .map(toDisplayMeeting),
    [allMeetingsData]
  );

  // Greeting dissolves
  const greetingOpacity = useTransform(scrollY, [0, 80], [1, 0]);
  const greetingY = useTransform(scrollY, [0, 80], [0, -12]);
  const greetingScale = useTransform(scrollY, [0, 80], [1, 0.97]);
  const tipOpacity = useTransform(scrollY, [0, 50], [1, 0]);

  // Bubbles dissolve + individual stagger
  const bubblesOpacity = useTransform(scrollY, [40, 160], [1, 0]);
  const bubble0Y = useTransform(scrollY, [30, 140], [0, -18]);
  const bubble1Y = useTransform(scrollY, [40, 150], [0, -18]);
  const bubble2Y = useTransform(scrollY, [50, 160], [0, -18]);
  const bubble3Y = useTransform(scrollY, [60, 170], [0, -18]);
  const bubble0Scale = useTransform(scrollY, [30, 140], [1, 0.85]);
  const bubble1Scale = useTransform(scrollY, [40, 150], [1, 0.85]);
  const bubble2Scale = useTransform(scrollY, [50, 160], [1, 0.85]);
  const bubble3Scale = useTransform(scrollY, [60, 170], [1, 0.85]);
  const bubbleTransforms = [
    { y: bubble0Y, scale: bubble0Scale },
    { y: bubble1Y, scale: bubble1Scale },
    { y: bubble2Y, scale: bubble2Scale },
    { y: bubble3Y, scale: bubble3Scale },
  ];

  // Compact sticky bar fades IN
  const barOpacity = useTransform(scrollY, [120, 170], [0, 1]);
  const barY = useTransform(scrollY, [120, 170], [-6, 0]);
  const barDateX = useTransform(scrollY, [130, 180], [-8, 0]);
  const barBorder = useTransform(scrollY, [120, 170], [0, 1]);
  const barPointerEvents = useTransform(barOpacity, (v) =>
    v > 0.3 ? ('auto' as string) : ('none' as string)
  );

  return (
    <div>
      <CompactStickyBar
        barOpacity={barOpacity}
        barY={barY}
        barBorder={barBorder}
        barPointerEvents={barPointerEvents}
        barDateX={barDateX}
        dayName={dayName}
        monthDay={monthDay}
      />

      <HeroSection
        greeting={greeting}
        dayName={dayName}
        monthDay={monthDay}
        tip={tip}
        userName={currentUser?.name ?? 'there'}
        greetingOpacity={greetingOpacity}
        greetingY={greetingY}
        greetingScale={greetingScale}
        tipOpacity={tipOpacity}
        bubblesOpacity={bubblesOpacity}
        bubbleTransforms={bubbleTransforms}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left — recent meetings (2/3) */}
        <div className="lg:col-span-2">
          <RecentMeetings
            meetings={recentMeetings}
            isLoading={meetingsLoading}
            isError={meetingsError}
          />
        </div>

        {/* Right — card widget + voice notes (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <DefaultCardWidget />
          <RecentVoiceNotes />
        </div>
      </motion.div>

      <StartMeetingFab />
    </div>
  );
}

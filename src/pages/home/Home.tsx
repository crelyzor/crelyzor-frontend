import { useMemo, useState } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';
import { useGreeting } from '@/hooks';
import { useMeetingsAll } from '@/hooks/queries/useMeetingQueries';
import { useAllTasks } from '@/hooks/queries/useSMAQueries';
import { useCurrentUser } from '@/hooks/queries/useAuthQueries';
import { useCards } from '@/hooks/queries/useCardQueries';
import { toDisplayMeeting } from '@/lib/meetingHelpers';
import { CompactStickyBar } from './CompactStickyBar';
import { HeroSection } from './HeroSection';
import { RecentMeetings } from './RecentMeetings';
import { TodayTimeline } from './TodayTimeline';
import { OverdueTasksSection } from './OverdueTasksSection';
import { NewAITasksBanner } from './NewAITasksBanner';
import { OnboardingOverlay } from './OnboardingOverlay';
import { PendingTasksWidget } from './PendingTasksWidget';
import { DefaultCardWidget } from './DefaultCardWidget';
import { RecentVoiceNotes } from './RecentVoiceNotes';
import { PublicLinksWidget } from './PublicLinksWidget';
import { StartMeetingFab } from '@/components/home/StartMeetingFab';

export default function Home() {
  const { scrollY } = useScroll();
  const { greeting, dayName, monthDay, tip } = useGreeting();
  const { data: currentUser } = useCurrentUser();

  // Onboarding overlay — shown to new users with no cards and no meetings
  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => !!localStorage.getItem('crelyzor_onboarding_done')
  );

  // Use same query key as /meetings page → shared cache, no duplicate fetch
  const {
    data: allMeetingsData,
    isLoading: meetingsLoading,
    isError: meetingsError,
  } = useMeetingsAll();

  const { data: cards, isLoading: cardsLoading } = useCards();

  const recentMeetings = useMemo(
    () =>
      (allMeetingsData ?? [])
        .filter((m) => m.type !== 'VOICE_NOTE')
        .slice(0, 8)
        .map(toDisplayMeeting),
    [allMeetingsData]
  );

  // Single task query shared by TodayTimeline + PendingTasksWidget
  const { data: taskData, isLoading: tasksLoading } = useAllTasks({
    status: 'pending',
    limit: 100,
  });
  const allPendingTasks = useMemo(() => taskData?.tasks ?? [], [taskData]);

  // Split tasks into three buckets: overdue / today / other
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { overdueTasks, todayTasks, otherTasks } = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const isToday = (iso: string) => iso.split('T')[0] === todayStr;

    // Overdue: has dueDate strictly before start of today
    const overdue = allPendingTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < startOfToday
    );
    const overdueIds = new Set(overdue.map((t) => t.id));

    // Today: scheduled today or due today — exclude anything already in overdue
    const today = allPendingTasks.filter(
      (t) =>
        !overdueIds.has(t.id) &&
        ((t.scheduledTime && isToday(t.scheduledTime)) ||
          (t.dueDate && isToday(t.dueDate)))
    );
    const todayIds = new Set(today.map((t) => t.id));

    // Other: everything not in overdue or today
    const other = allPendingTasks.filter(
      (t) => !overdueIds.has(t.id) && !todayIds.has(t.id)
    );

    return { overdueTasks: overdue, todayTasks: today, otherTasks: other };
  }, [allPendingTasks, todayStr]);

  // AI-extracted tasks from meetings processed in the last 48h — shown in NewAITasksBanner
  const newAITasks = useMemo(() => {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    return allPendingTasks.filter(
      (t) =>
        t.source === 'AI_EXTRACTED' &&
        t.meetingId !== null &&
        new Date(t.createdAt).getTime() > cutoff
    );
  }, [allPendingTasks]);

  // Show onboarding overlay for brand-new users (no cards, no meetings, not dismissed)
  const showOnboarding =
    !meetingsLoading &&
    !cardsLoading &&
    !onboardingDismissed &&
    (cards?.length ?? 0) === 0 &&
    (allMeetingsData?.length ?? 0) === 0;

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
        {/* Left — today + recent meetings (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <OverdueTasksSection tasks={overdueTasks} />
          <NewAITasksBanner tasks={newAITasks} />
          <TodayTimeline
            meetings={
              allMeetingsData
                ?.filter((m) => m.type !== 'VOICE_NOTE')
                .map(toDisplayMeeting) ?? []
            }
            tasks={todayTasks}
            isLoading={meetingsLoading}
            isTasksLoading={tasksLoading}
            isError={meetingsError}
          />
          <RecentMeetings
            meetings={recentMeetings}
            isLoading={meetingsLoading}
            isError={meetingsError}
          />
        </div>

        {/* Right — identity (links + card) then work (tasks + voice notes) (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <PublicLinksWidget />
          <DefaultCardWidget />
          <PendingTasksWidget tasks={otherTasks} isLoading={tasksLoading} />
          <RecentVoiceNotes />
        </div>
      </motion.div>

      <StartMeetingFab />

      <OnboardingOverlay
        show={showOnboarding}
        onDismiss={() => {
          localStorage.setItem('crelyzor_onboarding_done', '1');
          setOnboardingDismissed(true);
        }}
      />
    </div>
  );
}

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
import { TodayTimeline } from './TodayTimeline';
import { RecentMeetings } from './RecentMeetings';
import { OverdueTasksSection } from './OverdueTasksSection';
import { NewAITasksBanner } from './NewAITasksBanner';
import { PendingTasksWidget } from './PendingTasksWidget';
import { UpcomingBookingsWidget } from './UpcomingBookingsWidget';
import { PublicLinksWidget } from './PublicLinksWidget';
import { DefaultCardWidget } from './DefaultCardWidget';
import { ThisWeekWidget } from './ThisWeekWidget';
import { OnboardingOverlay } from './OnboardingOverlay';
import { StartMeetingFab } from '@/components/home/StartMeetingFab';

export default function Home() {
  const { scrollY } = useScroll();
  const { greeting, dayName, monthDay } = useGreeting();
  const { data: currentUser } = useCurrentUser();

  const [onboardingDismissed, setOnboardingDismissed] = useState(
    () => !!localStorage.getItem('crelyzor_onboarding_done')
  );

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

  const { data: taskData, isLoading: tasksLoading } = useAllTasks({
    status: 'pending',
    limit: 100,
  });
  const allPendingTasks = useMemo(() => taskData?.tasks ?? [], [taskData]);

  // Tip — count today's meetings
  const tip = useMemo(() => {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const todayMeetings = (allMeetingsData ?? [])
      .filter(
        (m) =>
          m.type !== 'VOICE_NOTE' && m.startTime.split('T')[0] === todayDateStr
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    const count = todayMeetings.length;
    if (count === 0) return 'No meetings scheduled today';
    const timeStr = new Date(todayMeetings[0].startTime).toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
      }
    );
    const label = count === 1 ? '1 meeting today' : `${count} meetings today`;
    return `${label} — first at ${timeStr}`;
  }, [allMeetingsData]);

  // Task buckets
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { overdueTasks, todayTasks, otherTasks } = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const isToday = (iso: string) => iso.split('T')[0] === todayStr;

    const overdue = allPendingTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < startOfToday
    );
    const overdueIds = new Set(overdue.map((t) => t.id));

    const today = allPendingTasks.filter(
      (t) =>
        !overdueIds.has(t.id) &&
        ((t.scheduledTime && isToday(t.scheduledTime)) ||
          (t.dueDate && isToday(t.dueDate)))
    );
    const todayIds = new Set(today.map((t) => t.id));
    const other = allPendingTasks.filter(
      (t) => !overdueIds.has(t.id) && !todayIds.has(t.id)
    );
    return { overdueTasks: overdue, todayTasks: today, otherTasks: other };
  }, [allPendingTasks, todayStr]);

  // AI tasks banner
  const newAITasks = useMemo(() => {
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    return allPendingTasks.filter(
      (t) =>
        t.source === 'AI_EXTRACTED' &&
        t.meetingId !== null &&
        new Date(t.createdAt).getTime() > cutoff
    );
  }, [allPendingTasks]);

  // Onboarding
  const showOnboarding =
    !meetingsLoading &&
    !cardsLoading &&
    !onboardingDismissed &&
    (cards?.length ?? 0) === 0 &&
    (allMeetingsData?.length ?? 0) === 0;

  // Compact sticky bar scroll values
  const barOpacity = useTransform(scrollY, [120, 170], [0, 1]);
  const barY = useTransform(scrollY, [120, 170], [-6, 0]);
  const barDateX = useTransform(scrollY, [130, 180], [-8, 0]);
  const barBorder = useTransform(scrollY, [120, 170], [0, 1]);
  const barPointerEvents = useTransform(barOpacity, (v) =>
    v > 0.3 ? ('auto' as string) : ('none' as string)
  );

  // Hero scroll transforms
  const greetingOpacity = useTransform(scrollY, [0, 80], [1, 0]);
  const greetingY = useTransform(scrollY, [0, 80], [0, -12]);
  const greetingScale = useTransform(scrollY, [0, 80], [1, 0.97]);
  const tipOpacity = useTransform(scrollY, [0, 50], [1, 0]);

  return (
    <div className="space-y-3 pb-10">
      {/* Compact sticky header (appears on scroll) */}
      <CompactStickyBar
        barOpacity={barOpacity}
        barY={barY}
        barBorder={barBorder}
        barPointerEvents={barPointerEvents}
        barDateX={barDateX}
        dayName={dayName}
        monthDay={monthDay}
      />

      {/* Hero */}
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
      />

      {/* Main bento grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-3"
      >
        {/* Left column — timeline focus (2/3) */}
        <div className="lg:col-span-2 space-y-3">
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
          <PendingTasksWidget tasks={otherTasks} isLoading={tasksLoading} />
        </div>

        {/* Right column — work + identity (1/3) */}
        <div className="lg:col-span-1 space-y-3">
          <ThisWeekWidget
            meetings={(allMeetingsData ?? []).filter((m) => m.type !== 'VOICE_NOTE')}
            isLoading={meetingsLoading}
          />
          <DefaultCardWidget />
          <UpcomingBookingsWidget />
          <PublicLinksWidget />
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

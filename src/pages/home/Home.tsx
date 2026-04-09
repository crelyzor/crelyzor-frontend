import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScroll, useTransform, motion } from 'motion/react';
import { MessageSquare, Sparkles } from 'lucide-react';
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
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const { greeting, dayName, monthDay } = useGreeting();
  const { data: currentUser, isLoading: currentUserLoading } = useCurrentUser();

  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [onboardingReady, setOnboardingReady] = useState(false);

  const {
    data: allMeetingsData,
    isLoading: meetingsLoading,
    isError: meetingsError,
  } = useMeetingsAll();

  const { data: cards, isLoading: cardsLoading } = useCards();
  const activeCardCount = useMemo(
    () => (cards ?? []).filter((card) => !card.isDeleted).length,
    [cards]
  );

  const onboardingStorageKey = currentUser?.id
    ? `crelyzor_onboarding_done:${currentUser.id}`
    : null;

  useEffect(() => {
    if (!onboardingStorageKey) {
      setOnboardingDismissed(false);
      setOnboardingReady(false);
      return;
    }

    setOnboardingDismissed(
      !!localStorage.getItem(onboardingStorageKey)
    );
    setOnboardingReady(true);
  }, [onboardingStorageKey]);

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

  const askAiCandidateMeeting = useMemo(() => {
    const transcriptReady = (allMeetingsData ?? []).filter(
      (m) => m.type !== 'VOICE_NOTE' && m.transcriptionStatus === 'COMPLETED'
    );
    return transcriptReady
      .sort((a, b) => Date.parse(b.startTime) - Date.parse(a.startTime))
      .at(0);
  }, [allMeetingsData]);

  // Onboarding
  const showOnboarding =
    !meetingsLoading &&
    !cardsLoading &&
    !currentUserLoading &&
    onboardingReady &&
    !onboardingDismissed &&
    activeCardCount === 0 &&
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
          {askAiCandidateMeeting && (
            <button
              onClick={() =>
                navigate(`/meetings/${askAiCandidateMeeting.id}#ask-ai`)
              }
              className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-5 py-4 flex items-center justify-between text-left hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    Ask AI about your latest meeting
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {askAiCandidateMeeting.title}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-300 shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
                Ask AI
              </span>
            </button>
          )}
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
            meetings={(allMeetingsData ?? []).filter(
              (m) => m.type !== 'VOICE_NOTE'
            )}
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
          if (onboardingStorageKey) {
            localStorage.setItem(onboardingStorageKey, '1');
          }
          setOnboardingDismissed(true);
        }}
      />
    </div>
  );
}

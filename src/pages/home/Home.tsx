import { useState } from 'react';
import { useScroll, useTransform } from 'motion/react';
import { motion } from 'motion/react';
import { useGreeting } from '@/hooks';
import { upcomingMeetings, recentMeetings, actionItems } from '@/data';
import { useOrganizationStore } from '@/stores/organizationStore';
import { CompactStickyBar } from './CompactStickyBar';
import { HeroSection } from './HeroSection';
import { NextMeetingCard } from './NextMeetingCard';
import { ScheduleCard } from './ScheduleCard';
import { StatsCard } from './StatsCard';
import { MeetingSummaryCard } from './MeetingSummaryCard';
import { ActionItemsCard } from './ActionItemsCard';
import { RecentMeetings } from './RecentMeetings';
import { BookingLinkCard } from './BookingLinkCard';

export default function Home() {
  const { scrollY } = useScroll();
  const { greeting, dayName, monthDay, tip } = useGreeting();
  const { currentOrg, currentUser } = useOrganizationStore();

  // Derive org context
  const isPersonalView = currentOrg?.isPersonal ?? true;
  const isOwnerOrAdmin =
    currentOrg?.role === 'owner' || currentOrg?.role === 'admin';
  const showTeamToggle = !isPersonalView && isOwnerOrAdmin;
  const [isTeamView, setIsTeamView] = useState(false);

  // ── Scroll-linked transforms (all continuous, no state) ──

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
    v > 0.3 ? 'auto' : 'none'
  );

  return (
    <div>
      {/* ===== Compact Sticky Bar (always mounted, fades in via scroll) ===== */}
      <CompactStickyBar
        barOpacity={barOpacity}
        barY={barY}
        barBorder={barBorder}
        barPointerEvents={barPointerEvents}
        barDateX={barDateX}
        dayName={dayName}
        monthDay={monthDay}
      />

      {/* ===== Hero Section ===== */}
      <HeroSection
        greeting={greeting}
        dayName={dayName}
        monthDay={monthDay}
        tip={tip}
        userName={currentUser?.name ?? 'there'}
        orgName={currentOrg?.name}
        isPersonalView={isPersonalView}
        showTeamToggle={showTeamToggle}
        isTeamView={isTeamView}
        onToggleTeamView={setIsTeamView}
        greetingOpacity={greetingOpacity}
        greetingY={greetingY}
        greetingScale={greetingScale}
        tipOpacity={tipOpacity}
        bubblesOpacity={bubblesOpacity}
        bubbleTransforms={bubbleTransforms}
      />

      {/* ===== Main Grid ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* ── Left Column (2/3 width) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Meeting + Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <NextMeetingCard meeting={upcomingMeetings[0]} />
            </div>
            <StatsCard isTeamView={showTeamToggle && isTeamView} />
          </div>

          {/* Today's Schedule */}
          <ScheduleCard
            meetings={upcomingMeetings}
            isPersonalView={isPersonalView}
          />

          {/* Meeting Summary */}
          <MeetingSummaryCard
            isPersonalView={isPersonalView}
            isTeamView={showTeamToggle && isTeamView}
          />
        </div>

        {/* ── Right Column (1/3 width) ── */}
        <div className="lg:col-span-1 space-y-6">
          {/* Action Items */}
          <ActionItemsCard
            items={actionItems}
            isPersonalView={isPersonalView}
            isTeamView={showTeamToggle && isTeamView}
          />

          {/* Recent Meetings */}
          <RecentMeetings
            meetings={recentMeetings}
            isPersonalView={isPersonalView}
            isTeamView={showTeamToggle && isTeamView}
          />

          {/* Booking Link */}
          <BookingLinkCard />
        </div>
      </motion.div>
    </div>
  );
}

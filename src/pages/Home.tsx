import {
  Calendar,
  Clock,
  Users,
  Video,
  Mic,
  TrendingUp,
  ArrowUpRight,
  Link2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Meeting = {
  id: number;
  title: string;
  time: string;
  date?: string;
  duration: string;
  participants: string[];
  type: 'upcoming' | 'past' | 'live';
  hasRecording?: boolean;
  category?: string;
};

const quickActions = [
  { icon: Video, label: 'Instant Meeting', desc: 'Start a call right now' },
  { icon: Calendar, label: 'Schedule', desc: 'Plan a meeting ahead' },
  { icon: Mic, label: 'Record Note', desc: 'Capture a voice memo' },
  { icon: Link2, label: 'Share Link', desc: 'Send your booking page' },
];

export default function Home() {
  const { scrollY } = useScroll();

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

  // Compact sticky bar fades IN (always mounted, just invisible initially)
  const barOpacity = useTransform(scrollY, [120, 170], [0, 1]);
  const barY = useTransform(scrollY, [120, 170], [-6, 0]);
  const barDateX = useTransform(scrollY, [130, 180], [-8, 0]);
  const barBorder = useTransform(scrollY, [120, 170], [0, 1]);
  // Disable pointer events on the bar while it's invisible
  const barPointerEvents = useTransform(barOpacity, (v) =>
    v > 0.3 ? 'auto' : 'none'
  );

  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? 'Good morning'
      : now.getHours() < 17
        ? 'Good afternoon'
        : 'Good evening';
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const tips = [
    'You have 3 meetings today — your first is at 2:00 PM',
    'Consider blocking focus time this afternoon',
    'Your busiest day this week is Wednesday',
  ];
  const tip = tips[now.getDay() % tips.length];

  const upcomingMeetings: Meeting[] = [
    {
      id: 1,
      title: 'Product Strategy Review',
      time: '2:00 PM',
      duration: '45 min',
      participants: ['Sarah Chen', 'Mike Ross', 'Alex Kim'],
      type: 'upcoming',
    },
    {
      id: 2,
      title: 'Design Sync',
      time: '4:30 PM',
      duration: '30 min',
      participants: ['Emma Wilson'],
      type: 'upcoming',
    },
    {
      id: 3,
      title: 'Sprint Retrospective',
      time: '5:30 PM',
      duration: '1 hr',
      participants: ['Engineering Team'],
      type: 'upcoming',
    },
  ];

  const recentMeetings: Meeting[] = [
    {
      id: 4,
      title: 'Weekly Standup',
      time: '10:00 AM',
      date: 'Today',
      duration: '15 min',
      participants: ['Team'],
      type: 'past',
      hasRecording: true,
      category: 'STANDUP',
    },
    {
      id: 5,
      title: 'Client Onboarding Call',
      time: '3:00 PM',
      date: 'Feb 8',
      duration: '1 hr',
      participants: ['Acme Corp'],
      type: 'past',
      hasRecording: true,
      category: 'CLIENT',
    },
    {
      id: 6,
      title: 'Investor Update',
      time: '11:00 AM',
      date: 'Feb 7',
      duration: '30 min',
      participants: ['Board'],
      type: 'past',
      hasRecording: false,
      category: 'INTERNAL',
    },
    {
      id: 7,
      title: '1:1 with Sarah',
      time: '9:00 AM',
      date: 'Feb 7',
      duration: '30 min',
      participants: ['Sarah Chen'],
      type: 'past',
      hasRecording: true,
      category: '1:1',
    },
    {
      id: 8,
      title: 'Design Review',
      time: '2:00 PM',
      date: 'Feb 6',
      duration: '45 min',
      participants: ['Design Team'],
      type: 'past',
      hasRecording: true,
      category: 'REVIEW',
    },
    {
      id: 9,
      title: 'Sales Pipeline Review',
      time: '4:00 PM',
      date: 'Feb 6',
      duration: '1 hr',
      participants: ['Sales Team'],
      type: 'past',
      hasRecording: false,
      category: 'SALES',
    },
  ];

  const getCategoryStyle = (cat?: string) => {
    const styles: Record<string, string> = {
      STANDUP:
        'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      CLIENT:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      INTERNAL:
        'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700',
      '1:1':
        'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
      REVIEW:
        'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
      SALES:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    };
    return styles[cat || ''] || styles.INTERNAL;
  };

  return (
    <div>
      {/* ===== Compact Sticky Bar (always mounted, fades in via scroll) ===== */}
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
          <motion.div
            style={{ x: barDateX }}
            className="flex items-center gap-2"
          >
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                <action.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== Hero Section ===== */}
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
            {greeting.toUpperCase()}, HARSH
          </p>
          <h1 className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight mb-3">
            It&apos;s {dayName}, {monthDay}
          </h1>
          <motion.div
            style={{ opacity: tipOpacity }}
            className="flex items-center justify-center gap-2 text-sm text-neutral-500 dark:text-neutral-400"
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

      {/* ===== Main Grid ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule + Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Today's Schedule */}
            <Card className="md:col-span-3 p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="p-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
                  <Calendar className="w-4 h-4" />
                  TODAY&apos;S SCHEDULE
                </div>
              </div>
              <div className="px-5 pb-2">
                <div className="text-4xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
                  {upcomingMeetings.length}
                  <span className="text-lg font-normal text-neutral-400 dark:text-neutral-500 ml-2">
                    meetings left
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3">
                <div className="space-y-0">
                  {upcomingMeetings.map((meeting, i) => (
                    <div
                      key={meeting.id}
                      className="flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="flex flex-col items-center pt-1.5">
                        <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                        {i < upcomingMeetings.length - 1 && (
                          <div className="w-px h-10 bg-neutral-200 dark:bg-neutral-700" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
                            {meeting.title}
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">
                            {meeting.duration}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">
                          {meeting.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="md:col-span-2 p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="p-5 pb-3 flex items-center gap-2 text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
                <TrendingUp className="w-4 h-4" />
                THIS WEEK
              </div>
              <div className="px-5 space-y-5">
                <div>
                  <div className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
                    12
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                    Total Meetings
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
                    8.5
                    <span className="text-lg font-normal text-neutral-400 dark:text-neutral-500">
                      hrs
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                    Time in Meetings
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-neutral-950 dark:text-neutral-50">
                    7
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                    Recordings
                  </p>
                </div>
              </div>
              <div className="p-5 pt-4">
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  Weekly avg: 10 meetings, 7.2 hrs,
                  <br />
                  calculated over last four weeks.
                </p>
              </div>
            </Card>
          </div>

          {/* Meeting Summary */}
          <Card className="p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  MEETING SUMMARY
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] rounded-full border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400"
                >
                  Feb 2026
                </Badge>
              </div>
              <button className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer">
                Details <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 border-t border-neutral-100 dark:border-neutral-800">
              {[
                { label: '1:1', count: 8 },
                { label: 'STANDUP', count: 12 },
                { label: 'CLIENT', count: 5 },
                { label: 'REVIEW', count: 6 },
                { label: 'OTHER', count: 3 },
              ].map((cat, i) => (
                <div
                  key={cat.label}
                  className={`p-5 ${i < 4 ? 'border-r border-neutral-100 dark:border-neutral-800' : ''}`}
                >
                  <div className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50">
                    {cat.count}
                  </div>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 tracking-wide">
                    {cat.label}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Recent Meetings */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
              RECENT MEETINGS
            </h2>
            <button className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors font-medium cursor-pointer">
              SEE ALL
            </button>
          </div>

          <div className="space-y-3">
            {recentMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="p-4 border-neutral-200 dark:border-neutral-800 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate flex-1">
                    {meeting.title}
                  </span>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 ml-2 whitespace-nowrap">
                    {meeting.date}, {meeting.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {meeting.hasRecording && (
                      <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <Video className="w-3 h-3" />
                        <span>{meeting.duration}</span>
                      </div>
                    )}
                    {!meeting.hasRecording && (
                      <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                        <Clock className="w-3 h-3" />
                        <span>{meeting.duration}</span>
                      </div>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium border ${getCategoryStyle(meeting.category)}`}
                  >
                    {meeting.category}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Booking Link Card */}
          <Card className="mt-6 p-4 border-neutral-200 dark:border-neutral-800 bg-neutral-900 dark:bg-neutral-800 text-white">
            <div className="flex items-start justify-between mb-3">
              <ExternalLink className="w-5 h-5 text-neutral-400" />
              <ArrowUpRight className="w-4 h-4 text-neutral-500" />
            </div>
            <h3 className="text-sm font-medium mb-1">Your Booking Page</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Share your availability link with others
            </p>
            <div className="text-xs text-neutral-500 bg-neutral-800 dark:bg-neutral-700 px-3 py-2 rounded-lg truncate">
              cal.harsh.dev/book/harsh
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

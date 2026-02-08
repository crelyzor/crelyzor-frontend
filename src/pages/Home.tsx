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
  ArrowRight,
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
  {
    icon: Video,
    label: 'Instant Meeting',
    desc: 'Start a call right now',
    accent: 'bg-blue-500',
    accentLight: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: Calendar,
    label: 'Schedule',
    desc: 'Plan a meeting ahead',
    accent: 'bg-violet-500',
    accentLight: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  {
    icon: Mic,
    label: 'Record Note',
    desc: 'Capture a voice memo',
    accent: 'bg-emerald-500',
    accentLight: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    icon: Link2,
    label: 'Share Link',
    desc: 'Send your booking page',
    accent: 'bg-amber-500',
    accentLight: 'bg-amber-50 text-amber-600 border-amber-100',
  },
];

export default function Home() {
  const { scrollY } = useScroll();

  // ── Scroll-linked transforms (all continuous, no state) ──

  // Greeting dissolves
  const greetingOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const greetingY = useTransform(scrollY, [0, 100], [0, -10]);
  const tipOpacity = useTransform(scrollY, [0, 60], [1, 0]);

  // Full cards dissolve + shrink
  const cardsOpacity = useTransform(scrollY, [40, 180], [1, 0]);
  const cardsScale = useTransform(scrollY, [40, 180], [1, 0.96]);
  const descOpacity = useTransform(scrollY, [20, 80], [1, 0]);
  const accentBarOpacity = useTransform(scrollY, [20, 100], [0.8, 0]);

  // Compact sticky bar fades IN (always mounted, just invisible initially)
  const barOpacity = useTransform(scrollY, [140, 200], [0, 1]);
  const barY = useTransform(scrollY, [140, 200], [-8, 0]);
  const barDateX = useTransform(scrollY, [160, 220], [-6, 0]);
  const barBorder = useTransform(scrollY, [140, 200], [0, 1]);
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
      STANDUP: 'bg-blue-50 text-blue-700 border-blue-200',
      CLIENT: 'bg-amber-50 text-amber-700 border-amber-200',
      INTERNAL: 'bg-neutral-100 text-neutral-600 border-neutral-200',
      '1:1': 'bg-violet-50 text-violet-700 border-violet-200',
      REVIEW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      SALES: 'bg-rose-50 text-rose-700 border-rose-200',
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
        className="fixed top-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-neutral-200/60"
      >
        <div className="max-w-7xl mx-auto px-8 h-12 flex items-center justify-between">
          {/* Left — Date */}
          <motion.div
            style={{ x: barDateX }}
            className="flex items-center gap-2"
          >
            <span className="text-sm font-semibold text-neutral-900">
              {dayName}
            </span>
            <span className="text-sm text-neutral-400">{monthDay}</span>
          </motion.div>

          {/* Right — Compact Quick Actions */}
          <div className="flex items-center gap-1.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer hover:shadow-sm transition-shadow ${action.accentLight}`}
              >
                <action.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ===== Hero Section ===== */}
      <div>
        {/* Greeting — dissolves with scroll */}
        <motion.div
          style={{ opacity: greetingOpacity, y: greetingY }}
          className="mb-8"
        >
          <p className="text-xs tracking-widest text-neutral-400 mb-1">
            {greeting.toUpperCase()}, HARSH
          </p>
          <h1 className="text-3xl font-semibold text-neutral-950 tracking-tight mb-3">
            It&apos;s {dayName}, {monthDay}
          </h1>
          <motion.div
            style={{ opacity: tipOpacity }}
            className="flex items-center gap-2 text-sm text-neutral-500"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>{tip}</span>
          </motion.div>
        </motion.div>

        {/* Full Quick Action Cards — dissolve + shrink with scroll */}
        <motion.div
          style={{ opacity: cardsOpacity, scale: cardsScale }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 origin-top"
        >
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="group relative p-5 rounded-2xl border border-neutral-200 bg-white hover:shadow-lg transition-shadow cursor-pointer text-left overflow-hidden"
            >
              {/* Accent bar */}
              <motion.div
                style={{ opacity: accentBarOpacity }}
                className={`absolute top-0 left-0 right-0 h-1 ${action.accent} rounded-t-2xl`}
              />

              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${action.accentLight} border`}
              >
                <action.icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold text-neutral-900 mb-0.5">
                {action.label}
              </div>
              <motion.div
                style={{ opacity: descOpacity }}
                className="text-xs text-neutral-400"
              >
                {action.desc}
              </motion.div>

              {/* Hover arrow */}
              <ArrowRight className="absolute bottom-5 right-5 w-4 h-4 text-neutral-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </button>
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
            <Card className="md:col-span-3 p-0 border-neutral-200 overflow-hidden">
              <div className="p-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs tracking-widest text-neutral-500 font-medium">
                  <Calendar className="w-4 h-4" />
                  TODAY&apos;S SCHEDULE
                </div>
              </div>
              <div className="px-5 pb-2">
                <div className="text-4xl font-semibold text-neutral-950 tracking-tight">
                  {upcomingMeetings.length}
                  <span className="text-lg font-normal text-neutral-400 ml-2">
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
                        <div className="w-2 h-2 rounded-full bg-neutral-900" />
                        {i < upcomingMeetings.length - 1 && (
                          <div className="w-px h-10 bg-neutral-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                            {meeting.title}
                          </span>
                          <span className="text-xs text-neutral-400">
                            {meeting.duration}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-400">
                          {meeting.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="md:col-span-2 p-0 border-neutral-200 overflow-hidden">
              <div className="p-5 pb-3 flex items-center gap-2 text-xs tracking-widest text-neutral-500 font-medium">
                <TrendingUp className="w-4 h-4" />
                THIS WEEK
              </div>
              <div className="px-5 space-y-5">
                <div>
                  <div className="text-3xl font-semibold text-neutral-950">
                    12
                  </div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">
                    Total Meetings
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-neutral-950">
                    8.5
                    <span className="text-lg font-normal text-neutral-400">
                      hrs
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">
                    Time in Meetings
                  </p>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-neutral-950">
                    7
                  </div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">
                    Recordings
                  </p>
                </div>
              </div>
              <div className="p-5 pt-4">
                <p className="text-[11px] text-neutral-400">
                  Weekly avg: 10 meetings, 7.2 hrs,
                  <br />
                  calculated over last four weeks.
                </p>
              </div>
            </Card>
          </div>

          {/* Meeting Summary */}
          <Card className="p-0 border-neutral-200 overflow-hidden">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs tracking-widest text-neutral-500 font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  MEETING SUMMARY
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] rounded-full border-neutral-200 text-neutral-500"
                >
                  Feb 2026
                </Badge>
              </div>
              <button className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1 cursor-pointer">
                Details <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 border-t border-neutral-100">
              {[
                { label: '1:1', count: 8 },
                { label: 'STANDUP', count: 12 },
                { label: 'CLIENT', count: 5 },
                { label: 'REVIEW', count: 6 },
                { label: 'OTHER', count: 3 },
              ].map((cat, i) => (
                <div
                  key={cat.label}
                  className={`p-5 ${i < 4 ? 'border-r border-neutral-100' : ''}`}
                >
                  <div className="text-2xl font-semibold text-neutral-950">
                    {cat.count}
                  </div>
                  <p className="text-[11px] text-neutral-400 tracking-wide">
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
            <h2 className="text-xs tracking-widest text-neutral-500 font-medium">
              RECENT MEETINGS
            </h2>
            <button className="text-xs text-neutral-400 hover:text-neutral-700 transition-colors font-medium cursor-pointer">
              SEE ALL
            </button>
          </div>

          <div className="space-y-3">
            {recentMeetings.map((meeting) => (
              <Card
                key={meeting.id}
                className="p-4 border-neutral-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900 truncate flex-1">
                    {meeting.title}
                  </span>
                  <span className="text-[11px] text-neutral-400 ml-2 whitespace-nowrap">
                    {meeting.date}, {meeting.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {meeting.hasRecording && (
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Video className="w-3 h-3" />
                        <span>{meeting.duration}</span>
                      </div>
                    )}
                    {!meeting.hasRecording && (
                      <div className="flex items-center gap-1 text-xs text-neutral-400">
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
          <Card className="mt-6 p-4 border-neutral-200 bg-neutral-900 text-white">
            <div className="flex items-start justify-between mb-3">
              <ExternalLink className="w-5 h-5 text-neutral-400" />
              <ArrowRight className="w-4 h-4 text-neutral-500" />
            </div>
            <h3 className="text-sm font-medium mb-1">Your Booking Page</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Share your availability link with others
            </p>
            <div className="text-xs text-neutral-500 bg-neutral-800 px-3 py-2 rounded-lg truncate">
              cal.harsh.dev/book/harsh
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

import {
  Calendar,
  CalendarDays,
  Clock,
  Home,
  Settings,
  Video,
  Bell,
  Share2,
  MoreVertical,
} from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { label: 'Upcoming meetings', value: '3', icon: CalendarDays },
    { label: 'This week', value: '12 hrs', icon: Clock },
    { label: 'Pending requests', value: '2', icon: Calendar },
  ];

  const recentMeetings = [
    {
      id: 1,
      time: '2:00 PM',
      title: 'Product Review',
      participant: 'John Doe',
      status: 'Confirmed',
    },
    {
      id: 2,
      time: '3:30 PM',
      title: 'Team Sync',
      participant: 'Jane Smith',
      status: 'Confirmed',
    },
    {
      id: 3,
      time: '4:00 PM',
      title: 'Client Meeting',
      participant: 'Acme Corp',
      status: 'Confirmed',
    },
    {
      id: 4,
      time: '5:00 PM',
      title: 'Design Review',
      participant: 'Sarah Lee',
      status: 'Confirmed',
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <aside className="w-60 bg-[#1A1A1A] p-6 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[#0F766E] rounded flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Calendar</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0F766E] text-white"
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-[#4A4A4A] transition-colors"
              >
                <CalendarDays className="w-5 h-5" />
                <span>Meetings</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-[#4A4A4A] transition-colors"
              >
                <Clock className="w-5 h-5" />
                <span>Availability</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-[#4A4A4A] transition-colors"
              >
                <Video className="w-5 h-5" />
                <span>Recordings</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-[#4A4A4A] transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E8E8E8] px-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Dashboard</h1>

          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-[#0F766E] hover:bg-[#134E4A] text-white rounded-lg flex items-center gap-2 transition-colors">
              <Share2 className="w-4 h-4" />
              Share Booking Link
            </button>
            <button className="w-10 h-10 rounded-full hover:bg-[#E8E8E8] flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5 text-[#1A1A1A]" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[#0F766E] flex items-center justify-center text-white font-medium">
              U
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 bg-[#FAFAF9] p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-[#E8E8E8] p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <stat.icon className="w-6 h-6 text-[#0F766E]" />
                </div>
                <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-[#4A4A4A]">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Meetings */}
          <div className="bg-white rounded-lg border border-[#E8E8E8] p-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">
              Recent Meetings
            </h2>

            <div className="space-y-0 divide-y divide-[#E8E8E8]">
              {recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="py-4 flex items-center justify-between group hover:bg-[#FAFAF9] px-4 -mx-4 rounded transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="px-3 py-1 bg-[#E8E8E8] rounded text-sm text-[#4A4A4A] font-medium">
                      {meeting.time}
                    </div>
                    <div className="flex-1">
                      <div className="text-[#1A1A1A] font-medium">
                        {meeting.title}
                      </div>
                      <div className="text-sm text-[#4A4A4A]">
                        {meeting.participant}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#15803D] text-white text-sm rounded-full font-medium">
                      {meeting.status}
                    </span>
                    <button className="w-8 h-8 rounded hover:bg-[#E8E8E8] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-[#4A4A4A]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import {
  Calendar,
  CalendarDays,
  Clock,
  Home,
  Settings,
  Video,
  Bell,
  Share2,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/meetings', label: 'Meetings', icon: CalendarDays },
    { path: '/availability', label: 'Availability', icon: Clock },
    { path: '/recordings', label: 'Recordings', icon: Video },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <aside className="w-60 bg-[#1A1A1A] p-6 flex flex-col">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-[#0F766E] rounded flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-lg">Calendar</span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-[#0F766E] text-white'
                        : 'text-white hover:bg-[#4A4A4A]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E8E8E8] px-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">
            {navItems.find((item) => isActive(item.path))?.label || 'Calendar'}
          </h1>

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

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

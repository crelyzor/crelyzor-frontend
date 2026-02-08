import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  CalendarDays,
  Clock,
  Mic,
  Video,
  Link2,
  Settings,
  Users,
  BarChart3,
  Bell,
  Globe,
  Grip,
  Pin,
  PinOff,
  type LucideIcon,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

export type ToolbarItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  action: 'navigate' | 'action';
  path?: string;
  group: 'navigation' | 'actions' | 'tools' | 'settings';
  description?: string;
};

const allItems: ToolbarItem[] = [
  // Navigation
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    action: 'navigate',
    path: '/',
    group: 'navigation',
    description: 'Dashboard overview',
  },
  {
    id: 'meetings',
    label: 'Meetings',
    icon: CalendarDays,
    action: 'navigate',
    path: '/meetings',
    group: 'navigation',
    description: 'All your meetings',
  },
  {
    id: 'availability',
    label: 'Availability',
    icon: Clock,
    action: 'navigate',
    path: '/availability',
    group: 'navigation',
    description: 'Set your schedule',
  },
  {
    id: 'recordings',
    label: 'Recordings',
    icon: Mic,
    action: 'navigate',
    path: '/recordings',
    group: 'navigation',
    description: 'Meeting recordings',
  },

  // Quick Actions
  {
    id: 'instant-meeting',
    label: 'Instant Meeting',
    icon: Video,
    action: 'action',
    group: 'actions',
    description: 'Start a meeting now',
  },
  {
    id: 'share-link',
    label: 'Booking Link',
    icon: Link2,
    action: 'action',
    group: 'actions',
    description: 'Share your booking page',
  },
  {
    id: 'invite-people',
    label: 'Invite People',
    icon: Users,
    action: 'action',
    group: 'actions',
    description: 'Invite team members',
  },

  // Tools
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    action: 'navigate',
    path: '/analytics',
    group: 'tools',
    description: 'Meeting insights',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    action: 'action',
    group: 'tools',
    description: 'Notification center',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: Globe,
    action: 'navigate',
    path: '/integrations',
    group: 'tools',
    description: 'Connected apps',
  },

  // Settings
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    action: 'navigate',
    path: '/settings',
    group: 'settings',
    description: 'App settings',
  },
];

// Default pinned items
const defaultPinned = [
  'home',
  'meetings',
  'availability',
  'recordings',
  'instant-meeting',
];

const STORAGE_KEY = 'toolbar-pinned-items';

function getPinnedFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultPinned;
  } catch {
    return defaultPinned;
  }
}

function savePinnedToStorage(pinned: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pinned));
}

const groupLabels: Record<string, string> = {
  navigation: 'NAVIGATE',
  actions: 'QUICK ACTIONS',
  tools: 'TOOLS',
  settings: 'SETTINGS',
};

export function Toolbar() {
  const [pinnedIds, setPinnedIds] = useState<string[]>(getPinnedFromStorage);
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const pinnedItems = pinnedIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean) as ToolbarItem[];

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id];
      savePinnedToStorage(next);
      return next;
    });
  }, []);

  const handleItemClick = useCallback(
    (item: ToolbarItem) => {
      if (item.action === 'navigate' && item.path) {
        navigate(item.path);
      }
      // For 'action' type items, you'd trigger modals, etc.
    },
    [navigate]
  );

  const groupedItems = allItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, ToolbarItem[]>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center gap-0.5">
        {/* Pinned toolbar items */}
        {pinnedItems.map((item) => {
          const isActive =
            item.action === 'navigate' && location.pathname === item.path;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleItemClick(item)}
                  className={`relative w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'text-neutral-900 bg-neutral-100'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-neutral-900 rounded-full" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Separator + Control Center trigger */}
        <div className="w-px h-5 bg-neutral-200 mx-1" />

        <Popover open={controlCenterOpen} onOpenChange={setControlCenterOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <button
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                    controlCenterOpen
                      ? 'text-neutral-900 bg-neutral-100'
                      : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Grip className="w-[18px] h-[18px]" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Control Center
            </TooltipContent>
          </Tooltip>

          <PopoverContent
            className="w-72 p-0 bg-white border-neutral-200 shadow-xl rounded-xl"
            align="start"
            sideOffset={8}
          >
            <div className="p-3 pb-2">
              <h3 className="text-xs tracking-widest text-neutral-400 font-medium">
                CONTROL CENTER
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Pin items to your toolbar
              </p>
            </div>

            <Separator className="bg-neutral-100" />

            <div className="max-h-80 overflow-y-auto py-1">
              {(['navigation', 'actions', 'tools', 'settings'] as const).map(
                (group) => (
                  <div key={group}>
                    <div className="px-3 pt-3 pb-1">
                      <span className="text-[10px] tracking-widest text-neutral-400 font-medium">
                        {groupLabels[group]}
                      </span>
                    </div>
                    {groupedItems[group]?.map((item) => {
                      const isPinned = pinnedIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 transition-colors cursor-pointer"
                        >
                          <button
                            onClick={() => handleItemClick(item)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                              <item.icon className="w-4 h-4 text-neutral-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-neutral-800">
                                {item.label}
                              </div>
                              <div className="text-[11px] text-neutral-400 truncate">
                                {item.description}
                              </div>
                            </div>
                          </button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePin(item.id);
                                }}
                                className={`w-7 h-7 flex items-center justify-center rounded-md shrink-0 transition-all cursor-pointer ${
                                  isPinned
                                    ? 'text-neutral-900 bg-neutral-100 hover:bg-neutral-200'
                                    : 'text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100'
                                }`}
                              >
                                {isPinned ? (
                                  <PinOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Pin className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="text-xs">
                              {isPinned
                                ? 'Unpin from toolbar'
                                : 'Pin to toolbar'}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            <Separator className="bg-neutral-100" />

            <div className="p-2">
              <button
                onClick={() => {
                  setPinnedIds(defaultPinned);
                  savePinnedToStorage(defaultPinned);
                }}
                className="w-full text-xs text-neutral-400 hover:text-neutral-600 py-1.5 transition-colors cursor-pointer"
              >
                Reset to defaults
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  );
}

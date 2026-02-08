import { useState } from 'react';
import {
  ChevronDown,
  Settings,
  Check,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

type Organization = {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  plan?: string;
  memberCount?: number;
};

// Mock data - replace with actual data from API
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: "Harsh's Workspace",
    role: 'owner',
    plan: 'Pro Plan',
    memberCount: 1,
  },
  {
    id: '2',
    name: 'Acme Inc',
    role: 'member',
    plan: 'Business',
    memberCount: 24,
  },
  {
    id: '3',
    name: 'Design Team',
    role: 'guest',
  },
  {
    id: '4',
    name: 'Freelance Projects',
    role: 'guest',
  },
];

const currentUser = {
  email: 'harshkeshari100@gmail.com',
  name: 'Harsh Keshari',
};

export function OrganizationSelector() {
  const [open, setOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization>(
    mockOrganizations[0]
  );

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (
    role: Organization['role'],
    size: 'sm' | 'md' = 'sm'
  ) => {
    const baseClass =
      size === 'md'
        ? 'px-2 py-0.5 text-[11px] font-medium rounded'
        : 'px-2 py-0.5 text-[10px] font-medium rounded';

    switch (role) {
      case 'owner':
        return (
          <span className={`${baseClass} bg-neutral-900 text-white`}>
            Owner
          </span>
        );
      case 'admin':
        return (
          <span className={`${baseClass} bg-blue-500 text-white`}>Admin</span>
        );
      case 'member':
        return (
          <span className={`${baseClass} bg-neutral-200 text-neutral-700`}>
            Member
          </span>
        );
      case 'guest':
        return (
          <span className={`${baseClass} bg-amber-400/90 text-amber-950`}>
            Guest
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg px-2 py-1.5 transition-colors cursor-pointer">
          <div className="w-7 h-7 bg-neutral-800 dark:bg-neutral-700 rounded-md flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {getInitials(selectedOrg.name)}
            </span>
          </div>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hidden sm:block max-w-[120px] truncate">
            {selectedOrg.name}
          </span>
          <ChevronDown className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-xl"
        align="start"
        sideOffset={8}
      >
        {/* Current Organization Header */}
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-800 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">
                {getInitials(selectedOrg.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {selectedOrg.name}
                </h3>
                {getRoleBadge(selectedOrg.role, 'md')}
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {selectedOrg.memberCount || 1} member
                {(selectedOrg.memberCount || 1) > 1 ? 's' : ''}
              </p>
            </div>
            <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer">
              <Settings className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>
        </div>

        <Separator className="bg-neutral-200 dark:bg-neutral-800" />

        {/* User Email */}
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {currentUser.email}
          </span>
          <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors cursor-pointer">
            <MoreHorizontal className="w-4 h-4 text-neutral-400" />
          </button>
        </div>

        {/* Organization List */}
        <div className="max-h-64 overflow-y-auto">
          {mockOrganizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleOrgSelect(org)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="w-7 h-7 bg-neutral-800 dark:bg-neutral-700 rounded flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-medium">
                  {getInitials(org.name)}
                </span>
              </div>
              <span className="text-sm text-neutral-900 dark:text-neutral-100 flex-1 text-left truncate">
                {org.name}
              </span>
              {getRoleBadge(org.role)}
              {selectedOrg.id === org.id && (
                <Check className="w-4 h-4 text-neutral-900 dark:text-neutral-100 shrink-0" />
              )}
            </button>
          ))}
        </div>

        <Separator className="bg-neutral-200 dark:bg-neutral-800" />

        {/* Actions */}
        <div className="py-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left cursor-pointer">
            <LogOut className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">
              Log out
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

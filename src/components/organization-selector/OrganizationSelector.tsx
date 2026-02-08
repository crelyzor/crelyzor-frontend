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
import { mockOrganizations, currentUser } from '@/data';
import type { Organization } from '@/types';
import { OrgAvatar } from './OrgAvatar';
import { RoleBadge } from './RoleBadge';

export function OrganizationSelector() {
  const [open, setOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization>(
    mockOrganizations[0]
  );

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg px-2 py-1.5 transition-colors cursor-pointer">
          <OrgAvatar name={selectedOrg.name} size="sm" />
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
            <OrgAvatar name={selectedOrg.name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {selectedOrg.name}
                </h3>
                <RoleBadge role={selectedOrg.role} size="md" />
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
              <OrgAvatar name={org.name} size="sm" />
              <span className="text-sm text-neutral-900 dark:text-neutral-100 flex-1 text-left truncate">
                {org.name}
              </span>
              <RoleBadge role={org.role} />
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

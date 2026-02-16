import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Settings, Check, LogOut, Home } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { mockOrganizations, currentUser } from '@/data';
import type { Organization } from '@/types';
import { useOrganizationStore } from '@/stores';
import { useLogout } from '@/hooks/queries/useAuthQueries';
import { OrgAvatar } from './OrgAvatar';
import { RoleBadge } from './RoleBadge';

type OrgGroup = { label: string; orgs: Organization[] };

export function OrganizationSelector() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const currentOrg = useOrganizationStore((s) => s.currentOrg);
  const organizations = useOrganizationStore((s) => s.organizations);
  const setOrganizations = useOrganizationStore((s) => s.setOrganizations);
  const setCurrentOrg = useOrganizationStore((s) => s.setCurrentOrg);
  const setCurrentUser = useOrganizationStore((s) => s.setCurrentUser);

  // Seed mock data until API is integrated
  useEffect(() => {
    if (organizations.length === 0) {
      setOrganizations(mockOrganizations);
      setCurrentUser(currentUser);
    }
  }, [organizations.length, setOrganizations, setCurrentUser]);

  const selectedOrg = currentOrg ?? mockOrganizations[0];
  const orgList = organizations.length > 0 ? organizations : mockOrganizations;

  // Group orgs: Home (personal) → Owner → Admin → Member
  const orgGroups = useMemo<OrgGroup[]>(() => {
    const personal = orgList.filter((o) => o.isPersonal);
    const owner = orgList.filter((o) => !o.isPersonal && o.role === 'owner');
    const admin = orgList.filter((o) => !o.isPersonal && o.role === 'admin');
    const member = orgList.filter((o) => !o.isPersonal && o.role === 'member');

    const groups: OrgGroup[] = [];
    if (personal.length) groups.push({ label: '', orgs: personal }); // no header for home — it's obvious
    if (owner.length) groups.push({ label: 'Owner', orgs: owner });
    if (admin.length) groups.push({ label: 'Admin', orgs: admin });
    if (member.length) groups.push({ label: 'Member', orgs: member });
    return groups;
  }, [orgList]);

  const handleOrgSelect = (org: Organization) => {
    setCurrentOrg(org);
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        navigate('/signin', { replace: true });
      },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg px-2 py-1.5 transition-colors cursor-pointer">
          <OrgAvatar name={selectedOrg.name} size="sm" />
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 hidden sm:block max-w-35 truncate">
            {selectedOrg.name}
          </span>
          {selectedOrg.isPersonal && (
            <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
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
                <RoleBadge
                  role={selectedOrg.isPersonal ? 'home' : selectedOrg.role}
                  size="md"
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {selectedOrg.isPersonal
                  ? 'Your personal workspace'
                  : `${selectedOrg.memberCount || 1} member${(selectedOrg.memberCount || 1) > 1 ? 's' : ''}`}
              </p>
            </div>
            {!selectedOrg.isPersonal && (
              <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer">
                <Settings className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </button>
            )}
          </div>
        </div>

        <Separator className="bg-neutral-200 dark:bg-neutral-800" />

        {/* User Email */}
        <div className="px-3 py-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {currentUser.email}
          </span>
        </div>

        {/* Grouped Organization List */}
        <div className="max-h-72 overflow-y-auto">
          {orgGroups.map((group, gi) => (
            <div key={group.label || 'home'}>
              {gi > 0 && (
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {group.label}
                  </span>
                </div>
              )}

              {group.orgs.map((org) => {
                const isSelected = selectedOrg.id === org.id;
                return (
                  <button
                    key={org.id}
                    onClick={() => handleOrgSelect(org)}
                    className={`w-full flex items-center gap-3 px-3 py-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-100 dark:bg-neutral-800'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    {org.isPersonal ? (
                      <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <Home className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <OrgAvatar name={org.name} size="sm" />
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <span className="text-sm text-neutral-900 dark:text-neutral-100 truncate block">
                        {org.name}
                      </span>
                      {org.isPersonal && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          All your meetings, across every org
                        </span>
                      )}
                    </div>
                    {org.isPersonal ? (
                      <RoleBadge role="home" />
                    ) : (
                      !org.isPersonal &&
                      org.memberCount && (
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">
                          {org.memberCount}
                        </span>
                      )
                    )}
                    {isSelected && (
                      <Check className="w-4 h-4 text-neutral-900 dark:text-neutral-100 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <Separator className="bg-neutral-200 dark:bg-neutral-800" />

        {/* Actions */}
        <div className="py-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-500 font-medium">Log out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

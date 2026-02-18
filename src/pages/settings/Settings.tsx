import { useState } from 'react';
import {
  User,
  Building2,
  Bell,
  Palette,
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Users,
  Link2,
  MoreHorizontal,
  Plug,
  Video,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useOrganizationStore } from '@/stores/organizationStore';
import { useCurrentUser, useLogout } from '@/hooks/queries/useAuthQueries';
import {
  useOrgMembers,
  useUpdateOrg,
} from '@/hooks/queries/useOrganizationQueries';
import { useUpdateProfile } from '@/hooks/queries/useUserQueries';
import {
  useCalendarStatus,
  useConnectCalendar,
  useSessions,
} from '@/hooks/queries/useIntegrationQueries';

// ── Settings sections ──
const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
] as const;

type SettingsSection = (typeof SETTINGS_SECTIONS)[number]['id'];

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('profile');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        // Always redirect to signin, even if API call fails
        // (local state is cleared in useLogout hook)
        navigate('/signin', { replace: true });
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your account, organization, and preferences
        </p>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar ── */}
        <nav className="w-48 shrink-0">
          <div className="space-y-1">
            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Sign out */}
          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </nav>

        {/* ── Content ── */}
        <div className="flex-1 min-w-0">
          {activeSection === 'profile' && <ProfileSection />}
          {activeSection === 'organization' && <OrganizationSection />}
          {activeSection === 'notifications' && <NotificationsSection />}
          {activeSection === 'integrations' && <IntegrationsSection />}
          {activeSection === 'appearance' && (
            <AppearanceSection theme={theme} setTheme={setTheme} />
          )}
          {activeSection === 'security' && <SecuritySection />}
        </div>
      </div>
    </div>
  );
}

// ── Profile ──
function ProfileSection() {
  const { data: profile } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nameInit, setNameInit] = useState(false);

  // Initialize form fields from profile data
  if (profile && !nameInit) {
    setName(profile.name ?? '');
    setPhone(profile.phoneNumber ?? '');
    setNameInit(true);
  }

  const initials = (profile?.name ?? 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSave = () => {
    const payload: Record<string, string> = {};
    if (name && name !== profile?.name) payload.name = name;
    if (phone !== (profile?.phoneNumber ?? '')) payload.phoneNumber = phone;
    if (Object.keys(payload).length === 0) return;

    updateProfile.mutate(payload, {
      onSuccess: () => toast.success('Profile updated'),
      onError: () => toast.error('Failed to update profile'),
    });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Profile"
        description="Your personal information and account details"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                {profile?.name ?? 'Loading...'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {profile?.email ?? ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Full Name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
            <FieldGroup label="Email">
              <Input
                value={profile?.email ?? ''}
                disabled
                className="border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
              />
            </FieldGroup>
            <FieldGroup label="Phone">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Add phone number"
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
            <FieldGroup label="Country">
              <Input
                defaultValue={profile?.country ?? ''}
                placeholder="Country"
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs px-4 h-8"
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Organization ──
function OrganizationSection() {
  const { currentOrg } = useOrganizationStore();
  const { data: members } = useOrgMembers();
  const updateOrg = useUpdateOrg();
  const [orgName, setOrgName] = useState(currentOrg?.name ?? '');

  const handleSaveOrg = () => {
    if (!orgName || orgName === currentOrg?.name) return;
    updateOrg.mutate(
      { name: orgName },
      {
        onSuccess: () => toast.success('Organization updated'),
        onError: () => toast.error('Failed to update organization'),
      }
    );
  };

  // Get members list from API response
  const membersList = Array.isArray(members) ? members : [];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Organization"
        description={
          currentOrg?.isPersonal
            ? 'Your personal workspace settings'
            : `Settings for ${currentOrg?.name ?? 'your organization'}`
        }
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Organization Name">
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
          </div>

          {/* Members preview */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-400" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Members
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                  {(membersList as unknown[]).length ||
                    currentOrg?.memberCount ||
                    1}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1 border-neutral-200 dark:border-neutral-700"
              >
                Invite Member
              </Button>
            </div>
            {(
              membersList as Array<{
                id: string;
                user: {
                  id: string;
                  name: string;
                  email: string;
                  avatarUrl?: string;
                };
                roles: Array<{ name?: string; systemRoleType?: string }>;
                accessLevel?: string;
              }>
            )
              .slice(0, 5)
              .map((member) => {
                const roleName =
                  member.roles?.[0]?.name ??
                  member.roles?.[0]?.systemRoleType ??
                  member.accessLevel ??
                  'Member';
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 py-2 border-b border-neutral-50 dark:border-neutral-800/50 last:border-0"
                  >
                    {member.user.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-500">
                        {member.user.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs text-neutral-700 dark:text-neutral-300 flex-1">
                      {member.user.name} &mdash; {roleName}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                    </Button>
                  </div>
                );
              })}
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              onClick={handleSaveOrg}
              disabled={updateOrg.isPending}
              className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs px-4 h-8"
            >
              {updateOrg.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Link */}
      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
              Public Booking Link
            </h3>
          </div>
          <div className="flex gap-2">
            <Input
              defaultValue={`${window.location.origin}/book/${currentOrg?.id ?? ''}`}
              readOnly
              className="border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-mono"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/book/${currentOrg?.id ?? ''}`
                );
                toast.success('Link copied!');
              }}
              className="text-xs h-9 px-3 shrink-0 border-neutral-200 dark:border-neutral-700"
            >
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Notifications ──
function NotificationsSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Notifications"
        description="Control how and when you receive notifications"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6 space-y-4">
          {[
            {
              label: 'Meeting scheduled',
              description: 'When a new meeting is scheduled with you',
              email: true,
              inApp: true,
            },
            {
              label: 'Meeting cancelled',
              description: "When a meeting you're part of is cancelled",
              email: true,
              inApp: true,
            },
            {
              label: 'Meeting reminders',
              description: 'Reminder before upcoming meetings',
              email: false,
              inApp: true,
            },
            {
              label: 'Transcription complete',
              description: 'When a recording transcription finishes',
              email: false,
              inApp: true,
            },
            {
              label: 'Action items generated',
              description: 'When AI generates action items from a meeting',
              email: true,
              inApp: true,
            },
            {
              label: 'New team member',
              description: 'When someone joins your organization',
              email: true,
              inApp: true,
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {item.label}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {item.description}
                </p>
              </div>
              <div className="flex gap-3">
                <ToggleChip label="Email" active={item.email} />
                <ToggleChip label="In-app" active={item.inApp} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Appearance ──
function AppearanceSection({
  theme,
  setTheme,
}: {
  theme: string;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
}) {
  const themes = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Appearance"
        description="Customize how the app looks and feels"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
            Theme
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors
                    ${isActive
                      ? 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'}`}
                  />
                  <span
                    className={`text-xs font-medium ${isActive ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-500 dark:text-neutral-400'}`}
                  >
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Integrations ──
function IntegrationsSection() {
  const { data: calStatus } = useCalendarStatus();
  const { connect } = useConnectCalendar();

  const integrations = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description:
        'Sync your Google Calendar events and create meetings with Google Meet',
      icon: Calendar,
      connected: calStatus?.hasCalendarAccess ?? false,
      account: calStatus?.connectedAt
        ? `Connected ${new Date(calStatus.connectedAt).toLocaleDateString()}`
        : null,
      onConnect: connect,
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Create Zoom meetings directly from your calendar',
      icon: Video,
      connected: false,
      account: null,
      onConnect: undefined,
    },
    {
      id: 'google-meet',
      name: 'Google Meet',
      description: 'Generate Google Meet links for online meetings',
      icon: Video,
      connected: calStatus?.hasCalendarAccess ?? false,
      account: calStatus?.hasCalendarAccess ? 'Via Google Calendar' : null,
      onConnect: undefined,
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Integrations"
        description="Connect third-party services to enhance your workflow"
      />

      <div className="space-y-3">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card
              key={integration.id}
              className="border-neutral-200 dark:border-neutral-800"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                        {integration.name}
                      </h3>
                      {integration.connected ? (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                          Connected
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-500 px-2 py-0.5 rounded-full">
                          Not connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {integration.description}
                    </p>
                    {integration.connected && integration.account && (
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                        {integration.account}
                      </p>
                    )}
                  </div>
                  <div>
                    {!integration.connected && integration.onConnect ? (
                      <Button
                        size="sm"
                        onClick={integration.onConnect}
                        className="text-xs h-8 px-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
                      >
                        Connect
                      </Button>
                    ) : integration.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 px-3 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-red-500 hover:border-red-200"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button size="sm" disabled className="text-xs h-8 px-3">
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-neutral-300 dark:text-neutral-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                More integrations coming soon
              </h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                Slack, Microsoft Teams, Notion, and more
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Security ──
function SecuritySection() {
  const { data: profile } = useCurrentUser();
  const { data: sessions } = useSessions();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Security"
        description="Manage your account security and connected services"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6 space-y-4">
          {/* Connected accounts */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-3">
              Connected Accounts
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                <Globe className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Google
                </p>
                <p className="text-xs text-neutral-400">
                  {profile?.email ?? ''}
                </p>
              </div>
              <span className="text-[10px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>
          </div>

          {/* Sessions */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50 mb-3">
              Active Sessions
            </h3>
            {sessions && Array.isArray(sessions) && sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.map(
                  (session: {
                    id: string;
                    userAgent?: string;
                    ipAddress?: string;
                    createdAt: string;
                    isCurrent?: boolean;
                  }) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {session.userAgent ?? 'Unknown device'}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {session.isCurrent
                            ? 'Current session'
                            : `Since ${new Date(session.createdAt).toLocaleDateString()}`}
                          {session.ipAddress
                            ? ` \u00B7 ${session.ipAddress}`
                            : ''}
                        </p>
                      </div>
                      {session.isCurrent && (
                        <span className="text-[10px] font-medium text-emerald-500">
                          Active
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <Monitor className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Current session
                  </p>
                  <p className="text-xs text-neutral-400">Active now</p>
                </div>
                <span className="text-[10px] font-medium text-emerald-500">
                  Active
                </span>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-red-500 mb-3">
              Danger Zone
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-red-500 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Shared components ──
function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-1">
      <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
        {title}
      </h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {label}
      </Label>
      {children}
    </div>
  );
}

function ToggleChip({ label, active }: { label: string; active: boolean }) {
  return (
    <button
      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors
        ${active
          ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
          : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
        }`}
    >
      {label}
    </button>
  );
}

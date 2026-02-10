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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useOrganizationStore } from '@/stores/organizationStore';

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
  const [activeSection, setActiveSection] =
    useState<SettingsSection>('profile');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

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
                    ${
                      isActive
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
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
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
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Profile"
        description="Your personal information and account details"
      />

      <Card className="border-neutral-200 dark:border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">
              HK
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-950 dark:text-neutral-50">
                Harsh Keshari
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                harsh@example.com
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs mt-1 h-7 px-2 text-blue-500 hover:text-blue-600"
              >
                Change photo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Full Name">
              <Input
                defaultValue="Harsh Keshari"
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
            <FieldGroup label="Username">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400 dark:text-neutral-500">
                  @
                </span>
                <Input
                  defaultValue="harshkeshari"
                  className="border-neutral-200 dark:border-neutral-700 pl-7"
                />
              </div>
            </FieldGroup>
            <FieldGroup label="Email">
              <Input
                defaultValue="harsh@example.com"
                disabled
                className="border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
              />
            </FieldGroup>
            <FieldGroup label="Phone">
              <Input
                placeholder="Add phone number"
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
            <FieldGroup label="Timezone">
              <Input
                defaultValue="Asia/Kolkata (IST)"
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs px-4 h-8">
              Save Changes
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
                defaultValue={currentOrg?.name ?? ''}
                className="border-neutral-200 dark:border-neutral-700"
              />
            </FieldGroup>
            <FieldGroup label="Brand Color">
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-md bg-neutral-900 dark:bg-neutral-100 border border-neutral-200 dark:border-neutral-700" />
                <Input
                  defaultValue="#171717"
                  className="border-neutral-200 dark:border-neutral-700 font-mono text-xs"
                />
              </div>
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
                  {currentOrg?.memberCount ?? 1}
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
            {/* Sample members */}
            {[
              'Harsh Keshari (You) — Owner',
              'Sarah Chen — Admin',
              'Mike Ross — Member',
            ].map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 border-b border-neutral-50 dark:border-neutral-800/50 last:border-0"
              >
                <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-semibold text-neutral-500">
                  {m.charAt(0)}
                </div>
                <span className="text-xs text-neutral-700 dark:text-neutral-300 flex-1">
                  {m}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs px-4 h-8">
              Save Changes
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
              defaultValue="https://cal.app/book/harsh-keshari"
              readOnly
              className="border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-mono"
            />
            <Button
              variant="outline"
              size="sm"
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
              description: 'When a voice note transcription finishes',
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
                    ${
                      isActive
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
const INTEGRATIONS = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description:
      'Sync your Google Calendar events and create meetings with Google Meet',
    icon: Calendar,
    connected: true,
    account: 'harsh@example.com',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Create Zoom meetings directly from your calendar',
    icon: Video,
    connected: false,
    account: null,
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    description: 'Generate Google Meet links for online meetings',
    icon: Video,
    connected: true,
    account: 'Via Google Calendar',
  },
] as const;

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Integrations"
        description="Connect third-party services to enhance your workflow"
      />

      {/* Connected integrations */}
      <div className="space-y-3">
        {INTEGRATIONS.map((integration) => {
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
                    {integration.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 px-3 border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-red-500 hover:border-red-200"
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="text-xs h-8 px-3 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* API / Webhooks hint */}
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
                <p className="text-xs text-neutral-400">harsh@example.com</p>
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
            <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
              <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  Chrome on macOS
                </p>
                <p className="text-xs text-neutral-400">
                  Current session &middot; Mumbai, India
                </p>
              </div>
              <span className="text-[10px] font-medium text-emerald-500">
                Active
              </span>
            </div>
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
        ${
          active
            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
            : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
        }`}
    >
      {label}
    </button>
  );
}

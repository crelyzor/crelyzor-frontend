import { useState } from 'react';
import { PageMotion } from '@/components/PageMotion';
import {
  User,
  Palette,
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser, useLogout } from '@/hooks/queries/useAuthQueries';
import { useUpdateProfile } from '@/hooks/queries/useUserQueries';
import { useSessions } from '@/hooks/queries/useIntegrationQueries';

// ── Settings sections ──
const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
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
    <PageMotion>
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-neutral-50 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your account and preferences
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
          {activeSection === 'appearance' && (
            <AppearanceSection theme={theme} setTheme={setTheme} />
          )}
          {activeSection === 'security' && <SecuritySection />}
        </div>
      </div>
    </div>
    </PageMotion>
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

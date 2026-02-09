import type { OrgRole } from '@/types';

type RoleBadgeProps = {
  role: OrgRole | 'home';
  size?: 'sm' | 'md';
};

export function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const baseClass =
    size === 'md'
      ? 'px-2 py-0.5 text-[11px] font-medium rounded'
      : 'px-2 py-0.5 text-[10px] font-medium rounded';

  switch (role) {
    case 'home':
      return (
        <span className={`${baseClass} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400`}>Home</span>
      );
    case 'owner':
      return (
        <span className={`${baseClass} bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900`}>Owner</span>
      );
    case 'admin':
      return (
        <span className={`${baseClass} bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400`}>Admin</span>
      );
    case 'member':
      return (
        <span className={`${baseClass} bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300`}>
          Member
        </span>
      );
    default:
      return null;
  }
}

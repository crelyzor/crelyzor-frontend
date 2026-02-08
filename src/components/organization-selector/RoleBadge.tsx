import type { OrgRole } from '@/types';

type RoleBadgeProps = {
  role: OrgRole;
  size?: 'sm' | 'md';
};

export function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const baseClass =
    size === 'md'
      ? 'px-2 py-0.5 text-[11px] font-medium rounded'
      : 'px-2 py-0.5 text-[10px] font-medium rounded';

  switch (role) {
    case 'owner':
      return (
        <span className={`${baseClass} bg-neutral-900 text-white`}>Owner</span>
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
}

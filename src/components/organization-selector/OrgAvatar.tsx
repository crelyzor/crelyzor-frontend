type OrgAvatarProps = {
  name: string;
  size?: 'sm' | 'md' | 'lg';
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-base font-semibold',
  lg: 'w-7 h-7 text-xs',
} as const;

export function OrgAvatar({ name, size = 'sm' }: OrgAvatarProps) {
  return (
    <div
      className={`bg-neutral-800 dark:bg-neutral-700 rounded-md flex items-center justify-center ${sizeClasses[size]}`}
    >
      <span className="text-white font-medium">{getInitials(name)}</span>
    </div>
  );
}

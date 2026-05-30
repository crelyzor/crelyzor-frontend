import { Sparkles } from 'lucide-react';

export function StubSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
      <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
        <Sparkles className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
      </div>
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1">
        {description}
      </p>
    </div>
  );
}

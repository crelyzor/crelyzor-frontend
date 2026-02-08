export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-neutral-900 dark:border-t-neutral-100 rounded-full animate-spin" />
        <span className="text-sm text-neutral-400 dark:text-neutral-500">
          Loading...
        </span>
      </div>
    </div>
  );
}

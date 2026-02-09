import { ClipboardList, Check, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ActionItem } from '@/types';

type ActionItemsCardProps = {
  items: ActionItem[];
  isPersonalView?: boolean;
  isTeamView?: boolean;
};

export function ActionItemsCard({
  items,
  isPersonalView,
  isTeamView,
}: ActionItemsCardProps) {
  const openItems = items.filter((item) => !item.isCompleted);
  const completedCount = items.filter((item) => item.isCompleted).length;

  return (
    <Card className="p-0 border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="p-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs tracking-widest text-neutral-500 dark:text-neutral-400 font-medium">
          <ClipboardList className="w-4 h-4" />
          ACTION ITEMS
          {isTeamView && (
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded ml-1">
              Team
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {completedCount > 0 && (
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {completedCount} done
            </span>
          )}
          <span className="text-[11px] font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
            {openItems.length} open
          </span>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="space-y-1">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 py-2 group cursor-pointer rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 px-2 -mx-2 transition-colors"
            >
              {/* Checkbox */}
              <div className="mt-0.5 shrink-0">
                {item.isCompleted ? (
                  <div className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-neutral-400 dark:text-neutral-500" />
                  </div>
                ) : (
                  <Circle className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400 dark:group-hover:text-neutral-500 transition-colors" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm leading-snug ${
                    item.isCompleted
                      ? 'text-neutral-400 dark:text-neutral-500 line-through'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    from {item.meetingTitle}
                  </span>
                  {/* Show assignee in team view */}
                  {isTeamView && item.assignedTo && (
                    <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                      → {item.assignedTo}
                    </span>
                  )}
                  {/* Show org source in personal view */}
                  {isPersonalView &&
                    item.orgSource &&
                    !item.orgSource.isPersonal && (
                      <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                        {item.orgSource.orgName}
                      </span>
                    )}
                </div>
              </div>

              {/* Due date */}
              {item.dueDate && !item.isCompleted && (
                <span
                  className={`text-[11px] font-medium shrink-0 ${
                    item.dueDate === 'Today'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {item.dueDate}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

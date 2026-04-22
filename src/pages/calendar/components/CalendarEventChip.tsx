import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, CheckSquare } from 'lucide-react';
import type { DraggableAttributes, SyntheticListenerMap } from '@dnd-kit/core';

export type CalendarItemType = 'gcal' | 'meeting' | 'task';

export interface DraggableChipProps {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  setNodeRef: (node: HTMLElement | null) => void;
  isDragging: boolean;
}

export interface CalendarEventChipProps {
  id: string;
  title: string;
  type: CalendarItemType;
  top: number;
  height: number;
  leftPct: number;
  widthPct: number;
  onClick?: () => void;
  /** Only provided for task chips that support drag-to-reschedule */
  draggableProps?: DraggableChipProps;
}

export function CalendarEventChip({
  title,
  type,
  top,
  height,
  leftPct,
  widthPct,
  onClick,
  draggableProps,
}: CalendarEventChipProps) {
  let chipClass = '';
  let icon: ReactNode = null;
  let prefix: ReactNode = null;

  if (type === 'gcal') {
    chipClass =
      'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700';
    prefix = (
      <span className="text-[8px] font-bold text-neutral-400 dark:text-neutral-500 leading-none mr-0.5 shrink-0 mt-px">
        G
      </span>
    );
  } else if (type === 'meeting') {
    chipClass = `bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 ${
      onClick
        ? 'cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-600'
        : ''
    }`;
    icon = <CalendarDays className="w-2.5 h-2.5 shrink-0 opacity-60 mt-px" />;
  } else {
    chipClass =
      'border-l-2 border-l-neutral-400 dark:border-l-neutral-500 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer';
    icon = <CheckSquare className="w-2.5 h-2.5 shrink-0 opacity-60 mt-px" />;
  }

  const isTaskDraggable = draggableProps !== undefined;

  return (
    <motion.div
      ref={draggableProps?.setNodeRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: draggableProps?.isDragging ? 0.3 : 1 }}
      transition={{ duration: 0.12 }}
      className={`absolute rounded-lg px-1.5 py-1 overflow-hidden select-none transition-colors ${chipClass} ${
        isTaskDraggable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        zIndex: 10,
      }}
      onClick={onClick}
      title={title}
      {...(draggableProps?.attributes ?? {})}
      {...(draggableProps?.listeners ?? {})}
    >
      <div className="flex items-start gap-0.5 h-full overflow-hidden">
        {prefix}
        {icon && <span>{icon}</span>}
        <span className="truncate leading-tight font-medium text-[10px]">
          {title}
        </span>
      </div>
    </motion.div>
  );
}

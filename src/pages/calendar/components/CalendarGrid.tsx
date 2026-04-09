import { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { CalendarEvent } from '@/services/integrationsService';
import type { Meeting } from '@/types';
import type { TaskWithMeeting } from '@/services/smaService';
import { CalendarEventChip } from './CalendarEventChip';
import { AllDayRow } from './AllDayRow';

const HOUR_HEIGHT = 64; // px per hour in the grid
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MIN_EVENT_HEIGHT = 22; // px minimum chip height
const VISIBLE_START_HOUR = 7; // auto-scroll to 7am on mount

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return toLocalDateStr(a) === toLocalDateStr(b);
}

type GridItem = {
  id: string;
  title: string;
  type: 'gcal' | 'meeting' | 'task';
  startMs: number;
  endMs: number;
  onClick?: () => void;
};

/** Groups overlapping items into clusters and assigns column positions. */
function computeLayout(
  items: GridItem[]
): Map<string, { index: number; total: number }> {
  const sorted = [...items].sort((a, b) => a.startMs - b.startMs);
  const layout = new Map<string, { index: number; total: number }>();
  const clusters: GridItem[][] = [];

  for (const item of sorted) {
    let added = false;
    for (const cluster of clusters) {
      const maxEnd = Math.max(...cluster.map((c) => c.endMs));
      if (item.startMs < maxEnd) {
        cluster.push(item);
        added = true;
        break;
      }
    }
    if (!added) clusters.push([item]);
  }

  for (const cluster of clusters) {
    cluster.forEach((item, index) => {
      layout.set(item.id, { index, total: cluster.length });
    });
  }

  return layout;
}

function getChipPosition(item: GridItem, day: Date) {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayStartMs = dayStart.getTime();
  const dayEndMs = dayStartMs + 24 * 60 * 60 * 1000;

  const clampedStart = Math.max(item.startMs, dayStartMs);
  const clampedEnd = Math.min(item.endMs, dayEndMs);
  const startMinutes = (clampedStart - dayStartMs) / 60_000;
  const durationMinutes = (clampedEnd - clampedStart) / 60_000;

  const top = (startMinutes / 60) * HOUR_HEIGHT;
  const height = Math.max(
    MIN_EVENT_HEIGHT,
    (durationMinutes / 60) * HOUR_HEIGHT
  );
  return { top, height };
}

// ── DraggableTaskChip ─────────────────────────────────────────────────────────

interface DraggableTaskChipProps {
  item: GridItem;
  day: Date;
}

function DraggableTaskChip({ item, day }: DraggableTaskChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { startMs: item.startMs },
  });
  const pos = getChipPosition(item, day);

  return (
    // Stop propagation so clicking a task chip doesn't also fire the column slot-click
    <span onClick={(e) => e.stopPropagation()}>
      <CalendarEventChip
        id={item.id}
        title={item.title}
        type="task"
        top={pos.top}
        height={pos.height}
        leftPct={0}
        widthPct={100}
        draggableProps={{ attributes, listeners, setNodeRef, isDragging }}
      />
    </span>
  );
}

// ── DayColumn ─────────────────────────────────────────────────────────────────

interface DayColumnProps {
  day: Date;
  items: GridItem[];
  isToday: boolean;
  currentMinutes: number;
  onSlotClick: (time: Date, x: number, y: number) => void;
}

function DayColumn({
  day,
  items,
  isToday,
  currentMinutes,
  onSlotClick,
}: DayColumnProps) {
  const navigate = useNavigate();
  const layout = useMemo(() => computeLayout(items), [items]);
  const { setNodeRef, isOver } = useDroppable({ id: toLocalDateStr(day) });

  const staticItems = items.filter((i) => i.type !== 'task');
  const taskItems = items.filter((i) => i.type === 'task');

  function handleColumnClick(e: React.MouseEvent<HTMLDivElement>) {
    // getBoundingClientRect accounts for scroll, giving the correct absolute offset
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const totalMinutes = Math.round(((offsetY / HOUR_HEIGHT) * 60) / 15) * 15;
    const clampedMinutes = Math.max(0, Math.min(totalMinutes, 23 * 60 + 45));
    const time = new Date(day);
    time.setHours(Math.floor(clampedMinutes / 60), clampedMinutes % 60, 0, 0);
    onSlotClick(time, e.clientX, e.clientY);
  }

  return (
    <div
      ref={setNodeRef}
      onClick={handleColumnClick}
      className={`flex-1 border-l border-neutral-100 dark:border-neutral-800 relative transition-colors cursor-pointer ${
        isToday ? 'bg-neutral-50/40 dark:bg-neutral-900/20' : ''
      } ${isOver ? 'bg-neutral-100/60 dark:bg-neutral-800/30' : ''}`}
    >
      {/* Hour grid lines */}
      {HOURS.map((h) => (
        <div
          key={h}
          className="absolute left-0 right-0 border-t border-neutral-100 dark:border-neutral-800/80 pointer-events-none"
          style={{ top: `${h * HOUR_HEIGHT}px` }}
        />
      ))}

      {/* Half-hour grid lines (subtle) */}
      {HOURS.map((h) => (
        <div
          key={`half-${h}`}
          className="absolute left-0 right-0 border-t border-neutral-50 dark:border-neutral-800/30 pointer-events-none"
          style={{ top: `${h * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
        />
      ))}

      {/* Current time indicator (only in today's column) */}
      {isToday && (
        <div
          className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
          style={{ top: `${(currentMinutes / 60) * HOUR_HEIGHT}px` }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400 shrink-0 -ml-0.5" />
          <div className="flex-1 h-px bg-neutral-400 dark:bg-neutral-500" />
        </div>
      )}

      {/* Non-task chips (gcal, meeting) — stop propagation so they don't trigger slot-click */}
      {staticItems.map((item) => {
        const pos = getChipPosition(item, day);
        const ol = layout.get(item.id) ?? { index: 0, total: 1 };
        return (
          <span key={item.id} onClick={(e) => e.stopPropagation()}>
            <CalendarEventChip
              id={item.id}
              title={item.title}
              type={item.type}
              top={pos.top}
              height={pos.height}
              leftPct={(100 / ol.total) * ol.index}
              widthPct={100 / ol.total}
              onClick={
                item.type === 'meeting'
                  ? () => navigate(`/meetings/${item.id}`)
                  : item.onClick
              }
            />
          </span>
        );
      })}

      {/* Draggable task chips */}
      {taskItems.map((item) => (
        <DraggableTaskChip key={item.id} item={item} day={day} />
      ))}
    </div>
  );
}

// ── CalendarGrid ──────────────────────────────────────────────────────────────

interface CalendarGridProps {
  days: Date[];
  gcalEvents: CalendarEvent[];
  meetings: Meeting[];
  scheduledTasks: TaskWithMeeting[];
  timedDueTasks: TaskWithMeeting[];
  dueTasks: TaskWithMeeting[];
  today: Date;
  onReschedule: (taskId: string, newTime: Date) => void;
  onSlotClick: (time: Date, x: number, y: number) => void;
}

export function CalendarGrid({
  days,
  gcalEvents,
  meetings,
  scheduledTasks,
  timedDueTasks,
  dueTasks,
  today,
  onReschedule,
  onSlotClick,
}: CalendarGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });
  const [activeDragItem, setActiveDragItem] = useState<GridItem | null>(null);

  // Scroll to VISIBLE_START_HOUR on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = VISIBLE_START_HOUR * HOUR_HEIGHT - 32;
    }
  }, []);

  // Keep the current-time indicator accurate, updating every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function getItemsForDay(day: Date): GridItem[] {
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    const items: GridItem[] = [];

    for (const evt of gcalEvents) {
      const start = new Date(evt.startTime).getTime();
      const end = new Date(evt.endTime).getTime();
      if (start < dayEnd.getTime() && end > dayStart.getTime()) {
        items.push({
          id: evt.id,
          title: evt.title,
          type: 'gcal',
          startMs: start,
          endMs: end,
        });
      }
    }

    for (const mtg of meetings) {
      const start = new Date(mtg.startTime).getTime();
      const end = new Date(mtg.endTime).getTime();
      if (start < dayEnd.getTime() && end > dayStart.getTime()) {
        items.push({
          id: mtg.id,
          title: mtg.title,
          type: 'meeting',
          startMs: start,
          endMs: end,
        });
      }
    }

    for (const task of scheduledTasks) {
      if (!task.scheduledTime) continue;
      const start = new Date(task.scheduledTime).getTime();
      const end = start + (task.durationMinutes ?? 30) * 60 * 1000;
      if (start < dayEnd.getTime() && end > dayStart.getTime()) {
        items.push({
          id: task.id,
          title: task.title,
          type: 'task',
          startMs: start,
          endMs: end,
        });
      }
    }

    // Tasks with an explicit dueDate+time (no scheduledTime) — render at their due time
    for (const task of timedDueTasks) {
      if (!task.dueDate) continue;
      const start = new Date(task.dueDate).getTime();
      const end = start + (task.durationMinutes ?? 30) * 60 * 1000;
      if (start < dayEnd.getTime() && end > dayStart.getTime()) {
        items.push({
          id: task.id,
          title: task.title,
          type: 'task',
          startMs: start,
          endMs: end,
        });
      }
    }

    return items;
  }

  function handleDragStart(event: DragStartEvent) {
    const task = scheduledTasks.find((t) => t.id === event.active.id);
    if (task?.scheduledTime) {
      const startMs = new Date(task.scheduledTime).getTime();
      setActiveDragItem({
        id: task.id,
        title: task.title,
        type: 'task',
        startMs,
        endMs: startMs + (task.durationMinutes ?? 30) * 60 * 1000,
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event;
    setActiveDragItem(null);

    if (!over || !active.data.current) return;

    const { startMs } = active.data.current as { startMs: number };

    // Derive original day start from startMs — avoids string parsing pitfalls
    const originalDayStart = new Date(startMs);
    originalDayStart.setHours(0, 0, 0, 0);
    const originalOffsetMs = startMs - originalDayStart.getTime();

    // Apply the drag delta (vertical movement only matters for time)
    const newOffsetMs =
      originalOffsetMs + (delta.y / HOUR_HEIGHT) * 60 * 60 * 1000;
    const totalMinutes = Math.round(newOffsetMs / 60_000 / 15) * 15; // snap to 15 min
    const clampedMinutes = Math.max(0, Math.min(totalMinutes, 23 * 60 + 45));

    // Build the new Date in the target day (over.id = "YYYY-MM-DD")
    const [yr, mo, dy] = (over.id as string).split('-').map(Number);
    const newTime = new Date(yr, mo - 1, dy);
    newTime.setHours(
      Math.floor(clampedMinutes / 60),
      clampedMinutes % 60,
      0,
      0
    );

    onReschedule(active.id as string, newTime);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Sticky day headers */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm shrink-0">
          <div className="w-14 shrink-0" />
          {days.map((day, i) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={i}
                className={`flex-1 border-l border-neutral-100 dark:border-neutral-800 py-2 text-center ${
                  isToday ? 'bg-neutral-50 dark:bg-neutral-900/60' : ''
                }`}
              >
                <div
                  className={`text-[10px] uppercase tracking-wider font-medium ${
                    isToday
                      ? 'text-neutral-600 dark:text-neutral-300'
                      : 'text-neutral-400 dark:text-neutral-600'
                  }`}
                >
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="flex items-center justify-center mt-0.5">
                  {isToday ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold">
                      {day.getDate()}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                      {day.getDate()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* All-day / due tasks row */}
        <AllDayRow days={days} tasks={dueTasks} />

        {/* Scrollable 24-hour time grid */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
          <div
            className="flex relative"
            style={{ height: `${24 * HOUR_HEIGHT}px` }}
          >
            {/* Time-label column */}
            <div className="w-14 shrink-0 relative">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute right-0 flex items-start pr-2"
                  style={{
                    top: `${h * HOUR_HEIGHT}px`,
                    height: `${HOUR_HEIGHT}px`,
                  }}
                >
                  {h > 0 && (
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-wider leading-none -translate-y-2">
                      {formatHour(h)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {days.map((day, colIdx) => (
              <DayColumn
                key={colIdx}
                day={day}
                items={getItemsForDay(day)}
                isToday={isSameDay(day, today)}
                currentMinutes={currentMinutes}
                onSlotClick={onSlotClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag overlay — ghost chip that follows the cursor */}
      <DragOverlay>
        {activeDragItem ? (
          <div
            className="rounded-lg px-1.5 py-1 overflow-hidden border-l-2 border-l-neutral-400 dark:border-l-neutral-500 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 shadow-lg opacity-90 pointer-events-none"
            style={{ width: 120, height: MIN_EVENT_HEIGHT }}
          >
            <span className="truncate leading-tight font-medium text-[10px]">
              {activeDragItem.title}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

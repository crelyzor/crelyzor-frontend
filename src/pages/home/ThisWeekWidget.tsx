import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, ArrowUpRight } from 'lucide-react';

type Props = {
  meetings: { startTime: string }[];
  isLoading?: boolean;
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function ThisWeekWidget({ meetings, isLoading }: Props) {
  const navigate = useNavigate();

  const { weekDays, totalThisWeek } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Monday of current week
    const dow = today.getDay(); // 0=Sun
    const mondayOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });

    // Count meetings per day
    const countByDate: Record<string, number> = {};
    for (const m of meetings) {
      const dateStr = new Date(m.startTime).toDateString();
      countByDate[dateStr] = (countByDate[dateStr] ?? 0) + 1;
    }

    const weekDays = days.map((d) => ({
      date: d,
      dayNum: d.getDate(),
      isToday: d.toDateString() === today.toDateString(),
      isPast: d < today,
      count: countByDate[d.toDateString()] ?? 0,
    }));

    const totalThisWeek = weekDays.reduce((sum, d) => sum + d.count, 0);

    return { weekDays, totalThisWeek };
  }, [meetings]);

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[10px] tracking-[0.18em] text-neutral-400 dark:text-neutral-500 uppercase font-medium">
            This Week
          </span>
          {!isLoading && totalThisWeek > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
              {totalThisWeek}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/calendar')}
          className="flex items-center gap-0.5 text-[10px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors group"
        >
          Calendar
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* Week strip */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-between animate-pulse">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-4 h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded" />
                <div className="w-7 h-7 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {weekDays.map((day, i) => (
              <button
                key={i}
                onClick={() => navigate('/calendar')}
                className="flex flex-col items-center gap-1 group"
              >
                <span
                  className={`text-[9px] font-medium uppercase tracking-wide ${
                    day.isToday
                      ? 'text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-400 dark:text-neutral-600'
                  }`}
                >
                  {DAY_LABELS[i]}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    day.isToday
                      ? 'bg-neutral-900 dark:bg-neutral-100'
                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span
                    className={`text-[12px] font-medium ${
                      day.isToday
                        ? 'text-white dark:text-neutral-900'
                        : day.isPast
                          ? 'text-neutral-300 dark:text-neutral-700'
                          : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {day.dayNum}
                  </span>
                </div>
                {/* Meeting dot */}
                <div className="h-1 flex items-center justify-center">
                  {day.count > 0 && (
                    <span
                      className={`w-1 h-1 rounded-full ${
                        day.isToday
                          ? 'bg-neutral-900 dark:bg-neutral-100'
                          : day.isPast
                            ? 'bg-neutral-200 dark:bg-neutral-700'
                            : 'bg-neutral-400 dark:bg-neutral-500'
                      }`}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

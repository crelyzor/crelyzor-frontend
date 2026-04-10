/**
 * DateTimePicker
 *
 * Self-contained date + time picker panel. Supports light and dark mode.
 * Uses react-day-picker for the calendar and a custom spinbox for time.
 *
 * Props
 *   date        – selected date as "YYYY-MM-DD", or null
 *   time        – selected time as "HH:MM" (24 h), or ""
 *   onDateChange(date, label) – called when a day is picked
 *   onTimeChange(time)        – called when time changes ("HH:MM" or "" to clear)
 */

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── helpers ────────────────────────────────────────────────────────────────────

function toLocalDateStr(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

function daysFromToday(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

function to12h(hh: number): { h: number; period: 'AM' | 'PM' } {
  if (hh === 0) return { h: 12, period: 'AM' };
  if (hh < 12) return { h: hh, period: 'AM' };
  if (hh === 12) return { h: 12, period: 'PM' };
  return { h: hh - 12, period: 'PM' };
}

function to24h(h: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'Next week', days: 7 },
];

// Step minutes in multiples of 5
const MINUTE_STEP = 5;

// ── TimePicker ─────────────────────────────────────────────────────────────────

interface TimePickerProps {
  time: string; // "HH:MM" 24 h, or ""
  onChange: (time: string) => void; // "" to clear
  clearable?: boolean; // show the X button (default true)
}

export function TimePicker({
  time,
  onChange,
  clearable = true,
}: TimePickerProps) {
  const hasTime = time.length > 0;

  // Internal state — initialised from prop, kept in sync
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

  // Sync from prop when it changes externally
  useEffect(() => {
    if (!time) return;
    const [hh, mm] = time.split(':').map(Number);
    const { h, period } = to12h(hh);
    setHour(h);
    setMinute(mm);
    setPeriod(period);
  }, [time]);

  function commit(h: number, m: number, p: 'AM' | 'PM') {
    const hh = to24h(h, p);
    onChange(`${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }

  function stepHour(dir: 1 | -1) {
    const next = ((hour - 1 + dir + 12) % 12) + 1;
    setHour(next);
    commit(next, minute, period);
  }

  function stepMinute(dir: 1 | -1) {
    const next = (minute + dir * MINUTE_STEP + 60) % 60;
    setMinute(next);
    commit(hour, next, period);
  }

  function togglePeriod(p: 'AM' | 'PM') {
    setPeriod(p);
    commit(hour, minute, p);
  }

  function activate() {
    // Activate with sensible default: next round hour
    const now = new Date();
    const defaultHour = (now.getHours() + 1) % 24;
    const { h, period: p } = to12h(defaultHour);
    setHour(h);
    setMinute(0);
    setPeriod(p);
    commit(h, 0, p);
  }

  if (!hasTime) {
    return (
      <button
        onClick={activate}
        className="flex items-center gap-2 w-full px-1 py-1.5 rounded-lg text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-[12px]"
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>Add time</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-1">
      <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />

      {/* Hour */}
      <Spinbox
        value={String(hour).padStart(2, '0')}
        onUp={() => stepHour(1)}
        onDown={() => stepHour(-1)}
      />

      <span className="text-neutral-400 dark:text-neutral-500 text-[13px] font-medium">:</span>

      {/* Minute */}
      <Spinbox
        value={String(minute).padStart(2, '0')}
        onUp={() => stepMinute(1)}
        onDown={() => stepMinute(-1)}
      />

      {/* AM / PM */}
      <div className="flex rounded-md overflow-hidden border border-neutral-200 dark:border-white/10 ml-1">
        {(['AM', 'PM'] as const).map((p) => (
          <button
            key={p}
            onClick={() => togglePeriod(p)}
            className={cn(
              'px-2 py-1 text-[11px] font-medium transition-colors',
              period === p
                ? 'bg-neutral-100 dark:bg-white/15 text-neutral-900 dark:text-white'
                : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Clear time */}
      {clearable && (
        <button
          onClick={() => onChange('')}
          className="ml-auto text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ── Spinbox ───────────────────────────────────────────────────────────────────

function Spinbox({
  value,
  onUp,
  onDown,
}: {
  value: string;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onUp}
        className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors leading-none"
      >
        <ChevronUp className="w-3 h-3" />
      </button>
      <span className="text-[13px] font-medium text-neutral-900 dark:text-white w-6 text-center tabular-nums select-none">
        {value}
      </span>
      <button
        onClick={onDown}
        className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors leading-none"
      >
        <ChevronDown className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── DateTimePicker ─────────────────────────────────────────────────────────────

interface Props {
  date: string | null;
  time: string;
  onDateChange: (date: string, label: string) => void;
  onTimeChange?: (time: string) => void;
  /** Set to false to hide the time picker (date-only mode). Default: true */
  showTime?: boolean;
}

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  showTime = true,
}: Props) {
  // Calendar month shown — sync to selected date
  const [month, setMonth] = useState<Date>(() =>
    date ? new Date(date + 'T00:00:00') : new Date()
  );

  const selected = date ? new Date(date + 'T00:00:00') : undefined;

  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    const iso = toLocalDateStr(day);
    const label = day.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    onDateChange(iso, label);
  }

  function handlePreset(days: number, label: string) {
    const d = daysFromToday(days);
    onDateChange(toLocalDateStr(d), label);
  }

  return (
    <div
      className="rounded-2xl overflow-hidden bg-white dark:bg-[#1c1c1e] border border-neutral-200 dark:border-white/[0.08] shadow-lg dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
      style={{ width: 268 }}
    >
      {/* Preset chips */}
      <div className="flex gap-1 px-3 pt-3 pb-1">
        {PRESETS.map((p) => {
          const presetIso = toLocalDateStr(daysFromToday(p.days));
          const active = date === presetIso;
          return (
            <button
              key={p.label}
              onClick={() => handlePreset(p.days, p.label)}
              className={cn(
                'flex-1 rounded-md py-1 text-[11px] font-medium transition-colors',
                active
                  ? 'bg-neutral-100 dark:bg-white/15 text-neutral-900 dark:text-white'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5'
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Calendar */}
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={handleDaySelect}
        month={month}
        onMonthChange={setMonth}
        showOutsideDays
        classNames={{
          root: 'p-2',
          months: '',
          month: 'w-full',
          month_caption: 'flex items-center justify-between px-1 mb-2',
          caption_label: 'text-[12px] font-medium text-neutral-700 dark:text-neutral-200',
          nav: 'flex items-center gap-1',
          button_previous:
            'p-1 rounded-md text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors',
          button_next:
            'p-1 rounded-md text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors',
          month_grid: 'w-full',
          weekdays: 'flex mb-1',
          weekday:
            'flex-1 text-center text-[10px] font-medium text-neutral-400 dark:text-neutral-600 uppercase tracking-wide',
          week: 'flex',
          day: 'flex-1 flex items-center justify-center',
          day_button: cn(
            'w-7 h-7 rounded-full text-[12px] transition-colors',
            'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white'
          ),
          selected: '!bg-neutral-900 dark:!bg-white !text-white dark:!text-neutral-900 font-semibold rounded-full',
          today: 'text-neutral-900 dark:text-white font-semibold',
          outside: 'opacity-25',
          disabled: 'opacity-20 cursor-not-allowed',
          hidden: 'invisible',
        }}
        components={{
          Chevron: ({ orientation }) =>
            orientation === 'left' ? (
              <ChevronLeft className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            ),
        }}
      />

      {showTime && (
        <>
          {/* Divider */}
          <div className="h-px bg-neutral-100 dark:bg-white/5 mx-3" />

          {/* Time picker */}
          <div className="px-3 py-2.5">
            <TimePicker
              time={date ? time : ''}
              onChange={date ? (onTimeChange ?? (() => {})) : () => {}}
            />
          </div>
        </>
      )}
    </div>
  );
}

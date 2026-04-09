import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns true if the stored dueDate ISO string has a non-midnight local time. */
export function hasTaskTime(iso: string): boolean {
  const d = new Date(iso);
  return d.getHours() !== 0 || d.getMinutes() !== 0;
}

/** Format a task dueDate for display: "Apr 10" or "Apr 10 · 3:00 PM" */
export function formatTaskDue(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!hasTaskTime(iso)) return date;
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}

/**
 * Combine a YYYY-MM-DD date string with an optional HH:MM time string into a
 * full ISO 8601 UTC string. If no time is provided the date is stored as-is
 * (the backend normalises it to midnight UTC).
 */
export function buildDueDateISO(date: string, time: string): string {
  if (!time) return date;
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes).toISOString();
}

/** Extract the local HH:MM time string from an ISO date, or '' if midnight. */
export function extractTimeFromISO(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  if (h === 0 && m === 0) return '';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Append a time label to a date label when time is set. */
export function appendTimeToLabel(baseLabel: string, time: string): string {
  if (!time) return baseLabel;
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${baseLabel} · ${timeStr}`;
}

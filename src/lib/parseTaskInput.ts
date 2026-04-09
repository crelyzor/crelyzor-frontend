/**
 * parseTaskInput — pure natural-language parser for quick-add task creation.
 *
 * Extracts priority, due date, and optional time from free-text input.
 * No external dependencies or network calls.
 *
 * Examples:
 *   "Review deck tomorrow high"      → { title: "Review deck",  priority: "HIGH",   dueDate: "2026-04-02" }
 *   "Call client thursday at 3pm"    → { title: "Call client",  dueDate: "2026-04-09T15:00:00.000Z" }
 *   "Stand-up today 9:30am medium"   → { title: "Stand-up",     priority: "MEDIUM", dueDate: "<today ISO>" }
 *   "Buy milk"                       → { title: "Buy milk" }
 */

export type ParsedTask = {
  title: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  /**
   * YYYY-MM-DD when no time was parsed; full UTC ISO string when time was
   * extracted (e.g. "2026-04-10T07:30:00.000Z").
   */
  dueDate?: string;
  /** Human-readable due date label for preview ("Today", "Tomorrow", "Monday …" …) */
  dueDateLabel?: string;
};

const WEEKDAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Returns a new Date set to midnight local time, n days from today. */
function daysFromToday(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

/**
 * Parse a time expression from text. Matches:
 *   "3pm", "3:30pm", "15:00", "at 9am", "at 9:30 am"
 * Returns { hours, minutes } in 24-hour format, or null if no match.
 * Also strips the matched text from `text` (mutates via return value).
 */
function parseTime(
  text: string
): { hours: number; minutes: number; rest: string } | null {
  // 12-hour: optional "at ", digits, optional ":mm", space?, am/pm
  const ampmRe =
    /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b|\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
  // 24-hour: HH:MM (must have colon to avoid false-positives on lone numbers)
  const h24Re = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;

  let match = text.match(ampmRe);
  if (match) {
    const rawH = parseInt(match[1] ?? match[4], 10);
    const rawM = parseInt(match[2] ?? match[5] ?? '0', 10);
    const period = (match[3] ?? match[6]).toLowerCase();
    let hours = rawH % 12;
    if (period === 'pm') hours += 12;
    return { hours, minutes: rawM, rest: text.replace(match[0], '').trim() };
  }

  match = text.match(h24Re);
  if (match) {
    return {
      hours: parseInt(match[1], 10),
      minutes: parseInt(match[2], 10),
      rest: text.replace(match[0], '').trim(),
    };
  }

  return null;
}

export function parseTaskInput(input: string): ParsedTask {
  let text = input.trim();
  if (!text) return { title: input };

  let priority: ParsedTask['priority'];
  let dueDate: string | undefined;
  let dueDateLabel: string | undefined;

  // ── Priority ────────────────────────────────────────────────────────────────
  const highRe = /\b(p1|!1|high|urgent|!high)\b/i;
  const medRe = /\b(p2|!2|medium|med|!medium)\b/i;
  const lowRe = /\b(p3|!3|low|!low)\b/i;

  if (highRe.test(text)) {
    priority = 'HIGH';
    text = text.replace(highRe, '').trim();
  } else if (medRe.test(text)) {
    priority = 'MEDIUM';
    text = text.replace(medRe, '').trim();
  } else if (lowRe.test(text)) {
    priority = 'LOW';
    text = text.replace(lowRe, '').trim();
  }

  // ── Due date ─────────────────────────────────────────────────────────────────
  if (/\btoday\b/i.test(text)) {
    const d = daysFromToday(0);
    dueDate = toISODate(d);
    dueDateLabel = 'Today';
    text = text.replace(/\btoday\b/gi, '').trim();
  } else if (/\btomorrow\b/i.test(text)) {
    const d = daysFromToday(1);
    dueDate = toISODate(d);
    dueDateLabel = 'Tomorrow';
    text = text.replace(/\btomorrow\b/gi, '').trim();
  } else if (/\bnext\s+week\b/i.test(text)) {
    const d = daysFromToday(7);
    dueDate = toISODate(d);
    dueDateLabel = 'Next week';
    text = text.replace(/\bnext\s+week\b/gi, '').trim();
  } else if (/\bthis\s+week\b/i.test(text)) {
    // end of current week = next Sunday
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
    const d = daysFromToday(daysUntilSunday);
    dueDate = toISODate(d);
    dueDateLabel = 'This week';
    text = text.replace(/\bthis\s+week\b/gi, '').trim();
  } else {
    // Weekday names — next occurrence (minimum 1 day ahead)
    for (const [i, day] of WEEKDAY_NAMES.entries()) {
      const dayRe = new RegExp(`\\b${day}\\b`, 'i');
      if (dayRe.test(text)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diff = (i - today.getDay() + 7) % 7 || 7;
        const d = daysFromToday(diff);
        dueDate = toISODate(d);
        dueDateLabel = day.charAt(0).toUpperCase() + day.slice(1);
        text = text.replace(dayRe, '').trim();
        break;
      }
    }
  }

  // ── Time ─────────────────────────────────────────────────────────────────────
  // Only parse time if a date was also found — standalone times are too ambiguous.
  if (dueDate) {
    const parsed = parseTime(text);
    if (parsed) {
      const [year, month, day] = dueDate.split('-').map(Number);
      const withTime = new Date(
        year,
        month - 1,
        day,
        parsed.hours,
        parsed.minutes
      );
      dueDate = withTime.toISOString();
      text = parsed.rest;
      // Append time to label e.g. "Tomorrow · 3:00 PM"
      const timeStr = withTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
      dueDateLabel = `${dueDateLabel} · ${timeStr}`;
    }
  }

  // Normalise whitespace; fall back to raw input if title is now empty
  const title = text.replace(/\s{2,}/g, ' ').trim() || input.trim();

  return { title, priority, dueDate, dueDateLabel };
}

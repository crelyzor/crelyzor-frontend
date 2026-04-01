/**
 * parseTaskInput — pure natural-language parser for quick-add task creation.
 *
 * Extracts priority and due date keywords from a free-text input and returns
 * a structured task payload. No external dependencies or network calls.
 *
 * Examples:
 *   "Review deck tomorrow high"   → { title: "Review deck",  priority: "HIGH",   dueDate: "2026-04-02" }
 *   "Call client thursday medium" → { title: "Call client",  priority: "MEDIUM", dueDate: "2026-04-09" }
 *   "Buy milk"                    → { title: "Buy milk" }
 */

export type ParsedTask = {
  title: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string; // YYYY-MM-DD
  /** Human-readable due date label for preview ("Today", "Tomorrow", "Monday" …) */
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
        const diff = ((i - today.getDay()) + 7) % 7 || 7;
        const d = daysFromToday(diff);
        dueDate = toISODate(d);
        dueDateLabel = day.charAt(0).toUpperCase() + day.slice(1);
        text = text.replace(dayRe, '').trim();
        break;
      }
    }
  }

  // Normalise whitespace; fall back to raw input if title is now empty
  const title = text.replace(/\s{2,}/g, ' ').trim() || input.trim();

  return { title, priority, dueDate, dueDateLabel };
}

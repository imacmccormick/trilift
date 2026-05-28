/**
 * Date utility functions for TriLift weekly rollover and calendar display.
 */

/**
 * Returns the ISO 8601 week string for a given date (e.g. "2026-W22").
 * ISO weeks start on Monday.
 */
export function getWeekId(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number.
  // Sunday is treated as day 7.
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

/**
 * Returns the Monday of the week for a given date, set to midnight (12:00 AM).
 */
export function getMondayOfCurrentWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  // If Sunday (0), we need to go back 6 days. Otherwise, go back (day - 1) days.
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Formats a date to "MMM D" (e.g., "May 28").
 */
export function formatMonthDay(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats a timestamp to a local readable date string.
 */
export function formatLocalDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

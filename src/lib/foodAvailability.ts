import type { FoodItem } from '@/types';

export type FoodAvailability = 'available' | 'today' | 'off';

export function foodAvailability(item: FoodItem): FoodAvailability {
  if (item.unavailableUntil) return 'today';
  return item.isAvailable ? 'available' : 'off';
}

// "at midnight", "today at 10:00 AM", "tomorrow at 10:00 AM" or "Mon 2 Dec at 10:00 AM" (Sri Lanka time).
export function formatReturnTime(value: string | Date, now: Date = new Date()): string {
  const date = new Date(value);
  const tz = 'Asia/Colombo';
  const day = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const time = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit' }).format(date);
  const tomorrow = new Date(now.getTime() + 86_400_000);
  if (day(date) === day(tomorrow) && time === '12:00 AM') return 'at midnight';
  if (day(date) === day(now)) return `today at ${time}`;
  if (day(date) === day(tomorrow)) return `tomorrow at ${time}`;
  const label = new Intl.DateTimeFormat('en-GB', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' }).format(date);
  return `${label} at ${time}`;
}

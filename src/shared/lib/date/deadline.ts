import { differenceInDays, endOfDay, format, isPast, isValid, parse } from "date-fns";
import { ru } from "date-fns/locale";

export function parseDeadlineDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const datePart = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;

  const d = parse(datePart, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : null;
}

export function toDateInputValue(value: string | null | undefined): string {
  const d = parseDeadlineDate(value);
  return d ? format(d, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
}

export function formatDeadline(value: string | null | undefined): string {
  const d = parseDeadlineDate(value);
  return d ? format(d, "PPP", { locale: ru }) : "—";
}

export function getDeadlineEnd(value: string | null | undefined): Date | null {
  const d = parseDeadlineDate(value);
  return d ? endOfDay(d) : null;
}

export function deadlineSortValue(value: string | null | undefined): number {
  const d = parseDeadlineDate(value);
  return d ? d.getTime() : Number.POSITIVE_INFINITY;
}

export function getDeadlineProgress(deadline: string | null | undefined): number {
  const deadlineEnd = getDeadlineEnd(deadline);
  if (!deadlineEnd) return 0;

  if (isPast(deadlineEnd)) return 100;

  const daysLeft = differenceInDays(deadlineEnd, new Date());
  const progress = 100 - (daysLeft / 30) * 100;

  return Math.min(100, Math.max(0, Math.round(progress)));
}

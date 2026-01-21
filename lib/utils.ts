import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';

const currencyFormatter = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function formatDate(dateISO: string): string {
  return format(parseISO(dateISO), 'dd.MM.yyyy', { locale: de });
}

export function formatDateShort(dateISO: string): string {
  return format(parseISO(dateISO), 'dd.MM', { locale: de });
}

export function formatMonth(dateISO: string): string {
  return format(parseISO(dateISO), 'MMMM yyyy', { locale: de });
}

export function formatMonthShort(dateISO: string): string {
  return format(parseISO(dateISO), 'MMM yyyy', { locale: de });
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function getMonthRange(date: Date): { start: Date; end: Date } {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

export function getCurrentMonthISO(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthISO(date: Date): string {
  return format(date, 'yyyy-MM');
}

export function getPreviousMonthsISO(count: number): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    months.push(getMonthISO(subMonths(now, i)));
  }

  return months;
}

export function getNextMonthsISO(count: number): string[] {
  const months: string[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    months.push(getMonthISO(addMonths(now, i)));
  }

  return months;
}

export function toDateISO(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatPercentInt(value: number): string {
  return `${Math.round(value * 100)}%`;
}
